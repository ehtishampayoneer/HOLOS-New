/* ============================================================
   SCREEN: Shopkeeper / Signup
   Apply to become a HOLOS seller. Goes to admin pending queue.
   ============================================================ */

Router.register('/shopkeeper/signup', () => {
  log('Shopkeeper/Signup', 'mounted');

  setTimeout(() => {
    const form = document.getElementById('ssu-form');
    if (form) form.addEventListener('submit', handleShopkeeperSignup);
  }, 50);

  const countryOptions = Locale.getCountryList().map(c => `<option value="${c.code}">${c.code} — ${c.name}</option>`).join('');
  const categoryOptions = Taxonomy.getCategories().map(c => `<option value="${c.id}">${c.label}</option>`).join('');

  setTimeout(() => {
    const catSel = document.getElementById('ssu-category');
    if (catSel) catSel.addEventListener('change', () => {
      const newCatInput = document.getElementById('ssu-newcat');
      if (newCatInput) newCatInput.style.display = catSel.value === '__other__' ? 'block' : 'none';
    });
    // Logo + banner upload handlers
    const logoInput = document.getElementById('ssu-logo-input');
    if (logoInput) logoInput.addEventListener('change', handleLogoUpload);
    const bannerInput = document.getElementById('ssu-banner-input');
    if (bannerInput) bannerInput.addEventListener('change', handleBannerUpload);
  }, 60);

  return `
    <div class="screen ssu">
      <header class="ssu-top">
        <button class="btn-icon-bare" onclick="Router.go('/')" aria-label="back">${icon('arrow_left')}</button>
        <div class="ssu-title">Become a seller</div>
        <div style="width: 40px;"></div>
      </header>

      <main class="ssu-main stagger">
        <div class="ssu-intro">
          <div class="ssu-intro-icon">${icon('package')}</div>
          <h1 class="ssu-intro-title">Sell on HOLOS</h1>
          <p class="ssu-intro-sub">Apply to open your shop. We'll review within 24 hours.</p>
        </div>

        <form id="ssu-form" class="ssu-form">
          <h2 class="ssu-section">About your business</h2>

          <div class="ssu-field">
            <label class="ssu-label">Shop name</label>
            <input id="ssu-name" type="text" class="ssu-input" placeholder="e.g. Bilal Footwear" required />
          </div>

          <div class="ssu-field">
            <label class="ssu-label">Tagline (one short line)</label>
            <input id="ssu-tagline" type="text" class="ssu-input" placeholder="e.g. Handcrafted shoes since 1998" />
          </div>

          <div class="ssu-field">
            <label class="ssu-label">Your category</label>
            <select id="ssu-category" class="ssu-input" required>
              <option value="">Choose...</option>
              ${categoryOptions}
              <option value="__other__">+ My category is not listed (request new)</option>
            </select>
            <input type="text" id="ssu-newcat" class="ssu-input" placeholder="What category do you sell in?" style="display:none;margin-top:var(--s-2);" />
          </div>

          <div class="ssu-field">
            <label class="ssu-label">Country</label>
            <select id="ssu-country" class="ssu-input" required onchange="updateCitySelect('ssu-city', this.value)">
              <option value="">Choose...</option>
              ${countryOptions}
            </select>
          </div>
          <div class="ssu-field">
            <label class="ssu-label">City</label>
            <select id="ssu-city" class="ssu-input" required>
              <option value="">Choose country first...</option>
            </select>
          </div>

          <h2 class="ssu-section">About you</h2>

          <div class="ssu-field">
            <label class="ssu-label">Your full name</label>
            <input id="ssu-owner" type="text" class="ssu-input" placeholder="Your name" required />
          </div>

          <div class="ssu-field">
            <label class="ssu-label">Email</label>
            <input id="ssu-email" type="email" class="ssu-input" placeholder="you@example.com" required />
          </div>

          <div class="ssu-field">
            <label class="ssu-label">Phone (WhatsApp)</label>
            <input id="ssu-phone" type="tel" class="ssu-input" placeholder="+92 3XX XXX XXXX" required />
          </div>

          <h2 class="ssu-section">Verification documents</h2>
          <p class="ssu-helper">We'll need these to approve your shop. Upload from camera or library.</p>

          <div class="ssu-docs">
            <h3 class="ssu-h3">Visual branding</h3>
            <p class="ssu-hint">Add your logo and banner so we can launch your shop with proper branding. You can change these anytime later.</p>

            <div class="ssu-visual-row">
              <div class="ssu-visual-card">
                <div class="ssu-visual-preview ssu-logo-preview" id="ssu-logo-preview">${icon('camera')}<span>Shop logo</span></div>
                <input type="file" id="ssu-logo-input" accept="image/jpeg,image/png,image/webp" style="display:none;" />
                <button type="button" class="ssu-doc-btn" onclick="document.getElementById('ssu-logo-input').click()" id="ssu-logo-btn">Upload logo</button>
                <div class="ssu-doc-status text-dim" id="ssu-logo-status" style="margin-top:6px;">Square, PNG/JPG</div>
              </div>
              <div class="ssu-visual-card">
                <div class="ssu-visual-preview ssu-banner-preview" id="ssu-banner-preview">${icon('camera')}<span>Shop banner</span></div>
                <input type="file" id="ssu-banner-input" accept="image/jpeg,image/png,image/webp" style="display:none;" />
                <button type="button" class="ssu-doc-btn" onclick="document.getElementById('ssu-banner-input').click()" id="ssu-banner-btn">Upload banner</button>
                <div class="ssu-doc-status text-dim" id="ssu-banner-status" style="margin-top:6px;">Wide, 1200×400px</div>
              </div>
            </div>

            <h3 class="ssu-h3" style="margin-top:var(--s-5);">Documents</h3>
            <div class="ssu-doc">
              <div class="ssu-doc-icon">${icon('user')}</div>
              <div class="ssu-doc-body">
                <div class="ssu-doc-name">National ID (CNIC)</div>
                <div class="ssu-doc-status text-success">Required</div>
              </div>
              <button type="button" class="ssu-doc-btn" onclick="mockDocUpload(this)">Upload</button>
            </div>
            <div class="ssu-doc">
              <div class="ssu-doc-icon">${icon('package')}</div>
              <div class="ssu-doc-body">
                <div class="ssu-doc-name">Business permit / tax registration</div>
                <div class="ssu-doc-status text-success">Required</div>
              </div>
              <button type="button" class="ssu-doc-btn" onclick="mockDocUpload(this)">Upload</button>
            </div>
          </div>

          <div class="ssu-terms">
            <label class="ssu-checkbox">
              <input type="checkbox" required />
              <span>I agree to HOLOS's <a class="ssu-link">Seller Terms</a> and <a class="ssu-link">Commission Structure</a> (10% per sale).</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-large btn-block">
            Submit application
          </button>

          <div class="ssu-bottom">
            Already approved? <a class="ssu-link" onclick="Router.go('/shopkeeper/home')">Go to dashboard</a>
          </div>
        </form>
      </main>
    </div>

    <style>
      .ssu { min-height: 100vh; background: var(--bg); padding-bottom: var(--s-9); }
      .ssu-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--s-4) var(--s-5);
        position: sticky; top: 0;
        background: var(--bg);
        z-index: 10;
      }
      .ssu-title { font-weight: 700; font-size: var(--t-h2); }
      .ssu-main {
        padding: var(--s-5);
        max-width: 480px;
        margin: 0 auto;
      }
      .ssu-intro {
        text-align: center;
        margin-bottom: var(--s-7);
      }
      .ssu-intro-icon {
        width: 64px; height: 64px;
        margin: 0 auto var(--s-4);
        border-radius: 50%;
        background: var(--accent);
        color: var(--accent-text);
        display: flex; align-items: center; justify-content: center;
      }
      .ssu-intro-icon svg { width: 28px; height: 28px; }
      .ssu-intro-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: var(--s-2);
        letter-spacing: -0.02em;
      }
      .ssu-intro-sub { color: var(--ink-dim); }

      .ssu-form { display: flex; flex-direction: column; gap: var(--s-4); }
      .ssu-section {
        font-size: var(--t-small);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--ink-dim);
        margin: var(--s-4) 0 var(--s-2);
        font-weight: 600;
      }
      .ssu-helper {
        font-size: var(--t-small);
        color: var(--ink-dim);
        margin-bottom: var(--s-2);
      }
      .ssu-field { display: flex; flex-direction: column; }
      .ssu-label {
        font-size: var(--t-small);
        color: var(--ink-dim);
        margin-bottom: var(--s-2);
        font-weight: 500;
      }
      .ssu-input {
        padding: var(--s-4);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--r-md);
        font-size: var(--t-body);
        transition: all var(--d-fast);
      }
      .ssu-input:focus {
        border-color: var(--accent);
        outline: none;
      }
      select.ssu-input {
        appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236F6B62' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right var(--s-4) center;
        padding-right: var(--s-7);
      }

      .ssu-docs {
        display: flex;
        flex-direction: column;
        gap: var(--s-2);
      }
      
      .ssu-h3 { font-size: var(--t-h3); font-weight: 700; margin-bottom: var(--s-2); }
      .ssu-hint { font-size: var(--t-small); color: var(--ink-dim); margin-bottom: var(--s-3); }
      .ssu-visual-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-3); margin-bottom: var(--s-4); }
      @media (max-width: 500px) { .ssu-visual-row { grid-template-columns: 1fr; } }
      .ssu-visual-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--s-3); text-align: center; }
      .ssu-visual-preview { width: 100%; border-radius: var(--r-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: var(--ink-muted); font-size: 0.75rem; background: var(--surface); border: 2px dashed var(--border); margin-bottom: var(--s-2); }
      .ssu-visual-preview svg { width: 22px; height: 22px; }
      .ssu-logo-preview { aspect-ratio: 1; }
      .ssu-banner-preview { aspect-ratio: 3 / 1; }

      .ssu-doc {
        display: grid;
        grid-template-columns: 36px 1fr auto;
        gap: var(--s-3);
        align-items: center;
        padding: var(--s-3) var(--s-4);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--r-md);
      }
      .ssu-doc-icon {
        width: 36px; height: 36px;
        background: var(--bg);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
      }
      .ssu-doc-icon svg { width: 16px; height: 16px; }
      .ssu-doc-name { font-size: var(--t-small); font-weight: 600; }
      .ssu-doc-status { font-size: var(--t-micro); margin-top: 2px; }
      .ssu-doc-btn {
        font-size: var(--t-small);
        font-weight: 500;
        padding: var(--s-2) var(--s-3);
        background: var(--bg);
        border-radius: var(--r-sm);
        border: 1px solid var(--border-strong);
        cursor: pointer;
      }
      .ssu-doc-btn.uploaded {
        background: var(--success-soft);
        color: var(--success);
        border-color: var(--success);
      }

      .ssu-terms {
        margin: var(--s-3) 0;
      }
      .ssu-checkbox {
        display: flex;
        gap: var(--s-3);
        font-size: var(--t-small);
        color: var(--ink-dim);
        line-height: 1.5;
        cursor: pointer;
      }
      .ssu-checkbox input { flex-shrink: 0; margin-top: 4px; }

      .ssu-link {
        color: var(--accent);
        cursor: pointer;
        font-weight: 500;
      }

      .ssu-bottom {
        text-align: center;
        font-size: var(--t-small);
        color: var(--ink-dim);
        margin-top: var(--s-4);
      }
    </style>
  `;
});

