/* ============================================================
   SCREEN: Shopkeeper / Add Product (Phase 2)
   Multi-step, schema-driven:
   1. Category + subcategory
   2. Name + description + dynamic schema fields
   3. Photos (quality pics for admin → 3D)
   4. Price + offer/discount + best-seller
   5. Review + submit (→ pending_approval or live if autoLive)
   ============================================================ */

function getDraft() {
  let d = State.get('draftProduct');
  if (!d) {
    d = { category: null, subcategory: null, name: '', description: '',
          options: {}, photos: [], price: '', salePrice: '', hasOffer: false,
          offerLabel: '', bestSeller: false,
          modelGlbUrl: null, modelGlbName: '', modelUsdzUrl: null, modelUsdzName: '', modelSize: '' };
    State.set('draftProduct', d);
  }
  return d;
}
function resetDraft() { State.set('draftProduct', null); }

/* ---- STEP 1: choose category → subcategory ---- */
Router.register('/shopkeeper/add', () => {
  log('Shopkeeper/Add', 'step 1: category');
  getDraft();
  const cats = Taxonomy.getCategories();
  return `
    <div class="screen ap2">
      ${apHeader('Add product', 1, 'Choose category', '/shopkeeper/home')}
      <main class="ap2-main">
        <p class="ap2-intro">What are you selling? Pick the closest match — the form adapts to it.</p>
        ${cats.map(c => `
          <div class="ap2-cat-group">
            <button class="ap2-cat-head" onclick="this.parentElement.classList.toggle('open')">
              <span class="ap2-cat-icon">${c.icon.startsWith('cat_') ? icon(c.icon) : c.icon}</span>
              <span class="ap2-cat-label">${c.label}</span>
              <span class="ap2-cat-count">${Object.keys(c.subcategories).length}</span>
              <span class="ap2-cat-chev">${icon('arrow_right')}</span>
            </button>
            <div class="ap2-subs">
              ${Object.values(c.subcategories).map(sub => `
                <button class="ap2-sub" onclick="pickSub('${c.id}','${sub.id}')">
                  ${sub.label}
                  <span class="ap2-sub-arrow">${icon('arrow_right')}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <div class="ap2-request">
          <div class="ap2-request-text">Can't find your category?</div>
          <button class="btn btn-ghost" onclick="Router.go('/shopkeeper/request-category')">Request a new one</button>
        </div>
      </main>
      ${AP2_STYLES}
    </div>
  `;
});

function pickSub(catId, subId) {
  const d = getDraft();
  d.category = catId; d.subcategory = subId; d.options = {};
  State.set('draftProduct', d);
  Router.go('/shopkeeper/add-details');
}

/* ---- STEP 2: name + description + schema fields ---- */
Router.register('/shopkeeper/add-details', () => {
  const d = getDraft();
  if (!d.subcategory) { setTimeout(()=>Router.go('/shopkeeper/add'),0); return '<div></div>'; }
  const sub = Taxonomy.getSubcategoryById(d.subcategory);
  log('Shopkeeper/Add', 'step 2: details for ' + d.subcategory);

  setTimeout(() => {
    FieldRenderer.initCustomSelects(document.getElementById('ap2-form'));
    const next = document.getElementById('ap2-next');
    if (next) next.addEventListener('click', () => {
      const container = document.getElementById('ap2-form');
      const name = document.getElementById('ap2-name').value.trim();
      const desc = document.getElementById('ap2-desc').value.trim();
      if (!name) { alert('Please enter a product name.'); return; }
      const missing = FieldRenderer.validate(container, d.subcategory);
      if (missing.length) { alert('Please fill required fields:\n• ' + missing.join('\n• ')); return; }
      d.name = name; d.description = desc;
      d.options = FieldRenderer.readValues(container);
      State.set('draftProduct', d);
      Router.go('/shopkeeper/add-photos');
    });
  }, 60);

  return `
    <div class="screen ap2">
      ${apHeader(sub.label, 2, 'Product details', '/shopkeeper/add')}
      <main class="ap2-main">
        <div id="ap2-form">
          <div class="fr-field">
            <label class="fr-label">Product name <span class="fr-req">*</span></label>
            <input id="ap2-name" class="fr-input" placeholder="e.g. Hand-knotted Persian Rug" value="${d.name || ''}" />
          </div>
          <div class="fr-field">
            <label class="fr-label">Description</label>
            <textarea id="ap2-desc" class="fr-input fr-textarea" rows="3" placeholder="Tell buyers what makes this special...">${d.description || ''}</textarea>
          </div>

          <div class="ap2-divider">
            <span>${sub.label} details</span>
          </div>

          ${FieldRenderer.renderSchema(d.subcategory)}
        </div>

        <button id="ap2-next" class="btn btn-primary btn-large btn-block">Continue to photos</button>
      </main>
      ${AP2_STYLES}
    </div>
  `;
});

/* ---- STEP 3: photos ---- */
Router.register('/shopkeeper/add-photos', () => {
  const d = getDraft();
  if (!d.subcategory) { setTimeout(()=>Router.go('/shopkeeper/add'),0); return '<div></div>'; }
  log('Shopkeeper/Add', 'step 3: photos');
  const labels = ['Front','Side','Back','Detail','In use','Extra'];

  setTimeout(() => {
    [0,1,2,3,4,5].forEach(i => wirePhotoSlot(i));
  }, 60);

  return `
    <div class="screen ap2">
      ${apHeader(d.name || 'Photos', 3, 'Upload quality photos', '/shopkeeper/add-details')}
      <main class="ap2-main">
        <div class="ap2-photo-note">
          <div class="ap2-photo-note-icon">${icon('camera')}</div>
          <div>
            <div class="ap2-photo-note-title">Why we need good photos</div>
            <div class="ap2-photo-note-desc">Our team turns your photos into a 3D AR model. Clear, well-lit shots from multiple angles = better AR. Blurry photos get sent back.</div>
          </div>
        </div>

        <div class="ap2-photo-grid" id="ap2-photos">
          ${[0,1,2,3,4,5].map(i => {
            const url = (d.photos || [])[i];
            return `
              <div class="ap2-photo-slot ${url ? 'filled' : ''}" id="photo-${i}">
                ${url ? `
                  <img src="${url}" class="ap2-photo-img" alt="photo ${i+1}" />
                  <button class="ap2-photo-edit" onclick="event.stopPropagation(); openPhotoMenu(${i}, true)" title="Edit">${icon('settings')}</button>
                  <button class="ap2-photo-del" onclick="event.stopPropagation(); deletePhoto(${i})" title="Remove">✕</button>
                ` : `<span class="ap2-photo-plus">${icon('plus')}</span><span class="ap2-photo-hint">${labels[i]}</span>`}
                <input type="file" id="photo-input-${i}" accept="image/jpeg,image/png,image/webp" style="display:none;" />
                <input type="file" id="photo-camera-${i}" accept="image/*" capture="environment" style="display:none;" />
              </div>
            `;
          }).join('')}
        </div>

        <!-- Photo source picker modal -->
        <div id="ap2-photo-menu" class="ap2-photo-menu" style="display:none;" onclick="closePhotoMenu(event)">
          <div class="ap2-photo-menu-card">
            <h3 class="ap2-photo-menu-title">Add photo</h3>
            <button class="ap2-photo-menu-btn" onclick="pickFromCamera()">${icon('camera')}<span>Take photo with camera</span></button>
            <button class="ap2-photo-menu-btn" onclick="pickFromLibrary()">${icon('image')}<span>Choose from library</span></button>
            <button class="ap2-photo-menu-cancel" onclick="closePhotoMenu()">Cancel</button>
          </div>
        </div>
        <div class="ap2-photo-tips">
          <div class="ap2-tip">✓ Natural daylight, plain background</div>
          <div class="ap2-tip">✓ Fill the frame with the product</div>
          <div class="ap2-tip">✓ At least 3 angles for good 3D</div>
        </div>

        <button class="btn btn-primary btn-large btn-block" onclick="photosNext()">Continue to AR model</button>
      </main>
      ${AP2_STYLES}
    </div>
  `;
});

function wirePhotoSlot(i) {
  const slot = document.getElementById('photo-' + i);
  const libInput = document.getElementById('photo-input-' + i);
  const camInput = document.getElementById('photo-camera-' + i);
  if (slot && libInput && camInput) {
    // Tap empty slot → open source menu (camera/library)
    slot.onclick = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.target.closest('.ap2-photo-edit') || e.target.closest('.ap2-photo-del')) return;
      openPhotoMenu(i, false);
    };
    libInput.onchange = e => handleRealPhoto(e, i);
    camInput.onchange = e => handleRealPhoto(e, i);
  }
}

