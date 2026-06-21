/* ============================================================
   ADMIN — Marketplace Banners (hero slider management)
   ============================================================ */

Router.register('/admin/banners', () => {
  if (!requireAdmin()) return '<div></div>';
  log('Admin/Banners', 'mounted');

  setTimeout(() => loadBanners(), 80);

  return `
    <div class="screen aq">
      <header class="aq-top">
        <button class="btn-icon-bare" onclick="Router.go('/admin/home')">${icon('arrow_left')}</button>
        <div class="aq-top-title">Marketplace Banners</div>
        <button class="btn-icon-bare" onclick="openCreateBanner()" title="Add slide">${icon('plus')}</button>
      </header>

      <main class="aq-main" style="max-width: 1100px; margin: 0 auto;">
        <section class="aq-intro reveal" data-reveal="up">
          <p class="aq-intro-desc">
            Slides that appear at the top of the customer marketplace. Set image/video, headline,
            CTA, alignment, and how long each slide stays visible. Drag-and-drop reordering coming soon —
            for now use the order number on each card.
          </p>
        </section>

        <section class="ab-settings reveal" data-reveal="up">
          <h3 class="ab-section-title">Global carousel settings</h3>
          <div class="ab-settings-grid">
            <div class="fr-field">
              <label class="fr-label">Default slide duration (seconds)</label>
              <input id="ab-default-duration" type="number" min="2" max="30" class="fr-input" placeholder="5" />
              <div class="fr-hint">Used when a slide doesn't have its own duration set.</div>
            </div>
            <div class="fr-field">
              <label class="fr-label">Transition style</label>
              <select id="ab-transition" class="fr-input">
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
              </select>
            </div>
            <div class="fr-field">
              <label class="fr-label">Desktop height (px)</label>
              <input id="ab-height-d" type="number" min="280" max="720" class="fr-input" placeholder="480" />
            </div>
            <div class="fr-field">
              <label class="fr-label">Mobile height (px)</label>
              <input id="ab-height-m" type="number" min="200" max="500" class="fr-input" placeholder="320" />
            </div>
          </div>
          <button class="btn btn-primary" onclick="saveBannerSettings()" style="margin-top:var(--s-3);">Save settings</button>
        </section>

        <section class="ab-list-section reveal-stagger">
          <h3 class="ab-section-title">Slides</h3>
          <div id="ab-list" class="ab-list">
            <div class="ab-empty">Loading…</div>
          </div>
        </section>
      </main>
    </div>

    <style>
      .aq-intro-desc { padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: var(--s-5); color: var(--ink-dim); font-size: var(--t-small); line-height: 1.6; }
      .ab-section-title { font-family: var(--font-serif); font-size: 1.4rem; font-weight: 500; letter-spacing: -0.01em; margin-bottom: var(--s-3); }
      .ab-settings { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); margin-bottom: var(--s-5); }
      .ab-settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4); }
      @media (max-width: 600px) { .ab-settings-grid { grid-template-columns: 1fr; } }
      .ab-list { display: flex; flex-direction: column; gap: var(--s-3); }
      .ab-empty { padding: var(--s-7); text-align: center; color: var(--ink-dim); background: var(--surface); border: 2px dashed var(--border); border-radius: var(--r-md); }
      .ab-card { display: grid; grid-template-columns: 200px 1fr auto; gap: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-4); align-items: start; }
      @media (max-width: 700px) { .ab-card { grid-template-columns: 1fr; } }
      .ab-card-media { aspect-ratio: 16/9; border-radius: var(--r-md); overflow: hidden; background: var(--bg); position: relative; }
      .ab-card-media img, .ab-card-media video { width: 100%; height: 100%; object-fit: cover; display: block; }
      .ab-card-media-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--ink-dim); font-size: var(--t-small); }
      .ab-card-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .ab-card-title { font-weight: 700; font-size: var(--t-h3); }
      .ab-card-sub { font-size: var(--t-small); color: var(--ink-dim); }
      .ab-card-meta { display: flex; gap: var(--s-3); flex-wrap: wrap; margin-top: var(--s-2); font-size: var(--t-micro); color: var(--ink-dim); }
      .ab-card-meta strong { color: var(--ink); font-weight: 600; }
      .ab-card-actions { display: flex; flex-direction: column; gap: 6px; }
      .ab-card-disabled { opacity: 0.45; }

      /* Editor modal */
      .ab-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: var(--z-modal); display: none; align-items: center; justify-content: center; padding: var(--s-4); }
      .ab-modal-overlay.open { display: flex; }
      .ab-modal { background: var(--surface); border-radius: var(--r-xl); padding: var(--s-6); max-width: 720px; width: 100%; max-height: 90vh; overflow-y: auto; }
      .ab-modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--s-4); }
      .ab-modal-title { font-family: var(--font-serif); font-size: 1.6rem; font-weight: 500; letter-spacing: -0.01em; }
      .ab-modal-close { background: none; border: none; cursor: pointer; font-size: 1.5rem; color: var(--ink-dim); }
      .ab-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-3); }
      @media (max-width: 600px) { .ab-form-grid { grid-template-columns: 1fr; } }
      .ab-media-preview { aspect-ratio: 16/9; background: var(--bg); border: 2px dashed var(--border); border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; color: var(--ink-dim); margin-bottom: var(--s-2); cursor: pointer; overflow: hidden; }
      .ab-media-preview img, .ab-media-preview video { width: 100%; height: 100%; object-fit: cover; }
    </style>

    <!-- Slide editor modal -->
    <div class="ab-modal-overlay" id="ab-modal-overlay">
      <div class="ab-modal">
        <div class="ab-modal-head">
          <div class="ab-modal-title" id="ab-modal-title">New slide</div>
          <button class="ab-modal-close" onclick="closeBannerModal()">×</button>
        </div>
        <form id="ab-form" onsubmit="event.preventDefault(); submitBanner();">
          <input type="hidden" id="ab-id" />

          <div class="fr-field">
            <label class="fr-label">Media (image, video, or GIF)</label>
            <div class="ab-media-preview" id="ab-media-preview" onclick="document.getElementById('ab-media-input').click()">
              <span id="ab-media-prompt">Click to upload</span>
            </div>
            <input type="file" id="ab-media-input" accept="image/*,video/*" style="display:none;" onchange="handleBannerMediaUpload(event)" />
            <div class="fr-hint">Recommended: 1920×800px image or short 10-15s video (≤8MB).</div>
          </div>

          <div class="fr-field">
            <label class="fr-label">Headline</label>
            <input id="ab-title" type="text" class="fr-input" placeholder="Shop the future." maxlength="80" />
          </div>
          <div class="fr-field">
            <label class="fr-label">Subtitle</label>
            <textarea id="ab-subtitle" class="fr-input" rows="2" placeholder="Discover real products. In real scale. In your real space." maxlength="180"></textarea>
          </div>

          <div class="ab-form-grid">
            <div class="fr-field">
              <label class="fr-label">CTA button label</label>
              <input id="ab-cta-label" type="text" class="fr-input" placeholder="Browse all products" maxlength="40" />
            </div>
            <div class="fr-field">
              <label class="fr-label">CTA link</label>
              <input id="ab-cta-link" type="text" class="fr-input" placeholder="#/customer/all-products" />
            </div>
          </div>

          <div class="ab-form-grid">
            <div class="fr-field">
              <label class="fr-label">Text alignment</label>
              <select id="ab-align" class="fr-input">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div class="fr-field">
              <label class="fr-label">Overlay darkness (0–1)</label>
              <input id="ab-overlay" type="number" min="0" max="1" step="0.05" class="fr-input" placeholder="0.35" />
            </div>
          </div>

          <div class="ab-form-grid">
            <div class="fr-field">
              <label class="fr-label">Display order</label>
              <input id="ab-order" type="number" min="0" class="fr-input" placeholder="0" />
              <div class="fr-hint">Lower numbers appear first.</div>
            </div>
            <div class="fr-field">
              <label class="fr-label">Duration (seconds)</label>
              <input id="ab-duration" type="number" min="2" max="30" class="fr-input" placeholder="5" />
              <div class="fr-hint">How long this slide stays visible.</div>
            </div>
          </div>

          <div class="fr-field">
            <label style="display:flex;align-items:center;gap:var(--s-2);cursor:pointer;">
              <input type="checkbox" id="ab-enabled" checked />
              <span>Enabled (visible to customers)</span>
            </label>
          </div>

          <div style="display:flex;gap:var(--s-2);margin-top:var(--s-4);">
            <button type="button" class="btn btn-ghost" onclick="closeBannerModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" style="flex:1;">Save slide</button>
          </div>
        </form>
      </div>
    </div>
  `;
});

