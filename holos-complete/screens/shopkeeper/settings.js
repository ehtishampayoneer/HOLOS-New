/* ============================================================
   SCREEN: Shopkeeper / Settings (Phase 2)
   Banner upload, shop name edit (needs approval), credentials,
   auto-live status (read-only — admin controls it).
   ============================================================ */

Router.register('/shopkeeper/settings', () => {
  const shop = State.get('shop') || State.getShopsList()[0];
  State.set('shop', shop);
  log('Shopkeeper/Settings', 'mounted');

  setTimeout(() => {
    const nameToggle = document.getElementById('ss-name-edit');
    if (nameToggle) nameToggle.addEventListener('click', () => {
      const field = document.getElementById('ss-name-field');
      if (field) field.style.display = field.style.display === 'none' ? 'block' : 'none';
    });
  }, 60);

  return `
    <div class="screen ss2">
      <header class="ss2-top">
        <button class="btn-icon-bare" onclick="Router.go('/shopkeeper/home')">${icon('arrow_left')}</button>
        <div class="ss2-top-title">Shop settings</div>
        <div style="width:40px;"></div>
      </header>

      <main class="ss2-main">
        <!-- Logo -->
        <section class="ss2-section">
          <h2 class="ss2-section-title">Shop logo</h2>
          <div class="ss2-logo-row">
            <div class="ss2-logo-frame" id="ss-logo-frame" style="${shop.logo ? `background:url('${shop.logo}') center/cover;` : `background:${shop.accent};`}">
              ${shop.logo ? '' : `<span class="ss2-logo-init">${shop.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span>`}
            </div>
            <div class="ss2-logo-controls">
              <button class="ss2-bc-btn" onclick="document.getElementById('ss-logo-input').click()">${icon('camera')} ${shop.logo ? 'Replace' : 'Upload'} logo</button>
              ${shop.logo ? `<button class="ss2-bc-btn ss2-bc-danger" onclick="removeLogo()">Remove</button>` : ''}
              <input type="file" id="ss-logo-input" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="handleLogoUpload(event)" />
              <div class="ss2-hint" style="margin-top:var(--s-2);">Square image works best. 512×512px recommended.</div>
            </div>
          </div>
          <div class="ss2-banner-pending" id="ss-logo-pending" style="display:none;">
            <span>Unsaved logo change</span>
            <button class="ss2-bc-btn ss2-bc-primary" onclick="saveLogoChange()">Save</button>
            <button class="ss2-bc-btn" onclick="discardLogoChange()">Discard</button>
          </div>
        </section>

        <!-- Banner -->
        <section class="ss2-section">
          <h2 class="ss2-section-title">Shop banner</h2>
          <div class="ss2-banner-wrap">
            <div class="ss2-banner ${shop.banner ? 'has-image' : ''}" style="background-image:${shop.banner ? `url('${shop.banner}')` : 'none'};background-size:cover;background-position:center ${shop.bannerPosY || 50}%;background-color:${shop.banner ? 'transparent' : 'var(--surface)'};" id="ss-banner">
              ${shop.banner ? '' : `<div class="ss2-banner-empty">${icon('camera')}<span>No banner yet — upload one below</span></div>`}
              ${shop.banner ? '<div class="ss2-banner-overlay-hint">↕ Drag image up/down to reposition</div>' : ''}
            </div>
          </div>
          <div class="ss2-banner-controls">
            <button class="ss2-bc-btn" onclick="document.getElementById('ss-banner-input').click()">${icon('camera')} ${shop.banner ? 'Replace' : 'Upload'}</button>
            ${shop.banner ? `<button class="ss2-bc-btn ss2-bc-danger" onclick="removeBanner()">Remove</button>` : ''}
            <input type="file" id="ss-banner-input" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="handleBannerUpload(event)" />
          </div>
          <div class="ss2-banner-pending" id="ss-banner-pending" style="display:none;">
            <span>Unsaved changes</span>
            <button class="ss2-bc-btn ss2-bc-primary" onclick="saveBannerChange()">Save</button>
            <button class="ss2-bc-btn" onclick="discardBannerChange()">Discard</button>
          </div>
          <div class="ss2-hint">Recommended: 1200×400px. Drag the image up or down to reposition once uploaded.</div>
        </section>

        <!-- Store QR Code -->
        <section class="ss2-section">
          <h2 class="ss2-section-title">Your Store QR Code</h2>
          <div class="ss2-qr-card">
            <div class="ss2-qr-code" id="ss-qr">${QRGen.shopQRCard(shop, location.origin).svg}</div>
            <div class="ss2-qr-url">holos.app/s/${shop.id}</div>
            <div class="ss2-qr-actions">
              <button class="btn btn-primary btn-block" onclick="copyQRImage()">
                ${icon('share')} Copy QR to share
              </button>
            </div>
            <div class="ss2-hint">Print this, put it in your live videos, on your shop counter, or on your website. Customers scan → your full HOLOS shop opens.</div>
          </div>
        </section>

        <!-- Shop name (needs approval) -->
        <section class="ss2-section">
          <h2 class="ss2-section-title">Shop identity</h2>
          <div class="ss2-row">
            <div>
              <div class="ss2-row-label">Shop name</div>
              <div class="ss2-row-value">${shop.name}</div>
            </div>
            <button class="ss2-edit-btn" id="ss-name-edit">Edit</button>
          </div>
          <div id="ss-name-field" style="display:none;" class="ss2-edit-field">
            <input class="fr-input" id="ss-new-name" placeholder="${shop.name}" />
            <div class="ss2-approval-note">⚠ Changing your shop name requires admin approval. Your current name stays until approved.</div>
            <button class="btn btn-primary btn-block" onclick="requestNameChange()">Request name change</button>
          </div>
          <div class="ss2-row">
            <div>
              <div class="ss2-row-label">Tagline</div>
              <div class="ss2-row-value">${shop.tagline}</div>
            </div>
            <button class="ss2-edit-btn" onclick="alert('Tagline editing — instant, no approval needed.')">Edit</button>
          </div>
        </section>

        <!-- Login credentials -->
        <section class="ss2-section">
          <h2 class="ss2-section-title">Login & security</h2>
          <div class="ss2-creds">
            <div class="ss2-cred-row">
              <span class="ss2-cred-key">Shop ID</span>
              <code class="ss2-cred-val">${shop.credentials.shopId}</code>
            </div>
            <div class="ss2-cred-row">
              <span class="ss2-cred-key">Password</span>
              <code class="ss2-cred-val">••••••••</code>
            </div>
          </div>
          <button class="btn btn-ghost btn-block" onclick="alert('Password change — sends a reset link to ' + '${shop.email}')">Change password</button>
          <div class="ss2-hint">Admin can also reset your password if you're locked out.</div>
        </section>

        <!-- Status (read-only) -->
        <section class="ss2-section">
          <h2 class="ss2-section-title">Account status</h2>
          <div class="ss2-status-row">
            <span>Product publishing</span>
            <span class="ss2-status-badge ${shop.autoLive ? 'auto' : 'manual'}">${shop.autoLive ? 'Auto-live' : 'Admin approval'}</span>
          </div>
          <div class="ss2-hint">${shop.autoLive ? 'Your products go live instantly. Granted by admin based on trust.' : 'New products are reviewed by admin before going live. Build a good track record to earn auto-live status.'}</div>
        </section>
      </main>
    </div>

    <style>
      .ss2 { min-height: 100vh; background: var(--bg); padding-bottom: var(--s-7); }
      .ss2-top { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4) var(--s-5); position: sticky; top: 0; background: var(--bg); z-index: 10; border-bottom: 1px solid var(--border); }
      .ss2-top-title { font-weight: 700; font-size: var(--t-h2); }
      .ss2-main { padding: var(--s-5); max-width: var(--phone-max); margin: 0 auto; }
      .ss2-section { margin-bottom: var(--s-6); }
      .ss2-section-title { font-size: var(--t-h3); font-weight: 700; margin-bottom: var(--s-3); }
      .ss2-banner { height: 140px; border-radius: var(--r-lg); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .ss2-banner-empty { color: rgba(255,255,255,0.7); font-size: var(--t-small); display: flex; flex-direction: column; align-items: center; gap: var(--s-2); }
      .ss2-banner-empty svg { width: 24px; height: 24px; }
      .ss2-banner-btn { position: absolute; bottom: var(--s-3); right: var(--s-3); background: rgba(255,255,255,0.92); padding: var(--s-2) var(--s-3); border-radius: var(--r-pill); font-size: var(--t-small); font-weight: 600; display: flex; align-items: center; gap: var(--s-2); cursor: pointer; }
      .ss2-banner-btn svg { width: 14px; height: 14px; }
      .ss2-hint { font-size: var(--t-micro); color: var(--ink-dim); margin-top: var(--s-2); line-height: 1.5; }
      .ss2-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: var(--s-2); }
      .ss2-row-label { font-size: var(--t-micro); color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.08em; }
      .ss2-row-value { font-size: var(--t-body); font-weight: 600; margin-top: 2px; }
      .ss2-edit-btn { font-size: var(--t-small); font-weight: 600; color: var(--accent); padding: var(--s-2) var(--s-3); background: var(--bg); border-radius: var(--r-sm); cursor: pointer; }
      .ss2-edit-field { padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: var(--s-2); }
      .ss2-edit-field .fr-input { margin-bottom: var(--s-3); }
      .ss2-approval-note { font-size: var(--t-micro); color: var(--warn); background: var(--warn-soft); padding: var(--s-2) var(--s-3); border-radius: var(--r-sm); margin-bottom: var(--s-3); line-height: 1.5; }
      .ss2-creds { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; margin-bottom: var(--s-3); }
      .ss2-cred-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-3) var(--s-4); border-bottom: 1px solid var(--border); }
      .ss2-cred-row:last-child { border-bottom: none; }
      .ss2-cred-key { font-size: var(--t-small); color: var(--ink-dim); }
      .ss2-cred-val { font-family: var(--mono); font-size: var(--t-small); background: var(--bg); padding: 2px var(--s-2); border-radius: 4px; }
      .ss2-status-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); }
      .ss2-status-badge { font-size: var(--t-micro); padding: 3px var(--s-3); border-radius: var(--r-pill); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
      .ss2-status-badge.auto { background: var(--success-soft); color: var(--success); }
      .ss2-status-badge.manual { background: var(--surface-elev); color: var(--ink-dim); }

      
      .ss2-banner-controls { display: flex; gap: var(--s-2); margin-top: var(--s-3); flex-wrap: wrap; }
      .ss2-banner-pending { display: flex; gap: var(--s-2); margin-top: var(--s-3); align-items: center; padding: var(--s-3); background: var(--warn-soft); border-radius: var(--r-md); }
      .ss2-banner-pending > span { font-size: var(--t-small); color: var(--warn); font-weight: 600; flex: 1; }
      .ss2-bc-btn { padding: var(--s-2) var(--s-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); font-size: var(--t-small); font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: var(--s-2); }
      .ss2-bc-btn:hover { background: var(--surface-elev); }
      .ss2-bc-btn.ss2-bc-primary { background: var(--accent); color: white; border-color: var(--accent); }
      .ss2-bc-btn.ss2-bc-danger { color: var(--danger); border-color: var(--danger-soft); }
      .ss2-bc-btn svg { width: 14px; height: 14px; }

      .ss2-qr-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); text-align: center; }
      .ss2-qr-code { width: 200px; height: 200px; margin: 0 auto var(--s-3); background: white; padding: var(--s-3); border-radius: var(--r-md); }
      .ss2-qr-code svg { width: 100%; height: 100%; }
      .ss2-qr-url { font-family: var(--mono); font-size: var(--t-small); color: var(--ink-dim); margin-bottom: var(--s-4); padding: var(--s-2); background: var(--bg); border-radius: var(--r-sm); }
      .ss2-qr-actions { margin-bottom: var(--s-3); }
      .ss2-qr-actions .btn svg { width: 16px; height: 16px; }
    </style>
  `;
});

// Banner upload with save/discard flow + drag-to-reposition
let _pendingBannerUrl = null;
let _bannerPosY = 50;  // percent — 0 means show top of image, 100 means bottom
let _bannerDragging = false;
let _bannerDragStartY = 0;
let _bannerDragStartPos = 50;

async function handleBannerUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateAsset(file);
  if (err) { alert(err); return; }
  const shop = State.get('shop');
  if (!shop) { alert('No shop loaded.'); return; }
  const banner = document.getElementById('ss-banner');
  if (banner) banner.style.opacity = '0.5';
  try {
    const url = await Storage.uploadShopAsset(shop.id, file, 'banner');
    _pendingBannerUrl = url;
    _bannerPosY = 50;
    if (banner) {
      banner.style.backgroundImage = `url('${url}')`;
      banner.style.backgroundPosition = `center 50%`;
      banner.style.backgroundSize = 'cover';
      banner.style.opacity = '1';
      banner.classList.add('has-image');
      const empty = banner.querySelector('.ss2-banner-empty');
      if (empty) empty.remove();
      // Show drag hint if not there
      if (!banner.querySelector('.ss2-banner-overlay-hint')) {
        const hint = document.createElement('div');
        hint.className = 'ss2-banner-overlay-hint';
        hint.textContent = '↕ Drag image up/down to reposition';
        banner.appendChild(hint);
      }
      // Initialize drag listeners
      initBannerDrag();
    }
    document.getElementById('ss-banner-pending').style.display = 'flex';
    log('Shopkeeper/Settings', 'banner uploaded (pending save)');
  } catch (err) {
    alert('Upload failed: ' + err.message + '\n\nIf you see "Bucket not found", you need to run migration_3_storage.sql in Supabase first.');
    if (banner) banner.style.opacity = '1';
  }
}

