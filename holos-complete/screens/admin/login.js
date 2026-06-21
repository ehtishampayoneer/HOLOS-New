/* ============================================================
   SCREEN: Admin / Login (demo)
   ============================================================ */

Router.register('/admin/login', () => {
  log('Admin/Login', 'mounted');

  setTimeout(() => {
    const form = document.getElementById('al-form');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('al-user').value;
      const p = document.getElementById('al-pass').value;
      if (State.adminLogin(u, p)) {
        log('Admin/Login', 'success');
        Router.go('/admin/home');
      } else {
        const err = document.getElementById('al-error');
        if (err) err.style.display = 'block';
      }
    });
  }, 50);

  return `
    <div class="screen al">
      <div class="al-card stagger">
        <div class="al-brand">HOLOS</div>
        <div class="al-badge">Admin Console</div>
        <h1 class="al-title">Sign in to continue</h1>
        <p class="al-sub">Restricted access. Authorized personnel only.</p>

        <form id="al-form" class="al-form">
          <div class="al-field">
            <label class="al-label">Username</label>
            <input id="al-user" type="text" class="al-input" placeholder="admin" autocomplete="username" required />
          </div>
          <div class="al-field">
            <label class="al-label">Password</label>
            <input id="al-pass" type="password" class="al-input" placeholder="••••••••" autocomplete="current-password" required />
          </div>
          <div id="al-error" class="al-error" style="display:none;">Invalid credentials. Try again.</div>
          <button type="submit" class="btn btn-primary btn-large btn-block">Sign in</button>
        </form>

        <div class="al-demo">
          <div class="al-demo-title">Demo credentials</div>
          <div class="al-demo-creds">
            <span>admin</span> / <span>holos2025</span>
          </div>
          <button class="al-demo-fill" onclick="document.getElementById('al-user').value='admin'; document.getElementById('al-pass').value='holos2025';">Auto-fill</button>
        </div>

        <button class="al-back" onclick="Router.go('/')">← Back to home</button>
      </div>

      <style>
        .al {
          min-height: 100vh;
          background: var(--bg-deep);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--s-5);
        }
        .al-card {
          width: 100%;
          max-width: 400px;
          background: var(--surface-dark);
          border: 1px solid var(--border-dark);
          border-radius: var(--r-xl);
          padding: var(--s-7);
          color: var(--ink-invert);
        }
        .al-brand {
          font-size: var(--t-small);
          font-weight: 700;
          letter-spacing: 0.24em;
          margin-bottom: var(--s-3);
        }
        .al-badge {
          display: inline-block;
          font-size: var(--t-micro);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #B3D9D2;
          background: rgba(179, 217, 210, 0.1);
          padding: 4px var(--s-3);
          border-radius: var(--r-pill);
          margin-bottom: var(--s-5);
        }
        .al-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: var(--s-2);
          letter-spacing: -0.02em;
        }
        .al-sub {
          color: rgba(245, 242, 236, 0.5);
          font-size: var(--t-small);
          margin-bottom: var(--s-6);
        }
        .al-form { display: flex; flex-direction: column; gap: var(--s-4); }
        .al-label {
          display: block;
          font-size: var(--t-small);
          color: rgba(245, 242, 236, 0.6);
          margin-bottom: var(--s-2);
        }
        .al-input {
          width: 100%;
          padding: var(--s-4);
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-dark);
          border-radius: var(--r-md);
          color: var(--ink-invert);
          font-size: var(--t-body);
        }
        .al-input:focus { border-color: #B3D9D2; }
        .al-error {
          color: #E89090;
          font-size: var(--t-small);
          padding: var(--s-2) var(--s-3);
          background: rgba(160, 69, 69, 0.15);
          border-radius: var(--r-sm);
        }
        .al-demo {
          margin-top: var(--s-5);
          padding: var(--s-4);
          background: rgba(255,255,255,0.04);
          border-radius: var(--r-md);
          text-align: center;
        }
        .al-demo-title {
          font-size: var(--t-micro);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(245,242,236,0.4);
          margin-bottom: var(--s-2);
        }
        .al-demo-creds {
          font-family: var(--mono);
          font-size: var(--t-small);
          margin-bottom: var(--s-3);
        }
        .al-demo-creds span { color: #B3D9D2; }
        .al-demo-fill {
          font-size: var(--t-small);
          color: #B3D9D2;
          text-decoration: underline;
        }
        .al-back {
          display: block;
          margin: var(--s-5) auto 0;
          color: rgba(245,242,236,0.4);
          font-size: var(--t-small);
        }
      </style>
    </div>
  `;
});
