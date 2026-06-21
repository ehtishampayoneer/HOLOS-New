/* ============================================================
   SCREEN: Customer / Account
   Profile, orders, addresses, settings.
   ============================================================ */

Router.register('/customer/account', () => {
  log('Customer/Account', 'mounted');
  const customer = State.get('customer');

  if (!customer.signedIn) {
    return `
      <div class="screen ac">
        <header class="ac-top">
          <button class="btn-icon-bare" onclick="Router.go('/customer/marketplace')">${icon('arrow_left')}</button>
          <div class="ac-title">You</div>
          <div style="width: 40px;"></div>
        </header>
        <main class="ac-signin">
          <div class="ac-signin-icon">${icon('user')}</div>
          <h2 class="ac-signin-title">Sign in to HOLOS</h2>
          <p class="ac-signin-sub">Save favorites, follow shops, track orders.</p>
          <button class="btn btn-primary btn-block" onclick="Router.go('/customer/login')">Sign in</button>
          <button class="btn btn-ghost btn-block" onclick="Router.go('/customer/signup')">Create account</button>
        </main>
      </div>
      <style>
        .ac { min-height: 100vh; background: var(--bg-pure); }
        .ac-top { display:flex; align-items:center; justify-content:space-between; padding: var(--s-4) var(--s-5); }
        .ac-title { font-weight: var(--w-bold); font-size: var(--t-h2); }
        .ac-signin {
          padding: var(--s-8) var(--s-5);
          text-align: center;
          max-width: 360px;
          margin: 0 auto;
        }
        .ac-signin-icon {
          width: 72px; height: 72px;
          margin: 0 auto var(--s-5);
          border-radius: 50%;
          background: var(--bg);
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-muted);
        }
        .ac-signin-icon svg { width: 32px; height: 32px; }
        .ac-signin-title {
          font-size: 1.6rem;
          font-weight: var(--w-bold);
          margin-bottom: var(--s-2);
          letter-spacing: -0.02em;
        }
        .ac-signin-sub {
          color: var(--ink-dim);
          margin-bottom: var(--s-6);
        }
        .ac-signin .btn { margin-bottom: var(--s-2); }
      </style>
    `;
  }

  return `
    <div class="screen ac">
      <header class="ac-top">
        <button class="btn-icon-bare" onclick="Router.go('/customer/marketplace')" aria-label="back">${icon('arrow_left')}</button>
        <div class="ac-title">You</div>
        <button class="btn-icon-bare" aria-label="settings">${icon('settings')}</button>
      </header>

      <main class="ac-main">
        <!-- Profile card -->
        <section class="ac-profile stagger">
          <div class="ac-avatar">${customer.avatar}</div>
          <div class="ac-profile-meta">
            <h2 class="ac-name">${customer.name}</h2>
            <div class="ac-email">${customer.email}</div>
            <div class="ac-city">📍 ${customer.city}</div>
          </div>
          <button class="btn-icon" aria-label="edit profile">${icon('user')}</button>
        </section>

        <!-- Quick stats -->
        <section class="ac-stats stagger">
          <div class="ac-stat">
            <div class="ac-stat-val">${customer.orders.length}</div>
            <div class="ac-stat-lbl">Orders</div>
          </div>
          <div class="ac-stat">
            <div class="ac-stat-val">${customer.favorites.length}</div>
            <div class="ac-stat-lbl">Saved</div>
          </div>
          <div class="ac-stat">
            <div class="ac-stat-val">4</div>
            <div class="ac-stat-lbl">Following</div>
          </div>
        </section>

        <!-- Recent orders -->
        <section class="ac-section">
          <div class="section-head">
            <h2 class="section-title">Recent orders</h2>
            <a class="section-link">View all</a>
          </div>
          ${customer.orders.length === 0 ? `
            <div class="ac-empty">No orders yet</div>
          ` : `
            <div class="ac-orders">
              ${customer.orders.map(o => {
                const shop = State.getShop(o.shop);
                return `
                  <div class="ac-order">
                    <div class="ac-order-shop" style="background: ${shop?.accent}">${shop?.name?.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                    <div class="ac-order-body">
                      <div class="ac-order-shop-name">${shop?.name || 'Unknown'}</div>
                      <div class="ac-order-meta">
                        <span>${o.id}</span>
                        <span>·</span>
                        <span>${o.date}</span>
                        <span>·</span>
                        <span>${o.items} item${o.items > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div class="ac-order-right">
                      <div class="ac-order-amt">${Locale.formatPrice(o.total)}</div>
                      <div class="ac-order-status ac-order-${o.status.replace(' ', '-')}">${o.status}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </section>

        <!-- Menu list -->
        <section class="ac-menu">
          ${menuItem('package', 'My orders', null, 'View order history & track')}
          ${menuItem('heart', 'Favorites', '/customer/favorites', `${customer.favorites.length} saved`)}
          ${menuItem('package', 'Addresses', null, `${customer.addresses.length} saved`)}
          ${menuItem('user', 'Following shops', null, '4 shops')}
          ${menuItem('whatsapp', 'WhatsApp notifications', null, 'Manage')}
          ${menuItem('settings', 'Settings', null, 'Privacy, language, etc.')}
        </section>

        <button class="ac-signout" onclick="signOutCustomer()">Sign out</button>

        <div class="ac-version">HOLOS · v0.4 prototype</div>
      </main>
    </div>

    <style>
      .ac { min-height: 100vh; background: var(--bg-pure); padding-bottom: var(--s-7); }
      .ac-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--s-4) var(--s-5);
        position: sticky; top: 0; background: var(--bg-pure); z-index: 10;
      }
      .ac-title { font-weight: var(--w-bold); font-size: var(--t-h2); }
      .ac-main {
        padding: var(--s-4) var(--s-5);
        max-width: var(--phone-max);
        margin: 0 auto;
      }
      .ac-profile {
        display: grid;
        grid-template-columns: 64px 1fr auto;
        gap: var(--s-4);
        align-items: center;
        background: var(--bg);
        border-radius: var(--r-lg);
        padding: var(--s-4);
        margin-bottom: var(--s-4);
      }
      .ac-avatar {
        width: 64px; height: 64px;
        background: var(--ink-strong);
        color: var(--ink-invert);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.5rem;
        font-weight: var(--w-bold);
      }
      .ac-name {
        font-size: 1.2rem;
        font-weight: var(--w-bold);
        margin-bottom: 2px;
        letter-spacing: -0.01em;
      }
      .ac-email {
        font-size: var(--t-small);
        color: var(--ink-dim);
        margin-bottom: 2px;
      }
      .ac-city {
        font-size: var(--t-micro);
        color: var(--ink-muted);
      }
      .ac-stats {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: var(--s-3);
        margin-bottom: var(--s-6);
      }
      .ac-stat {
        background: var(--bg);
        border-radius: var(--r-lg);
        padding: var(--s-4);
        text-align: center;
      }
      .ac-stat-val {
        font-size: 1.5rem;
        font-weight: var(--w-bold);
        line-height: 1;
        margin-bottom: var(--s-1);
        letter-spacing: -0.01em;
      }
      .ac-stat-lbl {
        font-size: var(--t-small);
        color: var(--ink-dim);
      }
      .ac-section { margin-bottom: var(--s-6); }
      .ac-empty {
        padding: var(--s-6);
        background: var(--bg);
        border-radius: var(--r-lg);
        text-align: center;
        color: var(--ink-muted);
        font-size: var(--t-small);
      }
      .ac-orders {
        display: flex;
        flex-direction: column;
        gap: var(--s-2);
      }
      .ac-order {
        display: grid;
        grid-template-columns: 40px 1fr auto;
        gap: var(--s-3);
        align-items: center;
        padding: var(--s-3) var(--s-4);
        background: var(--bg);
        border-radius: var(--r-md);
      }
      .ac-order-shop {
        width: 40px; height: 40px;
        border-radius: var(--r-sm);
        display: flex; align-items: center; justify-content: center;
        color: white;
        font-size: var(--t-small);
        font-weight: var(--w-bold);
      }
      .ac-order-shop-name {
        font-size: var(--t-small);
        font-weight: var(--w-semibold);
        margin-bottom: 2px;
      }
      .ac-order-meta {
        display: flex;
        gap: var(--s-2);
        font-size: var(--t-micro);
        color: var(--ink-dim);
      }
      .ac-order-right { text-align: right; }
      .ac-order-amt {
        font-size: var(--t-small);
        font-weight: var(--w-bold);
        margin-bottom: 2px;
      }
      .ac-order-status {
        font-size: var(--t-micro);
        padding: 2px 6px;
        border-radius: var(--r-pill);
        font-weight: var(--w-semibold);
      }
      .ac-order-delivered { background: rgba(30, 158, 94, 0.1); color: var(--success); }
      .ac-order-in-transit { background: rgba(45, 127, 249, 0.1); color: var(--info); }

      .ac-menu {
        background: var(--bg);
        border-radius: var(--r-lg);
        overflow: hidden;
        margin-bottom: var(--s-5);
      }
      .ac-menu-item {
        display: grid;
        grid-template-columns: 32px 1fr auto;
        gap: var(--s-3);
        align-items: center;
        padding: var(--s-4) var(--s-5);
        border-bottom: 1px solid var(--border);
        text-align: left;
        background: none;
        border: none;
        cursor: pointer;
        width: 100%;
        transition: background var(--d-fast);
      }
      .ac-menu-item:hover { background: var(--surface-elev); }
      .ac-menu-item:last-child { border-bottom: none; }
      .ac-menu-item-icon {
        width: 32px; height: 32px;
        background: var(--bg-pure);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: var(--ink);
      }
      .ac-menu-item-icon svg { width: 14px; height: 14px; }
      .ac-menu-item-label {
        font-size: var(--t-body);
        font-weight: var(--w-medium);
        margin-bottom: 2px;
      }
      .ac-menu-item-sub {
        font-size: var(--t-micro);
        color: var(--ink-dim);
      }
      .ac-menu-item-arrow {
        color: var(--ink-muted);
      }
      .ac-menu-item-arrow svg { width: 14px; height: 14px; }

      .ac-signout {
        width: 100%;
        padding: var(--s-4);
        background: var(--bg);
        border-radius: var(--r-lg);
        font-weight: var(--w-medium);
        color: var(--danger);
        text-align: center;
        font-size: var(--t-body);
        margin-bottom: var(--s-5);
      }
      .ac-version {
        text-align: center;
        font-size: var(--t-micro);
        color: var(--ink-muted);
      }
    </style>
  `;
});

function menuItem(iconName, label, link, sub) {
  const onclick = link ? `onclick="Router.go('${link}')"` : `onclick="log('Account', '${label} clicked')"`;
  return `
    <button class="ac-menu-item" ${onclick}>
      <div class="ac-menu-item-icon">${icon(iconName)}</div>
      <div>
        <div class="ac-menu-item-label">${label}</div>
        ${sub ? `<div class="ac-menu-item-sub">${sub}</div>` : ''}
      </div>
      <div class="ac-menu-item-arrow">${icon('arrow_right')}</div>
    </button>
  `;
}

function signOutCustomer() {
  log('Account', 'sign out');
  State.update('customer', c => ({ ...c, signedIn: false }));
  Router.go('/customer/marketplace');
}
