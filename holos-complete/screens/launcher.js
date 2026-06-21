/* ============================================================
   SCREEN: Launcher (v3)
   ============================================================ */

Router.register('/', () => {
  log('Launcher', 'mounted');

  // On very first launch (no locale set), force onboarding for everyone
  if (!Locale.isSet()) {
    setTimeout(() => Router.go('/welcome'), 0);
    return '<div style="min-height:100vh;background:var(--bg);"></div>';
  }

  const loc = Locale.get();

  return `
    <div class="screen launcher">
      <button class="launcher-locale-btn" onclick="Router.go('/welcome')" title="Change language / region">
        🌐 ${loc.country} · ${loc.language.toUpperCase()}
      </button>
      <main class="launcher-main">
        <header class="launcher-header stagger">
          <div class="launcher-brand">HOLOS</div>
          <h1 class="launcher-tag">AR commerce<br/>for every shop.</h1>
          <p class="launcher-sub">Pick a role to explore the prototype.</p>
        </header>

        <div class="launcher-grid stagger">
          <button class="launcher-card launcher-card-feat" onclick="Router.go('/customer/marketplace')">
            <div class="launcher-card-meta">
              <div class="launcher-card-num">01 · Live marketplace</div>
              <h2 class="launcher-card-title">Customer</h2>
              <p class="launcher-card-desc">Browse 8 shops, 23 products, AR-enabled. The main experience.</p>
            </div>
            <span class="launcher-card-arrow">${icon('arrow_right')}</span>
          </button>

          <button class="launcher-card" onclick="Router.go('/shopkeeper/home')">
            <div class="launcher-card-meta">
              <div class="launcher-card-num">02</div>
              <h2 class="launcher-card-title">Shopkeeper</h2>
              <p class="launcher-card-desc">Manage your shop, upload products, view analytics.</p>
            </div>
            <span class="launcher-card-arrow">${icon('arrow_right')}</span>
          </button>

          <button class="launcher-card" onclick="Router.go('/shopkeeper/signup')">
            <div class="launcher-card-meta">
              <div class="launcher-card-num">03 · Become a seller</div>
              <h2 class="launcher-card-title">Apply</h2>
              <p class="launcher-card-desc">Submit your shop for approval. New seller onboarding flow.</p>
            </div>
            <span class="launcher-card-arrow">${icon('arrow_right')}</span>
          </button>

          <button class="launcher-card" onclick="Router.go('/admin/login')">
            <div class="launcher-card-meta">
              <div class="launcher-card-num">04</div>
              <h2 class="launcher-card-title">Admin</h2>
              <p class="launcher-card-desc">Approve shops, view platform metrics, run the platform.</p>
            </div>
            <span class="launcher-card-arrow">${icon('arrow_right')}</span>
          </button>
        </div>

        <footer class="launcher-foot">
          <span>v0.5 prototype · tap LOG bottom-right for events</span>
        </footer>
      </main>
    </div>

    <style>
      .launcher {
        min-height: 100vh;
        background: var(--bg);
        padding: var(--s-7) var(--s-5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .launcher-locale-btn {
        position: absolute;
        top: var(--s-4); right: var(--s-4);
        background: rgba(255,255,255,0.08);
        backdrop-filter: blur(8px);
        color: white;
        padding: 8px 14px;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 999px;
        font-size: var(--t-small);
        font-weight: 600;
        cursor: pointer;
        z-index: 10;
        transition: background 160ms;
      }
      .launcher-locale-btn:hover { background: rgba(255,255,255,0.15); }
      
      .launcher-main {
        width: 100%;
        max-width: 540px;
      }
      .launcher-header { margin-bottom: var(--s-7); }
      .launcher-brand {
        font-size: var(--t-micro);
        font-weight: 700;
        letter-spacing: 0.24em;
        color: var(--ink);
        margin-bottom: var(--s-6);
      }
      .launcher-tag {
        font-size: var(--t-display);
        font-weight: 700;
        line-height: 1.05;
        margin-bottom: var(--s-3);
        letter-spacing: -0.03em;
      }
      .launcher-sub {
        color: var(--ink-dim);
        font-size: var(--t-body);
      }

      .launcher-grid {
        display: flex;
        flex-direction: column;
        gap: var(--s-3);
        margin-bottom: var(--s-7);
      }
      .launcher-card {
        display: flex;
        align-items: center;
        gap: var(--s-5);
        padding: var(--s-5);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--r-lg);
        text-align: left;
        color: var(--ink);
        transition: all var(--d-base) var(--ease-out);
        cursor: pointer;
      }
      .launcher-card:hover {
        background: var(--surface-elev);
        border-color: var(--border-strong);
        transform: translateY(-1px);
      }
      .launcher-card-feat {
        background: var(--ink);
        color: var(--ink-invert);
        border-color: var(--ink);
      }
      .launcher-card-feat:hover { background: var(--ink-strong); }

      .launcher-card-meta { flex: 1; }
      .launcher-card-num {
        font-size: var(--t-micro);
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ink-muted);
        margin-bottom: var(--s-2);
      }
      .launcher-card-feat .launcher-card-num { color: rgba(245,242,236,0.6); }
      .launcher-card-title {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: var(--s-2);
        letter-spacing: -0.02em;
      }
      .launcher-card-desc {
        font-size: var(--t-small);
        color: var(--ink-dim);
        line-height: 1.4;
      }
      .launcher-card-feat .launcher-card-desc { color: rgba(245,242,236,0.6); }

      .launcher-card-arrow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px; height: 40px;
        border-radius: var(--r-pill);
        background: var(--surface-elev);
        color: var(--ink);
        flex-shrink: 0;
        transition: all var(--d-fast);
      }
      .launcher-card:hover .launcher-card-arrow {
        background: var(--ink);
        color: var(--ink-invert);
      }
      .launcher-card-feat .launcher-card-arrow {
        background: rgba(255,255,255,0.1);
        color: var(--ink-invert);
      }
      .launcher-card-feat:hover .launcher-card-arrow {
        background: var(--ink-invert);
        color: var(--ink-strong);
      }
      .launcher-card-arrow svg { width: 16px; height: 16px; }

      .launcher-foot {
        font-size: var(--t-micro);
        color: var(--ink-muted);
        letter-spacing: 0.05em;
      }
    </style>
  `;
});
