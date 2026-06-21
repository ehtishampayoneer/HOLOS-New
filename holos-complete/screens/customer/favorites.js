/* ============================================================
   HOLOS — Customer Favorites (v2, editorial)
   ============================================================ */

Router.register('/customer/favorites', () => {
  log('Customer/Favorites', 'mounted');
  const customer = State.get('customer') || { name: '', signedIn: false, favorites: [] };
  const favProducts = (customer.favorites || [])
    .map(id => State.getProduct(id))
    .filter(Boolean);

  return `
    ${navMarkup(customer)}
    <div class="screen mk-screen">
      <main>
        <section class="mk-container mk-hero mk-reveal">
          <div class="mk-hero-eyebrow">${favProducts.length} ${favProducts.length === 1 ? 'piece' : 'pieces'} saved</div>
          <h1 class="mk-hero-title">Your favorites.</h1>
          <p class="mk-hero-sub">Pieces you've saved. View any in AR before you buy, or order direct from the seller.</p>
        </section>

        <section class="mk-container mk-section" style="padding-top:0;">
          ${favProducts.length === 0 ? `
            <div class="mk-empty">
              <div class="mk-empty-icon">♡</div>
              <h3>Nothing saved yet</h3>
              <p>Tap the heart on any product to save it here. Your favorites stay with you across sessions.</p>
              <a href="#/customer/marketplace" class="mk-editorial-cta" style="margin-top:var(--s-5);">Browse marketplace <span>→</span></a>
            </div>
          ` : `
            <div class="mk-product-grid mk-reveal-stagger">
              ${favProducts.map(p => productCard(p)).join('')}
            </div>
          `}
        </section>

        ${footerMarkup()}
      </main>
    </div>
  `;
});
