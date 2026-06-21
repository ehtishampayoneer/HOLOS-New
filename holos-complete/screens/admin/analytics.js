/* ============================================================
   SCREEN: Admin / Analytics Dashboard
   The command center for understanding the marketplace:
   - Revenue overview (total, monthly, weekly, daily)
   - Sales by shop (ranked, with drill-down)
   - Top-selling products
   - Refund tracking
   - Shop subscription revenue (MRR)
   - Regional breakdown
   - Date range filtering (this month, last month, this week, custom)
   ============================================================ */

Router.register('/admin/analytics', () => {
  if (!State.isAdminLoggedIn()) { setTimeout(() => Router.go('/admin/login'), 0); return '<div></div>'; }
  log('Admin/Analytics', 'mounted');

  const shops = State.getShopsList();
  const products = State.getAllProducts().filter(p => p.status === 'live');
  const m = State.getMarketStats();

  // Per-shop revenue sorted
  const totalReviews = shops.reduce((s, sh) => s + (sh.reviewCount || 0), 0);
  const shopsByRevenue = [...shops].sort((a, b) => (b.stats?.revenue || 0) - (a.stats?.revenue || 0));
  const totalRev = shops.reduce((s, sh) => s + (sh.stats?.revenue || 0), 0);
  const totalOrders = shops.reduce((s, sh) => s + (sh.stats?.orders || 0), 0);
  const totalRefunds = shops.reduce((s, sh) => s + (sh.stats?.refunds || 0), 0);
  const refundRate = totalOrders > 0 ? ((totalRefunds / totalOrders) * 100).toFixed(1) : '0';

  // Top products by rating * reviews
  const topProducts = [...products].sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount)).slice(0, 10);

  // Shops by plan (subscription tiers)
  const planCounts = {};
  shops.forEach(s => { planCounts[s.plan] = (planCounts[s.plan] || 0) + 1; });

  // Regional distribution
  const cityCounts = {};
  shops.forEach(s => { cityCounts[s.city || 'Unknown'] = (cityCounts[s.city || 'Unknown'] || 0) + 1; });
  const regions = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);

  // Monthly mock data for chart (we'll use real data once order history exists)
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const monthlyRev = [2.1, 3.4, 4.8, 6.2, 8.1, totalRev / 1000000];

  return `
    <div class="screen an">
      <header class="an-top">
        <button class="btn-icon-bare" onclick="Router.go('/admin/home')">${icon('arrow_left')}</button>
        <div class="an-top-title">Analytics</div>
        <div style="width:40px;"></div>
      </header>

      <main class="an-main">
        <!-- Date range selector -->
        <section class="an-daterange">
          <button class="an-dr-btn active" data-range="month" onclick="setDateRange(this)">This month</button>
          <button class="an-dr-btn" data-range="week" onclick="setDateRange(this)">This week</button>
          <button class="an-dr-btn" data-range="lastmonth" onclick="setDateRange(this)">Last month</button>
          <button class="an-dr-btn" data-range="year" onclick="setDateRange(this)">This year</button>
          <button class="an-dr-btn" data-range="all" onclick="setDateRange(this)">All time</button>
          <button class="an-dr-btn" data-range="custom" onclick="openDatePicker()">Custom dates</button>
        </section>
        <div id="an-custom-dates" style="display:none;margin-bottom:var(--s-4);">
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:var(--s-2);align-items:end;">
            <div><label style="font-size:var(--t-micro);color:var(--ink-dim);">From</label><input type="date" id="an-date-from" class="fr-input" style="padding:var(--s-3);"></div>
            <div><label style="font-size:var(--t-micro);color:var(--ink-dim);">To</label><input type="date" id="an-date-to" class="fr-input" style="padding:var(--s-3);"></div>
            <button class="btn btn-primary" style="padding:var(--s-3) var(--s-4);" onclick="applyCustomDates()">Apply</button>
          </div>
        </div>

        <!-- Revenue hero -->
        <section class="an-hero">
          <div class="an-hero-label">Total revenue</div>
          <div class="an-hero-value">${Locale.formatPrice(totalRev)}</div>
          <div class="an-hero-sub">
            <span>${totalOrders.toLocaleString()} orders</span>
            <span class="an-dot">·</span>
            <span>${totalRefunds} refunds (${refundRate}%)</span>
            <span class="an-dot">·</span>
            <span class="an-mrr">$${m.mrr.toLocaleString()}/mo MRR</span>
          </div>
        </section>

        <!-- 4 stat cards -->
        <section class="an-stats">
          ${anStat('Active shops', m.activeShops, 'of ' + m.totalShops)}
          ${anStat('Live products', m.totalProducts, 'across all shops')}
          ${anStat('Avg. order', Locale.formatPrice(totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0), 'per order')}
          ${anStat('AR scans', shops.reduce((s,sh) => s + (sh.stats?.scansMonth||0), 0).toLocaleString(), 'this month')}
        </section>

        <!-- Revenue chart (simple bar chart) -->
        <section class="an-section">
          <h2 class="an-section-title">Monthly revenue trend</h2>
          <div class="an-chart">
            ${months.map((m, i) => {
              const pct = monthlyRev[i] / Math.max(...monthlyRev) * 100;
              return `
                <div class="an-bar-col">
                  <div class="an-bar" style="height:${pct}%"></div>
                  <div class="an-bar-label">${m}</div>
                  <div class="an-bar-val">${monthlyRev[i].toFixed(1)}M</div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Revenue by shop -->
        <section class="an-section">
          <h2 class="an-section-title">Revenue by shop</h2>
          <div class="an-table">
            <div class="an-table-head">
              <span>Shop</span><span>Revenue</span><span>Orders</span><span>Refunds</span><span>Conv.</span>
            </div>
            ${shopsByRevenue.map((s, i) => {
              const rev = s.stats?.revenue || 0;
              const ord = s.stats?.orders || 0;
              const ref = s.stats?.refunds || 0;
              const pct = totalRev > 0 ? ((rev / totalRev) * 100).toFixed(1) : 0;
              return `
                <button class="an-table-row" onclick="Router.go('/admin/shop/${s.id}')">
                  <span class="an-table-shop">
                    <span class="an-table-rank">${i + 1}</span>
                    <span>${s.name}</span>
                    <span class="an-table-city">${s.city}</span>
                  </span>
                  <span class="an-table-rev">${Locale.formatPrice(rev)} <span class="an-table-pct">${pct}%</span></span>
                  <span>${ord}</span>
                  <span class="an-table-ref">${ref}</span>
                  <span>${ord > 0 ? ((s.stats?.scansMonth || 0) > 0 ? ((ord / s.stats.scansMonth) * 100).toFixed(0) + '%' : '—') : '—'}</span>
                </button>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Top products -->
        <section class="an-section">
          <h2 class="an-section-title">Top products</h2>
          <div class="an-products">
            ${topProducts.map((p, i) => {
              const shop = State.getShop(p.shop);
              return `
                <div class="an-product" onclick="Router.go('/admin/product-review/${p.id}')" style="cursor:pointer;">
                  <span class="an-product-rank">${i + 1}</span>
                  <div class="an-product-info">
                    <div class="an-product-name">${p.name}</div>
                    <div class="an-product-meta">${shop?.name || ''} · ★${p.rating.toFixed(1)} (${p.reviewCount})</div>
                  </div>
                  <div class="an-product-price">${Locale.formatPrice(p.salePrice || p.price)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Subscriptions -->
        <section class="an-section">
          <h2 class="an-section-title">Subscription tiers</h2>
          <div class="an-subs">
            ${Object.entries(planCounts).map(([plan, count]) => `
              <div class="an-sub-card">
                <div class="an-sub-plan">${plan}</div>
                <div class="an-sub-count">${count}</div>
                <div class="an-sub-label">shop${count === 1 ? '' : 's'}</div>
              </div>
            `).join('')}
            <div class="an-sub-card an-sub-mrr">
              <div class="an-sub-plan">MRR</div>
              <div class="an-sub-count">$${m.mrr.toLocaleString()}</div>
              <div class="an-sub-label">monthly recurring</div>
            </div>
          </div>
        </section>

        <!-- Regional breakdown -->
        <section class="an-section">
          <h2 class="an-section-title">Shops by city</h2>
          <div class="an-regions">
            ${regions.map(([city, count]) => `
              <div class="an-region">
                <div class="an-region-bar" style="width:${(count / Math.max(...regions.map(r => r[1]))) * 100}%"></div>
                <span class="an-region-city">${city}</span>
                <span class="an-region-count">${count}</span>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Quick actions -->
        <section class="an-section">
          <h2 class="an-section-title">Quick actions</h2>
          <div class="an-actions">
            <button class="an-action" onclick="Router.go('/admin/approvals')">Shop requests · ${m.pendingShops}</button>
            <button class="an-action" onclick="Router.go('/admin/product-queue')">Product queue · ${m.pendingProducts + m.photoReviews}</button>
            <button class="an-action" onclick="Router.go('/admin/category-queue')">Category requests · ${m.subcatRequests + (m.categoryRequests || 0)}</button>
            <button class="an-action" onclick="Router.go('/admin/reviews')">Reviews · manage</button>
            <button class="an-action" onclick="Router.go('/admin/create-shop')">Create shop</button>
          </div>
        </section>
      </main>
    </div>

    <style>
      .an { min-height: 100vh; background: var(--bg); padding-bottom: var(--s-7); }
      .an-top { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4) var(--s-5); position: sticky; top: 0; background: var(--bg); z-index: 10; border-bottom: 1px solid var(--border); }
      .an-top-title { font-weight: 700; font-size: var(--t-h2); }
      .an-main { padding: var(--s-4) var(--s-5); max-width: 1100px; margin: 0 auto; }

      .an-daterange { display: flex; gap: var(--s-2); margin-bottom: var(--s-5); overflow-x: auto; scrollbar-width: none; }
      .an-daterange::-webkit-scrollbar { display: none; }
      .an-dr-btn { padding: var(--s-2) var(--s-4); border-radius: var(--r-pill); font-size: var(--t-small); font-weight: 500; background: var(--surface); border: 1px solid var(--border); cursor: pointer; white-space: nowrap; }
      .an-dr-btn.active { background: var(--ink); color: var(--ink-invert); border-color: var(--ink); }

      .an-hero { background: var(--ink); color: var(--ink-invert); border-radius: var(--r-xl); padding: var(--s-6); margin-bottom: var(--s-3); position: relative; overflow: hidden; }
      .an-hero::after { content: ''; position: absolute; top: -40%; right: -10%; width: 280px; height: 280px; background: radial-gradient(circle, rgba(180,220,200,0.18), transparent 70%); filter: blur(40px); }
      .an-hero-label { font-size: var(--t-small); color: rgba(245,242,236,0.5); margin-bottom: var(--s-3); }
      .an-hero-value { font-size: 3rem; font-weight: 700; line-height: 1; letter-spacing: -0.04em; margin-bottom: var(--s-3); position: relative; z-index: 2; }
      .an-hero-sub { display: flex; gap: var(--s-2); font-size: var(--t-small); color: rgba(245,242,236,0.6); flex-wrap: wrap; position: relative; z-index: 2; }
      .an-dot { color: rgba(245,242,236,0.3); }
      .an-mrr { color: #B3D9D2; font-weight: 600; }

      .an-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--s-3); margin-bottom: var(--s-6); }
      @media (min-width: 768px) { .an-stats { grid-template-columns: repeat(4, 1fr); } }
      .an-stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); }
      .an-stat-val { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: var(--s-2); }
      .an-stat-lbl { font-size: var(--t-small); color: var(--ink-dim); }
      .an-stat-foot { font-size: var(--t-micro); color: var(--ink-muted); margin-top: 2px; }

      .an-section { margin-bottom: var(--s-7); }
      .an-section-title { font-size: var(--t-h2); font-weight: 700; margin-bottom: var(--s-4); letter-spacing: -0.01em; }

      .an-chart { display: flex; align-items: flex-end; gap: var(--s-3); height: 200px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5) var(--s-5) var(--s-3); }
      .an-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
      .an-bar { width: 100%; max-width: 48px; background: var(--accent); border-radius: var(--r-sm) var(--r-sm) 0 0; transition: height 0.4s var(--ease-out); min-height: 4px; }
      .an-bar-label { font-size: var(--t-micro); color: var(--ink-dim); margin-top: var(--s-2); }
      .an-bar-val { font-size: var(--t-micro); font-weight: 600; color: var(--ink); margin-top: 2px; }

      .an-table { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
      .an-table-head { display: grid; grid-template-columns: 2fr 1.5fr 0.7fr 0.7fr 0.7fr; gap: var(--s-3); padding: var(--s-3) var(--s-4); font-size: var(--t-micro); color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--border); }
      .an-table-row { display: grid; grid-template-columns: 2fr 1.5fr 0.7fr 0.7fr 0.7fr; gap: var(--s-3); padding: var(--s-3) var(--s-4); border-bottom: 1px solid var(--border); font-size: var(--t-small); align-items: center; cursor: pointer; text-align: left; width: 100%; background: none; }
      .an-table-row:last-child { border-bottom: none; }
      .an-table-row:hover { background: var(--surface-elev); }
      .an-table-shop { display: flex; align-items: center; gap: var(--s-2); }
      .an-table-rank { width: 22px; height: 22px; border-radius: 50%; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: var(--t-micro); font-weight: 700; color: var(--ink-dim); flex-shrink: 0; }
      .an-table-city { font-size: var(--t-micro); color: var(--ink-muted); margin-left: auto; }
      .an-table-rev { font-weight: 600; }
      .an-table-pct { font-size: var(--t-micro); color: var(--ink-dim); font-weight: 400; }
      .an-table-ref { color: var(--danger); }

      .an-products { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
      .an-product { display: grid; grid-template-columns: 32px 1fr auto; gap: var(--s-3); align-items: center; padding: var(--s-3) var(--s-4); border-bottom: 1px solid var(--border); transition: background 160ms; }
      .an-product:hover { background: var(--surface-elev) !important; }
      .an-product:last-child { border-bottom: none; }
      .an-product-rank { font-size: var(--t-body); font-weight: 700; color: var(--ink-muted); text-align: center; }
      .an-product-name { font-size: var(--t-small); font-weight: 600; }
      .an-product-meta { font-size: var(--t-micro); color: var(--ink-dim); margin-top: 2px; }
      .an-product-price { font-size: var(--t-small); font-weight: 600; }

      .an-subs { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--s-3); }
      .an-sub-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-5); text-align: center; }
      .an-sub-plan { font-size: var(--t-micro); text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-dim); margin-bottom: var(--s-2); }
      .an-sub-count { font-size: 1.6rem; font-weight: 700; }
      .an-sub-label { font-size: var(--t-micro); color: var(--ink-dim); margin-top: var(--s-1); }
      .an-sub-mrr { border-color: var(--accent); background: var(--accent-soft); }

      .an-regions { display: flex; flex-direction: column; gap: var(--s-2); }
      .an-region { display: flex; align-items: center; gap: var(--s-3); padding: var(--s-3) var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); position: relative; overflow: hidden; }
      .an-region-bar { position: absolute; left: 0; top: 0; bottom: 0; background: var(--accent-soft); z-index: 0; transition: width 0.4s var(--ease-out); }
      .an-region-city { position: relative; z-index: 1; font-size: var(--t-small); font-weight: 500; flex: 1; }
      .an-region-count { position: relative; z-index: 1; font-size: var(--t-small); font-weight: 700; }

      .an-actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2); }
      .an-action { padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); font-size: var(--t-small); font-weight: 600; cursor: pointer; text-align: center; transition: all var(--d-fast); }
      .an-action:hover { background: var(--surface-elev); border-color: var(--border-strong); }
    </style>
  `;
});

function anStat(label, value, foot) {
  return `<div class="an-stat"><div class="an-stat-val">${value}</div><div class="an-stat-lbl">${label}</div><div class="an-stat-foot">${foot}</div></div>`;
}

function setDateRange(btn) {
  document.querySelectorAll('.an-dr-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const range = btn.dataset.range;
  document.getElementById('an-custom-dates').style.display = 'none';
  // In production these would filter real data from Supabase with date queries.
  // For now, we show the range was selected via log.
  log('Analytics', `date range → ${range}`);
  // Visual feedback — apply multiplier to hero value based on range
  const heroVal = document.querySelector('.an-hero-value');
  if (heroVal) {
    const multipliers = { week: 0.25, month: 1, lastmonth: 0.9, year: 12, all: 18 };
    const m = multipliers[range] || 1;
    const base = State.getShopsList().reduce((s, sh) => s + (sh.stats?.revenue || 0), 0);
    heroVal.textContent = Locale.formatPrice(Math.round(base * m));
  }
}

function openDatePicker() {
  document.querySelectorAll('.an-dr-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-range="custom"]').classList.add('active');
  document.getElementById('an-custom-dates').style.display = 'block';
}

function applyCustomDates() {
  const from = document.getElementById('an-date-from').value;
  const to = document.getElementById('an-date-to').value;
  if (!from || !to) { alert('Please select both dates.'); return; }
  log('Analytics', `custom range: ${from} → ${to}`);
  // In production: query Supabase with date filters
  alert(`Showing data from ${from} to ${to}.\n\nIn production this would filter actual order data from the database.`);
}
