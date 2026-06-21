/* ============================================================
   SCREEN: Admin / Home (v5 · command center)
   Gated behind login. Market overview + all queues + tools.
   ============================================================ */

Router.register('/admin/home', () => {
  if (!State.isAdminLoggedIn()) {
    log('Admin/Home', 'not logged in → redirect');
    setTimeout(() => Router.go('/admin/login'), 0);
    return `<div style="min-height:100vh;background:var(--bg-deep);"></div>`;
  }

  log('Admin/Home', 'mounted');
  const m = State.getMarketStats();
  const shops = State.getShopsList();
  const queueTotal = m.pendingShops + m.pendingProducts + m.photoReviews + m.subcatRequests;

  return `
    <div class="screen ah">
      <header class="ah-top">
        <div class="ah-brand">
          <span class="ah-brand-main">HOLOS</span>
          <span class="ah-brand-sub">Admin</span>
        </div>
        <div class="ah-top-actions">
          <button class="ah-icon-btn" onclick="Router.go('/welcome')" title="Change language">🌐 ${(Locale.get()?.language || 'en').toUpperCase()}</button>
          <button class="ah-icon-btn" onclick="Router.go('/admin/create-shop')" title="Create shop">${icon('plus')}</button>
          <button class="ah-icon-btn" onclick="adminSignOut()" title="Sign out">${logoutIcon()}</button>
        </div>
      </header>

      <main class="ah-main">
        <section class="ah-greet stagger">
          <div class="ah-greet-label">Platform command center</div>
          <h1 class="ah-greet-title">Good morning, Admin.</h1>
        </section>

        ${queueTotal > 0 ? `
          <section class="ah-action-required">
            <div class="ah-ar-head">
              <span class="ah-ar-title">${queueTotal} item${queueTotal === 1 ? '' : 's'} need your attention</span>
            </div>
            <div class="ah-ar-grid">
              ${queueChip('Shop requests', m.pendingShops, 'approvals')}
              ${queueChip('Product approvals', m.pendingProducts, 'product-queue')}
              ${queueChip('Photo reviews', m.photoReviews, 'product-queue')}
              ${queueChip('Category requests', m.subcatRequests, 'category-queue')}
            </div>
          </section>
        ` : ''}

        <!-- Market overview -->
        <section class="ah-hero">
          <div class="ah-hero-label">Total marketplace revenue</div>
          <div class="ah-hero-value">Rs. ${(m.totalRevenue / 1000000).toFixed(1)}M</div>
          <div class="ah-hero-sub">
            <span>${m.totalOrders.toLocaleString()} orders</span>
            <span class="ah-hero-dot">·</span>
            <span>${m.totalRefunds} refunds</span>
            <span class="ah-hero-dot">·</span>
            <span class="ah-hero-mrr">$${m.mrr.toLocaleString()}/mo MRR</span>
          </div>
        </section>

        <section class="ah-stats stagger">
          ${statCard('Active shops', m.activeShops, `${m.totalShops} total`)}
          ${statCard('Live products', m.totalProducts, 'across all shops')}
          ${statCard('New signups', State.get('admin').newSignups, 'this week')}
          ${statCard('Refund rate', ((m.totalRefunds / m.totalOrders) * 100).toFixed(1) + '%', 'healthy')}
        </section>

        <!-- Tools / Management (moved above shops) -->
        <section class="ah-section">
          <div class="section-head"><h2 class="section-title">Management</h2></div>
          <div class="ah-tools">
            ${tool('analytics', 'Analytics', 'Revenue, sales, insights', 'chart', false)}
            ${tool('category-queue', 'Category management', `${m.subcatRequests + (m.categoryRequests || 0)} requests`, 'plus', (m.subcatRequests + (m.categoryRequests || 0)) > 0)}
            ${tool('approvals', 'Shop requests', `${m.pendingShops} pending`, 'package', m.pendingShops > 0)}
            ${tool('product-queue', 'Product queue', `${m.pendingProducts + m.photoReviews} to review`, 'eye', (m.pendingProducts + m.photoReviews) > 0)}
            ${tool('reviews', 'Review management', 'Manage all reviews', 'star', false)}
            ${tool('banners', 'Marketplace banners', 'Hero slider on homepage', 'package', false)}
            ${tool('create-shop', 'Create new shop', 'Add a seller directly', 'plus', false)}
          </div>
        </section>

        <!-- Shops table -->
        <section class="ah-section">
          <div class="section-head">
            <h2 class="section-title">Shops</h2>
            <a class="section-link" onclick="Router.go('/admin/create-shop')">+ Create shop</a>
          </div>
          <div class="ah-shops">
            ${shops.map(s => shopRow(s)).join('')}
          </div>
        </section>

        <!-- (Management was here, now moved above) -->
        <section class="ah-section" style="display:none;">
          <div class="ah-tools">
            ${tool('analytics', 'Analytics', 'Revenue, sales, insights', 'chart', false)}
            ${tool('category-queue', 'Category management', `${m.subcatRequests + (m.categoryRequests || 0)} requests`, 'plus', (m.subcatRequests + (m.categoryRequests || 0)) > 0)}
            ${tool('approvals', 'Shop requests', `${m.pendingShops} pending`, 'package', m.pendingShops > 0)}
            ${tool('product-queue', 'Product queue', `${m.pendingProducts + m.photoReviews} to review`, 'eye', (m.pendingProducts + m.photoReviews) > 0)}
            ${tool('reviews', 'Review management', 'Manage all reviews', 'star', false)}
            ${tool('create-shop', 'Create new shop', 'Add a seller directly', 'plus', false)}
          </div>
        </section>
      </main>
    </div>

    <style>
      .ah { min-height: 100vh; background: var(--bg); padding-bottom: var(--s-7); }
      .ah-top {
        display: flex; align-items: center; justify-content: space-between;
        padding: var(--s-4) var(--s-5);
        position: sticky; top: 0; background: var(--bg); z-index: 10;
        border-bottom: 1px solid var(--border);
      }
      .ah-brand { display: flex; align-items: baseline; gap: var(--s-2); }
      .ah-brand-main { font-size: var(--t-small); font-weight: 700; letter-spacing: 0.2em; }
      .ah-brand-sub {
        font-size: var(--t-micro); color: var(--ink-dim);
        letter-spacing: 0.1em; text-transform: uppercase;
      }
      .ah-top-actions { display: flex; gap: var(--s-2); }
      .ah-icon-btn {
        width: 40px; height: 40px; border-radius: var(--r-pill);
        background: var(--surface); border: 1px solid var(--border);
        display: flex; align-items: center; justify-content: center;
        color: var(--ink); cursor: pointer;
      }
      .ah-icon-btn:hover { background: var(--surface-elev); }
      .ah-icon-btn svg { width: 18px; height: 18px; }

      .ah-main { padding: var(--s-4) var(--s-5); max-width: 980px; margin: 0 auto; }
      .ah-greet { margin-bottom: var(--s-5); }
      .ah-greet-label { font-size: var(--t-small); color: var(--ink-dim); margin-bottom: var(--s-2); }
      .ah-greet-title { font-size: var(--t-display); font-weight: 700; letter-spacing: -0.03em; }

      .ah-action-required {
        background: var(--warn-soft);
        border: 1px solid var(--warn);
        border-radius: var(--r-lg);
        padding: var(--s-4);
        margin-bottom: var(--s-5);
      }
      .ah-ar-head { margin-bottom: var(--s-3); }
      .ah-ar-title { font-size: var(--t-body); font-weight: 700; color: var(--ink); }
      .ah-ar-grid {
        display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--s-2);
      }
      @media (min-width: 600px) { .ah-ar-grid { grid-template-columns: repeat(4, 1fr); } }
      .ah-queue-chip {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--r-md);
        padding: var(--s-3);
        text-align: left;
        cursor: pointer;
        transition: all var(--d-fast);
      }
      .ah-queue-chip:hover { border-color: var(--warn); }
      .ah-queue-chip-count { font-size: 1.4rem; font-weight: 700; line-height: 1; }
      .ah-queue-chip-label { font-size: var(--t-micro); color: var(--ink-dim); margin-top: 4px; }
      .ah-queue-chip.zero { opacity: 0.5; }

      .ah-hero {
        background: var(--ink); color: var(--ink-invert);
        border-radius: var(--r-xl); padding: var(--s-6);
        margin-bottom: var(--s-3); position: relative; overflow: hidden;
      }
      .ah-hero::after {
        content: ''; position: absolute; top: -40%; right: -10%;
        width: 280px; height: 280px;
        background: radial-gradient(circle, rgba(180,220,200,0.18), transparent 70%);
        filter: blur(40px);
      }
      .ah-hero-label { font-size: var(--t-small); color: rgba(245,242,236,0.5); margin-bottom: var(--s-3); }
      .ah-hero-value { font-size: 3.2rem; font-weight: 700; line-height: 1; letter-spacing: -0.04em; margin-bottom: var(--s-3); position: relative; z-index: 2; }
      .ah-hero-sub { display: flex; gap: var(--s-2); font-size: var(--t-small); color: rgba(245,242,236,0.6); position: relative; z-index: 2; flex-wrap: wrap; }
      .ah-hero-dot { color: rgba(245,242,236,0.3); }
      .ah-hero-mrr { color: #B3D9D2; font-weight: 600; }

      .ah-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--s-3); margin-bottom: var(--s-6); }
      @media (min-width: 720px) { .ah-stats { grid-template-columns: repeat(4, 1fr); } }
      .ah-stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); }
      .ah-stat-label { font-size: var(--t-small); color: var(--ink-dim); margin-bottom: var(--s-3); }
      .ah-stat-value { font-size: 1.8rem; font-weight: 700; line-height: 1; letter-spacing: -0.02em; margin-bottom: var(--s-2); }
      .ah-stat-foot { font-size: var(--t-small); color: var(--ink-dim); }

      .ah-section { margin-bottom: var(--s-6); }
      .ah-shops { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
      .ah-shop-row {
        display: grid; grid-template-columns: 44px 1fr auto auto; gap: var(--s-4);
        align-items: center; padding: var(--s-4) var(--s-5);
        border-bottom: 1px solid var(--border); cursor: pointer;
        transition: background var(--d-fast); text-align: left; width: 100%; background: none; border-left: none; border-right: none; border-top: none;
      }
      .ah-shop-row:last-child { border-bottom: none; }
      .ah-shop-row:hover { background: var(--surface-elev); }
      .ah-shop-avatar {
        width: 44px; height: 44px; border-radius: var(--r-md);
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 700; font-size: var(--t-small);
      }
      .ah-shop-name { font-size: var(--t-body); font-weight: 600; display: flex; align-items: center; gap: var(--s-2); }
      .ah-shop-cat { font-size: var(--t-micro); color: var(--accent); font-weight: 600; margin-top: 2px; }
      .ah-shop-meta { font-size: var(--t-micro); color: var(--ink-dim); margin-top: 2px; }
      .ah-shop-rev { font-size: var(--t-small); font-weight: 600; text-align: right; }
      .ah-shop-rev-label { font-size: var(--t-micro); color: var(--ink-dim); }
      .ah-shop-badge {
        font-size: 0.55rem; padding: 2px 6px; border-radius: var(--r-pill);
        font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      }
      .ah-shop-badge.auto { background: var(--success-soft); color: var(--success); }
      .ah-shop-badge.manual { background: var(--surface-elev); color: var(--ink-dim); }

      .ah-tools { display: grid; grid-template-columns: 1fr; gap: var(--s-2); }
      @media (min-width: 600px) { .ah-tools { grid-template-columns: 1fr 1fr; } }
      .ah-tool {
        display: grid; grid-template-columns: 36px 1fr auto; gap: var(--s-4);
        align-items: center; padding: var(--s-4);
        background: var(--surface); border: 1px solid var(--border);
        border-radius: var(--r-lg); cursor: pointer; transition: all var(--d-fast);
        text-align: left;
      }
      .ah-tool:hover { background: var(--surface-elev); }
      .ah-tool.alert { background: var(--warn-soft); border-color: var(--warn); }
      .ah-tool-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--bg); display: flex; align-items: center; justify-content: center; }
      .ah-tool.alert .ah-tool-icon { background: var(--warn); color: white; }
      .ah-tool-icon svg { width: 16px; height: 16px; }
      .ah-tool-title { font-size: var(--t-body); font-weight: 600; margin-bottom: 2px; }
      .ah-tool-sub { font-size: var(--t-small); color: var(--ink-dim); }
      .ah-tool.alert .ah-tool-sub { color: var(--warn); font-weight: 500; }
      .ah-tool-arrow { width: 28px; height: 28px; border-radius: 50%; background: var(--bg); display: flex; align-items: center; justify-content: center; color: var(--ink-dim); }
      .ah-tool-arrow svg { width: 14px; height: 14px; }
    </style>
  `;
});

