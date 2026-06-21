/* ============================================================
   SCREEN: Shopkeeper / Edit Product
   Edit any field of an existing product. Changes go to pending_approval
   so admin can review (unless seller has auto_live enabled, in which
   case changes go live immediately).
   ============================================================ */

Router.registerDynamic('/shopkeeper/edit-product/', (pid) => {
  const shop = State.get('shop');
  if (!shop) { setTimeout(()=>Router.go('/shopkeeper/login'),0); return '<div></div>'; }
  const p = State.getProduct(pid);
  if (!p || p.shop !== shop.id) { return '<div style="padding:2rem;">Product not found</div>'; }
  const sub = Taxonomy.getSubcategoryById(p.subcategory);
  log('Shopkeeper/EditProduct', pid);

  setTimeout(() => {
    FieldRenderer.initCustomSelects(document.getElementById('ep-form'));
    document.getElementById('ep-save').addEventListener('click', () => saveProductEdits(pid));
    // Restore current field values into the schema renderer
    restoreFieldValues(p.options || {});
    // Wire photo replacement
    document.querySelectorAll('.ep-photo-slot').forEach((slot, i) => wireEpPhotoSlot(slot, i, pid));
    SizeEditor.injectStyles();

    // Apply real-world size to the preview model-viewer so seller sees true scale.
    const mv = document.querySelector('.ep-model-preview model-viewer');
    if (mv && p?.models?.realDimsCm) {
      const d = p.models.realDimsCm;
      const strategy = p.models.scaleStrategy || 'auto';
      if (d.w || d.h || d.d) ModelFit.apply(mv, d, { strategy });
    }

    // Live-update preview when any W/H/D input changes.
    const updatePreview = () => {
      const size = SizeEditor.read('ep');
      const mvEl = document.querySelector('.ep-model-preview model-viewer');
      if (!mvEl) return;
      const { w, h, d } = size.realDimsCm;
      const strategy = p?.models?.scaleStrategy || 'auto';
      if (w || h || d) ModelFit.apply(mvEl, size.realDimsCm, { strategy });
      const hint = document.querySelector('.ep-preview-hint');
      if (hint) {
        if (!(w || h || d)) {
          hint.innerHTML = '⚠ Set the W × H × D above so the AR placement is accurate.';
          hint.className = 'ep-preview-hint warn';
          return;
        }
        // Warn if any dimension is bigger than ~3 meters (likely an error)
        const maxDim = Math.max(w, h, d);
        const warn = maxDim > 300;
        hint.innerHTML = `
          <div class="ep-ph-dims">${w || '—'} × ${h || '—'} × ${d || '—'} cm</div>
          <div class="ep-ph-real">In AR this product will appear at exactly these real-world dimensions in the customer's room.</div>
          ${warn ? `<div class="ep-ph-warn">⚠ ${maxDim}cm is over 3 meters. Are you sure? Most products are 5–200cm.</div>` : ''}
        `;
        hint.className = warn ? 'ep-preview-hint warn' : 'ep-preview-hint';
      }
    };
    ['ep-w','ep-h','ep-d'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updatePreview);
    });
  }, 60);

  return `
    <div class="screen ep">
      <header class="ep-top">
        <button class="btn-icon-bare" style="color:white;" onclick="Router.back()">${icon('arrow_left')}</button>
        <div class="ep-top-title">Edit product</div>
        <button class="ep-status-badge st-${p.status}">${({live:'Live',pending_approval:'Pending',photo_review:'Photo issue',draft:'Draft'})[p.status]||p.status}</button>
      </header>

      <main class="ep-main">
        <div class="ep-note">
          ${shop.autoLive
            ? '<strong>Auto-publish on:</strong> Your changes go live immediately.'
            : '<strong>Changes need admin approval.</strong> Until approved, customers continue to see the current version.'}
        </div>

        <!-- Photos -->
        <section class="ep-section">
          <h3 class="ep-h3">Photos</h3>
          <div class="ep-photo-grid">
            ${[0,1,2,3,4,5].map(i => {
              const url = (p.photoUrls || [])[i];
              return `
                <div class="ep-photo-slot ${url ? 'filled' : ''}" id="ep-photo-${i}">
                  ${url ? `
                    <img src="${url}" alt="photo ${i+1}" />
                    <button class="ep-photo-edit" onclick="event.stopPropagation(); openEpPhotoMenu(${i}, '${pid}', true)" title="Edit">${icon('settings')}</button>
                    <button class="ep-photo-del" onclick="event.stopPropagation(); deleteEpPhoto(${i}, '${pid}')" title="Remove">✕</button>
                  ` : `<span>${icon('plus')}</span>`}
                  <input type="file" id="ep-photo-input-${i}" accept="image/jpeg,image/png,image/webp" style="display:none;" />
                  <input type="file" id="ep-photo-camera-${i}" accept="image/*" capture="environment" style="display:none;" />
                </div>
              `;
            }).join('')}
          </div>
          <p class="ep-hint">Tap a slot to add or change a photo. Take a new picture with the camera or pick from your library.</p>
        </section>

        <!-- Photo source picker modal -->
        <div id="ep-photo-menu" class="ep-photo-menu" style="display:none;" onclick="closeEpPhotoMenu(event)">
          <div class="ep-photo-menu-card">
            <h3 class="ep-photo-menu-title">Add photo</h3>
            <button class="ep-photo-menu-btn" onclick="pickEpCamera()">${icon('camera')}<span>Take photo with camera</span></button>
            <button class="ep-photo-menu-btn" onclick="pickEpLibrary()">${icon('image')}<span>Choose from library</span></button>
            <button class="ep-photo-menu-btn" onclick="setAsThumb()">${icon('star')}<span>Use as thumbnail (cover image)</span></button>
            <button class="ep-photo-menu-cancel" onclick="closeEpPhotoMenu()">Cancel</button>
          </div>
        </div>

        <!-- Basics -->
        <section class="ep-section">
          <h3 class="ep-h3">Basics</h3>
          <div class="fr-field">
            <label class="fr-label">Product name</label>
            <input id="ep-name" class="fr-input" value="${p.name || ''}" />
          </div>
          <div class="fr-field">
            <label class="fr-label">Description</label>
            <textarea id="ep-desc" class="fr-input fr-textarea" rows="3">${p.description || ''}</textarea>
          </div>
        </section>

        <!-- Pricing -->
        <section class="ep-section">
          <h3 class="ep-h3">Pricing</h3>
          <div class="fr-field">
            <label class="fr-label">Regular price (PKR)</label>
            <input id="ep-price" class="fr-input" type="number" value="${p.price || 0}" />
          </div>
          <div class="fr-field">
            <label class="fr-label">Sale price (PKR, 0 to disable)</label>
            <input id="ep-sale" class="fr-input" type="number" value="${p.salePrice || 0}" />
          </div>
          <div class="fr-field">
            <label style="display:flex;gap:var(--s-2);align-items:center;cursor:pointer;">
              <input type="checkbox" id="ep-bestseller" ${p.bestSeller ? 'checked' : ''} />
              <span>Mark as Best Seller</span>
            </label>
          </div>
        </section>

        <!-- Schema-driven details -->
        <section class="ep-section">
          <h3 class="ep-h3">Product details</h3>
          <div id="ep-form">
            ${FieldRenderer.renderSchema(p.subcategory)}
          </div>
        </section>

        <!-- Real-world size + model URLs -->
        <section class="ep-section">
          <h3 class="ep-h3">AR size</h3>
          <p style="font-size:var(--t-small);color:var(--ink-dim);margin-bottom:var(--s-3);">Enter the real-world Width × Height × Depth in centimeters so the product appears at the correct scale when customers view it in AR.</p>
          ${SizeEditor.render('ep', p.subcategory, p.models)}
          <div class="ep-model-status" style="margin-top:var(--s-4);">
            <div>3D model (.glb): ${p.models?.glb ? '<span style="color:var(--success);font-weight:600;">✓ Uploaded</span>' : '<span style="color:var(--ink-dim);">Not yet</span>'}</div>
            <div>iOS model (.usdz): ${p.models?.usdz ? '<span style="color:var(--success);font-weight:600;">✓ Uploaded</span>' : '<span style="color:var(--ink-dim);">Not yet</span>'}</div>
          </div>
        </section>

        <!-- Preview your product -->
        <section class="ep-section ep-preview-section">
          <h3 class="ep-h3">${icon('eye')} Preview how customers see it</h3>
          <p class="ep-preview-desc">Check how your product looks before customers see it. Rotate the model, view it in AR in your real space, or open the full product page.</p>

          ${p.models?.glb ? `
            <div class="ep-model-preview">
              <model-viewer
                src="${p.models.glb}"
                ${p.models.usdz ? `ios-src="${p.models.usdz}"` : ''}
                alt="${p.name}"
                ar ar-modes="webxr scene-viewer quick-look" ar-scale="fixed"
                camera-controls auto-rotate auto-rotate-delay="800"
                rotation-per-second="14deg"
                shadow-intensity="1" exposure="1.1"
                environment-image="neutral"
                style="width:100%;height:340px;background:var(--bg);border-radius:var(--r-md);">
                <button slot="ar-button" class="ep-ar-btn">${icon('cube')} View in your room (AR)</button>
              </model-viewer>
              <div class="ep-preview-actions">
                <button class="btn btn-ghost" onclick="document.querySelector('.ep-model-preview model-viewer').activateAR?.()">${icon('cube')} Tap to place in AR</button>
                <button class="btn btn-primary" onclick="window.open('#/customer/product/${p.id}', '_blank')">${icon('eye')} See customer view (new tab)</button>
              </div>
              <div class="ep-preview-hint">${(() => {
                const d = p.models?.realDimsCm;
                if (!d || (!d.w && !d.h && !d.d)) return '⚠ Set the W × H × D above so the AR placement is accurate.';
                const maxDim = Math.max(d.w, d.h, d.d);
                const warn = maxDim > 300;
                return `
                  <div class="ep-ph-dims">${d.w||'—'} × ${d.h||'—'} × ${d.d||'—'} cm</div>
                  <div class="ep-ph-real">In AR this product will appear at exactly these real-world dimensions in the customer's room.</div>
                  ${warn ? `<div class="ep-ph-warn">⚠ ${maxDim}cm is over 3 meters. Are you sure? Most products are 5–200cm.</div>` : ''}
                `;
              })()}</div>
            </div>
          ` : `
            <div class="ep-preview-empty">
              <div style="font-size:2.5rem;opacity:0.3;">📦</div>
              <p style="color:var(--ink-dim);font-size:var(--t-small);margin-top:var(--s-2);">No 3D model uploaded yet. Once HOLOS team builds your model from your photos (or you upload one), you'll be able to preview it here in AR.</p>
              <button class="btn btn-ghost" style="margin-top:var(--s-3);" onclick="window.open('#/customer/product/${p.id}', '_blank')">${icon('eye')} See product page (new tab)</button>
            </div>
          `}
        </section>

        <button id="ep-save" class="btn btn-primary btn-large btn-block">Save changes</button>
        <button class="btn btn-ghost btn-block" style="margin-top:var(--s-2);color:var(--danger);" onclick="deleteOwnProduct('${pid}','${(p.name||'').replace(/'/g, "\\'")}')">Delete product</button>
      </main>
    </div>

    <style>
      .ep { min-height: 100vh; background: var(--bg); padding-bottom: var(--s-7); }
      .ep-top { display: flex; align-items: center; justify-content: space-between; padding: var(--s-3) var(--s-5); background: var(--accent); position: sticky; top: 0; z-index: 10; }
      .ep-top-title { font-weight: 700; font-size: var(--t-h2); color: white; }
      .ep-status-badge { font-size: var(--t-micro); padding: 4px var(--s-2); border-radius: var(--r-pill); font-weight: 700; text-transform: uppercase; background: rgba(255,255,255,0.2); color: white; border: none; }
      .ep-main { max-width: 640px; margin: 0 auto; padding: var(--s-5); }
      .ep-note { background: var(--accent-soft); border-left: 3px solid var(--accent); padding: var(--s-3) var(--s-4); border-radius: var(--r-sm); font-size: var(--t-small); margin-bottom: var(--s-5); color: var(--ink); }
      
    .ep-preview-section { background: linear-gradient(135deg, var(--accent-soft), var(--surface)); }
    .ep-preview-desc { font-size: var(--t-small); color: var(--ink-dim); line-height: 1.5; margin-bottom: var(--s-4); }
    .ep-model-preview { display: flex; flex-direction: column; gap: var(--s-3); }
    .ep-preview-actions { display: flex; gap: var(--s-2); flex-wrap: wrap; }
    .ep-preview-actions .btn { flex: 1; min-width: 0; }
    .ep-preview-hint { padding: var(--s-3) var(--s-4); background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); }
    .ep-preview-hint.warn { background: var(--warn-soft); border-color: var(--warn); }
    .ep-ph-dims { font-family: var(--font-serif, var(--font)); font-size: 1.4rem; font-weight: 600; color: var(--ink); letter-spacing: -0.01em; margin-bottom: 4px; }
    .ep-ph-real { font-size: var(--t-small); color: var(--ink-dim); line-height: 1.4; }
    .ep-ph-warn { margin-top: var(--s-2); padding: var(--s-2) var(--s-3); background: var(--warn-soft); color: var(--warn); border-radius: var(--r-sm); font-size: var(--t-small); font-weight: 600; }
    .ep-preview-empty { padding: var(--s-6); text-align: center; background: var(--bg); border: 2px dashed var(--border); border-radius: var(--r-md); }
    .ep-ar-btn { background: white; color: var(--accent); border: 2px solid var(--accent); padding: 10px 18px; border-radius: var(--r-pill); font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: var(--s-2); font-size: var(--t-small); position: absolute; bottom: 12px; right: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
    .ep-ar-btn svg { width: 16px; height: 16px; }

    .ep-section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); margin-bottom: var(--s-4); }
      .ep-h3 { font-size: var(--t-h3); font-weight: 700; margin-bottom: var(--s-4); }
      .ep-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-2); }
      .ep-photo-slot { aspect-ratio: 1; border: 2px dashed var(--border-strong); border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; background: var(--bg); cursor: pointer; overflow: hidden; color: var(--ink-dim); position: relative; }
      .ep-photo-slot.filled { border: 1px solid var(--border); padding: 0; }
      .ep-photo-slot img { width: 100%; height: 100%; object-fit: cover; }
      .ep-photo-slot svg { width: 20px; height: 20px; }
      .ep-hint { font-size: var(--t-micro); color: var(--ink-dim); margin-top: var(--s-2); }
      .ep-model-status { font-size: var(--t-small); display: flex; flex-direction: column; gap: var(--s-2); padding: var(--s-3); background: var(--bg); border-radius: var(--r-sm); }
    </style>
  `;
});