function initBannerDrag() {
  const banner = document.getElementById('ss-banner');
  if (!banner || banner._dragInit) return;
  banner._dragInit = true;
  banner.style.cursor = 'ns-resize';
  banner.style.touchAction = 'none';

  const onStart = (clientY) => {
    _bannerDragging = true;
    _bannerDragStartY = clientY;
    _bannerDragStartPos = _bannerPosY;
    banner.classList.add('dragging');
  };
  const onMove = (clientY) => {
    if (!_bannerDragging) return;
    const rect = banner.getBoundingClientRect();
    const deltaY = clientY - _bannerDragStartY;
    // Convert pixel delta into a percentage (larger banner area = finer control)
    const percentDelta = (deltaY / rect.height) * 100;
    _bannerPosY = Math.max(0, Math.min(100, _bannerDragStartPos - percentDelta));
    banner.style.backgroundPosition = `center ${_bannerPosY}%`;
    document.getElementById('ss-banner-pending').style.display = 'flex';
  };
  const onEnd = () => { _bannerDragging = false; banner.classList.remove('dragging'); };

  banner.addEventListener('mousedown', e => { e.preventDefault(); onStart(e.clientY); });
  window.addEventListener('mousemove', e => onMove(e.clientY));
  window.addEventListener('mouseup', onEnd);
  banner.addEventListener('touchstart', e => { onStart(e.touches[0].clientY); }, { passive: true });
  banner.addEventListener('touchmove', e => { onMove(e.touches[0].clientY); }, { passive: true });
  banner.addEventListener('touchend', onEnd);
}