let _currentPhotoIdx = null;
let _isReplacing = false;
function openPhotoMenu(idx, replacing) {
  _currentPhotoIdx = idx;
  _isReplacing = replacing;
  const menu = document.getElementById('ap2-photo-menu');
  if (menu) menu.style.display = 'flex';
}
function closePhotoMenu(e) {
  if (e && e.target.id !== 'ap2-photo-menu' && e.target !== undefined && !e.target.classList?.contains('ap2-photo-menu-cancel')) return;
  const menu = document.getElementById('ap2-photo-menu');
  if (menu) menu.style.display = 'none';
  _currentPhotoIdx = null;
}
function pickFromCamera() {
  if (_currentPhotoIdx === null) return;
  document.getElementById('photo-camera-' + _currentPhotoIdx)?.click();
  closePhotoMenu({ target: { classList: { contains: () => true } } });
}
function pickFromLibrary() {
  if (_currentPhotoIdx === null) return;
  document.getElementById('photo-input-' + _currentPhotoIdx)?.click();
  closePhotoMenu({ target: { classList: { contains: () => true } } });
}
function deletePhoto(idx) {
  if (!confirm('Remove this photo?')) return;
  const d = getDraft();
  const photos = [...(d.photos || [])];
  photos[idx] = null;
  d.photos = photos;
  State.set('draftProduct', d);
  const slot = document.getElementById('photo-' + idx);
  const labels = ['Front','Side','Back','Detail','In use','Extra'];
  if (slot) {
    slot.classList.remove('filled');
    slot.innerHTML = `<span class="ap2-photo-plus">${icon('plus')}</span><span class="ap2-photo-hint">${labels[idx]}</span><input type="file" id="photo-input-${idx}" accept="image/jpeg,image/png,image/webp" style="display:none;" /><input type="file" id="photo-camera-${idx}" accept="image/*" capture="environment" style="display:none;" />`;
    wirePhotoSlot(idx);
  }
  log('Shopkeeper/Add', `photo ${idx+1} removed`);
}

async function handleRealPhoto(e, idx) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validatePhoto(file);
  if (err) { alert(err); return; }

  const slot = document.getElementById('photo-' + idx);
  if (slot) {
    slot.classList.add('uploading');
    slot.innerHTML = '<div class="ap2-photo-uploading">Uploading…</div><input type="file" id="photo-input-' + idx + '" accept="image/jpeg,image/png,image/webp" style="display:none;" /><input type="file" id="photo-camera-' + idx + '" accept="image/*" capture="environment" style="display:none;" />';
  }

  try {
    const d = getDraft();
    const shop = State.get('shop') || State.getShopsList()[0];
    const url = await Storage.uploadProductPhoto(shop.id, file);
    const photos = [...(d.photos || [])];
    while (photos.length <= idx) photos.push(null);
    photos[idx] = url;
    d.photos = photos;
    State.set('draftProduct', d);
    if (slot) {
      slot.classList.remove('uploading');
      slot.classList.add('filled');
      slot.innerHTML = `
        <img src="${url}" class="ap2-photo-img" alt="photo ${idx+1}" />
        <button class="ap2-photo-edit" onclick="event.stopPropagation(); openPhotoMenu(${idx}, true)" title="Edit">${icon('settings')}</button>
        <button class="ap2-photo-del" onclick="event.stopPropagation(); deletePhoto(${idx})" title="Remove">✕</button>
        <input type="file" id="photo-input-${idx}" accept="image/jpeg,image/png,image/webp" style="display:none;" />
        <input type="file" id="photo-camera-${idx}" accept="image/*" capture="environment" style="display:none;" />
      `;
      wirePhotoSlot(idx);
    }
    log('Shopkeeper/Add', `photo ${idx+1} uploaded`);
  } catch (err) {
    alert('Upload failed: ' + err.message);
    if (slot) {
      slot.classList.remove('uploading');
      slot.innerHTML = `<span class="ap2-photo-plus">${icon('plus')}</span><span class="ap2-photo-hint">Retry</span><input type="file" id="photo-input-${idx}" accept="image/jpeg,image/png,image/webp" style="display:none;" /><input type="file" id="photo-camera-${idx}" accept="image/*" capture="environment" style="display:none;" />`;
      wirePhotoSlot(idx);
    }
  }
}

