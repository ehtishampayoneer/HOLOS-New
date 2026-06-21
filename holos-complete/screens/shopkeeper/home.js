/* ============================================================
   SCREEN: Shopkeeper / Home (v6 · proper dashboard)
   ============================================================ */

Router.register('/shopkeeper/home', () => {
  log('Shopkeeper/Home', 'mounted');
  const shop = State.get('shop') || State.getShopsList()[0];
  State.set('shop', shop);

  // Force onboarding: new sellers must pick a theme and customize first
  if (shop && !shop.onboarded) {
    setTimeout(() => Router.go('/shopkeeper/themes'), 0);
    return '<div style="min-height:100vh;background:var(--bg);"></div>';
  }
  const products = State.getProductsForShop(shop.id, true);
  const live = products.filter(p => p.status === 'live');
  const pending = products.filter(p => p.status !== 'live');
  const st = shop.stats || {};

  return `
    <div class="screen sh">
      <header class="sh-topbar">
        <button class="btn-icon-bare sh-tb-btn" onclick="Router.go('/')">${icon('arrow_left')}</button>
        <div class="sh-tb-brand">HOLOS <span class="sh-tb-seller">Seller</span></div>
        <button class="btn-icon-bare sh-tb-btn" onclick="Router.go('/shopkeeper/settings')">${icon('settings')}</button>
      </header>

      <main class="sh-main">
        <!-- Shop banner + logo -->
        <section class="sh-banner" style="background:${shop.banner ? `url('${shop.banner}') center ${shop.bannerPosY || 50}%/cover` : shop.coverGradient};">
          <div class="sh-banner-overlay">
            <div class="sh-logo" style="${shop.logo ? `background:url('${shop.logo}') center/cover;` : `background:${shop.accent}`}">
              ${shop.logo ? '' : shop.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
            </div>
            <div class="sh-banner-info">
              <div class="sh-banner-name">${shop.name}</div>
              <div class="sh-banner-tag">${shop.tagline}</div>
            </div>
            <button class="sh-banner-lang" onclick="Router.go('/welcome')" title="Change language">🌐 ${(Locale.get()?.language || 'en').toUpperCase()}</button>
            <button class="sh-banner-edit" onclick="Router.go('/shopkeeper/settings')">Edit</button>
          </div>
        </section>

        <!-- Date tabs -->
        <section class="sh-date-tabs">
          <button class="sh-dt active" onclick="shDateTab(this, 'today')">Today</button>
          <button class="sh-dt" onclick="shDateTab(this, 'week')">This week</button>
          <button class="sh-dt" onclick="shDateTab(this, 'month')">This month</button>
          <button class="sh-dt" onclick="shDateTab(this, 'year')">This year</button>
          <button class="sh-dt" onclick="shOpenCustom()">Custom dates</button>
        </section>
        <div id="sh-custom-dates" style="display:none;margin:0 var(--s-5) var(--s-3);">
          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:var(--s-2);align-items:end;background:var(--surface);padding:var(--s-3);border-radius:var(--r-md);border:1px solid var(--border);">
            <div><label style="font-size:var(--t-micro);color:var(--ink-dim);display:block;margin-bottom:4px;">From</label><input type="date" id="sh-date-from" style="width:100%;padding:var(--s-2);border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--t-small);"></div>
            <div><label style="font-size:var(--t-micro);color:var(--ink-dim);display:block;margin-bottom:4px;">To</label><input type="date" id="sh-date-to" style="width:100%;padding:var(--s-2);border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--t-small);"></div>
            <button class="btn btn-primary" style="padding:var(--s-2) var(--s-4);font-size:var(--t-small);" onclick="shApplyCustom()">Apply</button>
          </div>
        </div>

        <!-- Revenue hero -->
        <section class="sh-hero">
          <div class="sh-hero-label">Revenue</div>
          <div class="sh-hero-val">${Locale.formatPrice(st.revenue || 0)}</div>
          <div class="sh-hero-sub">${st.orders||0} orders · ${st.refunds||0} refunds · ${st.scansMonth||0} AR scans</div>
        </section>

        <!-- Quick stats -->
        <section class="sh-stats">
          <div class="sh-stat"><div class="sh-stat-v">${live.length}</div><div class="sh-stat-l">Live</div></div>
          <div class="sh-stat"><div class="sh-stat-v">${pending.length}</div><div class="sh-stat-l">In review</div></div>
          <div class="sh-stat"><div class="sh-stat-v">★ ${shop.rating.toFixed(1)}</div><div class="sh-stat-l">Rating</div></div>
          <div class="sh-stat"><div class="sh-stat-v">${(shop.followers||0).toLocaleString()}</div><div class="sh-stat-l">Followers</div></div>
        </section>

        <!-- Add product CTA -->
        <button class="btn btn-primary btn-large btn-block sh-add-btn" onclick="Router.go('/shopkeeper/add')">
          ${icon('plus')} Add a product
        </button>

        <!-- Status banners — show review queue & change requests -->
        ${(() => {
          const pendingApproval = products.filter(p => p.status === 'pending_approval');
          const photoReview = products.filter(p => p.status === 'photo_review');
          let banners = '';
          if (pendingApproval.length) {
            banners += `
              <div class="sh-banner-status sh-banner-pending">
                <div class="sh-banner-status-icon">⏳</div>
                <div class="sh-banner-status-body">
                  <div class="sh-banner-status-title">${pendingApproval.length} product${pendingApproval.length === 1 ? '' : 's'} awaiting admin review</div>
                  <div class="sh-banner-status-list">${pendingApproval.map(p => `<strong>${p.name}</strong>`).join(', ')}</div>
                  <div class="sh-banner-status-hint">Your changes are submitted. You'll get a message when admin approves.</div>
                </div>
              </div>
            `;
          }
          if (photoReview.length) {
            banners += `
              <div class="sh-banner-status sh-banner-changes">
                <div class="sh-banner-status-icon">⚠</div>
                <div class="sh-banner-status-body">
                  <div class="sh-banner-status-title">${photoReview.length} product${photoReview.length === 1 ? '' : 's'} need${photoReview.length === 1 ? 's' : ''} your attention</div>
                  <div class="sh-banner-status-list">${photoReview.map(p => `<button onclick="Router.go('/shopkeeper/edit-product/${p.id}')" style="background:none;border:none;color:var(--danger);font-weight:700;cursor:pointer;text-decoration:underline;">${p.name}</button>`).join(', ')}</div>
                  <div class="sh-banner-status-hint">Admin requested changes. <button onclick="Router.go('/shopkeeper/messages')" style="background:none;border:none;color:var(--accent);cursor:pointer;text-decoration:underline;font-weight:600;">Read the message</button> to see what's needed.</div>
                </div>
              </div>
            `;
          }
          return banners;
        })()}

        <!-- Products list (clickable) -->
        <section class="sh-section">
          <div class="sh-section-head">
            <h2 class="sh-section-title">Your products (${products.length})</h2>
          </div>
          <div class="sh-products">
            ${products.length === 0 ? `<div class="sh-empty">No products yet. Add your first product above.</div>` : ''}
            ${products.map(p => {
              const sub = Taxonomy.getSubcategoryById(p.subcategory);
              const catId = sub?.categoryId || p.category || '';
              const hasPhoto = p.photoUrls?.[0];
              const hasModel = p.models?.glb;
              return `
                <div class="sh-product" onclick="Router.go('/shopkeeper/edit-product/${p.id}')">
                  <div class="sh-product-thumb" style="${hasPhoto ? `background:url('${p.photoUrls[0]}') center/cover;` : `background:linear-gradient(135deg,${(p.options?.colors?.[0]?.hex)||shop.accent}15,transparent);`}">
                    ${!hasPhoto ? (Icons['cat_' + catId] ? icon('cat_' + catId) : icon('cube')) : ''}
                  </div>
                  <div class="sh-product-body">
                    <div class="sh-product-name">${p.name}</div>
                    <div class="sh-product-meta">${Locale.formatPrice(p.salePrice||p.price)} · ${sub?.label||p.subcategory}</div>
                  </div>
                  <div class="sh-product-actions">
                    ${hasModel ? `<button class="sh-product-ar" onclick="event.stopPropagation(); previewProductAR('${p.id}')" title="Preview in AR">${icon('cube')}</button>` : ''}
                    <span class="sh-product-status st-${p.status}">${({live:'Live',pending_approval:'Pending',photo_review:'Photos',draft:'Draft'})[p.status]||p.status}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Quick links -->
        <section class="sh-section">
          <div class="sh-links">
            <button class="sh-link" onclick="Router.go('/shopkeeper/messages')" id="sh-msg-link">${icon('mail')} Contact admin<span id="sh-msg-unread" class="sh-link-badge" style="display:none;"></span></button>
            <button class="sh-link" onclick="Router.go('/shopkeeper/themes')">${icon('image')} Themes &amp; design</button>
            <button class="sh-link" onclick="Router.go('/shopkeeper/customize')">${icon('settings')} Customize shop</button>
            <button class="sh-link" onclick="Router.go('/shopkeeper/settings')">${icon('settings')} Shop settings</button>
            <button class="sh-link" onclick="Router.go('/shopkeeper/request-category')">${icon('plus')} Request category</button>
          </div>
        </section>
      </main>
    </div>

    <style>
      .sh { min-height:100vh; background:var(--bg); padding-bottom:var(--s-7); }
      .sh-topbar { display:flex; align-items:center; justify-content:space-between; padding:var(--s-3) var(--s-5); background:var(--accent); position:sticky; top:0; z-index:10; }
      .sh-tb-brand { font-size:var(--t-small); font-weight:700; letter-spacing:0.15em; color:white; }
      .sh-tb-seller { font-weight:400; opacity:0.7; letter-spacing:0.08em; font-size:var(--t-micro); text-transform:uppercase; }
      .sh-tb-btn { color:white !important; }
      .sh-main { max-width:var(--phone-max); margin:0 auto; padding:0; }

      .sh-banner { height:160px; position:relative; }
      .sh-banner-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.3); display:flex; align-items:flex-end; padding:var(--s-5); gap:var(--s-3); }
      .sh-logo { width:56px; height:56px; border-radius:var(--r-md); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:1.2rem; border:3px solid white; flex-shrink:0; }
      .sh-banner-info { flex:1; color:white; }
      .sh-banner-name { font-size:var(--t-h2); font-weight:700; }
      .sh-banner-tag { font-size:var(--t-small); opacity:0.8; }
      .sh-banner-lang { padding: 6px 12px; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); border-radius: 999px; color: white; font-size: 0.75rem; font-weight: 600; cursor: pointer; margin-right: var(--s-2); }
      .sh-banner-lang:hover { background: rgba(255,255,255,0.25); }
      .sh-banner-edit { font-size:var(--t-micro); color:white; background:rgba(255,255,255,0.2); padding:var(--s-1) var(--s-3); border-radius:var(--r-pill); font-weight:600; border:none; cursor:pointer; }

      .sh-date-tabs { display:flex; gap:var(--s-2); padding:var(--s-4) var(--s-5); overflow-x:auto; scrollbar-width:none; }
      .sh-date-tabs::-webkit-scrollbar { display:none; }
      .sh-dt { padding:var(--s-2) var(--s-4); border-radius:var(--r-pill); font-size:var(--t-small); font-weight:500; background:var(--surface); border:1px solid var(--border); cursor:pointer; white-space:nowrap; }
      .sh-dt.active { background:var(--accent); color:white; border-color:var(--accent); }

      .sh-hero { margin:0 var(--s-5) var(--s-3); background:var(--accent); color:white; border-radius:var(--r-xl); padding:var(--s-5); }
      .sh-hero-label { font-size:var(--t-small); opacity:0.6; margin-bottom:var(--s-2); }
      .sh-hero-val { font-size:2.4rem; font-weight:700; letter-spacing:-0.03em; line-height:1; margin-bottom:var(--s-2); }
      .sh-hero-sub { font-size:var(--t-small); opacity:0.6; }

      .sh-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:var(--s-2); padding:0 var(--s-5); margin-bottom:var(--s-5); }
      .sh-stat { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:var(--s-3); text-align:center; }
      .sh-stat-v { font-size:1.2rem; font-weight:700; line-height:1; letter-spacing:-0.01em; }
      .sh-stat-l { font-size:var(--t-micro); color:var(--ink-dim); margin-top:4px; }

      .sh-add-btn { margin:0 var(--s-5) var(--s-5); width:calc(100% - var(--s-5)*2); }
      .sh-add-btn svg { width:18px; height:18px; }

      .sh-section { padding:0 var(--s-5); margin-bottom:var(--s-5); }
      .sh-section-head { margin-bottom:var(--s-3); }
      .sh-section-title { font-size:var(--t-h3); font-weight:700; }

      
      .sh-banner-status { display: grid; grid-template-columns: 40px 1fr; gap: var(--s-3); padding: var(--s-4); margin: var(--s-3) var(--s-5); border-radius: var(--r-md); align-items: start; }
      .sh-banner-pending { background: linear-gradient(135deg, var(--warn-soft, #fef3c7), var(--surface)); border: 1px solid var(--warn, #f59e0b); }
      .sh-banner-changes { background: linear-gradient(135deg, var(--danger-soft, #fee2e2), var(--surface)); border: 1px solid var(--danger, #ef4444); }
      .sh-banner-status-icon { font-size: 1.5rem; line-height: 1; padding-top: 2px; }
      .sh-banner-status-title { font-weight: 700; font-size: var(--t-body); margin-bottom: 4px; }
      .sh-banner-status-list { font-size: var(--t-small); color: var(--ink); margin-bottom: 6px; }
      .sh-banner-status-hint { font-size: var(--t-small); color: var(--ink-dim); }

      .sh-products { display:flex; flex-direction:column; gap:var(--s-2); }
      .sh-product { display:grid; grid-template-columns:48px 1fr auto; gap:var(--s-3); align-items:center; background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:var(--s-3); cursor:pointer; transition:background 160ms; }
      .sh-product:hover { background:var(--surface-elev); }
      .sh-product-thumb { width:48px; height:48px; border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; }
      .sh-product-thumb svg { width:22px; height:22px; color:var(--ink-dim); opacity:0.4; }
      .sh-product-name { font-size:var(--t-small); font-weight:600; }
      .sh-product-meta { font-size:var(--t-micro); color:var(--ink-dim); margin-top:2px; }
      .sh-product-status { font-size:0.55rem; padding:3px var(--s-2); border-radius:var(--r-pill); font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
      .st-live { background:var(--success-soft); color:var(--success); }
      .st-pending_approval { background:var(--warn-soft); color:var(--warn); }
      .st-photo_review { background:var(--danger-soft); color:var(--danger); }
      .st-draft { background:var(--surface-elev); color:var(--ink-dim); }
      .sh-empty { padding:var(--s-7); text-align:center; color:var(--ink-muted); background:var(--surface); border-radius:var(--r-lg); }

      .sh-links { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:var(--s-2); }
      .sh-link { display:flex; align-items:center; gap:var(--s-2); padding:var(--s-4); background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); font-size:var(--t-small); font-weight:600; cursor:pointer; transition:background 160ms; }
      .sh-link:hover { background:var(--surface-elev); }
      .sh-link svg { width:16px; height:16px; }
      .sh-link-badge { background:var(--danger); color:white; font-size:0.65rem; font-weight:700; padding:2px 6px; border-radius:999px; margin-left:auto; }
    </style>
  `;
});

function shDateTab(btn, range) {
  document.querySelectorAll('.sh-dt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const customDiv = document.getElementById('sh-custom-dates');
  if (customDiv) customDiv.style.display = 'none';
  log('Shopkeeper', `date tab → ${range || btn.textContent.trim()}`);
  // Visual feedback: scale the hero revenue value
  const heroVal = document.querySelector('.sh-hero-val');
  if (heroVal) {
    const shop = State.get('shop');
    const base = shop?.stats?.revenue || 0;
    const mult = { today: 0.03, week: 0.25, month: 1, year: 12 }[range] || 1;
    heroVal.textContent = Locale.formatPrice(Math.round(base * mult));
  }
}
function shOpenCustom() {
  document.querySelectorAll('.sh-dt').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('sh-custom-dates').style.display = 'block';
}
function shApplyCustom() {
  const from = document.getElementById('sh-date-from').value;
  const to = document.getElementById('sh-date-to').value;
  if (!from || !to) { alert('Please select both dates.'); return; }
  alert(`Showing sales from ${from} to ${to}.\n\nIn production this queries your actual order data.`);
}

/* Load unread admin message count on seller dashboard mount */
window.addEventListener('screen:mounted', async (e) => {
  if (e.detail?.path !== '/shopkeeper/home') return;
  if (!window.DB || !DB.isReady()) return;
  const shop = State.get('shop');
  if (!shop) return;
  try {
    const msgs = await DB.getMessages(shop.id);
    const unread = msgs.filter(m => m.sender === 'admin' && !m.readBySeller).length;
    const badge = document.getElementById('sh-msg-unread');
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) { log('Shopkeeper/Home', 'unread load: ' + err.message, 'warn'); }
});

/* Open the customer product page in a new tab so seller can see exactly what customers see */
function previewProductAR(pid) {
  window.open('#/customer/product/' + pid, '_blank');
}

/* Style for the small AR preview button on seller product cards */
(function(){
  if (document.getElementById('sh-prod-ar-style')) return;
  const s = document.createElement('style');
  s.id = 'sh-prod-ar-style';
  s.textContent = `
    .sh-product-actions { display: flex; align-items: center; gap: var(--s-2); flex-shrink: 0; }
    .sh-product-ar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 160ms; }
    .sh-product-ar:hover { background: var(--accent); color: white; transform: scale(1.05); }
    .sh-product-ar svg { width: 16px; height: 16px; }
    .sh-product-thumb { width: 60px; height: 60px; border-radius: var(--r-md); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .sh-product-thumb svg { width: 28px; height: 28px; opacity: 0.4; }
  `;
  document.head.appendChild(s);
})();
