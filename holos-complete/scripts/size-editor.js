/* ============================================================
   HOLOS — Size Editor Component (v2, W × H × D only)
   Three inputs for Width / Height / Depth in cm + per-category
   suggestion pill. The model is scaled to fit inside the given
   box while preserving its aspect ratio.
   ============================================================ */

const SizeEditor = (() => {

  /* Render the editor markup. Returns HTML string.
     @param idPrefix    'ep', 'apr', etc.
     @param subcategoryId  used to find a per-category suggestion
     @param current     { realDimsCm: {w, h, d} } from the product
  */
  function render(idPrefix, subcategoryId, current = {}) {
    const sug = ModelFit.getSuggestion(subcategoryId);
    const dims = current.realDimsCm || { w: 0, h: 0, d: 0 };

    return `
      ${sug ? `
        <div class="se-sug">
          <div class="se-sug-left">
            <div class="se-sug-label">Typical ${sug.name}</div>
            <div class="se-sug-value">${sug.w} × ${sug.h} × ${sug.d} cm</div>
          </div>
          <button type="button" class="se-sug-btn" onclick="SizeEditor.useSuggestion('${idPrefix}', ${sug.w}, ${sug.h}, ${sug.d})">Use this</button>
        </div>
      ` : ''}

      <div class="se-canvas-grid">
        <div class="fr-field">
          <label class="fr-label">Width (cm)</label>
          <input id="${idPrefix}-w" class="fr-input" type="number" min="0" max="10000" step="0.1" value="${dims.w || ''}" placeholder="${sug?.w || ''}" oninput="if(this.value.length>6){this.value=this.value.slice(0,6);} SizeEditor.updateDiagram('${idPrefix}')" />
        </div>
        <div class="fr-field">
          <label class="fr-label">Height (cm)</label>
          <input id="${idPrefix}-h" class="fr-input" type="number" min="0" max="10000" step="0.1" value="${dims.h || ''}" placeholder="${sug?.h || ''}" oninput="if(this.value.length>6){this.value=this.value.slice(0,6);} SizeEditor.updateDiagram('${idPrefix}')" />
        </div>
        <div class="fr-field">
          <label class="fr-label">Depth (cm)</label>
          <input id="${idPrefix}-d" class="fr-input" type="number" min="0" max="10000" step="0.1" value="${dims.d || ''}" placeholder="${sug?.d || ''}" oninput="if(this.value.length>6){this.value=this.value.slice(0,6);} SizeEditor.updateDiagram('${idPrefix}')" />
        </div>
      </div>
      <div class="fr-hint"><strong>Real-life size (shown in AR).</strong> Width = side-to-side, Height = top-to-bottom, Depth = front-to-back — in centimeters. This is the exact size the product appears at when a customer places it in their room. The store preview above is separate and auto-fits its frame. Leave a dimension blank to ignore it.</div>
      <div id="${idPrefix}-scalecheck" class="se-scalecheck" data-sub="${subcategoryId || ''}">${scaleSvg(dims.w || 0, dims.h || 0, dims.d || 0, subcategoryId)}</div>
    `;
  }

  /* Read the current W/H/D values. Always returns the canvas shape. */
  function read(idPrefix) {
    // Clamp to 0-100000 cm (1km) — anything larger is treated as garbage input.
    const clamp = v => Math.max(0, Math.min(100000, Number(v) || 0));
    const w = clamp(document.getElementById(idPrefix + '-w')?.value);
    const h = clamp(document.getElementById(idPrefix + '-h')?.value);
    const d = clamp(document.getElementById(idPrefix + '-d')?.value);
    return {
      realSizeCm: Math.max(w, h, d), // kept for back-compat with old data; derived from W/H/D
      realDimsCm: { w, h, d },
      mode: 'canvas',
    };
  }

  /* Pre-fill all three fields from a category suggestion. */
  function useSuggestion(idPrefix, w, h, d) {
    const wEl = document.getElementById(idPrefix + '-w');
    const hEl = document.getElementById(idPrefix + '-h');
    const dEl = document.getElementById(idPrefix + '-d');
    if (wEl) wEl.value = w;
    if (hEl) hEl.value = h;
    if (dEl) dEl.value = d;
    // Trigger input event so the live preview rescales
    if (wEl) wEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* Deterministic "scale check": draws the product (W x H) next to a 1.7 m
     adult at the SAME scale, plus an automatic verdict comparing the entered
     size to a typical item in that category. Lets seller/admin confirm the
     real-life size is sensible without needing a phone. */
  function scaleSvg(w, h, d, subId) {
    w = Number(w) || 0; h = Number(h) || 0; d = Number(d) || 0;
    const hasAny = (w > 0 || h > 0 || d > 0);
    const PERSON_CM = 170, BUDGET = 200, ground = 225;
    const prodH = h > 0 ? h : Math.max(w, d);
    const maxCm = Math.max(PERSON_CM, prodH || 0, 10);
    const k = BUDGET / maxCm;
    const personH = PERSON_CM * k;
    const headR = Math.max(6, personH * 0.07);
    const bodyW = headR * 2.2;
    const personTop = ground - personH;
    const headCy = personTop + headR;
    const bodyTop = headCy + headR * 0.7;
    const pH = Math.max(2, (prodH || 0) * k);
    let pW = (w > 0 ? w : (d > 0 ? d : prodH)) * k;
    pW = Math.max(2, Math.min(150, pW));
    const prodTop = ground - pH;
    const personX = 78, prodX = 205;

    const sug = getSuggestion(subId);
    let verdict = '', vclass = 'muted';
    if (!hasAny) {
      verdict = 'Enter Width / Height / Depth to preview the size next to a person.';
    } else if (sug) {
      const sugMax = Math.max(sug.w, sug.h, sug.d);
      const curMax = Math.max(w, h, d);
      const r = curMax / sugMax;
      if (r > 3) { verdict = '\u26a0 About ' + r.toFixed(1) + '\u00d7 larger than a typical ' + sug.name.toLowerCase() + ' \u2014 double-check the size.'; vclass = 'warn'; }
      else if (r < 0.34) { verdict = '\u26a0 About ' + (1/r).toFixed(1) + '\u00d7 smaller than a typical ' + sug.name.toLowerCase() + ' \u2014 double-check the size.'; vclass = 'warn'; }
      else { verdict = '\u2713 In the normal range for a ' + sug.name.toLowerCase() + '.'; vclass = 'ok'; }
    } else {
      verdict = 'Shown next to a 1.7 m adult \u2014 does this look right for your product?';
    }

    const svg = hasAny ? (
      '<svg viewBox="0 0 320 250" width="100%" height="190" role="img" aria-label="size comparison">' +
        '<line x1="20" y1="' + ground + '" x2="300" y2="' + ground + '" stroke="var(--border-strong)" stroke-width="1.5"/>' +
        '<circle cx="' + personX + '" cy="' + headCy + '" r="' + headR + '" fill="var(--ink-muted)"/>' +
        '<rect x="' + (personX - bodyW/2) + '" y="' + bodyTop + '" width="' + bodyW + '" height="' + (ground - bodyTop) + '" rx="' + (bodyW/2) + '" fill="var(--ink-muted)"/>' +
        '<text x="' + personX + '" y="' + (ground + 16) + '" text-anchor="middle" font-size="10" fill="var(--ink-dim)">1.7 m adult</text>' +
        '<rect x="' + (prodX - pW/2) + '" y="' + prodTop + '" width="' + pW + '" height="' + pH + '" rx="3" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>' +
        '<text x="' + prodX + '" y="' + (ground + 16) + '" text-anchor="middle" font-size="10" fill="var(--accent)" font-weight="700">' + (w||'\u2014') + '\u00d7' + (h||'\u2014') + '\u00d7' + (d||'\u2014') + ' cm</text>' +
      '</svg>'
    ) : '';

    return svg + '<div class="se-verdict ' + vclass + '">' + verdict + '</div>';
  }

  function updateDiagram(prefix) {
    const box = document.getElementById(prefix + '-scalecheck');
    if (!box) return;
    const v = id => Number(document.getElementById(prefix + '-' + id) ? document.getElementById(prefix + '-' + id).value : 0) || 0;
    box.innerHTML = scaleSvg(v('w'), v('h'), v('d'), box.dataset.sub || '');
  }

  function injectStyles() {
    if (document.getElementById('se-styles')) return;
    const s = document.createElement('style');
    s.id = 'se-styles';
    s.textContent = `
      .se-sug { display: flex; align-items: center; gap: var(--s-3); padding: var(--s-3) var(--s-4); background: var(--accent-soft); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: var(--s-3); }
      .se-sug-left { flex: 1; min-width: 0; }
      .se-sug-label { font-size: var(--t-micro); color: var(--ink-dim); font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 2px; }
      .se-sug-value { font-size: var(--t-body); color: var(--accent); font-weight: 700; letter-spacing: -0.01em; }
      .se-sug-btn { padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: var(--r-pill); font-size: var(--t-small); font-weight: 600; cursor: pointer; transition: opacity 160ms; flex-shrink: 0; }
      .se-sug-btn:hover { opacity: 0.9; }
      .se-canvas-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--s-3); }
      @media (max-width: 500px) { .se-canvas-grid { grid-template-columns: 1fr; } }
      .se-scalecheck { margin-top: var(--s-3); padding: var(--s-3) var(--s-4); background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); }
      .se-verdict { margin-top: var(--s-2); font-size: var(--t-small); font-weight: 600; text-align: center; }
      .se-verdict.ok { color: var(--success); }
      .se-verdict.warn { color: var(--warn); }
      .se-verdict.muted { color: var(--ink-dim); font-weight: 500; }
    `;
    document.head.appendChild(s);
  }

  /* Legacy noop for old callers that referenced switchMode */
  function switchMode() {}

  return { render, read, useSuggestion, switchMode, injectStyles, scaleSvg, updateDiagram };
})();

window.SizeEditor = SizeEditor;