function photosNext() {
  const d = getDraft();
  // Count only real photo URLs (not nulls or empty)
  const realPhotos = (d.photos || []).filter(p => p && typeof p === 'string' && p.length > 0);
  if (realPhotos.length < 3) { alert('Please add at least 3 photos for good 3D model quality.'); return; }
  Router.go('/shopkeeper/add-model');
}

/* ---- STEP 3.5: 3D model upload + real-world size ---- */
Router.register('/shopkeeper/add-model', () => {
  const d = getDraft();
  if (!d.subcategory) { setTimeout(()=>Router.go('/shopkeeper/add'),0); return '<div></div>'; }
  const sub = Taxonomy.getSubcategoryById(d.subcategory);
  log('Shopkeeper/Add', 'step 4: model upload');

  setTimeout(() => {
    const glbInput = document.getElementById('ap2-glb-file');
    if (glbInput) glbInput.addEventListener('change', (e) => handleModelFile(e, 'glb'));
    const usdzInput = document.getElementById('ap2-usdz-file');
    if (usdzInput) usdzInput.addEventListener('change', (e) => handleModelFile(e, 'usdz'));
    if (d.modelGlbUrl) showModelPreview(d.modelGlbUrl, d.modelSize);
  }, 60);

  return `
    <div class="screen ap2">
      ${apHeader(d.name || '3D Model', 4, 'Upload 3D model', '/shopkeeper/add-photos')}
      <main class="ap2-main">
        <div class="ap2-photo-note">
          <div class="ap2-photo-note-icon">${icon('cube')}</div>
          <div>
            <div class="ap2-photo-note-title">Upload your AR model</div>
            <div class="ap2-photo-note-desc">For full device coverage, upload both: a <strong>.glb</strong> (Android & web) and a <strong>.usdz</strong> (iPhone/iPad AR). Have only one? That's fine. Have neither? Skip — our team builds it from your photos.</div>
          </div>
        </div>

        <!-- GLB slot (Android / web) -->
        <input type="file" id="ap2-glb-file" accept=".glb,.gltf" style="display:none;" />
        <div class="ap2-model-slot" id="ap2-glb-slot">
          <div class="ap2-model-slot-head">
            <span class="ap2-model-slot-badge android">Android / Web</span>
            <span class="ap2-model-slot-ext">.glb</span>
          </div>
          <button class="ap2-model-drop compact" id="ap2-glb-drop" onclick="document.getElementById('ap2-glb-file').click()">
            <div class="ap2-model-drop-icon">${icon('cube')}</div>
            <div class="ap2-model-drop-title">${d.modelGlbName || 'Tap to upload .glb'}</div>
            <div class="ap2-model-drop-sub">${d.modelGlbName ? '✓ uploaded — tap to change' : 'Required for Android & web AR'}</div>
          </button>
        </div>

        <!-- USDZ slot (iOS) -->
        <input type="file" id="ap2-usdz-file" accept=".usdz" style="display:none;" />
        <div class="ap2-model-slot" id="ap2-usdz-slot">
          <div class="ap2-model-slot-head">
            <span class="ap2-model-slot-badge ios">iPhone / iPad</span>
            <span class="ap2-model-slot-ext">.usdz</span>
          </div>
          <button class="ap2-model-drop compact" id="ap2-usdz-drop" onclick="document.getElementById('ap2-usdz-file').click()">
            <div class="ap2-model-drop-icon">${icon('cube')}</div>
            <div class="ap2-model-drop-title">${d.modelUsdzName || 'Tap to upload .usdz'}</div>
            <div class="ap2-model-drop-sub">${d.modelUsdzName ? '✓ uploaded — tap to change' : 'Recommended for best iPhone AR'}</div>
          </button>
        </div>

        <div class="ap2-divider"><span>Live preview</span></div>
        <div id="ap2-model-preview" style="display:none;"></div>
        <div id="ap2-model-preview-empty" class="ap2-preview-empty" style="${d.modelGlbUrl ? 'display:none;' : ''}">Upload a .glb above to see a live 3D preview here.</div>

        <div class="ap2-divider"><span>Real-world size</span></div>

        <div class="fr-field">
          <label class="fr-label">Longest dimension (cm) <span class="fr-req">*</span></label>
          <input id="ap2-model-size" class="fr-input" type="number" placeholder="e.g. 30" value="${d.modelSize || ''}"
                 oninput="if(document.getElementById('ap2-mv-preview')){ModelFit.resetFit(document.getElementById('ap2-mv-preview'));}" />
          <div class="ap2-size-hint">${ModelFit.sizeHint(sub.tryOn)}</div>
        </div>

        <div class="ap2-scale-explain">
          <div class="ap2-scale-explain-title">${icon('zap')} How sizing works</div>
          <div class="ap2-scale-explain-body">In AR, your product appears at exactly this real-world size in the buyer's space. Buyers can zoom in to inspect detail, but the model can never appear smaller than its true size — so they always see it accurately.</div>
        </div>

        <button class="btn btn-primary btn-large btn-block" onclick="modelNext()">Continue to pricing</button>
        <button class="btn btn-ghost btn-block" style="margin-top:var(--s-2);" onclick="skipModel()">Skip — let HOLOS build it from photos</button>
      </main>
      ${AP2_STYLES}
    </div>
  `;
});

async function handleModelFile(e, kind) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateModel(file);
  if (err) { alert(err); return; }

  const dropId = kind === 'glb' ? 'ap2-glb-drop' : 'ap2-usdz-drop';
  const drop = document.getElementById(dropId);
  if (drop) {
    drop.querySelector('.ap2-model-drop-title').textContent = 'Uploading…';
    drop.querySelector('.ap2-model-drop-sub').textContent = file.name;
  }

  try {
    const d = getDraft();
    const shop = State.get('shop') || State.getShopsList()[0];
    // Use blob URL for instant preview, then swap to real URL after upload
    const previewBlobUrl = URL.createObjectURL(file);
    if (kind === 'glb') showModelPreview(previewBlobUrl, d.modelSize);

    const url = await Storage.uploadProductModel(shop.id, file, kind);

    if (kind === 'glb') {
      d.modelGlbUrl = url; d.modelGlbName = file.name;
      showModelPreview(url, d.modelSize);
    } else {
      d.modelUsdzUrl = url; d.modelUsdzName = file.name;
    }
    State.set('draftProduct', d);
    log('Shopkeeper/Add', `${kind.toUpperCase()} uploaded: ${file.name}`);

    if (drop) {
      drop.querySelector('.ap2-model-drop-title').textContent = file.name;
      drop.querySelector('.ap2-model-drop-sub').textContent = '✓ uploaded — tap to change';
    }
  } catch (err) {
    alert('Upload failed: ' + err.message);
    if (drop) {
      drop.querySelector('.ap2-model-drop-title').textContent = kind === 'glb' ? 'Tap to upload .glb' : 'Tap to upload .usdz';
      drop.querySelector('.ap2-model-drop-sub').textContent = 'Retry';
    }
  }
}