function queueChip(label, count, route) {
  return `
    <button class="ah-queue-chip ${count === 0 ? 'zero' : ''}" onclick="Router.go('/admin/${route}')">
      <div class="ah-queue-chip-count">${count}</div>
      <div class="ah-queue-chip-label">${label}</div>
    </button>
  `;
}
function statCard(label, value, foot) {
  return `<div class="ah-stat"><div class="ah-stat-label">${label}</div><div class="ah-stat-value">${value}</div><div class="ah-stat-foot">${foot}</div></div>`;
}
function shopRow(s) {
  // Build category/subcategory display from the shop's primary category
  let catLabel = '';
  if (s.category) {
    const cat = Taxonomy.getCategory(s.category);
    if (cat) catLabel = cat.label;
  }
  // If shop has products, infer subcategories from them
  const prods = State.getProductsForShop(s.id);
  const subSet = new Set();
  prods.forEach(p => {
    const sub = Taxonomy.getSubcategoryById(p.subcategory);
    if (sub) subSet.add(sub.label);
  });
  const subLabels = [...subSet].slice(0, 3).join(', ');

  return `
    <button class="ah-shop-row" onclick="Router.go('/admin/shop/${s.id}')">
      <div class="ah-shop-avatar" style="${s.logo ? `background:url('${s.logo}') center/cover;` : `background: ${s.accent}`}">${s.logo ? '' : s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
      <div>
        <div class="ah-shop-name">
          ${s.name}
          ${s.verified ? '<span style="color:var(--info);font-size:0.7rem;">✓</span>' : ''}
        </div>
        ${catLabel || subLabels ? `<div class="ah-shop-cat">${catLabel}${catLabel && subLabels ? ' · ' : ''}${subLabels}</div>` : ''}
        <div class="ah-shop-meta">${s.city} · ${prods.length} products · ★ ${s.rating.toFixed(1)}</div>
      </div>
      <span class="ah-shop-badge ${s.autoLive ? 'auto' : 'manual'}">${s.autoLive ? 'Auto-live' : 'Manual'}</span>
      <div>
        <div class="ah-shop-rev">Rs. ${((s.stats?.revenue || 0)/1000).toFixed(0)}k</div>
        <div class="ah-shop-rev-label">revenue</div>
      </div>
    </button>
  `;
}
function tool(route, title, sub, ico, isAlert) {
  return `
    <button class="ah-tool ${isAlert ? 'alert' : ''}" onclick="Router.go('/admin/${route}')">
      <div class="ah-tool-icon">${icon(ico)}</div>
      <div><div class="ah-tool-title">${title}</div><div class="ah-tool-sub">${sub}</div></div>
      <div class="ah-tool-arrow">${icon('arrow_right')}</div>
    </button>
  `;
}
function logoutIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
}
function adminSignOut() {
  State.adminLogout();
  Router.go('/');
}

