/* ============================================================
   SCREEN: Customer / Signup
   ============================================================ */

Router.register('/customer/signup', () => {
  log('Customer/Signup', 'mounted');

  setTimeout(() => {
    const form = document.getElementById('signup-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('su-name').value;
        const email = document.getElementById('su-email').value;
        log('Customer/Signup', `creating account: ${name} ${email}`);
        State.update('customer', c => ({
          ...c, signedIn: true,
          name: name || c.name,
          email: email || c.email,
          avatar: (name || c.name).charAt(0).toUpperCase(),
        }));
        Router.go('/customer/marketplace');
      });
    }
  }, 60);

  return `
    <div class="screen au">
      <header class="au-top">
        <button class="btn-icon-bare" onclick="Router.go('/customer/login')" aria-label="back">
          ${icon('arrow_left')}
        </button>
        <div></div>
        <button class="au-skip" onclick="Router.go('/customer/marketplace')">Skip</button>
      </header>

      <main class="au-main stagger">
        <div class="au-brand">HOLOS</div>
        <h1 class="au-title">Create<br/>your account.</h1>
        <p class="au-sub">Save favorites, follow shops, track orders — all in one place.</p>

        <form id="signup-form" class="au-form">
          <div class="au-field">
            <label class="au-label">Full name</label>
            <input id="su-name" type="text" class="au-input" placeholder="Your name" required />
          </div>

          <div class="au-field">
            <label class="au-label">Email</label>
            <input id="su-email" type="email" class="au-input" placeholder="you@example.com" required />
          </div>

          <div class="au-field">
            <label class="au-label">Phone (for WhatsApp orders)</label>
            <input id="su-phone" type="tel" class="au-input" placeholder="+92 3XX XXX XXXX" />
          </div>

          <div class="au-field">
            <label class="au-label">Password</label>
            <input id="su-password" type="password" class="au-input" placeholder="At least 8 characters" />
          </div>

          <button type="submit" class="btn btn-primary btn-large btn-block au-submit">
            Create account
          </button>
        </form>

        <p class="au-fineprint">
          By creating an account, you agree to HOLOS's
          <a>Terms of Service</a> and <a>Privacy Policy</a>.
        </p>

        <div class="au-bottom">
          <span>Already have an account?</span>
          <a onclick="Router.go('/customer/login')">Sign in</a>
        </div>
      </main>
    </div>

    <style>
      .au-fineprint {
        font-size: var(--t-micro);
        color: var(--ink-muted);
        line-height: 1.5;
        margin-bottom: var(--s-5);
        text-align: center;
      }
      .au-fineprint a {
        color: var(--info);
        cursor: pointer;
        font-weight: var(--w-medium);
      }
    </style>
  `;
});
