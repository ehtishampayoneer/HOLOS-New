/* ============================================================
   HOLOS — Auto Translate (whole-app runtime localization)
   Translates the rendered page (UI chrome + seller content like
   product names) into the user's selected language, and caches
   every result in localStorage so it's instant after the first
   load. English is the source language (no calls when en).

   Idempotent: every node/attribute is translated from its ORIGINAL
   English text (remembered), so repeated runs or re-renders never
   stack translations.

   Prices are NOT touched here — they already convert by region
   via Locale.formatPrice.

   NOTE: uses a free, keyless translation endpoint that works in
   the browser — ideal for the prototype. For production scale,
   swap ENDPOINT for Google Cloud Translation / DeepL with a key.
   ============================================================ */
(function () {
  const CACHE = 'holos_tr_';
  const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
  const MAX_CONCURRENT = 6;
  const ORIG = new WeakMap();   // textNode -> original English value
  let running = false;
  let pending = false;

  function lang() { return (window.Locale && Locale.get() && Locale.get().language) || 'en'; }

  function ckey(l, t) { return CACHE + l + ':' + t; }
  function cget(l, t) { try { return localStorage.getItem(ckey(l, t)); } catch (e) { return null; } }
  function cset(l, t, v) { try { localStorage.setItem(ckey(l, t), v); } catch (e) {} }

  function translatable(s) {
    const t = (s || '').trim();
    if (!t) return false;
    if (!/[A-Za-z\u00C0-\u024F]/.test(t)) return false;                          // must contain letters
    if (/\d/.test(t) && t.replace(/[^A-Za-z]/g, '').length <= 3) return false;   // "Rs 80,000", "$ 12"
    return true;
  }

  function excluded(el) {
    return !!(el && el.closest &&
      el.closest('[data-no-translate], script, style, noscript, model-viewer, #langfab, .langov, #log-content, #holos-log, code, pre'));
  }

  function origText(node) {
    if (ORIG.has(node)) return ORIG.get(node);
    ORIG.set(node, node.nodeValue);
    return node.nodeValue;
  }

  function collectNodes(root) {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const base = ORIG.has(node) ? ORIG.get(node) : node.nodeValue;
        if (!translatable(base)) return NodeFilter.FILTER_REJECT;
        if (excluded(node.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n; while ((n = walker.nextNode())) out.push(n);
    return out;
  }

  function collectAttrs(root) {
    const out = [];
    root.querySelectorAll('[placeholder],[title],[alt]').forEach(el => {
      if (excluded(el)) return;
      ['placeholder', 'title', 'alt'].forEach(a => {
        if (!el.hasAttribute(a)) return;
        const dataKey = 'tro' + a;
        let base = el.dataset[dataKey];
        if (base == null) { base = el.getAttribute(a); el.dataset[dataKey] = base; }
        if (translatable(base)) out.push({ el, a, base: base.trim(), raw: base });
      });
    });
    return out;
  }

  async function fetchOne(text, l) {
    const url = ENDPOINT + '?client=gtx&sl=auto&tl=' + encodeURIComponent(l) + '&dt=t&q=' + encodeURIComponent(text);
    const r = await fetch(url);
    const j = await r.json();
    return (j[0] || []).map(seg => seg[0]).join('') || text;
  }

  async function resolve(texts, l) {
    const map = new Map();
    const need = [];
    texts.forEach(t => { const c = cget(l, t); if (c != null) map.set(t, c); else need.push(t); });
    let i = 0;
    async function worker() {
      while (i < need.length) {
        const t = need[i++];
        try { const tr = await fetchOne(t, l); cset(l, t, tr); map.set(t, tr); }
        catch (e) { map.set(t, t); }
      }
    }
    await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT, need.length) || 1 }, worker));
    return map;
  }

  function applyNodes(nodes, map) {
    nodes.forEach(node => {
      const original = origText(node);
      const key = original.trim();
      const tr = map.get(key);
      if (tr && tr !== key) node.nodeValue = original.replace(key, tr);
    });
  }
  function applyAttrs(attrs, map) {
    attrs.forEach(({ el, a, base, raw }) => {
      const tr = map.get(base);
      if (tr && tr !== base) el.setAttribute(a, raw.replace(base, tr));
    });
  }

  async function run() {
    const l = lang();
    const root = document.getElementById('app');
    if (!root || l === 'en') return;
    if (running) { pending = true; return; }
    running = true;
    try {
      let nodes = collectNodes(root);
      let attrs = collectAttrs(root);
      const texts = Array.from(new Set([
        ...nodes.map(n => origText(n).trim()),
        ...attrs.map(a => a.base),
      ]));
      if (!texts.length) return;

      const cached = new Map();
      texts.forEach(t => { const c = cget(l, t); if (c != null) cached.set(t, c); });
      if (cached.size) { applyNodes(nodes, cached); applyAttrs(attrs, cached); }

      const full = await resolve(texts, l);
      applyNodes(collectNodes(root), full);
      applyAttrs(collectAttrs(root), full);
    } catch (e) {
      try { (window.log || function () {})('AutoTranslate', 'failed: ' + e.message, 'warn'); } catch (e2) {}
    } finally {
      running = false;
      if (pending) { pending = false; setTimeout(run, 0); }
    }
  }

  function schedule() { clearTimeout(window._holosTrTimer); window._holosTrTimer = setTimeout(run, 40); }

  window.addEventListener('screen:mounted', schedule);
  window.addEventListener('DOMContentLoaded', schedule);
  window.AutoTranslate = { run, schedule };
  if (document.readyState !== 'loading') schedule();
})();