function restoreFieldValues(options) {
  // Restore values into the field renderer's controls
  Object.entries(options).forEach(([key, val]) => {
    const el = document.querySelector(`[data-key="${key}"]`);
    if (!el) return;
    const type = el.dataset.type;
    if (type === 'select') {
      if (!Array.from(el.options).some(o => o.value === val)) {
        // Custom option — set to __custom__ and fill input
        el.value = '__custom__';
        el.dataset.customValue = val;
        const ci = document.getElementById(el.id + '-custom');
        if (ci) { ci.style.display = 'block'; ci.value = val; }
      } else {
        el.value = val;
      }
    } else if (type === 'multiselect' || type === 'sizes') {
      const vals = Array.isArray(val) ? val : [];
      el.querySelectorAll('[data-val]').forEach(chip => {
        if (vals.includes(chip.dataset.val)) chip.classList.add('active');
      });
    } else if (type === 'colors') {
      el.querySelectorAll('[data-color]').forEach(chip => {
        if ((val || []).some(c => c.hex === chip.dataset.color || c === chip.dataset.color)) chip.classList.add('active');
      });
    } else if (type === 'boolean') {
      if (val) el.classList.add('active');
    } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = val ?? '';
    }
  });
}

async function handleEditPhoto(e, idx, pid) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validatePhoto(file);
  if (err) { alert(err); return; }
  const slot = document.getElementById('ep-photo-' + idx);
  if (slot) slot.style.opacity = '0.5';
  try {
    const shop = State.get('shop');
    const url = await Storage.uploadProductPhoto(shop.id, file);
    // Update product photoUrls
    const p = State.getProduct(pid);
    const photos = [...(p.photoUrls || [])];
    while (photos.length <= idx) photos.push(null);
    photos[idx] = url;
    p.photoUrls = photos;
    p.photos = photos.filter(Boolean).length;
    State.update('products', ps => ({ ...ps, [pid]: p }));
    // visual
    if (slot) {
      slot.classList.add('filled');
      slot.innerHTML = `
        <img src="${url}" alt="photo ${idx+1}" />
        <button class="ep-photo-edit" onclick="event.stopPropagation(); openEpPhotoMenu(${idx}, '${pid}', true)" title="Edit">${icon('settings')}</button>
        <button class="ep-photo-del" onclick="event.stopPropagation(); deleteEpPhoto(${idx}, '${pid}')" title="Remove">✕</button>
        <input type="file" id="ep-photo-input-${idx}" accept="image/jpeg,image/png,image/webp" style="display:none;" />
        <input type="file" id="ep-photo-camera-${idx}" accept="image/*" capture="environment" style="display:none;" />
      `;
      slot.style.opacity = '1';
      wireEpPhotoSlot(slot, idx, pid);
    }
    log('Shopkeeper/EditProduct', `photo ${idx+1} replaced`);
  } catch (err) {
    alert('Upload failed: ' + err.message);
    if (slot) slot.style.opacity = '1';
  }
}

