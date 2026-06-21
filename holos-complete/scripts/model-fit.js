/* ============================================================
   HOLOS — Model Fit (v4 · cached raw dimensions)

   THE BUG IT FIXES:
   model-viewer's getDimensions() returns the CURRENT bounding box,
   which already includes any scale that was applied. So if you
   apply a scale, then measure again, you get the SCALED size, not
   the raw size. Apply again → scale compounds → model explodes or
   collapses.

   THE FIX:
   On first call for any <model-viewer>, we reset scale to 1, wait
   one frame for that to take effect, then measure and CACHE the
   true raw dimensions per element. All subsequent calls compute
   the absolute scale from that cached raw value. Scale never
   compounds.
   ============================================================ */

const ModelFit = (() => {

  /* Per-element cache of original (scale = 1) bounding box. Keyed
     by the element + current src so a model swap invalidates. */
  const _rawCache = new WeakMap();

  /* Get the TRUE raw bounding box of a model in meters.
     Always returns the dimensions at scale 1, regardless of any
     scale currently applied. Returns null if the model isn't ready. */
  async function getRawDims(mvEl) {
    if (!mvEl || !mvEl.getDimensions) return null;

    // Wait for model to load
    if (!mvEl.loaded) {
      await new Promise(resolve => {
        const onLoad = () => { mvEl.removeEventListener('load', onLoad); resolve(); };
        mvEl.addEventListener('load', onLoad);
        // Safety: don't hang forever
        setTimeout(onLoad, 5000);
      });
    }
    if (!mvEl.loaded) return null;

    const currentSrc = mvEl.getAttribute('src') || mvEl.src || '';
    const cached = _rawCache.get(mvEl);
    if (cached && cached.src === currentSrc) return cached.dims;

    // First measurement for this element: reset scale to 1 so we measure RAW.
    mvEl.setAttribute('scale', '1 1 1');
    if ('scale' in mvEl) { try { mvEl.scale = '1 1 1'; } catch (e) {} }

    // Wait two frames for the renderer to apply scale=1 and update the bbox.
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const dims = mvEl.getDimensions();
    if (!dims || dims.x <= 0 || dims.y <= 0 || dims.z <= 0) {
      log('ModelFit', 'invalid raw dims: ' + JSON.stringify(dims), 'warn');
      return null;
    }
    // Cache as plain numbers so they don't drift
    const raw = { x: Number(dims.x), y: Number(dims.y), z: Number(dims.z) };
    _rawCache.set(mvEl, { src: currentSrc, dims: raw });
    return raw;
  }

  /* Apply a real-world size to a <model-viewer>.
     sizeOrCanvas can be:
       - a number → longest dimension in cm (legacy, applies uniform scale)
       - {w, h, d} in cm → canvas mode
     opts:
       - strategy: 'uniform' (preserve shape, single scale), 'per-axis'
         (independent X/Y/Z scales — exact dims, may distort), or 'auto'
         (default: pick based on proportion drift — uniform if model is
         well-aligned, per-axis if not). Once admin runs Model Audit and
         picks a strategy, that choice is stored on the product and
         passed in here so customer AR always uses the same approach.
  */
  async function apply(mvEl, sizeOrCanvas, opts = {}) {
    if (!mvEl || sizeOrCanvas == null) return;
    const strategy = opts.strategy || 'auto';

    // Normalize input
    const canvas = typeof sizeOrCanvas === 'object'
      ? {
          w: Math.max(0, Number(sizeOrCanvas.w) || 0),
          h: Math.max(0, Number(sizeOrCanvas.h) || 0),
          d: Math.max(0, Number(sizeOrCanvas.d) || 0),
        }
      : { longest: Math.max(0, Number(sizeOrCanvas) || 0) };

    // Sanity: clamp to reasonable physical limits (0.1mm to 1000m).
    // Garbage input like 12122311211 (12 billion cm) shouldn't try to render.
    const MAX_CM = 100000; // 1 km — anything over this is clearly bad input
    if (canvas.longest != null) {
      if (canvas.longest <= 0) return;
      if (canvas.longest > MAX_CM) { log('ModelFit', `value ${canvas.longest}cm too large, ignored`, 'warn'); return; }
    } else {
      if (canvas.w === 0 && canvas.h === 0 && canvas.d === 0) return;
      if (canvas.w > MAX_CM || canvas.h > MAX_CM || canvas.d > MAX_CM) {
        log('ModelFit', `value over ${MAX_CM}cm, ignored`, 'warn'); return;
      }
    }

    // Always get the TRUE raw dimensions, never the currently-displayed ones.
    const raw = await getRawDims(mvEl);
    if (!raw) return;

    // Calculate per-axis scales.
    // - Legacy "longest" mode: uniform scale based on longest raw dimension.
    // - Canvas mode: NON-UNIFORM scaling so each axis matches the entered cm.
    //   For axes the user left at 0, we use the average of the set axes
    //   so the model doesn't get squashed flat on unspecified dimensions.
    //   This is what sellers actually want: enter 35×24×2cm and the
    //   product appears at exactly 35×24×2cm in AR.
    //   model-viewer axes: x=width, y=height, z=depth.
    let sx, sy, sz;
    if (canvas.longest != null) {
      const longestM = Math.max(raw.x, raw.y, raw.z);
      const f = (canvas.longest / 100) / longestM;
      sx = sy = sz = f;
    } else {
      const targetX = canvas.w > 0 ? (canvas.w / 100) / raw.x : null;
      const targetY = canvas.h > 0 ? (canvas.h / 100) / raw.y : null;
      const targetZ = canvas.d > 0 ? (canvas.d / 100) / raw.z : null;
      const set = [targetX, targetY, targetZ].filter(v => v != null);
      if (set.length === 0) return;

      if (strategy === 'uniform') {
        // Uniform: use average of set factors. Preserves model shape.
        // Dimensions may not match declared exactly if model proportions
        // differ, but no visual distortion.
        const avg = set.reduce((a, b) => a + b, 0) / set.length;
        sx = sy = sz = avg;
      } else if (strategy === 'per-axis') {
        // Per-axis: exact dimensional match. May distort the model.
        // For unset axes, use average to avoid squashing them flat.
        const avg = set.reduce((a, b) => a + b, 0) / set.length;
        sx = targetX != null ? targetX : avg;
        sy = targetY != null ? targetY : avg;
        sz = targetZ != null ? targetZ : avg;
      } else {
        // 'auto' — use per-axis only if axes diverge a lot, otherwise
        // uniform. Threshold 1.3× drift = "noticeably off".
        const maxF = Math.max(...set);
        const minF = Math.min(...set);
        const drift = maxF / minF;
        if (drift > 1.3) {
          const avg = set.reduce((a, b) => a + b, 0) / set.length;
          sx = targetX != null ? targetX : avg;
          sy = targetY != null ? targetY : avg;
          sz = targetZ != null ? targetZ : avg;
        } else {
          const avg = set.reduce((a, b) => a + b, 0) / set.length;
          sx = sy = sz = avg;
        }
      }
    }

    // Sanity-clamp each axis (prevents NaN, ∞, or insane values)
    const clamp = v => {
      if (!v || !isFinite(v) || v <= 0) return null;
      return Math.max(0.0001, Math.min(1000, v));
    };
    sx = clamp(sx); sy = clamp(sy); sz = clamp(sz);
    if (sx == null || sy == null || sz == null) {
      log('ModelFit', `bad scales sx=${sx} sy=${sy} sz=${sz}`, 'warn');
      return;
    }

    // Apply NON-UNIFORM absolute scale.
    const scaleStr = `${sx} ${sy} ${sz}`;
    mvEl.setAttribute('scale', scaleStr);
    if ('scale' in mvEl) { try { mvEl.scale = scaleStr; } catch (e) {} }
    mvEl.setAttribute('ar-scale', 'fixed');

    // DO NOT auto-frame the camera. The whole point of showing the model at
    // its real-world size is so the seller can SEE if it's huge or tiny.
    // If we updateFraming() after every change, the camera always nicely
    // frames the model whatever size — and the seller loses the visual cue
    // that "wow, 800cm is way too big for a laptop". So we leave the camera
    // alone. The user can still pan/zoom manually via camera-controls.

    const label = canvas.longest != null
      ? `${canvas.longest}cm longest`
      : `${canvas.w || '—'}×${canvas.h || '—'}×${canvas.d || '—'}cm`;
    log('ModelFit', `${label} [${strategy}] · scales ${sx.toFixed(4)} ${sy.toFixed(4)} ${sz.toFixed(4)} · raw ${raw.x.toFixed(2)}×${raw.y.toFixed(2)}×${raw.z.toFixed(2)}m`);
  }

  /* Suggested sizes by subcategory — used to pre-fill the size inputs
     so seller/admin don't have to guess. Values in cm: { name, w, h, d }. */
  const SIZE_HINTS = {
    // Wearables
    'shoe-formal': { w: 30, h: 12, d: 12, name: "Men's shoe (UK 9)" },
    'shoe-sneakers': { w: 30, h: 12, d: 12, name: 'Sneaker (UK 9)' },
    'shoe-boots': { w: 32, h: 30, d: 12, name: 'Boots' },
    'shoe-sandals': { w: 28, h: 5, d: 11, name: 'Sandals' },
    'shoe-heels': { w: 25, h: 12, d: 10, name: 'Heels' },
    'sunglasses': { w: 14, h: 5, d: 14, name: 'Sunglasses' },
    'glasses': { w: 14, h: 5, d: 14, name: 'Glasses' },
    'eyewear': { w: 14, h: 5, d: 14, name: 'Eyewear' },
    'watches-analog': { w: 4, h: 4, d: 1.2, name: 'Wristwatch' },
    'watches-digital': { w: 4, h: 4, d: 1.2, name: 'Wristwatch' },
    'watches-smart': { w: 4.5, h: 4, d: 1.2, name: 'Smartwatch' },
    'watches-luxury': { w: 4, h: 4, d: 1.2, name: 'Luxury watch' },
    'jewelry-ring': { w: 2, h: 2, d: 0.5, name: 'Ring' },
    'jewelry-necklace': { w: 18, h: 30, d: 0.3, name: 'Necklace' },
    'jewelry-earring': { w: 2, h: 3, d: 0.5, name: 'Earring' },
    'jewelry-bracelet': { w: 6, h: 6, d: 1, name: 'Bracelet' },
    'jewelry-pendant': { w: 3, h: 4, d: 0.5, name: 'Pendant' },
    // Clothing
    'clothing-shirt': { w: 50, h: 70, d: 2, name: 'Shirt' },
    'clothing-tshirt': { w: 50, h: 70, d: 1, name: 'T-shirt' },
    'clothing-pants': { w: 40, h: 100, d: 5, name: 'Pants' },
    'clothing-jacket': { w: 55, h: 75, d: 8, name: 'Jacket' },
    'clothing-dress': { w: 50, h: 120, d: 3, name: 'Dress' },
    'clothing-suit': { w: 55, h: 140, d: 8, name: 'Suit' },
    'bridal-lehenga': { w: 100, h: 110, d: 5, name: 'Lehenga' },
    'bridal-saree': { w: 110, h: 550, d: 1, name: 'Saree (unfurled)' },
    'bridal-gown': { w: 80, h: 150, d: 5, name: 'Gown' },
    // Bags
    'bags-handbag': { w: 35, h: 25, d: 12, name: 'Handbag' },
    'bags-backpack': { w: 30, h: 45, d: 15, name: 'Backpack' },
    'bags-clutch': { w: 25, h: 14, d: 4, name: 'Clutch' },
    'bags-tote': { w: 40, h: 35, d: 14, name: 'Tote bag' },
    'bags-wallet': { w: 12, h: 9, d: 2, name: 'Wallet' },
    // Furniture
    'furniture-sofa': { w: 220, h: 90, d: 95, name: 'Sofa (3-seater)' },
    'furniture-chair': { w: 50, h: 90, d: 55, name: 'Chair' },
    'furniture-armchair': { w: 90, h: 90, d: 95, name: 'Armchair' },
    'furniture-table': { w: 150, h: 75, d: 90, name: 'Dining table' },
    'furniture-bed': { w: 160, h: 90, d: 200, name: 'Queen bed' },
    'furniture-bookshelf': { w: 90, h: 180, d: 30, name: 'Bookshelf' },
    'furniture-cabinet': { w: 120, h: 90, d: 45, name: 'Cabinet' },
    'furniture-desk': { w: 140, h: 75, d: 70, name: 'Desk' },
    // Decor
    'decor-lamp': { w: 30, h: 50, d: 30, name: 'Table lamp' },
    'decor-vase': { w: 20, h: 30, d: 20, name: 'Vase' },
    'decor-mirror': { w: 60, h: 80, d: 4, name: 'Wall mirror' },
    'decor-rug': { w: 200, h: 2, d: 300, name: 'Area rug' },
    'decor-wallart': { w: 70, h: 50, d: 3, name: 'Wall art' },
    'decor-clock': { w: 40, h: 40, d: 5, name: 'Wall clock' },
    'decor-cushion': { w: 45, h: 45, d: 15, name: 'Cushion' },
    // Kitchen
    'kitchen-cookware': { w: 30, h: 15, d: 30, name: 'Cooking pot' },
    'kitchen-appliance': { w: 40, h: 35, d: 35, name: 'Appliance' },
    'kitchen-utensils': { w: 25, h: 5, d: 5, name: 'Utensil' },
    'kitchen-dinnerware': { w: 25, h: 4, d: 25, name: 'Plate / dish' },
    // Electronics
    'electronics-phone': { w: 7.5, h: 16, d: 0.9, name: 'Phone' },
    'electronics-laptop': { w: 35, h: 1.8, d: 24, name: 'Laptop' },
    'electronics-tv': { w: 110, h: 65, d: 10, name: 'TV (50")' },
    'electronics-headphones': { w: 20, h: 22, d: 10, name: 'Headphones' },
    'electronics-speaker': { w: 25, h: 35, d: 25, name: 'Speaker' },
    'electronics-camera': { w: 15, h: 11, d: 9, name: 'Camera' },
    'electronics-tablet': { w: 25, h: 18, d: 0.8, name: 'Tablet' },
    // Beauty
    'beauty-makeup': { w: 8, h: 12, d: 3, name: 'Makeup product' },
    'beauty-skincare': { w: 6, h: 14, d: 6, name: 'Skincare bottle' },
    'beauty-perfume': { w: 8, h: 12, d: 4, name: 'Perfume bottle' },
    'beauty-haircare': { w: 7, h: 22, d: 5, name: 'Haircare bottle' },
    // Toys
    'toys-figure': { w: 10, h: 20, d: 10, name: 'Figurine' },
    'toys-plush': { w: 25, h: 30, d: 18, name: 'Plush toy' },
    'toys-vehicle': { w: 25, h: 10, d: 12, name: 'Toy vehicle' },
    'toys-building': { w: 30, h: 25, d: 8, name: 'Building set' },
    'toys-board': { w: 40, h: 6, d: 30, name: 'Board game' },
    // Sports
    'sports-ball': { w: 22, h: 22, d: 22, name: 'Sport ball' },
    'sports-equipment': { w: 100, h: 30, d: 25, name: 'Sports equipment' },
    'sports-apparel': { w: 50, h: 70, d: 2, name: 'Sports apparel' },
  };

  function getSuggestion(subId) {
    if (!subId) return null;
    return SIZE_HINTS[subId] || null;
  }

  function sizeHint(tryOn) {
    return {
      foot: 'Tip: a UK 9 shoe is about 30 cm long',
      face: 'Tip: glasses are about 14 cm wide',
      wrist: 'Tip: a watch case is about 4 cm',
      finger: 'Tip: a ring is about 2 cm',
      'body-ai': 'Tip: a kurta is about 80–100 cm tall',
      room: 'Enter W × H × D in centimeters',
      wall: 'Enter W × H × D in centimeters',
    }[tryOn] || 'Enter W × H × D';
  }

  /* Manually clear the cache for a model viewer — call when the src changes
     between products in a SPA navigation. (Most uses don't need this because
     we key the cache by src too.) */
  function invalidate(mvEl) {
    if (mvEl) _rawCache.delete(mvEl);
  }

  return { apply, sizeHint, getSuggestion, invalidate, SIZE_HINTS };
})();

window.ModelFit = ModelFit;
log('ModelFit', 'ready (v7 with audit-driven strategy)');