/* ------------------------------------------------------------ */

async function loadBanners() {
  const list = document.getElementById('ab-list');
  if (!list) return;
  try {
    const banners = window.DB && DB.isReady() ? await DB.getBanners() : [];
    const settings = window.DB && DB.isReady() ? await DB.getMarketplaceSettings() : { defaultDurationMs: 5000, transition: 'fade', heightDesktop: 480, heightMobile: 320 };
    // Fill global settings inputs
    document.getElementById('ab-default-duration').value = Math.round((settings.defaultDurationMs || 5000) / 1000);
    document.getElementById('ab-transition').value = settings.transition || 'fade';
    document.getElementById('ab-height-d').value = settings.heightDesktop || 480;
    document.getElementById('ab-height-m').value = settings.heightMobile || 320;

    if (!banners.length) {
      list.innerHTML = `
        <div class="ab-empty">
          <p style="margin-bottom:var(--s-3);">No slides yet. Customers see the default HOLOS welcome slides until you add your own.</p>
          <button class="btn btn-primary" onclick="openCreateBanner()">+ Add first slide</button>
        </div>
      `;
      return;
    }
    list.innerHTML = banners.map(b => bannerCard(b)).join('');
    setTimeout(() => Reveal.scan(list), 50);
  } catch (e) {
    list.innerHTML = `<div class="ab-empty"><p>Could not load banners. Has migration 10 been run?</p><p style="font-size:var(--t-micro);color:var(--ink-muted);margin-top:var(--s-2);">${e.message}</p></div>`;
  }
}