function showModelPreview(url, sizeCm) {
  const preview = document.getElementById('ap2-model-preview');
  const empty = document.getElementById('ap2-model-preview-empty');
  if (!preview) return;
  if (empty) empty.style.display = 'none';
  preview.style.display = 'block';
  preview.innerHTML = `
    <div class="ap2-model-loaded">
      <model-viewer id="ap2-mv-preview" class="ap2-mv-preview"
        src="${url}" alt="model preview"
        camera-controls auto-rotate rotation-per-second="20deg"
        shadow-intensity="1" exposure="1.1" environment-image="neutral"
        ar-scale="fixed"></model-viewer>
    </div>
  `;
  setTimeout(() => {
    const mv = document.getElementById('ap2-mv-preview');
    if (mv) ModelFit.resetFit(mv);
  }, 100);
}

function changeModel() {
  const d = getDraft();
  d.modelGlbUrl = null; d.modelGlbName = ''; d.modelUsdzUrl = null; d.modelUsdzName = '';
  State.set('draftProduct', d);
  Router.reload();
}

function modelNext() {
  const d = getDraft();
  const size = document.getElementById('ap2-model-size').value;
  if (!size || Number(size) <= 0) { alert('Please enter the real-world size (longest dimension in cm) so AR shows it accurately.'); return; }
  d.modelSize = Number(size);
  State.set('draftProduct', d);
  Router.go('/shopkeeper/add-pricing');
}

function skipModel() {
  const d = getDraft();
  const size = document.getElementById('ap2-model-size').value;
  d.modelSize = size ? Number(size) : 0;
  d.modelGlbUrl = null; d.modelGlbName = ''; d.modelUsdzUrl = null; d.modelUsdzName = '';
  State.set('draftProduct', d);
  Router.go('/shopkeeper/add-pricing');
}

/* ---- STEP 4: pricing + offer + best-seller ---- */
Router.register('/shopkeeper/add-pricing', () => {
  const d = getDraft();
  if (!d.subcategory) { setTimeout(()=>Router.go('/shopkeeper/add'),0); return '<div></div>'; }
  log('Shopkeeper/Add', 'step 4: pricing');

  setTimeout(() => {
    const offerToggle = document.getElementById('ap2-offer-toggle');
    if (offerToggle) offerToggle.addEventListener('click', () => {
      offerToggle.classList.toggle('on');
      const fields = document.getElementById('ap2-offer-fields');
      if (fields) fields.style.display = offerToggle.classList.contains('on') ? 'block' : 'none';
    });
    const bsToggle = document.getElementById('ap2-bs-toggle');
    if (bsToggle) bsToggle.addEventListener('click', () => bsToggle.classList.toggle('on'));
  }, 60);

  return `
    <div class="screen ap2">
      ${apHeader(d.name || 'Pricing', 5, 'Price & offers', '/shopkeeper/add-model')}
      <main class="ap2-main">
        <div class="fr-field">
          <label class="fr-label">Price (Rs.) <span class="fr-req">*</span></label>
          <input id="ap2-price" class="fr-input" type="number" placeholder="e.g. 14500" value="${d.price || ''}" />
        </div>

        <div class="ap2-divider"><span>Offer (optional)</span></div>

        <div class="ap2-toggle-row">
          <div>
            <div class="ap2-toggle-label">Run a discount / sale</div>
            <div class="ap2-toggle-desc">Show a crossed-out old price + animated badge</div>
          </div>
          <button type="button" id="ap2-offer-toggle" class="fr-toggle ${d.hasOffer?'on':''}"><span class="fr-toggle-knob"></span></button>
        </div>

        <div id="ap2-offer-fields" style="display:${d.hasOffer?'block':'none'};">
          <div class="fr-field" style="margin-top:var(--s-4);">
            <label class="fr-label">Sale price (Rs.)</label>
            <input id="ap2-saleprice" class="fr-input" type="number" placeholder="e.g. 11900" value="${d.salePrice || ''}" />
          </div>
          <div class="fr-field">
            <label class="fr-label">Offer ends in</label>
            <select id="ap2-offer-ends" class="fr-input fr-select">
              <option value="2 days">2 days</option>
              <option value="3 days">3 days</option>
              <option value="5 days">5 days</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
            </select>
          </div>
        </div>

        <div class="ap2-divider"><span>Visibility</span></div>
        <div class="ap2-toggle-row">
          <div>
            <div class="ap2-toggle-label">Mark as best-seller</div>
            <div class="ap2-toggle-desc">Highlighted with a badge on your shop page</div>
          </div>
          <button type="button" id="ap2-bs-toggle" class="fr-toggle ${d.bestSeller?'on':''}"><span class="fr-toggle-knob"></span></button>
        </div>

        <button class="btn btn-primary btn-large btn-block" onclick="pricingNext()">Review & submit</button>
      </main>
      ${AP2_STYLES}
    </div>
  `;
});

function pricingNext() {
  const d = getDraft();
  const price = document.getElementById('ap2-price').value;
  if (!price || Number(price) <= 0) { alert('Please enter a valid price.'); return; }
  d.price = Number(price);
  d.hasOffer = document.getElementById('ap2-offer-toggle').classList.contains('on');
  if (d.hasOffer) {
    const sp = document.getElementById('ap2-saleprice').value;
    d.salePrice = sp ? Number(sp) : 0;
    d.offerEnds = document.getElementById('ap2-offer-ends').value;
    if (d.salePrice >= d.price) { alert('Sale price must be lower than the regular price.'); return; }
  } else {
    d.salePrice = 0;
  }
  d.bestSeller = document.getElementById('ap2-bs-toggle').classList.contains('on');
  State.set('draftProduct', d);
  Router.go('/shopkeeper/add-review');
}