async function saveProductEdits(pid) {
  const shop = State.get('shop');
  const p = State.getProduct(pid);
  const formEl = document.getElementById('ep-form');
  const newOptions = FieldRenderer.readValues(formEl);

  // Capture originals BEFORE applying updates — used for the diff message to admin
  const originalName = p.name;
  const originalPrice = p.price;
  const originalSalePrice = p.salePrice || 0;
  const originalSize = p.models?.realSizeCm || 0;
  const originalDims = JSON.parse(JSON.stringify(p.models?.realDimsCm || { w: 0, h: 0, d: 0 }));
  const originalOptions = JSON.parse(JSON.stringify(p.options || {}));

  const updates = {
    name: document.getElementById('ep-name').value.trim() || p.name,
    description: document.getElementById('ep-desc').value.trim(),
    price: Number(document.getElementById('ep-price').value) || p.price,
    salePrice: Number(document.getElementById('ep-sale').value) || 0,
    bestSeller: document.getElementById('ep-bestseller').checked,
    options: newOptions,
    models: (() => {
      const size = SizeEditor.read('ep');
      return { ...p.models, realSizeCm: size.realSizeCm, realDimsCm: size.realDimsCm };
    })(),
    // Send back to pending_approval unless auto-live
    status: shop.autoLive ? 'live' : 'pending_approval',
  };

  Object.assign(p, updates);
  State.update('products', ps => ({ ...ps, [pid]: p }));

  try {
    if (window.DB && DB.isReady()) {
      // Update in DB — direct fields
      const sb = window.supabaseClient;
      const res = await sb.from('products').update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        sale_price: updates.salePrice,
        best_seller: updates.bestSeller,
        options: updates.options,
        photo_urls: p.photoUrls || [],
        photos: p.photos || 0,
        real_size_cm: updates.models.realSizeCm,
        status: updates.status,
      }).eq('id', pid);
      if (res.error) throw new Error(res.error.message);
    }
    log('Shopkeeper/EditProduct', `${pid} saved`);

    // If changes need approval, notify admin via the shop_messages thread
    if (!shop.autoLive && updates.status === 'pending_approval') {
      const diffs = [];
      if (updates.name !== originalName) diffs.push(`Name: "${originalName}" → "${updates.name}"`);
      if (updates.price !== originalPrice) diffs.push(`Price: Rs.${originalPrice} → Rs.${updates.price}`);
      if (updates.salePrice !== originalSalePrice) diffs.push(`Sale: Rs.${originalSalePrice || 0} → Rs.${updates.salePrice || 0}`);
      if (updates.models.realSizeCm !== originalSize) diffs.push(`Real size: ${originalSize}cm → ${updates.models.realSizeCm}cm`);
      if (JSON.stringify(updates.models.realDimsCm) !== JSON.stringify(originalDims)) {
        const o = originalDims, n = updates.models.realDimsCm;
        diffs.push(`Canvas size: ${o.w}×${o.h}×${o.d}cm → ${n.w}×${n.h}×${n.d}cm`);
      }
      if (JSON.stringify(updates.options) !== JSON.stringify(originalOptions)) diffs.push('Product details (sizes/colors/specs) changed');

      const summary = diffs.length
        ? `🔔 Submitted product edits for review\n\nProduct: ${updates.name}\n\nChanges:\n• ${diffs.join('\n• ')}\n\nPlease review at /admin/product-review/${pid}`
        : `🔔 Submitted product edits for review\n\nProduct: ${updates.name}\nLink: /admin/product-review/${pid}`;
      try {
        if (window.DB && DB.isReady()) {
          await DB.sendMessage({ shopId: shop.id, sender: 'seller', body: summary });
        }
      } catch (e) { /* non-fatal */ }
    }

    alert(shop.autoLive
      ? 'Changes saved. Customers see them now.'
      : 'Changes saved. Admin will review them and approve.\n\nYou\'ll get a message when they\'re approved.');
    Router.back();
  } catch (e) {
    alert('Save failed: ' + e.message);
  }
}