// Initialize drag on existing banner when settings screen mounts
window.addEventListener('screen:mounted', (e) => {
  if (e.detail?.path === '/shopkeeper/settings') {
    setTimeout(() => {
      const banner = document.getElementById('ss-banner');
      if (banner && banner.classList.contains('has-image')) {
        const shop = State.get('shop');
        _bannerPosY = shop?.bannerPosY || 50;
        initBannerDrag();
      }
    }, 100);
  }
});

// Legacy (no longer used but referenced)
function adjustBannerPosition() {}

async function saveBannerChange() {
  const shop = State.get('shop');
  if (!shop) return;
  const url = _pendingBannerUrl || shop.banner;
  if (!url) return;
  try {
    shop.banner = url;
    shop.bannerPosY = _bannerPosY;
    State.set('shop', shop);
    State.update('shops', s => ({ ...s, [shop.id]: { ...s[shop.id], banner: url, bannerPosY: _bannerPosY } }));
    if (window.DB && DB.isReady()) await DB.updateShop(shop.id, { banner: url });
    document.getElementById('ss-banner-pending').style.display = 'none';
    _pendingBannerUrl = null;
    alert('Banner saved.');
    log('Shopkeeper/Settings', 'banner saved to DB');
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
}

function discardBannerChange() {
  _pendingBannerUrl = null;
  _bannerPosY = 50;
  const shop = State.get('shop');
  const banner = document.getElementById('ss-banner');
  if (banner && shop) {
    banner.style.background = shop.banner ? `url('${shop.banner}') center/cover` : shop.coverGradient;
  }
  document.getElementById('ss-banner-pending').style.display = 'none';
  log('Shopkeeper/Settings', 'banner change discarded');
}

async function removeBanner() {
  if (!confirm('Remove the current banner?')) return;
  const shop = State.get('shop');
  if (!shop) return;
  try {
    if (shop.banner) await Storage.removeByUrl(shop.banner);
    shop.banner = null;
    State.set('shop', shop);
    State.update('shops', s => ({ ...s, [shop.id]: { ...s[shop.id], banner: null } }));
    if (window.DB && DB.isReady()) await DB.updateShop(shop.id, { banner: null });
    alert('Banner removed.');
    Router.reload();
  } catch (err) { alert('Remove failed: ' + err.message); }
}

// Legacy alias (still referenced elsewhere)
async function mockBannerUpload() {
  document.getElementById('ss-banner-input')?.click();
}
async function requestNameChange() {
  const newName = document.getElementById('ss-new-name').value.trim();
  if (!newName) { alert('Enter a new name first.'); return; }
  const shop = State.get('shop');
  if (!shop) { alert('No shop loaded.'); return; }
  if (newName === shop.name) { alert('That is your current name.'); return; }
  const reason = prompt('Optional: why are you changing the name? (helps admin approve faster)') || '';

  try {
    if (window.DB && DB.isReady()) {
      await DB.createChangeRequest({
        shopId: shop.id,
        field: 'name',
        currentValue: shop.name,
        requestedValue: newName,
        reason,
      });
    }
    log('Shopkeeper/Settings', `name change requested: ${newName}`);
    alert(`Name change to "${newName}" submitted for admin approval. Your current name stays active until approved.\n\nYou'll see the change reflected once admin approves it.`);
    Router.go('/shopkeeper/home');
  } catch (e) {
    alert('Could not submit the request: ' + e.message);
  }
}

function copyQRImage() {
  const qrEl = document.getElementById('ss-qr');
  if (!qrEl) return;
  // Convert SVG to data URL for sharing
  const svg = qrEl.innerHTML;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  // Try native share if available (mobile)
  if (navigator.share) {
    navigator.share({ title: 'My HOLOS Shop QR', url: window.location.origin + '/s/' + (State.get('shop')?.id || '') });
  } else {
    // Fallback: copy URL
    navigator.clipboard.writeText(window.location.origin + '/s/' + (State.get('shop')?.id || '')).then(() => {
      alert('Shop link copied to clipboard!');
    }).catch(() => alert('Could not copy. Your shop URL: ' + window.location.origin + '/s/' + (State.get('shop')?.id || '')));
  }
}

/* ---- LOGO UPLOAD ---- */
let _pendingLogoUrl = null;

async function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateAsset(file);
  if (err) { alert(err); return; }
  const shop = State.get('shop');
  if (!shop) { alert('No shop loaded.'); return; }
  const frame = document.getElementById('ss-logo-frame');
  if (frame) frame.style.opacity = '0.5';
  try {
    const url = await Storage.uploadShopAsset(shop.id, file, 'logo');
    _pendingLogoUrl = url;
    if (frame) {
      frame.style.background = `url('${url}') center/cover`;
      frame.style.opacity = '1';
      const init = frame.querySelector('.ss2-logo-init');
      if (init) init.remove();
    }
    document.getElementById('ss-logo-pending').style.display = 'flex';
    log('Shopkeeper/Settings', 'logo uploaded (pending save)');
  } catch (err) {
    alert('Upload failed: ' + err.message + '\n\nIf you see "Bucket not found", run migration_3_storage.sql in Supabase first.');
    if (frame) frame.style.opacity = '1';
  }
}