/* ---- STEP 5: review + submit ---- */
Router.register('/shopkeeper/add-review', () => {
  const d = getDraft();
  if (!d.subcategory) { setTimeout(()=>Router.go('/shopkeeper/add'),0); return '<div></div>'; }
  const sub = Taxonomy.getSubcategoryById(d.subcategory);
  const shop = State.get('shop') || State.getShopsList()[0];
  log('Shopkeeper/Add', 'step 5: review');

  const off = (d.hasOffer && d.salePrice) ? Math.round((1 - d.salePrice/d.price)*100) : 0;

  // Render filled options as readable summary
  const optRows = Object.entries(d.options).filter(([k,v]) =>
    v != null && v !== '' && !(Array.isArray(v) && v.length === 0)
  ).map(([k, v]) => {
    const field = sub.fields.find(f => f.key === k);
    let display = v;
    if (Array.isArray(v)) {
      if (v.length && v[0] && v[0].hex) display = v.map(c => c.label).join(', ');
      else display = v.join(', ');
    } else if (typeof v === 'boolean') display = v ? 'Yes' : 'No';
    return `<div class="ap2-rev-row"><span class="ap2-rev-key">${field?.label || k}</span><span class="ap2-rev-val">${display}</span></div>`;
  }).join('');

  return `
    <div class="screen ap2">
      ${apHeader('Review', 6, 'Confirm & submit', '/shopkeeper/add-pricing')}
      <main class="ap2-main">
        <div class="ap2-rev-card">
          <div class="ap2-rev-head">
            <div class="ap2-rev-thumb">${categoryGlyphForSub(d.subcategory)}</div>
            <div>
              <div class="ap2-rev-name">${d.name}</div>
              <div class="ap2-rev-cat">${sub.categoryLabel} · ${sub.label}</div>
            </div>
          </div>

          <div class="ap2-rev-price">
            ${off ? `
              <span class="ap2-rev-was">Rs. ${d.price.toLocaleString()}</span>
              <span class="ap2-rev-now">Rs. ${d.salePrice.toLocaleString()}</span>
              <span class="ap2-rev-off">${off}% OFF</span>
            ` : `<span class="ap2-rev-now">Rs. ${d.price.toLocaleString()}</span>`}
          </div>

          ${d.description ? `<p class="ap2-rev-desc">${d.description}</p>` : ''}

          <div class="ap2-rev-rows">
            ${optRows}
            <div class="ap2-rev-row"><span class="ap2-rev-key">Photos</span><span class="ap2-rev-val">${d.photos.length} uploaded</span></div>
            <div class="ap2-rev-row"><span class="ap2-rev-key">3D model (Android)</span><span class="ap2-rev-val">${d.modelGlbUrl ? '✓ .glb' : '—'}</span></div>
            <div class="ap2-rev-row"><span class="ap2-rev-key">3D model (iOS)</span><span class="ap2-rev-val">${d.modelUsdzUrl ? '✓ .usdz' : '—'}</span></div>
            ${(!d.modelGlbUrl && !d.modelUsdzUrl) ? '<div class="ap2-rev-row"><span class="ap2-rev-key">3D model</span><span class="ap2-rev-val">HOLOS will build it</span></div>' : ''}
            ${d.modelSize ? `<div class="ap2-rev-row"><span class="ap2-rev-key">Real size</span><span class="ap2-rev-val">${d.modelSize} cm</span></div>` : ''}
            ${d.bestSeller ? `<div class="ap2-rev-row"><span class="ap2-rev-key">Best-seller</span><span class="ap2-rev-val">★ Yes</span></div>` : ''}
          </div>
        </div>

        <div class="ap2-submit-note">
          ${shop.autoLive
            ? `<div class="ap2-note-live">✓ Your shop is <strong>auto-live</strong> — this product goes live immediately.</div>`
            : `<div class="ap2-note-review">Your product will be sent to admin for approval. You'll be notified once it's live (usually within a few hours).</div>`
          }
        </div>

        <button class="btn btn-primary btn-large btn-block" onclick="submitProduct()">
          ${shop.autoLive ? 'Publish product' : 'Submit for approval'}
        </button>
        <button class="btn btn-ghost btn-block" style="margin-top:var(--s-2);" onclick="if(confirm('Discard this product?')){resetDraft();Router.go('/shopkeeper/home');}">Discard</button>
      </main>
      ${AP2_STYLES}
    </div>
  `;
});

async function submitProduct() {
  const d = getDraft();
  const shop = State.get('shop') || State.getShopsList()[0];
  const sub = Taxonomy.getSubcategoryById(d.subcategory);
  const pid = 'p-' + Date.now().toString(36);

  const newProduct = {
    id: pid, shop: shop.id,
    category: d.category, subcategory: d.subcategory,
    name: d.name, subtitle: sub.label,
    price: d.price, salePrice: d.salePrice || 0, currency: 'PKR',
    offer: (d.hasOffer && d.salePrice) ? {
      type: 'discount',
      label: Math.round((1 - d.salePrice/d.price)*100) + '% OFF',
      endsIn: d.offerEnds || '3 days'
    } : null,
    options: d.options,
    defaultColor: 0, defaultSize: 0,
    description: d.description || '',
    photos: (d.photos || []).filter(p => p).length,
    photoUrls: (d.photos || []).filter(p => p),
    rating: 0, reviewCount: 0,
    bestSeller: d.bestSeller,
    status: shop.autoLive ? 'live' : 'pending_approval',
    models: {
      glb: d.modelGlbUrl || '',
      usdz: d.modelUsdzUrl || '',
      poster: (d.photos || []).find(p => p) || '',
      realSizeCm: d.modelSize || 0,
    },
    tryOn: sub.tryOn,
  };

  State.update('products', p => ({ ...p, [pid]: newProduct }));
  if (window.DB && DB.isReady()) {
    try {
      const res = await DB.createProduct(newProduct);
      if (res && res.error) throw new Error(res.error.message || 'save failed');
    } catch (e) {
      alert('Could not save the product to the server:\n' + e.message + '\n\nYour model and details are still here — please check your connection and tap submit again.');
      log('Shopkeeper/Add', 'createProduct failed: ' + e.message, 'error');
      return; // keep the draft so the seller can retry without re-entering anything
    }
  }
  log('Shopkeeper/Add', `submitted ${pid} · status ${newProduct.status}`);
  resetDraft();
  Router.go('/shopkeeper/add-success?status=' + newProduct.status);
}

