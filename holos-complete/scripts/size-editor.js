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
          <input id="${idPrefix}-w" class="fr-input" type="number" min="0" max="10000" step="0.1" value="${dims.w || ''}" placeholder="${sug?.w || ''}" oninput="if(this.value.length>6){this.value=this.value.slice(0,6);}" />
        </div>
        <div class="fr-field">
          <label class="fr-label">Height (cm)</label>
          <input id="${idPrefix}-h" class="fr-input" type="number" min="0" max="10000" step="0.1" value="${dims.h || ''}" placeholder="${sug?.h || ''}" oninput="if(this.value.length>6){this.value=this.value.slice(0,6);}" />
        </div>
        <div class="fr-field">
          <label class="fr-label">Depth (cm)</label>
          <input id="${idPrefix}-d" class="fr-input" type="number" min="0" max="10000" step="0.1" value="${dims.d || ''}" placeholder="${sug?.d || ''}" oninput="if(this.value.length>6){this.value=this.value.slice(0,6);}" />
        </div>
      </div>
      <div class="fr-hint">Width = side-to-side, Height = top-to-bottom, Depth = front-to-back. The model fits inside this box keeping its aspect ratio. Leave a dimension blank or 0 to ignore it.</div>
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
    `;
    document.head.appendChild(s);
  }

  /* Legacy noop for old callers that referenced switchMode */
  function switchMode() {}

  return { render, read, useSuggestion, switchMode, injectStyles };
})();

window.SizeEditor = SizeEditor;