function mockDocUpload(btn) {
  log('Shopkeeper/Signup', 'doc uploaded');
  btn.textContent = '✓ Uploaded';
  btn.classList.add('uploaded');
}

function handleShopkeeperSignup(e) {
  e.preventDefault();
  const name = document.getElementById('ssu-name').value;
  const owner = document.getElementById('ssu-owner').value;
  const city = document.getElementById('ssu-city').value;
  const category = document.getElementById('ssu-category').value;
  const phone = document.getElementById('ssu-phone')?.value || '';
  const email = document.getElementById('ssu-email')?.value || '';
  log('Shopkeeper/Signup', `submitted: ${name} (${owner}, ${city})`);

  // Add to admin's shop-requests queue (and persist to DB)
  const reqId = 'req-' + Date.now().toString(36);
  const reqObj = {
    id: reqId, name, owner, email, phone, city,
    category,
    tagline: document.getElementById('ssu-tagline')?.value || '',
    logo: window._pendingShopLogo || null,
    banner: window._pendingShopBanner || null,
    requestedAt: 'just now',
    docs: ['CNIC', 'Business permit', 'Sample products'],
    status: 'pending',
  };
  State.update('shopRequests', r => ({ ...r, [reqId]: reqObj }));
  if (window.DB && DB.isReady()) DB.createShopRequest(reqObj);
  // Clear the pending uploads so they don't leak to a new signup
  delete window._pendingShopLogo;
  delete window._pendingShopBanner;

  // Show success screen
  Router.go('/shopkeeper/signup-success');
}

