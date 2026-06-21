/* ============================================================
   HOLOS — Model Audit
   Compares a model's native bounding box (from the .glb file)
   against the declared real-world dimensions and lets admin
   bake a correction so customer AR is always correct.

   The flow:
   1. Admin uploads a .glb (or one was made from seller photos)
   2. Admin enters the declared W/H/D for the real product
   3. Audit panel shows the comparison:
       - Native model box (what the file actually contains)
       - Declared real-world size
       - Mismatch analysis (size ratio + proportion drift)
   4. Admin picks correction strategy:
       - Uniform fit (preserves model shape, one dimension matches)
       - Per-axis fit (all dimensions match exactly, may distort)
       - Reject (sends back to modeler)
   5. Correction is BAKED into the product (per-axis or uniform
      scale stored as realDimsCm). Customer AR reads this and
      applies it once at render. No runtime guessing.
   ============================================================ */

const ModelAudit = (() => {

  /* Analyze the relationship between a model's native size and
     the declared real-world size. Returns a verdict object the
     UI can display + use to recommend the correction strategy. */
  function analyze(rawMeters, declaredCm) {
    const r = { w: rawMeters.x, h: rawMeters.y, d: rawMeters.z };
    const dC = declaredCm || { w: 0, h: 0, d: 0 };
    const dMeters = { w: dC.w / 100, h: dC.h / 100, d: dC.d / 100 };

    // Per-axis scale factors needed to match declared
    const factors = {
      w: dMeters.w > 0 ? dMeters.w / r.w : null,
      h: dMeters.h > 0 ? dMeters.h / r.h : null,
      d: dMeters.d > 0 ? dMeters.d / r.d : null,
    };
    const setFactors = [factors.w, factors.h, factors.d].filter(v => v != null);

    if (setFactors.length === 0) {
      return { status: 'no-declaration', message: 'Declared dimensions are missing.' };
    }

    // Are the factors all close to each other? If so, the model is
    // well-proportioned — uniform scale will work without distortion.
    const maxF = Math.max(...setFactors);
    const minF = Math.min(...setFactors);
    const drift = maxF / minF; // 1.0 = perfect, 2.0 = 2× off, 10.0 = 10× off

    // Decide overall verdict
    let status, message, recommendation;
    if (drift <= 1.15) {
      status = 'aligned';
      message = 'Model proportions match the declared size. Uniform correction will give a clean result.';
      recommendation = 'uniform';
    } else if (drift <= 2.0) {
      status = 'minor-drift';
      message = `Model proportions are slightly off (${drift.toFixed(2)}× drift between axes). Uniform fit recommended — slight visual stretch on one axis.`;
      recommendation = 'uniform';
    } else if (drift <= 10) {
      status = 'major-drift';
      message = `Model proportions don't match the declared shape (${drift.toFixed(1)}× drift). Per-axis fit gives accurate sizing but visible distortion.`;
      recommendation = 'per-axis';
    } else {
      status = 'bad-model';
      message = `Model shape is very different from the declared product (${drift.toFixed(0)}× drift). Strongly recommend re-modelling.`;
      recommendation = 'reject';
    }

    // Average factor for "if you applied uniform, what would the size look like"
    const avgFactor = setFactors.reduce((a, b) => a + b, 0) / setFactors.length;
    const uniformPreview = {
      w: r.w * avgFactor * 100,
      h: r.h * avgFactor * 100,
      d: r.d * avgFactor * 100,
    };

    return {
      status, message, recommendation, drift,
      factors, avgFactor,
      uniformPreview,
      native: { w: r.w * 100, h: r.h * 100, d: r.d * 100 }, // in cm for display
      declared: dC,
    };
  }

  /* Render the audit panel HTML. The model-viewer element passed
     in needs to be already loaded — we measure from it. */
  async function render(mvEl, declaredCm, opts = {}) {
    if (!mvEl) return '<div class="ma-empty">No model loaded.</div>';

    let raw;
    try {
      raw = await ModelFit.apply.constructor === Function
        ? await getRawFromMV(mvEl)
        : null;
    } catch (e) { raw = null; }
    if (!raw) {
      return '<div class="ma-empty">Could not read the model file. The .glb may be invalid.</div>';
    }

    const verdict = analyze(raw, declaredCm);
    if (verdict.status === 'no-declaration') {
      return `
        <div class="ma-empty">
          <div class="ma-icon">📐</div>
          <h4>Enter the declared size first</h4>
          <p>Audit needs the real-world W × H × D to compare against the model file.</p>
        </div>
      `;
    }

    const idP = opts.idPrefix || 'ma';
    return `
      <div class="ma-panel ma-${verdict.status}" data-id-prefix="${idP}">
        <div class="ma-header">
          <div class="ma-status-badge ma-status-${verdict.status}">
            ${statusIcon(verdict.status)} ${statusLabel(verdict.status)}
          </div>
          <div class="ma-drift">${verdict.drift.toFixed(2)}× drift between axes</div>
        </div>

        <div class="ma-message">${verdict.message}</div>

        <div class="ma-comparison">
          <div class="ma-col">
            <div class="ma-col-label">Model file native size</div>
            <div class="ma-col-value">${fmtCm(verdict.native.w)} × ${fmtCm(verdict.native.h)} × ${fmtCm(verdict.native.d)}</div>
            <div class="ma-col-sub">what's in the .glb</div>
          </div>
          <div class="ma-arrow">→</div>
          <div class="ma-col ma-col-target">
            <div class="ma-col-label">Declared real-world size</div>
            <div class="ma-col-value">${fmtCm(verdict.declared.w)} × ${fmtCm(verdict.declared.h)} × ${fmtCm(verdict.declared.d)}</div>
            <div class="ma-col-sub">what customers should see in AR</div>
          </div>
        </div>

        <div class="ma-actions">
          <h5>Pick a correction strategy</h5>
          <label class="ma-option ${verdict.recommendation === 'uniform' ? 'recommended' : ''}">
            <input type="radio" name="${idP}-strategy" value="uniform" ${verdict.recommendation === 'uniform' ? 'checked' : ''} />
            <div class="ma-option-body">
              <div class="ma-option-title">Uniform fit ${verdict.recommendation === 'uniform' ? '<span class="ma-pill">recommended</span>' : ''}</div>
              <div class="ma-option-desc">Apply a single scale factor (${verdict.avgFactor.toFixed(4)}) to all axes. Model shape stays clean. Final size: ${fmtCm(verdict.uniformPreview.w)} × ${fmtCm(verdict.uniformPreview.h)} × ${fmtCm(verdict.uniformPreview.d)}</div>
              ${verdict.drift > 1.15 ? `<div class="ma-option-warn">Result will be slightly different from declared (${verdict.drift.toFixed(2)}× off on the worst axis).</div>` : ''}
            </div>
          </label>
          <label class="ma-option ${verdict.recommendation === 'per-axis' ? 'recommended' : ''}">
            <input type="radio" name="${idP}-strategy" value="per-axis" ${verdict.recommendation === 'per-axis' ? 'checked' : ''} />
            <div class="ma-option-body">
              <div class="ma-option-title">Per-axis fit ${verdict.recommendation === 'per-axis' ? '<span class="ma-pill">recommended</span>' : ''}</div>
              <div class="ma-option-desc">Apply different scales per axis (W: ${verdict.factors.w?.toFixed(3) || '—'}, H: ${verdict.factors.h?.toFixed(3) || '—'}, D: ${verdict.factors.d?.toFixed(3) || '—'}). All dimensions match exactly.</div>
              ${verdict.drift > 1.5 ? `<div class="ma-option-warn">Model will appear visually ${verdict.drift > 3 ? 'distorted' : 'slightly stretched'} on one or more axes.</div>` : ''}
            </div>
          </label>
          <label class="ma-option ${verdict.recommendation === 'reject' ? 'recommended' : ''}">
            <input type="radio" name="${idP}-strategy" value="reject" ${verdict.recommendation === 'reject' ? 'checked' : ''} />
            <div class="ma-option-body">
              <div class="ma-option-title">Reject this model ${verdict.recommendation === 'reject' ? '<span class="ma-pill ma-pill-warn">recommended</span>' : ''}</div>
              <div class="ma-option-desc">Send back to modeler. The model's shape doesn't represent the product. Customer AR shouldn't see this.</div>
            </div>
          </label>
        </div>
      </div>
    `;
  }

  /* Get true raw dims from a model-viewer (uses ModelFit's caching) */
  async function getRawFromMV(mvEl) {
    if (!mvEl || !mvEl.getDimensions) return null;
    if (!mvEl.loaded) {
      await new Promise(resolve => {
        const onLoad = () => { mvEl.removeEventListener('load', onLoad); resolve(); };
        mvEl.addEventListener('load', onLoad);
        setTimeout(onLoad, 5000);
      });
    }
    if (!mvEl.loaded) return null;
    // Force scale 1 temporarily so we read the file's native dims
    const prevScale = mvEl.getAttribute('scale') || '1 1 1';
    mvEl.setAttribute('scale', '1 1 1');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const dims = mvEl.getDimensions();
    // Restore previous scale
    mvEl.setAttribute('scale', prevScale);
    if (!dims || dims.x <= 0 || dims.y <= 0 || dims.z <= 0) return null;
    return { x: Number(dims.x), y: Number(dims.y), z: Number(dims.z) };
  }

  /* Read which strategy the admin chose */
  function readChoice(idPrefix = 'ma') {
    const chosen = document.querySelector(`input[name="${idPrefix}-strategy"]:checked`);
    return chosen ? chosen.value : null;
  }

  /* Bake the chosen correction into a models patch ready to save.
     Returns: { realDimsCm, realSizeCm, scaleX, scaleY, scaleZ, strategy }
     The product gets the W/H/D the admin DECLARED — customer AR uses those.
     The scale strategy determines HOW model-viewer renders to match. */
  function bake(strategy, rawMeters, declaredCm) {
    const result = {
      strategy,
      realDimsCm: { w: declaredCm.w || 0, h: declaredCm.h || 0, d: declaredCm.d || 0 },
      realSizeCm: Math.max(declaredCm.w, declaredCm.h, declaredCm.d) || 0,
    };
    // For 'reject', the caller should mark the model for re-do.
    // For 'uniform' and 'per-axis', we don't store the scale itself in DB
    // because the customer page recomputes from raw + declared at render time.
    // But we DO want to remember which strategy was approved so the renderer
    // applies the right one.
    result.scaleStrategy = strategy; // 'uniform' | 'per-axis' | 'reject'
    return result;
  }

  function statusIcon(status) {
    return {
      'aligned': '✓',
      'minor-drift': '✓',
      'major-drift': '⚠',
      'bad-model': '✕',
      'no-declaration': '?',
    }[status] || '?';
  }
  function statusLabel(status) {
    return {
      'aligned': 'Model is well-aligned',
      'minor-drift': 'Minor proportion drift',
      'major-drift': 'Major proportion drift',
      'bad-model': 'Model shape doesn\'t match',
      'no-declaration': 'Needs declared size',
    }[status] || status;
  }
  function fmtCm(v) {
    if (v == null || v === 0) return '—';
    return v.toFixed(v < 10 ? 1 : 0) + ' cm';
  }

  function injectStyles() {
    if (document.getElementById('ma-styles')) return;
    const s = document.createElement('style');
    s.id = 'ma-styles';
    s.textContent = `
      .ma-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); margin-top: var(--s-3); }
      .ma-aligned { border-left: 4px solid var(--success); }
      .ma-minor-drift { border-left: 4px solid var(--success); }
      .ma-major-drift { border-left: 4px solid var(--warn); }
      .ma-bad-model { border-left: 4px solid var(--danger); }
      .ma-empty { padding: var(--s-5); text-align: center; color: var(--ink-dim); background: var(--surface); border: 1px dashed var(--border); border-radius: var(--r-md); }
      .ma-empty .ma-icon { font-size: 2rem; margin-bottom: var(--s-2); }
      .ma-empty h4 { font-weight: 700; margin-bottom: var(--s-1); color: var(--ink); }
      .ma-empty p { font-size: var(--t-small); }
      .ma-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--s-3); flex-wrap: wrap; gap: var(--s-2); }
      .ma-status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--r-pill); font-size: var(--t-small); font-weight: 700; }
      .ma-status-aligned, .ma-status-minor-drift { background: var(--success-soft); color: var(--success); }
      .ma-status-major-drift { background: var(--warn-soft); color: var(--warn); }
      .ma-status-bad-model { background: var(--danger-soft); color: var(--danger); }
      .ma-drift { font-size: var(--t-small); color: var(--ink-dim); font-weight: 600; }
      .ma-message { color: var(--ink-dim); font-size: var(--t-small); line-height: 1.5; margin-bottom: var(--s-4); }
      .ma-comparison { display: grid; grid-template-columns: 1fr auto 1fr; gap: var(--s-3); align-items: center; padding: var(--s-4); background: var(--bg); border-radius: var(--r-md); margin-bottom: var(--s-4); }
      @media (max-width: 540px) { .ma-comparison { grid-template-columns: 1fr; } .ma-arrow { display: none; } }
      .ma-col { text-align: center; }
      .ma-col-target { color: var(--accent); }
      .ma-col-label { font-size: var(--t-micro); color: var(--ink-dim); font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
      .ma-col-value { font-family: var(--font-serif, var(--font)); font-size: 1.15rem; font-weight: 600; letter-spacing: -0.01em; }
      .ma-col-sub { font-size: var(--t-micro); color: var(--ink-muted); margin-top: 4px; }
      .ma-arrow { font-size: 1.4rem; color: var(--ink-muted); }
      .ma-actions h5 { font-size: var(--t-small); font-weight: 700; color: var(--ink-dim); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: var(--s-3); }
      .ma-option { display: flex; gap: var(--s-3); padding: var(--s-3); background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: var(--s-2); cursor: pointer; transition: all 160ms; }
      .ma-option:hover { border-color: var(--border-strong); }
      .ma-option.recommended { border-color: var(--accent); background: var(--accent-soft); }
      .ma-option input { margin-top: 4px; cursor: pointer; flex-shrink: 0; }
      .ma-option-body { flex: 1; min-width: 0; }
      .ma-option-title { font-weight: 700; font-size: var(--t-body); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
      .ma-option-desc { font-size: var(--t-small); color: var(--ink-dim); line-height: 1.5; }
      .ma-option-warn { margin-top: 6px; padding: 6px 10px; background: var(--warn-soft); color: var(--warn); border-radius: var(--r-sm); font-size: var(--t-micro); font-weight: 600; }
      .ma-pill { display: inline-block; padding: 2px 8px; background: var(--accent); color: white; border-radius: var(--r-pill); font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
      .ma-pill-warn { background: var(--warn); }
    `;
    document.head.appendChild(s);
  }

  return { analyze, render, readChoice, bake, getRawFromMV, injectStyles };
})();

window.ModelAudit = ModelAudit;
