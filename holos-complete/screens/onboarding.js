/* ============================================================
   SCREEN: Onboarding
   First-launch country + language + city picker.
   Sets Locale, then routes to the marketplace.
   ============================================================ */

Router.register('/welcome', () => {
  log('Onboarding', 'mounted');
  const countries = Locale.COUNTRIES;
  const languages = Locale.LANGUAGES;

  setTimeout(() => {
    // country select → repopulate cities
    const cSel = document.getElementById('ob-country');
    if (cSel) cSel.addEventListener('change', () => {
      const c = Locale.COUNTRIES[cSel.value];
      const citySel = document.getElementById('ob-city');
      if (citySel && c) {
        citySel.innerHTML = '<option value="">All of ' + c.name + '</option>' +
          c.cities.map(ct => `<option value="${ct}">${ct}</option>`).join('');
      }
    });
  }, 60);

  return `
    <div class="screen ob">
      ${Locale.isSet() ? `<button class="ob-back" onclick="window.history.back()">← ${t('common.back')}</button>` : ''}
      <div class="ob-inner stagger">
        <div class="ob-brand">HOLOS</div>
        <h1 class="ob-title">${t('welcome.title')}</h1>
        <p class="ob-sub">${t('welcome.subtitle')}</p>

        <div class="ob-field">
          <label class="ob-label">${t('welcome.country')}</label>
          <select id="ob-country" class="ob-select">
            ${Object.entries(countries).map(([code, c]) =>
              `<option value="${code}" ${code==='PK'?'selected':''}>${code} — ${c.name}</option>`
            ).join('')}
          </select>
        </div>

        <div class="ob-field">
          <label class="ob-label">City / region <span class="ob-opt">(${t('welcome.optional')})</span></label>
          <select id="ob-city" class="ob-select">
            <option value="">All of Pakistan</option>
            ${countries.PK.cities.map(ct => `<option value="${ct}">${ct}</option>`).join('')}
          </select>
        </div>

        <div class="ob-field">
          <label class="ob-label">${t('welcome.language')}</label>
          <div class="ob-langs">
            ${Object.entries(languages).map(([code, l], i) =>
              `<button type="button" class="ob-lang ${i===0?'active':''}" data-lang="${code}" onclick="document.querySelectorAll('.ob-lang').forEach(x=>x.classList.remove('active'));this.classList.add('active');">
                <span class="ob-lang-native">${l.native}</span>
                <span class="ob-lang-name">${l.name}</span>
              </button>`
            ).join('')}
          </div>
        </div>

        <button class="btn btn-primary btn-large btn-block" onclick="finishOnboarding()">${t('welcome.start')}</button>
        <p class="ob-foot">You can change this anytime from your account.</p>
      </div>

      <style>
        .ob { min-height: 100vh; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: var(--s-5); }
        .ob-back { position: absolute; top: var(--s-4); left: var(--s-4); background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 8px 14px; border-radius: 999px; cursor: pointer; font-size: var(--t-small); font-weight: 600; }
        .ob-back:hover { background: rgba(255,255,255,0.2); }
        .ob-inner { width: 100%; max-width: 460px; }
        .ob-brand { font-size: var(--t-small); font-weight: 700; letter-spacing: 0.24em; margin-bottom: var(--s-6); }
        .ob-title { font-size: var(--t-display); font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; margin-bottom: var(--s-3); }
        .ob-sub { color: var(--ink-dim); margin-bottom: var(--s-7); line-height: 1.5; }
        .ob-field { margin-bottom: var(--s-5); }
        .ob-label { display: block; font-size: var(--t-small); font-weight: 600; margin-bottom: var(--s-2); }
        .ob-opt { color: var(--ink-muted); font-weight: 400; }
        .ob-select {
          width: 100%; padding: var(--s-4); background: var(--surface);
          border: 1px solid var(--border); border-radius: var(--r-md);
          font-size: var(--t-body); appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236F6B62' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
          background-repeat: no-repeat; background-position: right var(--s-4) center; padding-right: var(--s-7);
        }
        .ob-select:focus { border-color: var(--accent); outline: none; }
        .ob-langs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--s-2); }
        .ob-lang {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: var(--s-3); background: var(--surface);
          border: 2px solid var(--border); border-radius: var(--r-md); cursor: pointer;
          transition: all var(--d-fast);
        }
        .ob-lang.active { border-color: var(--accent); background: var(--accent-soft); }
        .ob-lang-native { font-size: var(--t-body); font-weight: 600; }
        .ob-lang-name { font-size: var(--t-micro); color: var(--ink-dim); }
        .ob-foot { text-align: center; font-size: var(--t-micro); color: var(--ink-muted); margin-top: var(--s-4); }
      </style>
    </div>
  `;
});

function finishOnboarding() {
  const country = document.getElementById('ob-country').value;
  const city = document.getElementById('ob-city').value;
  const langBtn = document.querySelector('.ob-lang.active');
  const language = langBtn ? langBtn.dataset.lang : 'en';
  Locale.save({ country, city, language });
  // Apply language direction
  const dir = Locale.LANGUAGES[language]?.dir || 'ltr';
  document.documentElement.setAttribute('dir', dir);
  Router.go('/customer/marketplace');
}