function bannerCard(b) {
  const media = b.mediaType === 'video'
    ? `<video src="${b.mediaUrl}" muted></video>`
    : `<img src="${b.mediaUrl}" alt="" />`;
  return `
    <div class="ab-card ${b.enabled ? '' : 'ab-card-disabled'} reveal" data-reveal="up">
      <div class="ab-card-media">${b.mediaUrl ? media : '<div class="ab-card-media-empty">No media</div>'}</div>
      <div class="ab-card-body">
        <div class="ab-card-title">${b.title || '<em style="color:var(--ink-dim);">Untitled slide</em>'}</div>
        <div class="ab-card-sub">${b.subtitle || ''}</div>
        <div class="ab-card-meta">
          <span>Order: <strong>${b.displayOrder}</strong></span>
          <span>Duration: <strong>${Math.round((b.durationMs || 5000) / 1000)}s</strong></span>
          <span>Align: <strong>${b.textAlign}</strong></span>
          <span>${b.enabled ? '✓ Enabled' : '⊘ Disabled'}</span>
        </div>
      </div>
      <div class="ab-card-actions">
        <button class="aq-btn-sm" onclick="editBanner('${b.id}')">Edit</button>
        <button class="aq-btn-sm" onclick="toggleBanner('${b.id}', ${!b.enabled})">${b.enabled ? 'Disable' : 'Enable'}</button>
        <button class="aq-btn-sm aq-btn-danger" onclick="deleteBannerConfirm('${b.id}')">Delete</button>
      </div>
    </div>
  `;
}

async function saveBannerSettings() {
  const patch = {
    defaultDurationMs: (Number(document.getElementById('ab-default-duration').value) || 5) * 1000,
    transition: document.getElementById('ab-transition').value,
    heightDesktop: Number(document.getElementById('ab-height-d').value) || 480,
    heightMobile: Number(document.getElementById('ab-height-m').value) || 320,
  };
  try {
    if (window.DB && DB.isReady()) await DB.updateMarketplaceSettings(patch);
    alert('Settings saved.');
  } catch (e) { alert('Failed: ' + e.message); }
}

/* ----- Editor modal ----- */

function openCreateBanner() {
  window._editingBanner = null;
  window._editingBannerMediaUrl = null;
  window._editingBannerMediaType = 'image';
  document.getElementById('ab-modal-title').textContent = 'New slide';
  document.getElementById('ab-id').value = '';
  document.getElementById('ab-title').value = '';
  document.getElementById('ab-subtitle').value = '';
  document.getElementById('ab-cta-label').value = '';
  document.getElementById('ab-cta-link').value = '';
  document.getElementById('ab-align').value = 'center';
  document.getElementById('ab-overlay').value = 0.35;
  document.getElementById('ab-order').value = 0;
  document.getElementById('ab-duration').value = 5;
  document.getElementById('ab-enabled').checked = true;
  document.getElementById('ab-media-preview').innerHTML = '<span id="ab-media-prompt">Click to upload</span>';
  document.getElementById('ab-modal-overlay').classList.add('open');
}