Router.register('/shopkeeper/add-success', () => {
  const isLive = (window.location.hash.includes('live'));
  return `
    <div class="screen" style="min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:var(--s-5);">
      <div style="text-align:center;max-width:360px;">
        <div style="width:80px;height:80px;margin:0 auto var(--s-5);border-radius:50%;background:var(--success-soft);color:var(--success);display:flex;align-items:center;justify-content:center;font-size:2rem;">✓</div>
        <h1 style="font-size:1.6rem;font-weight:700;margin-bottom:var(--s-3);letter-spacing:-0.02em;">${isLive ? 'Product is live!' : 'Submitted for approval'}</h1>
        <p style="color:var(--ink-dim);margin-bottom:var(--s-7);line-height:1.5;">${isLive ? 'Your product is now visible to customers and ready to view in AR.' : "Admin will review your photos and product details. Once approved, it goes live and we'll start building its AR model."}</p>
        <button class="btn btn-primary btn-large btn-block" onclick="Router.go('/shopkeeper/home')">Back to dashboard</button>
        <button class="btn btn-ghost btn-block" style="margin-top:var(--s-2);" onclick="Router.go('/shopkeeper/add')">Add another product</button>
      </div>
    </div>
  `;
});

/* ---- Request a new category ---- */
Router.register('/shopkeeper/request-category', () => {
  const shop = State.get('shop') || State.getShopsList()[0];
  setTimeout(() => {
    // toggle between subcategory / main-category modes
    document.querySelectorAll('.rc-mode').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('.rc-mode').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const isMain = b.dataset.mode === 'main';
      document.getElementById('rc-parent-field').style.display = isMain ? 'none' : 'block';
      document.getElementById('rc-name-label').textContent = isMain ? 'New category name' : 'Subcategory name';
    }));
    const btn = document.getElementById('rc-submit');
    if (btn) btn.addEventListener('click', () => {
      const mode = document.querySelector('.rc-mode.active')?.dataset.mode || 'sub';
      const name = document.getElementById('rc-name').value.trim();
      const reason = document.getElementById('rc-reason').value.trim();
      if (!name) { alert('Please enter a name.'); return; }

      if (mode === 'main') {
        const reqId = 'creq-' + Date.now().toString(36);
        const reqObj = { id: reqId, shopId: shop.id, shopName: shop.name,
          proposedName: name, icon: '📦', reason: reason || '—', requestedAt: 'just now', status: 'pending' };
        State.update('categoryRequests', r => ({ ...r, [reqId]: reqObj }));
        if (window.DB && DB.isReady()) DB.createCategoryRequest(reqObj).catch(e => log('Shopkeeper','cat req failed: '+e.message,'error'));
      } else {
        const cat = document.getElementById('rc-cat').value;
        if (!cat) { alert('Please choose a parent category.'); return; }
        const reqId = 'sreq-' + Date.now().toString(36);
        const reqObj = { id: reqId, shopId: shop.id, shopName: shop.name,
          proposedName: name, suggestedCategory: cat, reason: reason || '—', requestedAt: 'just now', status: 'pending' };
        State.update('subcatRequests', r => ({ ...r, [reqId]: reqObj }));
        if (window.DB && DB.isReady()) DB.createSubcatRequest(reqObj).catch(e => log('Shopkeeper','subcat req failed: '+e.message,'error'));
      }
      Router.go('/shopkeeper/request-success');
    });
  }, 60);
  return `
    <div class="screen ap2">
      ${apHeader('Request category', 0, 'Suggest a new category', '/shopkeeper/add')}
      <main class="ap2-main">
        <p class="ap2-intro">Selling something new? Request a category. Admin reviews it and makes it live for everyone.</p>

        <div class="ap2-divider"><span>What kind?</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-2);margin-bottom:var(--s-5);">
          <button type="button" class="rc-mode active" data-mode="sub" style="padding:var(--s-4);border:2px solid var(--accent);background:var(--accent-soft);border-radius:var(--r-md);cursor:pointer;text-align:left;">
            <div style="font-weight:700;font-size:var(--t-small);">Subcategory</div>
            <div style="font-size:var(--t-micro);color:var(--ink-dim);">under an existing category</div>
          </button>
          <button type="button" class="rc-mode" data-mode="main" style="padding:var(--s-4);border:2px solid var(--border);background:var(--surface);border-radius:var(--r-md);cursor:pointer;text-align:left;">
            <div style="font-weight:700;font-size:var(--t-small);">New main category</div>
            <div style="font-size:var(--t-micro);color:var(--ink-dim);">a whole new department</div>
          </button>
        </div>

        <div class="fr-field">
          <label class="fr-label" id="rc-name-label">Subcategory name <span class="fr-req">*</span></label>
          <input id="rc-name" class="fr-input" placeholder="e.g. Handwoven Baskets" />
        </div>
        <div class="fr-field" id="rc-parent-field">
          <label class="fr-label">Which category does it belong to? <span class="fr-req">*</span></label>
          <select id="rc-cat" class="fr-input fr-select">
            <option value="">Choose...</option>
            ${Taxonomy.getCategories().map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="fr-field">
          <label class="fr-label">Why? (helps admin decide)</label>
          <textarea id="rc-reason" class="fr-input fr-textarea" rows="3" placeholder="Describe what you sell and why existing categories don't fit"></textarea>
        </div>
        <button id="rc-submit" class="btn btn-primary btn-large btn-block">Submit request</button>
      </main>
      ${AP2_STYLES}
    </div>
  `;
});

Router.register('/shopkeeper/request-success', () => `
  <div class="screen" style="min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:var(--s-5);">
    <div style="text-align:center;max-width:360px;">
      <div style="width:80px;height:80px;margin:0 auto var(--s-5);border-radius:50%;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:2rem;">✓</div>
      <h1 style="font-size:1.6rem;font-weight:700;margin-bottom:var(--s-3);letter-spacing:-0.02em;">Request sent</h1>
      <p style="color:var(--ink-dim);margin-bottom:var(--s-7);line-height:1.5;">Admin will review your category request and respond. If something similar exists, they'll point you to it.</p>
      <button class="btn btn-primary btn-large btn-block" onclick="Router.go('/shopkeeper/add')">Back to add product</button>
    </div>
  </div>
`);

