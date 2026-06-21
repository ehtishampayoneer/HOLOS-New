/* ============================================================
   SCREEN: Admin / Shop Detail
   Deep view of one shop: stats, products, credentials, controls.
   ============================================================ */

State.getShopsList().forEach(s => {
  Router.register(`/admin/shop/${s.id}`, () => renderAdminShopDetail(s.id));
});
// Also register a generic handler for dynamically-created shops
Router.registerDynamic && Router.registerDynamic('/admin/shop/', (id) => renderAdminShopDetail(id));

function renderAdminShopDetail(shopId) {
  if (!State.isAdminLoggedIn()) { setTimeout(() => Router.go('/admin/login'), 0); return '<div></div>'; }
  log('Admin/ShopDetail', shopId);
  const s = State.getShop(shopId);
  if (!s) return `<div style="padding:2rem;">Shop not found</div>`;
  const products = State.getProductsForShop(shopId, true);
  const st = s.stats || {};

  return `
    <div class="screen asd">
      <header class="asd-top">
        <button class="btn-icon-bare" onclick="Router.go('/admin/home')">${icon('arrow_left')}</button>
        <div class="asd-top-title">${s.name}</div>
        <div style="width:40px;"></div>
      </header>

      <main class="asd-main">
        <!-- Shop header -->
        <section class="asd-header">
          <div class="asd-avatar" style="background:${s.accent}">${s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
          <div>
            <div class="asd-name">${s.name} ${s.verified ? '<span style="color:var(--info)">✓</span>' : ''}</div>
            <div class="asd-sub">${s.owner} · ${s.city} · joined ${s.joinedMonths}mo ago</div>
            <div class="asd-badges">
              <span class="asd-badge ${s.status === 'active' ? 'ok' : ''}">${s.status}</span>
              <span class="asd-badge ${s.autoLive ? 'auto' : ''}">${s.autoLive ? 'Auto-live ON' : 'Manual approval'}</span>
              <span class="asd-badge">${s.plan}</span>
            </div>
          </div>
        </section>

        <!-- Date range tabs -->
        <section class="asd-daterange">
          <button class="asd-dr-btn active" onclick="asdDateTab(this, 'month')">This month</button>
          <button class="asd-dr-btn" onclick="asdDateTab(this, 'week')">This week</button>
          <button class="asd-dr-btn" onclick="asdDateTab(this, 'year')">This year</button>
          <button class="asd-dr-btn" onclick="asdDateTab(this, 'all')">All time</button>
          <button class="asd-dr-btn" onclick="asdOpenCustom()">Custom dates</button>
        </section>
        <div id="asd-custom-dates" style="display:none;margin:0 var(--s-5) var(--s-3);">
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:var(--s-2);align-items:end;background:var(--surface);padding:var(--s-3);border-radius:var(--r-md);border:1px solid var(--border);">
            <div><label style="font-size:var(--t-micro);color:var(--ink-dim);display:block;margin-bottom:4px;">From</label><input type="date" id="asd-date-from" style="width:100%;padding:var(--s-2);border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--t-small);"></div>
            <div><label style="font-size:var(--t-micro);color:var(--ink-dim);display:block;margin-bottom:4px;">To</label><input type="date" id="asd-date-to" style="width:100%;padding:var(--s-2);border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--t-small);"></div>
            <button class="btn btn-primary" style="padding:var(--s-2) var(--s-4);font-size:var(--t-small);" onclick="asdApplyCustom('${s.id}')">Apply</button>
          </div>
        </div>

        <!-- Stats grid -->
        <section class="asd-stats">
          ${asdStat('Revenue', 'Rs. ' + ((st.revenue||0)/1000).toFixed(0) + 'k')}
          ${asdStat('Orders', st.orders || 0)}
          ${asdStat('Refunds', st.refunds || 0)}
          ${asdStat('Products', products.filter(p=>p.status==='live').length)}
          ${asdStat('Followers', (st.views ? (s.followers||0) : 0))}
          ${asdStat('Rating', '★ ' + s.rating.toFixed(1))}
          ${asdStat('Scans (mo)', st.scansMonth || 0)}
          ${asdStat('Page views', (st.views||0).toLocaleString())}
        </section>

        <!-- Pending requests + Messages -->
        <section class="asd-section">
          <div class="asd-row-grid">
            <div class="asd-comm-card" onclick="Router.go('/admin/shop-messages/${s.id}')" id="asd-msg-card-${s.id}">
              <div class="asd-comm-icon">💬</div>
              <div class="asd-comm-body">
                <div class="asd-comm-title">Talk with seller</div>
                <div class="asd-comm-sub" id="asd-msg-count-${s.id}">Loading messages…</div>
              </div>
              <div class="asd-comm-arrow">→</div>
            </div>
            <div class="asd-comm-card" id="asd-req-card-${s.id}">
              <div class="asd-comm-icon">📋</div>
              <div class="asd-comm-body">
                <div class="asd-comm-title">Pending requests</div>
                <div class="asd-comm-sub" id="asd-req-count-${s.id}">Loading requests…</div>
              </div>
            </div>
          </div>
          <div id="asd-req-list-${s.id}" class="asd-req-list" style="display:none;margin-top:var(--s-3);"></div>
        </section>

        <!-- Shop branding (admin can edit) -->
        <section class="asd-branding">
          <h3 class="asd-controls-title">Shop branding</h3>

          <div class="asd-brand-row">
            <div class="asd-brand-label">Logo</div>
            <div class="asd-brand-preview asd-logo-preview" style="${s.logo ? `background:url('${s.logo}') center/cover;` : `background:${s.accent};`}">${s.logo ? '' : `<span>${s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span>`}</div>
            <div class="asd-brand-actions">
              <input type="file" id="asd-logo-input" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="asdUploadShopLogo(event, '${s.id}')" />
              <button class="asd-btn-sm" onclick="document.getElementById('asd-logo-input').click()">${s.logo ? 'Replace' : 'Upload'}</button>
              ${s.logo ? `<button class="asd-btn-sm asd-btn-danger" onclick="asdRemoveLogo('${s.id}')">Remove</button>` : ''}
            </div>
          </div>

          <div class="asd-brand-row">
            <div class="asd-brand-label">Banner</div>
            <div class="asd-brand-preview asd-banner-preview" style="${s.banner ? `background:url('${s.banner}') center ${s.bannerPosY||50}%/cover;` : `background:${s.accent};`}"></div>
            <div class="asd-brand-actions">
              <input type="file" id="asd-banner-input" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="asdUploadShopBanner(event, '${s.id}')" />
              <button class="asd-btn-sm" onclick="document.getElementById('asd-banner-input').click()">${s.banner ? 'Replace' : 'Upload'}</button>
              ${s.banner ? `<button class="asd-btn-sm asd-btn-danger" onclick="asdRemoveBanner('${s.id}')">Remove</button>` : ''}
            </div>
          </div>
        </section>

        <!-- Controls -->
        <section class="asd-controls">
          <h3 class="asd-controls-title">Admin controls</h3>
          <div class="asd-control-row">
            <div>
              <div class="asd-control-label">Auto-live products</div>
              <div class="asd-control-desc">New products go live without manual approval</div>
            </div>
            <button class="asd-toggle ${s.autoLive ? 'on' : ''}" onclick="toggleAutoLive('${s.id}')">
              <span class="asd-toggle-knob"></span>
            </button>
          </div>
          <div class="asd-control-row">
            <div>
              <div class="asd-control-label">Shop credentials</div>
              <div class="asd-control-desc">ID: <code>${s.credentials.shopId}</code> · Pass: <code>${s.credentials.password}</code></div>
            </div>
            <button class="asd-btn-sm" onclick="resetPassword('${s.id}')">Reset password</button>
          </div>
          <div class="asd-control-row asd-danger-row">
            <div>
              <div class="asd-control-label">Delete shop</div>
              <div class="asd-control-desc">Permanent. Removes shop, products, reviews, files.</div>
            </div>
            <button class="asd-btn-sm asd-btn-danger" onclick="deleteShopConfirm('${s.id}','${s.name.replace(/'/g, "\\'")}')">Delete shop</button>
          </div>
        </section>

        <!-- Top sellers -->
        <section class="asd-section">
          <div class="section-head">
            <h2 class="section-title">Top sellers</h2>
            <div class="asd-dr">
              <button class="asd-dr-btn active" onclick="asdTopRange('${s.id}', this, 'today')">Today</button>
              <button class="asd-dr-btn" onclick="asdTopRange('${s.id}', this, 'week')">Week</button>
              <button class="asd-dr-btn" onclick="asdTopRange('${s.id}', this, 'month')">Month</button>
              <button class="asd-dr-btn" onclick="asdTopRange('${s.id}', this, 'year')">Year</button>
              <button class="asd-dr-btn" onclick="asdTopOpenCustom('${s.id}')">Custom</button>
            </div>
          </div>
          <div id="asd-top-custom-${s.id}" style="display:none;margin-bottom:var(--s-3);">
            <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:var(--s-2);align-items:end;background:var(--surface);padding:var(--s-3);border-radius:var(--r-md);border:1px solid var(--border);">
              <div><label style="font-size:var(--t-micro);color:var(--ink-dim);display:block;margin-bottom:4px;">From</label><input type="date" id="asd-top-from-${s.id}" style="width:100%;padding:var(--s-2);border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--t-small);"></div>
              <div><label style="font-size:var(--t-micro);color:var(--ink-dim);display:block;margin-bottom:4px;">To</label><input type="date" id="asd-top-to-${s.id}" style="width:100%;padding:var(--s-2);border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--t-small);"></div>
              <button class="btn btn-primary" style="padding:var(--s-2) var(--s-4);font-size:var(--t-small);" onclick="asdApplyTopCustom('${s.id}')">Apply</button>
            </div>
          </div>
          <div id="asd-top-list-${s.id}" class="asd-top-list">
            ${renderTopSellers(products, 'today')}
          </div>
        </section>

        <!-- All Products with sort/filter -->
        <section class="asd-section">
          <div class="section-head">
            <h2 class="section-title">All products (${products.length})</h2>
            <div class="asd-sort">
              <label style="font-size:var(--t-micro);color:var(--ink-dim);">Sort:</label>
              <select id="asd-sort-${s.id}" onchange="asdSortProducts('${s.id}')" style="padding:6px 10px;border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--t-small);background:var(--surface);">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="sales-desc">Most sold first</option>
                <option value="sales-asc">Least sold first</option>
                <option value="price-desc">Price: high → low</option>
                <option value="price-asc">Price: low → high</option>
                <option value="rating-desc">Best rated first</option>
                <option value="name-asc">Name: A → Z</option>
              </select>
            </div>
          </div>
          <div id="asd-products-${s.id}" class="asd-products">
            ${renderProductsList(products, 'newest')}
          </div>
        </section>
      </main>
    </div>


    <script>
      window._asdShopProducts_${s.id.replace(/-/g, '_')} = ${JSON.stringify(products.map(p => ({
        id: p.id, name: p.name, price: p.price, salePrice: p.salePrice,
        rating: p.rating, reviewCount: p.reviewCount,
        photoUrls: p.photoUrls || [], photo: p.photoUrls?.[0] || null,
        status: p.status, subcategory: p.subcategory,
        createdAt: p.createdAt || Date.now(),
        // Mock sales data — in production this comes from orders table
        sales: { today: Math.floor(Math.random()*5), week: Math.floor(Math.random()*30),
                 month: Math.floor(Math.random()*120), year: Math.floor(Math.random()*1500), all: Math.floor(Math.random()*2000) },
      })))};
    </script>

    <style>
      .asd { min-height: 100vh; background: var(--bg); padding-bottom: var(--s-7); }
      .asd-top { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4) var(--s-5); position: sticky; top: 0; background: var(--bg); z-index: 10; border-bottom: 1px solid var(--border); }
      .asd-top-title { font-weight: 700; font-size: var(--t-h2); }
      .asd-main { padding: var(--s-5); max-width: 900px; margin: 0 auto; }
      .asd-header { display: grid; grid-template-columns: 64px 1fr; gap: var(--s-4); align-items: center; margin-bottom: var(--s-5); }
      .asd-avatar { width: 64px; height: 64px; border-radius: var(--r-lg); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.3rem; }
      .asd-name { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
      .asd-sub { font-size: var(--t-small); color: var(--ink-dim); margin: 2px 0 var(--s-2); }
      .asd-badges { display: flex; gap: var(--s-2); flex-wrap: wrap; }
      .asd-badge { font-size: var(--t-micro); padding: 3px var(--s-2); border-radius: var(--r-pill); background: var(--surface-elev); color: var(--ink-dim); text-transform: capitalize; }
      .asd-badge.ok { background: var(--success-soft); color: var(--success); }
      .asd-badge.auto { background: var(--success-soft); color: var(--success); }
      .asd-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--s-2); margin-bottom: var(--s-6); }
      @media (min-width: 600px) { .asd-stats { grid-template-columns: repeat(4, 1fr); } }
      .asd-stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--s-4); }
      .asd-stat-val { font-size: 1.3rem; font-weight: 700; letter-spacing: -0.01em; }
      .asd-stat-lbl { font-size: var(--t-micro); color: var(--ink-dim); margin-top: 2px; }
      .asd-controls { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); margin-bottom: var(--s-6); }
      .asd-controls-title { font-size: var(--t-body); font-weight: 700; margin-bottom: var(--s-4); }
      .asd-control-row { display: flex; align-items: center; justify-content: space-between; gap: var(--s-4); padding: var(--s-3) 0; border-bottom: 1px solid var(--border); }
      .asd-control-row:last-child { border-bottom: none; }
      .asd-control-label { font-size: var(--t-small); font-weight: 600; }
      .asd-control-desc { font-size: var(--t-micro); color: var(--ink-dim); margin-top: 2px; }
      .asd-control-desc code { background: var(--bg); padding: 1px 5px; border-radius: 4px; font-family: var(--mono); }
      .asd-toggle { width: 48px; height: 28px; border-radius: var(--r-pill); background: var(--surface-elev); position: relative; transition: background var(--d-fast); flex-shrink: 0; }
      .asd-toggle.on { background: var(--success); }
      .asd-toggle-knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: white; transition: transform var(--d-fast); box-shadow: var(--shadow-sm); }
      .asd-toggle.on .asd-toggle-knob { transform: translateX(20px); }
      .asd-btn-sm { font-size: var(--t-small); padding: var(--s-2) var(--s-3); background: var(--bg); border: 1px solid var(--border-strong); border-radius: var(--r-sm); font-weight: 500; cursor: pointer; flex-shrink: 0; }
      .asd-section { margin-bottom: var(--s-6); }
      .asd-products { display: flex; flex-direction: column; gap: var(--s-2); }
      .asd-product { display: grid; transition: background 160ms; grid-template-columns: 72px 1fr auto; gap: var(--s-3); align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--s-3); }
      .asd-product:hover { background: var(--surface-elev); }
      .asd-product-thumb { width: 72px; height: 72px; border-radius: var(--r-md); overflow: hidden; display: flex; align-items: center; justify-content: center; color: var(--ink-dim); }
      .asd-product-thumb.has-photo { background-size: cover; }
      
      .asd-product-name { font-size: var(--t-small); font-weight: 600; }
      .asd-product-meta { font-size: var(--t-micro); color: var(--ink-dim); margin-top: 2px; }
      .asd-product-status { font-size: 0.55rem; padding: 3px var(--s-2); border-radius: var(--r-pill); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
      .status-live { background: var(--success-soft); color: var(--success); }
      .status-pending_approval { background: var(--warn-soft); color: var(--warn); }
      .status-photo_review { background: var(--danger-soft); color: var(--danger); }
      .status-draft { background: var(--surface-elev); color: var(--ink-dim); }
    </style>
  `;
}

function asdStat(lbl, val) {
  return `<div class="asd-stat"><div class="asd-stat-val">${val}</div><div class="asd-stat-lbl">${lbl}</div></div>`;
}
function statusLabel(s) {
  return { live: 'Live', pending_approval: 'Pending', photo_review: 'Photo fix', draft: 'Draft' }[s] || s;
}
function categoryGlyphForSub(subId) {
  const sub = Taxonomy.getSubcategoryById(subId);
  const catId = sub?.categoryId || '';
  const iconId = 'cat_' + catId;
  if (Icons && Icons[iconId]) return icon(iconId);
  return icon('cube');
}
async function toggleAutoLive(shopId) {
  State.toggleShopAutoLive(shopId);
  const shop = State.getShop(shopId);
  try {
    if (window.DB && DB.isReady()) {
      await DB.updateShop(shopId, { autoLive: shop.autoLive });
      log('Admin', `auto-live ${shop.autoLive ? 'ON' : 'OFF'} for ${shopId}`);
    }
  } catch (e) {
    alert('Could not save the change: ' + e.message);
  }
  Router.go(`/admin/shop/${shopId}`);
}
function resetPassword(shopId) {
  const newPass = State.resetShopPassword(shopId);
  alert(`New password generated: ${newPass}\n\nIn production this would be emailed to the shop owner.`);
  Router.go(`/admin/shop/${shopId}`);
}

function asdDateTab(btn, range) {
  document.querySelectorAll('.asd-dr-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('asd-custom-dates').style.display = 'none';
  log('Admin/ShopDetail', `date range → ${range}`);
}
function asdOpenCustom() {
  document.querySelectorAll('.asd-dr-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('asd-custom-dates').style.display = 'block';
}
function asdApplyCustom(shopId) {
  const from = document.getElementById('asd-date-from').value;
  const to = document.getElementById('asd-date-to').value;
  if (!from || !to) { alert('Please select both dates.'); return; }
  alert(`Filtering ${shopId} sales from ${from} to ${to}.\n\nIn production this queries actual order data.`);
}

// Inject shop-detail date tab styles
(function() {
  if (document.getElementById('asd-dr-styles')) return;
  const style = document.createElement('style');
  style.id = 'asd-dr-styles';
  style.textContent = `
    .asd-daterange { display: flex; gap: var(--s-2); padding: 0 var(--s-5) var(--s-4); overflow-x: auto; scrollbar-width: none; }
    .asd-daterange::-webkit-scrollbar { display: none; }
    .asd-dr-btn { padding: var(--s-2) var(--s-4); border-radius: var(--r-pill); font-size: var(--t-small); font-weight: 500; background: var(--surface); border: 1px solid var(--border); cursor: pointer; white-space: nowrap; }
    .asd-dr-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
  `;
  document.head.appendChild(style);
})();

async function deleteShopConfirm(shopId, shopName) {
  if (!confirm(`Permanently delete "${shopName}"?\n\nThis removes the shop, all its products, reviews, and uploaded files. Cannot be undone.`)) return;
  if (!confirm(`Are you absolutely sure? Type "delete" to confirm.`)) return;
  const typed = prompt(`Type "delete" to confirm permanent deletion of "${shopName}":`);
  if (typed !== 'delete') { alert('Cancelled.'); return; }
  try {
    if (window.DB && DB.isReady()) await DB.deleteShop(shopId);
    // Remove locally
    State.update('shops', s => { const n = {...s}; delete n[shopId]; return n; });
    State.update('products', p => {
      const n = {...p};
      Object.keys(n).forEach(pid => { if (n[pid].shop === shopId) delete n[pid]; });
      return n;
    });
    log('Admin', `deleted shop ${shopId}`);
    alert(`Shop "${shopName}" deleted.`);
    Router.go('/admin/home');
  } catch (e) {
    alert('Delete failed: ' + e.message);
  }
}

// Inject danger styles
(function() {
  if (document.getElementById('asd-danger-styles')) return;
  const s = document.createElement('style');
  s.id = 'asd-danger-styles';
  s.textContent = `
    .asd-danger-row { border-top: 1px solid var(--danger-soft); padding-top: var(--s-3); margin-top: var(--s-3); }
    .asd-btn-danger { background: var(--danger) !important; color: white !important; border-color: var(--danger) !important; }
    .asd-btn-danger:hover { background: var(--danger) !important; opacity: 0.9; }
  `;
  document.head.appendChild(s);
})();

/* ============================================================
   ADMIN SHOP DETAIL — Communication panel
   Loads unread message count + pending change requests when
   the shop detail screen mounts.
   ============================================================ */
window.addEventListener('screen:mounted', async (e) => {
  if (!e.detail || !e.detail.path || !e.detail.path.startsWith('/admin/shop/')) return;
  // Get shop id (path is /admin/shop/{id} — strip trailing extras like /messages)
  const after = e.detail.path.replace('/admin/shop/', '');
  if (!after || after.includes('/')) return;  // skip /admin/shop-messages/...
  const shopId = after.split('?')[0];

  // 1. Unread messages
  if (window.DB && DB.isReady()) {
    try {
      const msgs = await DB.getMessages(shopId);
      const unread = msgs.filter(m => m.sender === 'seller' && !m.readByAdmin).length;
      const subEl = document.getElementById('asd-msg-count-' + shopId);
      if (subEl) {
        if (msgs.length === 0) {
          subEl.textContent = 'No messages yet — start a conversation';
        } else if (unread > 0) {
          subEl.innerHTML = `<strong style="color:var(--accent);">${unread} unread</strong> · ${msgs.length} total`;
          const card = document.getElementById('asd-msg-card-' + shopId);
          if (card) card.classList.add('has-unread');
        } else {
          subEl.textContent = `${msgs.length} message${msgs.length === 1 ? '' : 's'} · all read`;
        }
      }
    } catch (err) { log('Admin/ShopDetail', 'msg load: ' + err.message, 'warn'); }

    // 2. Pending change requests
    try {
      const reqs = await DB.getChangeRequests(shopId);
      const pending = reqs.filter(r => r.status === 'pending');
      const reqSubEl = document.getElementById('asd-req-count-' + shopId);
      const reqListEl = document.getElementById('asd-req-list-' + shopId);
      const card = document.getElementById('asd-req-card-' + shopId);

      if (reqSubEl) {
        if (pending.length === 0) {
          reqSubEl.textContent = 'No pending requests from this seller';
        } else {
          reqSubEl.innerHTML = `<strong style="color:var(--warn);">${pending.length} pending</strong> — tap to review`;
          if (card) {
            card.classList.add('has-pending');
            card.style.cursor = 'pointer';
            card.onclick = () => {
              if (reqListEl) reqListEl.style.display = reqListEl.style.display === 'none' ? 'block' : 'none';
            };
          }
        }
      }
      if (reqListEl && pending.length > 0) {
        reqListEl.innerHTML = pending.map(r => `
          <div class="asd-req-row">
            <div class="asd-req-meta">
              <div class="asd-req-field">Change <strong>${r.field}</strong></div>
              <div class="asd-req-values">
                <span class="asd-req-from">${r.currentValue || '(none)'}</span>
                <span class="asd-req-arrow">→</span>
                <span class="asd-req-to">${r.requestedValue}</span>
              </div>
              ${r.reason ? `<div class="asd-req-reason">"${r.reason}"</div>` : ''}
            </div>
            <div class="asd-req-actions">
              <button class="asd-btn-sm asd-btn-danger" onclick="rejectChangeRequest('${r.id}')">Reject</button>
              <button class="asd-btn-sm" style="background:var(--accent);color:white;border-color:var(--accent);" onclick="approveChangeRequest('${r.id}','${r.shopId}','${r.field}','${(r.requestedValue || '').replace(/'/g, "\\'")}')">Approve</button>
            </div>
          </div>
        `).join('');
      }
    } catch (err) { log('Admin/ShopDetail', 'req load: ' + err.message, 'warn'); }
  }
});

async function approveChangeRequest(reqId, shopId, field, newValue) {
  if (!confirm(`Approve this change?\n\n${field}: ${newValue}`)) return;
  try {
    // Update the shop with the new value
    const patch = { [field]: newValue };
    if (window.DB && DB.isReady()) {
      await DB.updateShop(shopId, patch);
      await DB.resolveChangeRequest(reqId, 'approved');
    }
    // Update local state too
    State.update('shops', s => ({ ...s, [shopId]: { ...s[shopId], [field]: newValue } }));
    log('Admin', `approved change ${field} → ${newValue} for ${shopId}`);
    alert('Approved. The seller will see the change.');
    Router.reload();
  } catch (e) { alert('Approve failed: ' + e.message); }
}

async function rejectChangeRequest(reqId) {
  if (!confirm('Reject this request?')) return;
  try {
    if (window.DB && DB.isReady()) await DB.resolveChangeRequest(reqId, 'rejected');
    alert('Rejected.');
    Router.reload();
  } catch (e) { alert('Reject failed: ' + e.message); }
}

/* Inject comm panel styles */
(function() {
  if (document.getElementById('asd-comm-styles')) return;
  const s = document.createElement('style');
  s.id = 'asd-comm-styles';
  s.textContent = `
    .asd-row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-3); }
    @media (max-width: 600px) { .asd-row-grid { grid-template-columns: 1fr; } }
    .asd-comm-card { display: flex; align-items: center; gap: var(--s-3); padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); cursor: pointer; transition: all 160ms; }
    .asd-comm-card:hover { background: var(--surface-elev); border-color: var(--accent); }
    .asd-comm-card.has-unread { background: var(--accent-soft); border-color: var(--accent); }
    .asd-comm-card.has-pending { background: var(--warn-soft); border-color: var(--warn); }
    .asd-comm-icon { font-size: 1.4rem; flex-shrink: 0; }
    .asd-comm-body { flex: 1; }
    .asd-comm-title { font-size: var(--t-body); font-weight: 700; margin-bottom: 2px; }
    .asd-comm-sub { font-size: var(--t-small); color: var(--ink-dim); }
    .asd-comm-arrow { color: var(--ink-muted); font-size: 1.2rem; }
    .asd-req-list { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--s-3); }
    .asd-req-row { display: grid; grid-template-columns: 1fr auto; gap: var(--s-3); padding: var(--s-3); border-bottom: 1px solid var(--border); }
    .asd-req-row:last-child { border-bottom: none; }
    .asd-req-field { font-size: var(--t-small); margin-bottom: 4px; }
    .asd-req-values { display: flex; gap: var(--s-2); align-items: center; flex-wrap: wrap; }
    .asd-req-from { font-size: var(--t-small); color: var(--ink-dim); text-decoration: line-through; }
    .asd-req-arrow { color: var(--ink-muted); }
    .asd-req-to { font-size: var(--t-small); font-weight: 700; color: var(--accent); }
    .asd-req-reason { font-size: var(--t-micro); color: var(--ink-dim); font-style: italic; margin-top: 4px; }
    .asd-req-actions { display: flex; gap: var(--s-2); align-items: center; }
  `;
  document.head.appendChild(s);
})();

/* ============================================================
   ADMIN SHOP DETAIL — Top Sellers + Sortable Products
   ============================================================ */

function renderTopSellers(products, range) {
  // Mock sales data — in production this comes from orders table
  const withSales = products.map(p => ({
    ...p,
    salesCount: Math.floor(Math.random() * (range === 'today' ? 5 : range === 'week' ? 30 : range === 'month' ? 120 : 1500))
  })).sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  if (withSales.length === 0) {
    return '<div style="padding:var(--s-5);text-align:center;color:var(--ink-dim);">No sales data for this period yet.</div>';
  }
  if (withSales.every(p => p.salesCount === 0)) {
    return '<div style="padding:var(--s-5);text-align:center;color:var(--ink-dim);">No sales recorded in this period.</div>';
  }

  return withSales.map((p, i) => `
    <div class="asd-top-row" onclick="Router.go('/admin/product-review/${p.id}')">
      <span class="asd-top-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</span>
      <div class="asd-top-thumb" style="${p.photoUrls?.[0] ? `background:url('${p.photoUrls[0]}') center/cover;` : `background:linear-gradient(135deg, var(--accent-soft), transparent);`}">
        ${!p.photoUrls?.[0] ? '<span style="opacity:0.4;">📦</span>' : ''}
      </div>
      <div class="asd-top-info">
        <div class="asd-top-name">${p.name}</div>
        <div class="asd-top-meta">Rs. ${(p.salePrice || p.price).toLocaleString()} · ★ ${p.rating.toFixed(1)}</div>
      </div>
      <div class="asd-top-sales">
        <div class="asd-top-sales-num">${p.salesCount}</div>
        <div class="asd-top-sales-label">sales</div>
      </div>
    </div>
  `).join('');
}

function renderProductsList(products, sortMode) {
  const sorted = sortProducts(products.map(p => ({
    ...p,
    salesCount: Math.floor(Math.random() * 1000), // mock
  })), sortMode);
  if (sorted.length === 0) return '<div style="padding:var(--s-5);text-align:center;color:var(--ink-dim);">No products yet.</div>';
  return sorted.map(p => `
    <div class="asd-product" onclick="Router.go('/admin/product-review/${p.id}')" style="cursor:pointer;">
      <div class="asd-product-thumb ${p.photoUrls?.[0] ? 'has-photo' : ''}" style="${p.photoUrls?.[0] ? `background:url('${p.photoUrls[0]}') center/cover;` : `background:linear-gradient(135deg, var(--accent-soft), transparent);`}">
        ${!p.photoUrls?.[0] ? `<span style="opacity:0.4;font-size:1.4rem;">📦</span>` : ''}
      </div>
      <div class="asd-product-body">
        <div class="asd-product-name">${p.name}</div>
        <div class="asd-product-meta">
          Rs. ${(p.salePrice || p.price).toLocaleString()} ·
          <strong>${p.salesCount}</strong> sold ·
          ★ ${p.rating.toFixed(1)}
        </div>
      </div>
      <span class="asd-product-status status-${p.status}">${typeof statusLabel === 'function' ? statusLabel(p.status) : p.status}</span>
    </div>
  `).join('');
}

function sortProducts(products, mode) {
  const sorted = [...products];
  switch (mode) {
    case 'newest': return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    case 'oldest': return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    case 'sales-desc': return sorted.sort((a, b) => b.salesCount - a.salesCount);
    case 'sales-asc': return sorted.sort((a, b) => a.salesCount - b.salesCount);
    case 'price-desc': return sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    case 'price-asc': return sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    case 'rating-desc': return sorted.sort((a, b) => b.rating - a.rating);
    case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default: return sorted;
  }
}

window.asdTopRange = function(shopId, btn, range) {
  document.querySelectorAll('.asd-dr-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const customDiv = document.getElementById('asd-top-custom-' + shopId);
  if (customDiv) customDiv.style.display = 'none';
  const list = document.getElementById('asd-top-list-' + shopId);
  if (list) {
    const products = State.getProductsForShop(shopId, true);
    list.innerHTML = renderTopSellers(products, range);
  }
};

window.asdTopOpenCustom = function(shopId) {
  document.querySelectorAll('.asd-dr-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('asd-top-custom-' + shopId).style.display = 'block';
};

window.asdApplyTopCustom = function(shopId) {
  const from = document.getElementById('asd-top-from-' + shopId).value;
  const to = document.getElementById('asd-top-to-' + shopId).value;
  if (!from || !to) { alert('Pick both dates.'); return; }
  alert(`Showing top sellers from ${from} to ${to}.\n\nIn production this queries the orders table for sales in that date range.`);
};

window.asdSortProducts = function(shopId) {
  const mode = document.getElementById('asd-sort-' + shopId).value;
  const products = State.getProductsForShop(shopId, true);
  const list = document.getElementById('asd-products-' + shopId);
  if (list) list.innerHTML = renderProductsList(products, mode);
};

/* Styles for top sellers + sort UI */
(function() {
  if (document.getElementById('asd-top-styles')) return;
  const s = document.createElement('style');
  s.id = 'asd-top-styles';
  s.textContent = `
    .asd-dr { display: flex; gap: 4px; flex-wrap: wrap; }
    .asd-dr-btn { padding: 6px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-pill); font-size: var(--t-small); font-weight: 600; cursor: pointer; color: var(--ink-dim); }
    .asd-dr-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
    .asd-dr-btn:hover { background: var(--surface-elev); }
    .asd-dr-btn.active:hover { background: var(--accent); }
    .asd-sort { display: flex; align-items: center; gap: var(--s-2); }
    .asd-top-list { display: flex; flex-direction: column; gap: var(--s-2); }
    .asd-top-row { display: grid; grid-template-columns: 36px 64px 1fr auto; gap: var(--s-3); align-items: center; padding: var(--s-3); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); cursor: pointer; transition: background 160ms; }
    .asd-top-row:hover { background: var(--surface-elev); }
    .asd-top-rank { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: var(--bg); font-weight: 800; font-size: 0.9rem; color: var(--ink-dim); }
    .asd-top-rank.gold { background: linear-gradient(135deg, #ffd700, #ffaa00); color: white; }
    .asd-top-rank.silver { background: linear-gradient(135deg, #c0c0c0, #9090a0); color: white; }
    .asd-top-rank.bronze { background: linear-gradient(135deg, #cd7f32, #a05a1f); color: white; }
    .asd-top-thumb { width: 64px; height: 64px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; overflow: hidden; }
    .asd-top-info { min-width: 0; }
    .asd-top-name { font-weight: 700; font-size: var(--t-body); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .asd-top-meta { font-size: var(--t-small); color: var(--ink-dim); margin-top: 2px; }
    .asd-top-sales { text-align: right; }
    .asd-top-sales-num { font-size: 1.4rem; font-weight: 800; color: var(--accent); line-height: 1; }
    .asd-top-sales-label { font-size: 0.7rem; color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
  `;
  document.head.appendChild(s);
})();

/* ============================================================
   ADMIN SHOP DETAIL — Branding (logo + banner) upload
   ============================================================ */
async function asdUploadShopLogo(e, shopId) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateAsset(file);
  if (err) { alert(err); return; }
  try {
    const url = await Storage.uploadShopAsset(shopId, file, 'logo');
    State.update('shops', s => ({ ...s, [shopId]: { ...s[shopId], logo: url } }));
    if (window.DB && DB.isReady()) await DB.updateShop(shopId, { logo: url });
    log('Admin', `logo uploaded for ${shopId}`);
    alert('Logo updated.');
    Router.reload();
  } catch (err) {
    alert('Upload failed: ' + err.message);
  }
}

async function asdUploadShopBanner(e, shopId) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateAsset(file);
  if (err) { alert(err); return; }
  try {
    const url = await Storage.uploadShopAsset(shopId, file, 'banner');
    State.update('shops', s => ({ ...s, [shopId]: { ...s[shopId], banner: url } }));
    if (window.DB && DB.isReady()) await DB.updateShop(shopId, { banner: url });
    log('Admin', `banner uploaded for ${shopId}`);
    alert('Banner updated.');
    Router.reload();
  } catch (err) {
    alert('Upload failed: ' + err.message);
  }
}

async function asdRemoveLogo(shopId) {
  if (!confirm('Remove this shop\'s logo?')) return;
  const shop = State.getShop(shopId);
  try {
    if (shop?.logo) { try { await Storage.removeByUrl(shop.logo); } catch (e) {} }
    State.update('shops', s => ({ ...s, [shopId]: { ...s[shopId], logo: null } }));
    if (window.DB && DB.isReady()) await DB.updateShop(shopId, { logo: null });
    alert('Logo removed.');
    Router.reload();
  } catch (err) { alert('Remove failed: ' + err.message); }
}

async function asdRemoveBanner(shopId) {
  if (!confirm('Remove this shop\'s banner?')) return;
  const shop = State.getShop(shopId);
  try {
    if (shop?.banner) { try { await Storage.removeByUrl(shop.banner); } catch (e) {} }
    State.update('shops', s => ({ ...s, [shopId]: { ...s[shopId], banner: null } }));
    if (window.DB && DB.isReady()) await DB.updateShop(shopId, { banner: null });
    alert('Banner removed.');
    Router.reload();
  } catch (err) { alert('Remove failed: ' + err.message); }
}

/* Inject branding styles + shop request approval banner style */
(function() {
  if (document.getElementById('asd-brand-styles')) return;
  const s = document.createElement('style');
  s.id = 'asd-brand-styles';
  s.textContent = `
    .asd-branding { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); margin-bottom: var(--s-4); }
    .asd-brand-row { display: grid; grid-template-columns: 80px 1fr auto; gap: var(--s-3); align-items: center; padding: var(--s-3) 0; border-bottom: 1px solid var(--border); }
    .asd-brand-row:last-child { border-bottom: none; padding-bottom: 0; }
    .asd-brand-row:first-of-type { padding-top: 0; }
    .asd-brand-label { font-weight: 700; font-size: var(--t-small); color: var(--ink-dim); }
    .asd-brand-preview { width: 100%; border-radius: var(--r-md); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .asd-logo-preview { width: 56px; height: 56px; border-radius: 50%; }
    .asd-banner-preview { height: 56px; min-width: 180px; }
    .asd-brand-actions { display: flex; gap: var(--s-2); }
    /* Shop approval card banner + tagline */
    .aq-card-banner { height: 90px; border-radius: var(--r-md) var(--r-md) 0 0; margin: calc(-1 * var(--s-4)) calc(-1 * var(--s-4)) var(--s-4); }
    .aq-card-tagline { font-size: var(--t-small); color: var(--ink-dim); font-style: italic; margin-top: 4px; }
  `;
  document.head.appendChild(s);
})();