async function saveLogoChange() {
  const shop = State.get('shop');
  if (!shop || !_pendingLogoUrl) return;
  try {
    shop.logo = _pendingLogoUrl;
    State.set('shop', shop);
    State.update('shops', s => ({ ...s, [shop.id]: { ...s[shop.id], logo: _pendingLogoUrl } }));
    if (window.DB && DB.isReady()) await DB.updateShop(shop.id, { logo: _pendingLogoUrl });
    document.getElementById('ss-logo-pending').style.display = 'none';
    _pendingLogoUrl = null;
    alert('Logo saved.');
    log('Shopkeeper/Settings', 'logo saved to DB');
  } catch (err) { alert('Save failed: ' + err.message); }
}

function discardLogoChange() {
  _pendingLogoUrl = null;
  const shop = State.get('shop');
  const frame = document.getElementById('ss-logo-frame');
  if (frame && shop) {
    if (shop.logo) {
      frame.style.background = `url('${shop.logo}') center/cover`;
    } else {
      frame.style.background = shop.accent;
      if (!frame.querySelector('.ss2-logo-init')) {
        const init = document.createElement('span');
        init.className = 'ss2-logo-init';
        init.textContent = shop.name.split(' ').map(w=>w[0]).slice(0,2).join('');
        frame.appendChild(init);
      }
    }
  }
  document.getElementById('ss-logo-pending').style.display = 'none';
}

