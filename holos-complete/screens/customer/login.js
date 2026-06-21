/* ============================================================
   SCREEN: Customer / Login
   Mock auth (real Supabase comes in production).
   ============================================================ */

Router.register('/customer/login', () => {
  log('Customer/Login', 'mounted');

  setTimeout(() => {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        log('Customer/Login', `signing in: ${email}`);
        // Mock: just flip signedIn and navigate
        State.update('customer', c => ({ ...c, signedIn: true, email: email || c.email }));
        Router.go('/customer/marketplace');
      });
    }
  }, 60);

  return `
    <div class="screen au">
      <header class="au-top">
        <button class="btn-icon-bare" onclick="Router.go('/customer/marketplace')" aria-label="back">
          ${icon('arrow_left')}
        </button>
        <div></div>
        <button class="au-skip" onclick="Router.go('/customer/marketplace')">Skip</button>
      </header>

      <main class="au-main stagger">
        <div class="au-brand">HOLOS</div>
        <h1 class="au-title">Welcome back.</h1>
        <p class="au-sub">Sign in to save favorites, track orders, and follow shops.</p>

        <form id="login-form" class="au-form">
          <div class="au-field">
            <label class="au-label">Email or phone</label>
            <input id="login-email" type="text" class="au-input" placeholder="you@example.com or +92 XXX..." required />
          </div>

          <div class="au-field">
            <label class="au-label">Password</label>
            <input id="login-password" type="password" class="au-input" placeholder="••••••••" />
            <a class="au-forgot">Forgot?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-large btn-block au-submit">
            Sign in
          </button>
        </form>

        <div class="au-or"><span>or</span></div>

        <div class="au-socials">
          <button class="au-social" onclick="mockSocialLogin('Google')">
            ${googleIcon()} Continue with Google
          </button>
          <button class="au-social" onclick="mockSocialLogin('Apple')">
            ${appleIcon()} Continue with Apple
          </button>
          <button class="au-social au-social-wa" onclick="mockSocialLogin('WhatsApp')">
            ${icon('whatsapp')} Continue with WhatsApp
          </button>
        </div>

        <div class="au-bottom">
          <span>New to HOLOS?</span>
          <a onclick="Router.go('/customer/signup')">Create account</a>
        </div>
      </main>
    </div>

    <style>
      .au { min-height: 100vh; background: var(--bg-pure); }
      .au-top {
        display: grid;
        grid-template-columns: 40px 1fr auto;
        align-items: center;
        padding: var(--s-4) var(--s-5);
      }
      .au-skip {
        color: var(--ink-dim);
        font-size: var(--t-small);
        font-weight: var(--w-medium);
        padding: var(--s-2) var(--s-4);
      }
      .au-main {
        padding: var(--s-5) var(--s-5) var(--s-7);
        max-width: 420px;
        margin: 0 auto;
      }
      .au-brand {
        font-size: var(--t-small);
        font-weight: var(--w-bold);
        letter-spacing: 0.24em;
        margin-bottom: var(--s-7);
      }
      .au-title {
        font-size: var(--t-display);
        font-weight: var(--w-bold);
        line-height: 1.05;
        letter-spacing: -0.03em;
        margin-bottom: var(--s-3);
      }
      .au-sub {
        color: var(--ink-dim);
        margin-bottom: var(--s-6);
        font-size: var(--t-body);
      }

      .au-form {
        display: flex;
        flex-direction: column;
        gap: var(--s-4);
        margin-bottom: var(--s-5);
      }
      .au-field { position: relative; }
      .au-label {
        display: block;
        font-size: var(--t-small);
        color: var(--ink-dim);
        margin-bottom: var(--s-2);
        font-weight: var(--w-medium);
      }
      .au-input {
        width: 100%;
        padding: var(--s-4) var(--s-4);
        background: var(--bg);
        border: 1px solid transparent;
        border-radius: var(--r-md);
        font-size: var(--t-body);
        transition: all var(--d-fast);
      }
      .au-input:focus {
        background: var(--bg-pure);
        border-color: var(--ink);
      }
      .au-forgot {
        position: absolute;
        top: 0; right: 0;
        font-size: var(--t-small);
        color: var(--info);
        font-weight: var(--w-medium);
        cursor: pointer;
      }
      .au-submit { margin-top: var(--s-2); }

      .au-or {
        text-align: center;
        margin: var(--s-5) 0;
        position: relative;
      }
      .au-or::before {
        content: '';
        position: absolute;
        top: 50%; left: 0; right: 0;
        height: 1px;
        background: var(--border);
      }
      .au-or span {
        position: relative;
        background: var(--bg-pure);
        padding: 0 var(--s-4);
        font-size: var(--t-small);
        color: var(--ink-muted);
      }

      .au-socials {
        display: flex;
        flex-direction: column;
        gap: var(--s-2);
        margin-bottom: var(--s-6);
      }
      .au-social {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--s-3);
        padding: var(--s-4);
        background: var(--bg-pure);
        border: 1px solid var(--border-strong);
        border-radius: var(--r-pill);
        font-size: var(--t-body);
        font-weight: var(--w-medium);
        transition: all var(--d-fast);
      }
      .au-social:hover { background: var(--bg); }
      .au-social svg { width: 18px; height: 18px; }
      .au-social-wa {
        background: #25D366;
        color: white;
        border-color: #25D366;
      }
      .au-social-wa:hover { background: #1ec05a; }

      .au-bottom {
        text-align: center;
        font-size: var(--t-small);
        color: var(--ink-dim);
      }
      .au-bottom a {
        color: var(--info);
        font-weight: var(--w-semibold);
        margin-left: var(--s-2);
        cursor: pointer;
      }
    </style>
  `;
});

function mockSocialLogin(provider) {
  log('Customer/Login', `social login: ${provider}`);
  State.update('customer', c => ({ ...c, signedIn: true }));
  Router.go('/customer/marketplace');
}

function googleIcon() {
  return `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;
}
function appleIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>`;
}