async function deleteOwnProduct(pid, name) {
  if (!confirm(`Delete "${name}"?\n\nThis removes the product permanently.`)) return;
  try {
    if (window.DB && DB.isReady()) await DB.deleteProduct(pid);
    State.update('products', ps => { const n = {...ps}; delete n[pid]; return n; });
    alert(`"${name}" deleted.`);
    Router.go('/shopkeeper/home');
  } catch (e) { alert('Delete failed: ' + e.message); }
}

/* Photo source menu (camera vs library) */
let _epPhotoIdx = null;
let _epPid = null;

function wireEpPhotoSlot(slot, i, pid) {
  const libInput = document.getElementById('ep-photo-input-' + i);
  const camInput = document.getElementById('ep-photo-camera-' + i);
  if (!libInput || !camInput) return;
  slot.onclick = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.target.closest('.ep-photo-edit') || e.target.closest('.ep-photo-del')) return;
    openEpPhotoMenu(i, pid, false);
  };
  libInput.onchange = e => handleEditPhoto(e, i, pid);
  camInput.onchange = e => handleEditPhoto(e, i, pid);
}

function openEpPhotoMenu(i, pid, replacing) {
  _epPhotoIdx = i;
  _epPid = pid;
  const menu = document.getElementById('ep-photo-menu');
  if (menu) menu.style.display = 'flex';
}
function closeEpPhotoMenu(e) {
  if (e && e.target && e.target.id !== 'ep-photo-menu' && !e.target.classList?.contains('ep-photo-menu-cancel')) return;
  const menu = document.getElementById('ep-photo-menu');
  if (menu) menu.style.display = 'none';
}
function pickEpCamera() {
  if (_epPhotoIdx === null) return;
  document.getElementById('ep-photo-camera-' + _epPhotoIdx)?.click();
  closeEpPhotoMenu({ target: { classList: { contains: () => true } } });
}
function pickEpLibrary() {
  if (_epPhotoIdx === null) return;
  document.getElementById('ep-photo-input-' + _epPhotoIdx)?.click();
  closeEpPhotoMenu({ target: { classList: { contains: () => true } } });
}