Router.register('/shopkeeper/signup-success', () => {
  return `
    <div class="screen" style="min-height: 100vh; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: var(--s-5);">
      <div style="text-align: center; max-width: 360px;">
        <div style="width: 80px; height: 80px; margin: 0 auto var(--s-5); border-radius: 50%; background: var(--success-soft); color: var(--success); display: flex; align-items: center; justify-content: center; font-size: 2rem;">✓</div>
        <h1 style="font-size: 1.8rem; font-weight: 700; margin-bottom: var(--s-3); letter-spacing: -0.02em;">Application submitted!</h1>
        <p style="color: var(--ink-dim); margin-bottom: var(--s-3); line-height: 1.5;">We've received your seller application. Our team typically reviews within 24 hours.</p>
        <p style="color: var(--ink-dim); margin-bottom: var(--s-7); line-height: 1.5; font-size: var(--t-small);">You'll get a WhatsApp + email notification once approved. After that, sign in to start adding products.</p>
        <button class="btn btn-primary btn-large btn-block" onclick="Router.go('/')">Back to home</button>
        <button class="btn btn-ghost btn-block" style="margin-top: var(--s-2);" onclick="Router.go('/admin/home')">View admin queue (demo)</button>
      </div>
    </div>
  `;
});

async function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateAsset(file);
  if (err) { alert(err); return; }
  const btn = document.getElementById('ssu-logo-btn');
  const status = document.getElementById('ssu-logo-status');
  const preview = document.getElementById('ssu-logo-preview');
  if (btn) { btn.disabled = true; btn.textContent = 'Uploading…'; }
  try {
    const tempId = 'pending-' + Date.now().toString(36);
    const url = await Storage.uploadShopAsset(tempId, file, 'logo');
    window._pendingShopLogo = url;
    if (preview) { preview.style.background = `url('${url}') center/cover`; preview.innerHTML = ''; }
    if (status) { status.textContent = '✓ Uploaded'; status.className = 'ssu-doc-status text-success'; }
    if (btn) { btn.textContent = 'Change'; btn.disabled = false; }
    log('Shopkeeper/Signup', 'logo uploaded');
  } catch (err) {
    alert('Upload failed: ' + err.message + '\n\nIf you see "Bucket not found", the storage migration hasn\'t been run yet in Supabase.');
    if (btn) { btn.textContent = 'Upload logo'; btn.disabled = false; }
  }
}

async function handleBannerUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateAsset(file);
  if (err) { alert(err); return; }
  const btn = document.getElementById('ssu-banner-btn');
  const status = document.getElementById('ssu-banner-status');
  const preview = document.getElementById('ssu-banner-preview');
  if (btn) { btn.disabled = true; btn.textContent = 'Uploading…'; }
  try {
    const tempId = 'pending-' + Date.now().toString(36);
    const url = await Storage.uploadShopAsset(tempId, file, 'banner');
    window._pendingShopBanner = url;
    if (preview) { preview.style.background = `url('${url}') center/cover`; preview.innerHTML = ''; }
    if (status) { status.textContent = '✓ Uploaded'; status.className = 'ssu-doc-status text-success'; }
    if (btn) { btn.textContent = 'Change'; btn.disabled = false; }
    log('Shopkeeper/Signup', 'banner uploaded');
  } catch (err) {
    alert('Upload failed: ' + err.message + '\n\nIf you see "Bucket not found", the storage migration hasn\'t been run yet in Supabase.');
    if (btn) { btn.textContent = 'Upload banner'; btn.disabled = false; }
  }
}
