/* ============================================================
   SCREEN: Shopkeeper / Login + Switch
   Lets a seller log in to a shop by Shop ID + password, or quickly
   switch between shops. shopLogout() clears the session.
   ============================================================ */

Router.register('/shopkeeper/login', () => {
  log('Shopkeeper/Login', 'mounted');
  const shops = State.getShopsList ? State.getShopsList() : [];
  const active = State.get('shop');

  return `
    <div class="screen" style="min-height:100vh;background:var(--bg);padding:var(--s-6) var(--s-5);">
      <header style="display:flex;align-items:center;gap:var(--s-3);margin-bottom:var(--s-5);">
        <button class="btn-icon-bare" onclick="Router.go('/')">${icon('arrow_left')}</button>
        <div style="font-weight:700;">Shop login</div>
      </header>

      <main style="max-width:440px;margin:0 auto;width:100%;">
        <h1 style="font-family:var(--font-serif,Georgia,serif);font-size:1.7rem;font-weight:600;color:var(--ink);margin:0 0 6px;">Log in to your shop</h1>
        <p style="color:var(--ink-dim);font-size:0.95rem;margin:0 0 var(--s-5);">Enter your Shop ID and password to manage your shop.</p>

        <div class="fr-field" style="margin-bottom:var(--s-3);">
          <label class="fr-label">Shop ID</label>
          <input id="sl-id" class="fr-input" placeholder="SHOP-XX-0000" autocapitalize="characters" />
        </div>
        <div class="fr-field" style="margin-bottom:var(--s-3);">
          <label class="fr-label">Password</label>
          <input id="sl-pw" class="fr-input" type="password" placeholder="Your password" />
        </div>
        <div id="sl-err" style="display:none;color:var(--danger,#C0392B);font-size:0.85rem;font-weight:600;margin-bottom:var(--s-3);"></div>
        <button class="btn btn-primary btn-block" onclick="shopLogin()">Log in</button>

        ${shops.length ? `
          <div class="ap2-divider" style="margin:var(--s-5) 0;"><span>or pick a shop</span></div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${shops.map(s => `
              <button class="sl-shop ${active && active.id === s.id ? 'active' : ''}" onclick="shopQuickLogin('${s.id}')">
                <span class="sl-shop-logo" style="${s.logo ? `background:url('${s.logo}') center/cover;` : `background:${s.accent || '#2D4A47'};`}">
                  ${s.logo ? '' : (s.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
                </span>
                <span class="sl-shop-info">
                  <span class="sl-shop-name">${s.name || s.id}</span>
                  <span class="sl-shop-sub">${s.owner ? s.owner + ' · ' : ''}${(s.credentials && s.credentials.shopId) || s.id}</span>
                </span>
                ${active && active.id === s.id ? '<span class="sl-shop-cur">Current</span>' : `<span class="sl-shop-arrow">${icon('arrow_right')}</span>`}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </main>
    </div>

    <style>
      .sl-shop{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px;
        border:1px solid var(--border,#ECE6DB);border-radius:14px;background:#fff;cursor:pointer;}
      .sl-shop.active{border-color:var(--ink,#1A1714);background:var(--surface-2,#FAF7F1);}
      .sl-shop-logo{flex:0 0 42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;
        color:#fff;font-weight:700;font-size:0.85rem;overflow:hidden;}
      .sl-shop-info{display:flex;flex-direction:column;flex:1;min-width:0;}
      .sl-shop-name{font-weight:700;color:var(--ink,#1A1714);font-size:0.95rem;}
      .sl-shop-sub{font-size:0.75rem;color:var(--ink-dim,#8A857C);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .sl-shop-arrow{color:var(--ink-dim,#8A857C);display:flex;}
      .sl-shop-arrow svg{width:18px;height:18px;}
      .sl-shop-cur{font-size:0.7rem;font-weight:700;color:var(--ink,#1A1714);background:var(--border,#ECE6DB);padding:3px 9px;border-radius:999px;}
    </style>
  `;
});

function shopLogin() {
  const id = (document.getElementById('sl-id')?.value || '').trim();
  const pw = document.getElementById('sl-pw')?.value || '';
  const err = document.getElementById('sl-err');
  const shop = (State.getShopsList ? State.getShopsList() : []).find(s =>
    s.credentials && (s.credentials.shopId === id || s.id === id));
  if (!shop || !shop.credentials || shop.credentials.password !== pw) {
    if (err) { err.style.display = 'block'; err.textContent = 'Wrong Shop ID or password. Please try again.'; }
    log('Shopkeeper/Login', 'failed login for ' + (id || '(blank)'), 'warn');
    return;
  }
  State.set('shop', shop);
  log('Shopkeeper/Login', 'logged in to ' + shop.id);
  Router.go('/shopkeeper/home');
}

function shopQuickLogin(shopId) {
  const shop = State.getShop ? State.getShop(shopId) : null;
  if (!shop) return;
  State.set('shop', shop);
  log('Shopkeeper/Login', 'switched to ' + shopId);
  Router.go('/shopkeeper/home');
}

function shopLogout() {
  State.set('shop', null);
  log('Shopkeeper/Login', 'logged out');
  Router.go('/shopkeeper/login');
}