async function editBanner(id) {
  const banners = await DB.getBanners();
  const b = banners.find(x => x.id === id);
  if (!b) return;
  window._editingBanner = id;
  window._editingBannerMediaUrl = b.mediaUrl;
  window._editingBannerMediaType = b.mediaType;
  document.getElementById('ab-modal-title').textContent = 'Edit slide';
  document.getElementById('ab-id').value = id;
  document.getElementById('ab-title').value = b.title;
  document.getElementById('ab-subtitle').value = b.subtitle;
  document.getElementById('ab-cta-label').value = b.ctaLabel;
  document.getElementById('ab-cta-link').value = b.ctaLink;
  document.getElementById('ab-align').value = b.textAlign;
  document.getElementById('ab-overlay').value = b.overlayOpacity;
  document.getElementById('ab-order').value = b.displayOrder;
  document.getElementById('ab-duration').value = Math.round((b.durationMs || 5000) / 1000);
  document.getElementById('ab-enabled').checked = b.enabled;
  const preview = document.getElementById('ab-media-preview');
  preview.innerHTML = b.mediaType === 'video'
    ? `<video src="${b.mediaUrl}" muted autoplay loop></video>`
    : `<img src="${b.mediaUrl}" alt="" />`;
  document.getElementById('ab-modal-overlay').classList.add('open');
}

function closeBannerModal() {
  document.getElementById('ab-modal-overlay').classList.remove('open');
}

async function handleBannerMediaUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const isVideo = file.type.startsWith('video');
  if (file.size > 8 * 1024 * 1024) {
    alert('File too large. Keep under 8MB.');
    return;
  }
  const preview = document.getElementById('ab-media-preview');
  preview.innerHTML = '<span>Uploading…</span>';
  try {
    // Reuse the shop-assets bucket for simplicity (admin only)
    const url = await Storage.uploadShopAsset('banner-' + Date.now().toString(36), file, isVideo ? 'video' : 'banner');
    window._editingBannerMediaUrl = url;
    window._editingBannerMediaType = isVideo ? 'video' : 'image';
    preview.innerHTML = isVideo
      ? `<video src="${url}" muted autoplay loop></video>`
      : `<img src="${url}" alt="" />`;
  } catch (err) {
    alert('Upload failed: ' + err.message);
    preview.innerHTML = '<span>Click to upload</span>';
  }
}

async function submitBanner() {
  if (!window._editingBannerMediaUrl) {
    alert('Please upload an image or video first.');
    return;
  }
  const id = document.getElementById('ab-id').value || 'banner-' + Date.now().toString(36);
  const data = {
    id,
    mediaUrl: window._editingBannerMediaUrl,
    mediaType: window._editingBannerMediaType || 'image',
    title: document.getElementById('ab-title').value.trim(),
    subtitle: document.getElementById('ab-subtitle').value.trim(),
    ctaLabel: document.getElementById('ab-cta-label').value.trim(),
    ctaLink: document.getElementById('ab-cta-link').value.trim(),
    textAlign: document.getElementById('ab-align').value,
    overlayOpacity: Number(document.getElementById('ab-overlay').value) || 0.35,
    displayOrder: Number(document.getElementById('ab-order').value) || 0,
    durationMs: (Number(document.getElementById('ab-duration').value) || 5) * 1000,
    enabled: document.getElementById('ab-enabled').checked,
  };
  try {
    if (window._editingBanner) {
      await DB.updateBanner(window._editingBanner, data);
    } else {
      await DB.createBanner(data);
    }
    closeBannerModal();
    loadBanners();
  } catch (e) { alert('Save failed: ' + e.message); }
}

async function toggleBanner(id, enable) {
  try {
    await DB.updateBanner(id, { enabled: enable });
    loadBanners();
  } catch (e) { alert('Failed: ' + e.message); }
}

async function deleteBannerConfirm(id) {
  if (!confirm('Delete this slide? This cannot be undone.')) return;
  try {
    await DB.deleteBanner(id);
    loadBanners();
  } catch (e) { alert('Failed: ' + e.message); }
}