async function removeLogo() {
  if (!confirm('Remove the current logo?')) return;
  const shop = State.get('shop');
  if (!shop) return;
  try {
    if (shop.logo) await Storage.removeByUrl(shop.logo);
    shop.logo = null;
    State.set('shop', shop);
    State.update('shops', s => ({ ...s, [shop.id]: { ...s[shop.id], logo: null } }));
    if (window.DB && DB.isReady()) await DB.updateShop(shop.id, { logo: null });
    alert('Logo removed.');
    Router.reload();
  } catch (err) { alert('Remove failed: ' + err.message); }
}

/* Logo + banner styles */
(function() {
  if (document.getElementById('ss-banner-logo-styles')) return;
  const s = document.createElement('style');
  s.id = 'ss-banner-logo-styles';
  s.textContent = `
    .ss2-logo-row { display: grid; grid-template-columns: 100px 1fr; gap: var(--s-4); align-items: center; }
    .ss2-logo-frame { width: 100px; height: 100px; border-radius: var(--r-md); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border); flex-shrink: 0; }
    .ss2-logo-init { color: white; font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em; }
    .ss2-logo-controls { display: flex; flex-direction: column; gap: var(--s-2); }
    .ss2-banner-wrap { position: relative; }
    .ss2-banner { width: 100%; height: 180px; border-radius: var(--r-md); position: relative; overflow: hidden; transition: opacity 160ms; }
    .ss2-banner.has-image { cursor: ns-resize; }
    .ss2-banner.dragging { cursor: grabbing; }
    .ss2-banner-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--s-2); color: var(--ink-muted); }
    .ss2-banner-empty svg { width: 28px; height: 28px; }
    .ss2-banner-overlay-hint { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.55); color: white; padding: 4px 10px; border-radius: var(--r-pill); font-size: var(--t-micro); pointer-events: none; backdrop-filter: blur(4px); }
    .ss2-banner.dragging .ss2-banner-overlay-hint { opacity: 0; }
  `;
  document.head.appendChild(s);
})();
