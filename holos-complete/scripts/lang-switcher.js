/* ============================================================
   HOLOS — Language Switcher (floating)
   A persistent globe button (bottom-left) on every screen that
   lets the user change language at any time. Saves via Locale and
   re-renders the current screen so all t() strings update.
   ============================================================ */
(function () {
  function curLang() { return (window.Locale && Locale.get() && Locale.get().language) || 'en'; }

  function hiddenHere() {
    const h = location.hash || '';
    // Hide during first-run onboarding (its own language picker handles that)
    if (h.startsWith('#/welcome')) return true;
    if (window.Locale && !Locale.isSet()) return true;
    return false;
  }

  function injectStyles() {
    if (document.getElementById('langfab-styles')) return;
    const st = document.createElement('style');
    st.id = 'langfab-styles';
    st.textContent = `
    .langfab{position:fixed;left:16px;bottom:20px;z-index:9000;display:flex;align-items:center;gap:6px;
      padding:9px 13px;border-radius:999px;border:1px solid rgba(0,0,0,0.08);
      background:#fff;color:#1A1714;box-shadow:0 6px 20px rgba(26,23,20,0.16);
      font-family:inherit;font-size:0.78rem;font-weight:700;letter-spacing:0.03em;cursor:pointer;}
    .langfab:active{transform:scale(0.96);}
    .langfab svg{width:16px;height:16px;display:block;}
    body[dir="rtl"] .langfab{left:auto;right:16px;}
    .langov{position:fixed;inset:0;z-index:9001;background:rgba(26,23,20,0.55);
      backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
      display:flex;align-items:flex-end;justify-content:center;animation:langfade .2s ease;}
    @keyframes langfade{from{opacity:0}to{opacity:1}}
    .langsheet{background:#fff;width:100%;max-width:480px;max-height:72vh;overflow:auto;
      border-radius:20px 20px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom));
      animation:langslide .26s cubic-bezier(.2,.8,.2,1);}
    @keyframes langslide{from{transform:translateY(24px);opacity:.6}to{transform:none;opacity:1}}
    .langsheet-title{font-size:1.05rem;font-weight:700;color:#1A1714;margin:4px 4px 14px;}
    .langgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    .langitem{display:flex;flex-direction:column;align-items:flex-start;gap:1px;text-align:left;
      padding:11px 13px;border-radius:13px;border:1px solid #ECE6DB;background:#fff;cursor:pointer;}
    .langitem.active{border-color:#1A1714;background:#FAF7F1;}
    .langitem-native{font-size:0.95rem;font-weight:700;color:#1A1714;}
    .langitem-name{font-size:0.72rem;color:#8A857C;}
    `;
    document.head.appendChild(st);
  }

  function globe() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/></svg>';
  }

  function close() { const ov = document.getElementById('langov'); if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }

  function open() {
    if (!window.Locale || !Locale.LANGUAGES) return;
    close();
    const langs = Locale.LANGUAGES;
    const cur = curLang();
    const ov = document.createElement('div');
    ov.id = 'langov'; ov.className = 'langov';
    const items = Object.keys(langs).map(code => {
      const l = langs[code];
      return `<button class="langitem ${code === cur ? 'active' : ''}" data-code="${code}">
        <span class="langitem-native">${l.native}</span>
        <span class="langitem-name">${l.name}</span>
      </button>`;
    }).join('');
    ov.innerHTML = `<div class="langsheet" role="dialog" aria-modal="true">
      <div class="langsheet-title">${(window.t && t('welcome.language')) || 'Language'}</div>
      <div class="langgrid">${items}</div>
    </div>`;
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.querySelectorAll('.langitem').forEach(b => b.addEventListener('click', () => choose(b.dataset.code)));
    document.body.appendChild(ov);
  }

  function choose(code) {
    const loc = (window.Locale && Locale.get()) || { country: 'PK', language: 'en' };
    if (window.Locale) Locale.save(Object.assign({}, loc, { language: code }));
    close();
    updateLabel();
    if (window.Router && Router.reload) Router.reload();
  }

  function updateLabel() {
    const code = document.getElementById('langfab-code');
    if (code) code.textContent = curLang().toUpperCase();
  }

  function mount() {
    injectStyles();
    let fab = document.getElementById('langfab');
    if (!fab) {
      fab = document.createElement('button');
      fab.id = 'langfab'; fab.className = 'langfab';
      fab.title = 'Change language';
      fab.innerHTML = globe() + '<span id="langfab-code"></span>';
      fab.addEventListener('click', open);
      document.body.appendChild(fab);
    }
    fab.style.display = hiddenHere() ? 'none' : 'flex';
    updateLabel();
  }

  window.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('hashchange', mount);
  // also refresh after each screen render (catches language/route changes)
  window.addEventListener('screen:mounted', mount);
  if (document.readyState !== 'loading') mount();
})();