/* ---- shared header + styles ---- */
function apHeader(title, step, stepLabel, backTo) {
  return `
    <header class="ap2-top">
      <button class="btn-icon-bare" onclick="Router.go('${backTo}')">${icon('arrow_left')}</button>
      <div class="ap2-top-mid">
        <div class="ap2-top-title">${title}</div>
        ${step ? `<div class="ap2-top-step">Step ${step} of 6 · ${stepLabel}</div>` : `<div class="ap2-top-step">${stepLabel}</div>`}
      </div>
      <div style="width:40px;"></div>
    </header>
    ${step ? `<div class="ap2-progress"><div class="ap2-progress-bar" style="width:${(step/6)*100}%"></div></div>` : ''}
  `;
}

const AP2_STYLES = `
  <style>
    .ap2 { min-height: 100vh; background: var(--bg); padding-bottom: var(--s-7); }
    .ap2-top { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4) var(--s-5); position: sticky; top: 0; background: var(--bg); z-index: 10; }
    .ap2-top-mid { text-align: center; }
    .ap2-top-title { font-weight: 700; font-size: var(--t-h3); }
    .ap2-top-step { font-size: var(--t-micro); color: var(--ink-dim); margin-top: 2px; }
    .ap2-progress { height: 3px; background: var(--surface-elev); }
    .ap2-progress-bar { height: 100%; background: var(--accent); transition: width var(--d-base) var(--ease-out); }
    .ap2-main { padding: var(--s-5); max-width: var(--phone-max); margin: 0 auto; }
    .ap2-intro { color: var(--ink-dim); margin-bottom: var(--s-5); line-height: 1.5; }

    .ap2-cat-group { border: 1px solid var(--border); border-radius: var(--r-lg); margin-bottom: var(--s-2); overflow: hidden; background: var(--surface); }
    .ap2-cat-head { display: flex; align-items: center; gap: var(--s-3); width: 100%; padding: var(--s-4); cursor: pointer; text-align: left; }
    .ap2-cat-icon { font-size: 1.3rem; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: var(--ink-dim); }
    .ap2-cat-icon svg { width: 22px; height: 22px; }
    .ap2-cat-label { flex: 1; font-weight: 600; font-size: var(--t-body); }
    .ap2-cat-count { font-size: var(--t-micro); color: var(--ink-dim); background: var(--bg); padding: 2px 8px; border-radius: var(--r-pill); }
    .ap2-cat-chev { color: var(--ink-muted); transition: transform var(--d-fast); }
    .ap2-cat-chev svg { width: 16px; height: 16px; }
    .ap2-cat-group.open .ap2-cat-chev { transform: rotate(90deg); }
    .ap2-subs { max-height: 0; overflow: hidden; transition: max-height var(--d-base) var(--ease-out); }
    .ap2-cat-group.open .ap2-subs { max-height: 600px; }
    .ap2-sub { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: var(--s-3) var(--s-5); border-top: 1px solid var(--border); font-size: var(--t-small); cursor: pointer; text-align: left; transition: background var(--d-fast); }
    .ap2-sub:hover { background: var(--surface-elev); }
    .ap2-sub-arrow { color: var(--ink-muted); }
    .ap2-sub-arrow svg { width: 14px; height: 14px; }

    .ap2-request { margin-top: var(--s-6); padding: var(--s-5); background: var(--surface); border: 1px dashed var(--border-strong); border-radius: var(--r-lg); text-align: center; }
    .ap2-request-text { color: var(--ink-dim); margin-bottom: var(--s-3); font-size: var(--t-small); }

    .ap2-divider { display: flex; align-items: center; gap: var(--s-3); margin: var(--s-6) 0 var(--s-5); }
    .ap2-divider::before, .ap2-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .ap2-divider span { font-size: var(--t-micro); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-dim); }

    .ap2-photo-note { display: grid; grid-template-columns: 40px 1fr; gap: var(--s-3); background: var(--accent-soft); border: 1px solid var(--accent); border-radius: var(--r-lg); padding: var(--s-4); margin-bottom: var(--s-5); }
    .ap2-photo-note-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; }
    .ap2-photo-note-icon svg { width: 18px; height: 18px; }
    .ap2-photo-note-title { font-size: var(--t-small); font-weight: 700; margin-bottom: 2px; }
    .ap2-photo-note-desc { font-size: var(--t-micro); color: var(--ink-dim); line-height: 1.5; }
    .ap2-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-2); margin-bottom: var(--s-4); }
    .ap2-photo-edit, .ap2-photo-del { position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.65); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; z-index: 3; backdrop-filter: blur(8px); }
    .ap2-photo-edit svg { width: 14px; height: 14px; }
    .ap2-photo-edit { top: 6px; right: 6px; }
    .ap2-photo-del { top: 6px; left: 6px; }
    .ap2-photo-edit:hover, .ap2-photo-del:hover { background: rgba(0,0,0,0.85); }
    .ap2-photo-del:hover { background: var(--danger); }
    .ap2-photo-slot { position: relative; }
    .ap2-photo-menu { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding: var(--s-4); }
    .ap2-photo-menu-card { background: var(--surface); border-radius: var(--r-lg); width: 100%; max-width: 400px; padding: var(--s-5); }
    .ap2-photo-menu-title { font-size: var(--t-h3); font-weight: 700; margin-bottom: var(--s-4); }
    .ap2-photo-menu-btn { display: flex; align-items: center; gap: var(--s-3); width: 100%; padding: var(--s-4); margin-bottom: var(--s-2); background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); cursor: pointer; text-align: left; font-size: var(--t-body); font-weight: 500; transition: background 160ms; }
    .ap2-photo-menu-btn:hover { background: var(--surface-elev); border-color: var(--accent); }
    .ap2-photo-menu-btn svg { width: 22px; height: 22px; color: var(--accent); flex-shrink: 0; }
    .ap2-photo-menu-cancel { width: 100%; padding: var(--s-3); margin-top: var(--s-2); background: none; border: none; color: var(--ink-dim); cursor: pointer; font-size: var(--t-small); font-weight: 600; }
    @media (min-width: 600px) { .ap2-photo-menu { align-items: center; } }

    .ap2-photo-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
    .ap2-photo-slot.filled { padding: 0; overflow: hidden; }
    .ap2-photo-slot.uploading { background: var(--accent-soft); }
    .ap2-photo-uploading { font-size: var(--t-micro); color: var(--accent); font-weight: 600; }
    .ap2-photo-slot { aspect-ratio: 1; border-radius: var(--r-md); border: 2px dashed var(--border-strong); background: var(--surface); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--s-1); cursor: pointer; transition: all var(--d-fast); color: var(--ink-dim); }
    .ap2-photo-slot:hover { border-color: var(--accent); background: var(--surface-elev); }
    .ap2-photo-slot.filled { border-style: solid; border-color: var(--success); background: var(--success-soft); }
    .ap2-photo-plus svg { width: 20px; height: 20px; }
    .ap2-photo-hint { font-size: var(--t-micro); }
    .ap2-photo-check { font-size: 1.5rem; color: var(--success); }
    .ap2-photo-tips { display: flex; flex-direction: column; gap: var(--s-2); margin-bottom: var(--s-6); }
    .ap2-tip { font-size: var(--t-small); color: var(--ink-dim); }

    .ap2-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: var(--s-3); }
    .ap2-toggle-label { font-size: var(--t-small); font-weight: 600; }
    .ap2-toggle-desc { font-size: var(--t-micro); color: var(--ink-dim); margin-top: 2px; }

    .ap2-rev-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); margin-bottom: var(--s-4); }
    .ap2-rev-head { display: grid; grid-template-columns: 56px 1fr; gap: var(--s-3); align-items: center; margin-bottom: var(--s-4); }
    .ap2-rev-thumb { width: 56px; height: 56px; border-radius: var(--r-md); background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; }
    .ap2-rev-name { font-size: var(--t-h3); font-weight: 700; }
    .ap2-rev-cat { font-size: var(--t-small); color: var(--ink-dim); margin-top: 2px; }
    .ap2-rev-price { display: flex; align-items: baseline; gap: var(--s-2); margin-bottom: var(--s-4); flex-wrap: wrap; }
    .ap2-rev-was { font-size: var(--t-small); color: var(--ink-muted); text-decoration: line-through; }
    .ap2-rev-now { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.01em; }
    .ap2-rev-off { font-size: var(--t-small); color: var(--success); font-weight: 600; }
    .ap2-rev-desc { font-size: var(--t-small); color: var(--ink-dim); line-height: 1.5; margin-bottom: var(--s-4); padding-bottom: var(--s-4); border-bottom: 1px solid var(--border); }
    .ap2-rev-rows { display: flex; flex-direction: column; gap: var(--s-2); }
    .ap2-rev-row { display: flex; justify-content: space-between; gap: var(--s-4); font-size: var(--t-small); }
    .ap2-rev-key { color: var(--ink-dim); }
    .ap2-rev-val { font-weight: 500; text-align: right; }
    .ap2-submit-note { margin-bottom: var(--s-4); }
    .ap2-note-live { font-size: var(--t-small); color: var(--success); background: var(--success-soft); padding: var(--s-3) var(--s-4); border-radius: var(--r-md); }


    .ap2-model-slot { margin-bottom: var(--s-3); }
    .ap2-model-slot-head { display: flex; align-items: center; gap: var(--s-2); margin-bottom: var(--s-2); }
    .ap2-model-slot-badge { font-size: var(--t-micro); font-weight: 700; padding: 2px var(--s-2); border-radius: var(--r-pill); letter-spacing: 0.03em; }
    .ap2-model-slot-badge.android { background: var(--success-soft); color: var(--success); }
    .ap2-model-slot-badge.ios { background: var(--info-soft); color: var(--info); }
    .ap2-model-slot-ext { font-family: var(--mono); font-size: var(--t-micro); color: var(--ink-dim); }
    .ap2-model-drop.compact { padding: var(--s-5) var(--s-4); flex-direction: row; gap: var(--s-3); justify-content: flex-start; text-align: left; }
    .ap2-model-drop.compact .ap2-model-drop-icon { width: 36px; height: 36px; flex-shrink: 0; }
    .ap2-model-drop.compact .ap2-model-drop-icon svg { width: 18px; height: 18px; }
    .ap2-preview-empty { padding: var(--s-6); text-align: center; color: var(--ink-muted); background: var(--bg); border-radius: var(--r-md); font-size: var(--t-small); margin-bottom: var(--s-4); }
    .ap2-model-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--s-2); width: 100%; padding: var(--s-8) var(--s-5); background: var(--surface); border: 2px dashed var(--border-strong); border-radius: var(--r-lg); cursor: pointer; transition: all var(--d-fast); margin-bottom: var(--s-4); }
    .ap2-model-drop:hover { border-color: var(--accent); background: var(--surface-elev); }
    .ap2-model-drop-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; }
    .ap2-model-drop-icon svg { width: 22px; height: 22px; }
    .ap2-model-drop-title { font-size: var(--t-body); font-weight: 600; }
    .ap2-model-drop-sub { font-size: var(--t-small); color: var(--ink-dim); }
    .ap2-model-loaded { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; margin-bottom: var(--s-4); }
    .ap2-mv-preview { width: 100%; height: 280px; background: var(--bg); --poster-color: transparent; }
    .ap2-model-loaded-bar { display: flex; align-items: center; justify-content: space-between; padding: var(--s-3) var(--s-4); border-top: 1px solid var(--border); }
    .ap2-model-loaded-name { display: flex; align-items: center; gap: var(--s-2); font-size: var(--t-small); font-weight: 600; color: var(--success); }
    .ap2-model-loaded-name svg { width: 14px; height: 14px; }
    .ap2-model-change { font-size: var(--t-small); font-weight: 600; color: var(--accent); cursor: pointer; }
    .ap2-size-hint { font-size: var(--t-micro); color: var(--ink-dim); margin-top: var(--s-2); }
    .ap2-scale-explain { background: var(--accent-soft); border: 1px solid var(--accent); border-radius: var(--r-md); padding: var(--s-4); margin-bottom: var(--s-5); }
    .ap2-scale-explain-title { display: flex; align-items: center; gap: var(--s-2); font-size: var(--t-small); font-weight: 700; color: var(--accent); margin-bottom: var(--s-2); }
    .ap2-scale-explain-title svg { width: 14px; height: 14px; }
    .ap2-scale-explain-body { font-size: var(--t-micro); color: var(--ink-dim); line-height: 1.5; }
    .ap2-note-review { font-size: var(--t-small); color: var(--ink-dim); background: var(--surface); border: 1px solid var(--border); padding: var(--s-3) var(--s-4); border-radius: var(--r-md); line-height: 1.5; }
  </style>
`;