async function deleteEpPhoto(idx, pid) {
  if (!confirm('Remove this photo?')) return;
  const p = State.getProduct(pid);
  if (!p) return;
  const photos = [...(p.photoUrls || [])];
  photos[idx] = null;
  p.photoUrls = photos;
  p.photos = photos.filter(Boolean).length;
  State.update('products', ps => ({ ...ps, [pid]: p }));

  // Re-render the slot
  const slot = document.getElementById('ep-photo-' + idx);
  if (slot) {
    slot.classList.remove('filled');
    slot.innerHTML = `<span>${icon('plus')}</span><input type="file" id="ep-photo-input-${idx}" accept="image/jpeg,image/png,image/webp" style="display:none;" /><input type="file" id="ep-photo-camera-${idx}" accept="image/*" capture="environment" style="display:none;" />`;
    wireEpPhotoSlot(slot, idx, pid);
  }

  // Persist deletion immediately
  try {
    if (window.DB && DB.isReady()) {
      const sb = window.supabaseClient;
      await sb.from('products').update({ photo_urls: photos.filter(Boolean), photos: photos.filter(Boolean).length }).eq('id', pid);
    }
  } catch (e) { log('Shopkeeper/EditProduct', 'photo delete sync failed: ' + e.message, 'warn'); }
  log('Shopkeeper/EditProduct', `photo ${idx+1} removed`);
}