/* Load unread message counts per shop on admin home mount */
window.addEventListener('screen:mounted', async (e) => {
  if (e.detail?.path !== '/admin/home') return;
  if (!window.DB || !DB.isReady()) return;
  try {
    const counts = await DB.getUnreadCounts('admin');
    // Add badges to shop rows
    Object.entries(counts).forEach(([shopId, count]) => {
      if (count <= 0) return;
      const row = document.querySelector(`.ah-shop-row[onclick*="/admin/shop/${shopId}"]`);
      if (!row || row.querySelector('.ah-unread-badge')) return;
      const badge = document.createElement('span');
      badge.className = 'ah-unread-badge';
      badge.textContent = count + ' new';
      const name = row.querySelector('.ah-shop-name');
      if (name) name.appendChild(badge);
    });
  } catch (err) { log('Admin/Home', 'unread load: ' + err.message, 'warn'); }
});

/* Inject badge style */
(function() {
  if (document.getElementById('ah-unread-style')) return;
  const s = document.createElement('style');
  s.id = 'ah-unread-style';
  s.textContent = `
    .ah-unread-badge { background: var(--danger); color: white; font-size: 0.6rem; font-weight: 700; padding: 2px 6px; border-radius: 999px; margin-left: 6px; vertical-align: middle; }
  `;
  document.head.appendChild(s);
})();