/* Inject menu styles */
(function() {
  if (document.getElementById('ep-photo-menu-styles')) return;
  const s = document.createElement('style');
  s.id = 'ep-photo-menu-styles';
  s.textContent = `
    .ep-photo-edit, .ep-photo-del { position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,0.65); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; z-index: 3; backdrop-filter: blur(8px); }
    .ep-photo-edit svg { width: 12px; height: 12px; }
    .ep-photo-edit { top: 5px; right: 5px; }
    .ep-photo-del { top: 5px; left: 5px; }
    .ep-photo-del:hover { background: var(--danger); }
    .ep-photo-menu { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding: var(--s-4); }
    .ep-photo-menu-card { background: var(--surface); border-radius: var(--r-lg); width: 100%; max-width: 400px; padding: var(--s-5); }
    .ep-photo-menu-title { font-size: var(--t-h3); font-weight: 700; margin-bottom: var(--s-4); }
    .ep-photo-menu-btn { display: flex; align-items: center; gap: var(--s-3); width: 100%; padding: var(--s-4); margin-bottom: var(--s-2); background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); cursor: pointer; text-align: left; font-size: var(--t-body); font-weight: 500; }
    .ep-photo-menu-btn:hover { background: var(--surface-elev); border-color: var(--accent); }
    .ep-photo-menu-btn svg { width: 22px; height: 22px; color: var(--accent); flex-shrink: 0; }
    .ep-photo-menu-cancel { width: 100%; padding: var(--s-3); margin-top: var(--s-2); background: none; border: none; color: var(--ink-dim); cursor: pointer; font-size: var(--t-small); font-weight: 600; }
    @media (min-width: 600px) { .ep-photo-menu { align-items: center; } }
  `;
  document.head.appendChild(s);
})();

async function setAsThumb() {
  if (_epPhotoIdx === null || _epPid === null) return;
  const idx = _epPhotoIdx;
  const pid = _epPid;
  const p = State.getProduct(pid);
  if (!p) return;
  const photos = [...(p.photoUrls || [])];
  if (idx === 0 || !photos[idx]) { closeEpPhotoMenu({target:{classList:{contains:()=>true}}}); return; }
  // Move the selected photo to index 0
  const chosen = photos.splice(idx, 1)[0];
  photos.unshift(chosen);
  p.photoUrls = photos;
  // Also update the poster in models so model-viewer fallback uses it
  if (p.models) p.models.poster = chosen;
  State.update('products', ps => ({ ...ps, [pid]: p }));
  try {
    if (window.DB && DB.isReady()) {
      const sb = window.supabaseClient;
      await sb.from('products').update({
        photo_urls: photos.filter(Boolean),
        model_poster: chosen,
      }).eq('id', pid);
    }
  } catch (e) { log('Shopkeeper/EditProduct', 'thumb sync failed: ' + e.message, 'warn'); }
  closeEpPhotoMenu({target:{classList:{contains:()=>true}}});
  alert('That photo is now the product thumbnail.');
  Router.reload();
}
