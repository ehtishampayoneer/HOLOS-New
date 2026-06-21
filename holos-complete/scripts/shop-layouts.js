/* ============================================================
   HOLOS — Shop Layout Templates
   Each layout is a completely different page structure:
   - 'classic'   : original block-based feed (best_sellers, grid, about)
   - 'apple'     : fullscreen hero scroll-story (Apple-style)
   - 'netflix'   : dark, horizontal rows of products
   - 'bento'     : modern bento grid of mixed-size cards
   - 'editorial' : magazine/lookbook (large imagery, text overlays)
   - 'split'     : left text + right products (agency split-screen)
   The seller picks a layout in the theme picker. Each layout
   uses the shop's theme colors but has its own HTML structure.
   ============================================================ */

const ShopLayouts = (() => {

  /* Shared helper: turn a shop + theme into CSS vars */
  function themeVars(shop) {
    const theme = ShopThemes.get(shop.theme?.id);
    const overrides = shop.theme?.colorOverrides || {};
    const c = { ...theme.colors, ...overrides };
    return `
      --shop-bg:${c.bg};
      --shop-surface:${c.surface};
      --shop-ink:${c.ink};
      --shop-ink-dim:${c.inkDim};
      --shop-accent:${c.accent};
      --shop-border:${c.border};
      --shop-radius:${theme.style.borderRadius};
      --shop-font-heading:${theme.fonts.heading};
      --shop-font-body:${theme.fonts.body};
    `;
  }

  function topBar(shop, colors) {
    return `
      <header class="lt-top" style="background:${colors.accent};">
        <button class="btn-icon-bare" style="color:white;" onclick="Router.go('/customer/marketplace')">${icon('arrow_left')}</button>
        <div style="font-weight:700;color:white;letter-spacing:0.04em;">${shop.name}</div>
        <button class="btn-icon-bare" style="color:white;" onclick="alert('Coming soon')">${icon('search')}</button>
      </header>
    `;
  }

  function prodCard(p) {
    return `
      <div class="lt-prod-card" onclick="Router.go('/customer/product/${p.id}')">
        <div class="lt-prod-img">${p.photoUrls?.[0] ? `<img src="${p.photoUrls[0]}" />` : `<span class="lt-prod-placeholder">${icon('cube')}</span>`}</div>
        <div class="lt-prod-name">${p.name}</div>
        <div class="lt-prod-price">${Locale.formatPrice(p.salePrice || p.price)}</div>
      </div>
    `;
  }

  /* ============================================================
     1. CLASSIC LAYOUT (current block-based)
     ============================================================ */
  function classic(shop) {
    const theme = ShopThemes.get(shop.theme?.id);
    const c = { ...theme.colors, ...(shop.theme?.colorOverrides || {}) };
    const blocks = shop.theme?.blocks || [];
    return `
      <div class="lt classic-lt" style="${themeVars(shop)}">
        ${topBar(shop, c)}
        <main>${blocks.filter(b => b.enabled).map(b => renderClassicBlock(b, shop, theme, c)).join('')}</main>
      </div>
    `;
  }

  function renderClassicBlock(b, shop, theme, c) {
    if (typeof renderBlockPreview === 'function') return renderBlockPreview(b, shop, theme, c);
    return '';
  }

  /* ============================================================
     2. APPLE PREMIUM LAYOUT
     Fullscreen hero + scroll-story product showcases
     ============================================================ */
  function apple(shop) {
    const theme = ShopThemes.get(shop.theme?.id);
    const c = { ...theme.colors, ...(shop.theme?.colorOverrides || {}) };
    const products = State.getProductsForShop(shop.id);
    const featured = products[0];
    const others = products.slice(1, 4);

    return `
      <div class="lt apple-lt" style="${themeVars(shop)}">
        ${topBar(shop, c)}
        <main>
          <!-- Fullscreen hero -->
          <section class="apple-hero">
            ${shop.banner ? `<img src="${shop.banner}" class="apple-hero-bg" />` : ''}
            <div class="apple-hero-content">
              <h1 class="apple-hero-title">${shop.name}</h1>
              <p class="apple-hero-sub">${shop.tagline || 'Crafted with care.'}</p>
              ${featured ? `<button class="apple-cta" onclick="Router.go('/customer/product/${featured.id}')">Discover ${featured.name} →</button>` : ''}
            </div>
            <div class="apple-scroll-hint">↓ Scroll</div>
          </section>

          <!-- Each featured product gets its own fullscreen section -->
          ${others.map(p => `
            <section class="apple-product-section" onclick="Router.go('/customer/product/${p.id}')">
              <div class="apple-product-media">
                ${p.photoUrls?.[0] ? `<img src="${p.photoUrls[0]}" />` : `<div class="apple-placeholder">${icon('cube')}</div>`}
              </div>
              <div class="apple-product-info">
                <div class="apple-eyebrow">Featured</div>
                <h2 class="apple-product-name">${p.name}</h2>
                <p class="apple-product-desc">${p.description || 'A standout piece.'}</p>
                <div class="apple-product-price">${Locale.formatPrice(p.salePrice || p.price)}</div>
                <button class="apple-cta">View in AR →</button>
              </div>
            </section>
          `).join('')}

          <!-- All products grid at the bottom -->
          <section class="apple-grid-section">
            <h2 class="apple-grid-title">All products</h2>
            <div class="apple-grid">
              ${products.map(p => prodCard(p)).join('')}
            </div>
          </section>
        </main>
      </div>
    `;
  }

  /* ============================================================
     3. NETFLIX STREAMING LAYOUT
     Dark, horizontal rows of products grouped by category
     ============================================================ */
  function netflix(shop) {
    const theme = ShopThemes.get(shop.theme?.id);
    const c = { ...theme.colors, ...(shop.theme?.colorOverrides || {}) };
    const products = State.getProductsForShop(shop.id);
    const hero = products.find(p => p.bestSeller) || products[0];
    const bySub = {};
    products.forEach(p => { (bySub[p.subcategory] ||= []).push(p); });
    const offers = products.filter(p => p.salePrice && p.salePrice < p.price);
    const news = [...products].sort(() => Math.random() - 0.5).slice(0, 8);

    return `
      <div class="lt netflix-lt" style="${themeVars(shop)};--shop-bg:#0A0A0A;--shop-ink:#FFFFFF;--shop-ink-dim:#999;--shop-surface:#1A1A1A;--shop-border:rgba(255,255,255,0.1);">
        ${topBar(shop, c)}
        <main>
          ${hero ? `
            <section class="netflix-hero" style="background:linear-gradient(0deg, #0A0A0A 0%, transparent 60%), ${hero.photoUrls?.[0] ? `url('${hero.photoUrls[0]}') center/cover` : `linear-gradient(135deg,${c.accent},${c.accent}40)`};">
              <div class="netflix-hero-body">
                <div class="netflix-eyebrow">Top pick from ${shop.name}</div>
                <h1 class="netflix-hero-title">${hero.name}</h1>
                <p class="netflix-hero-desc">${hero.description || 'Premium quality, ready in AR.'}</p>
                <div class="netflix-hero-actions">
                  <button class="netflix-btn-primary" onclick="Router.go('/customer/product/${hero.id}')">▶ View in AR</button>
                  <button class="netflix-btn-secondary" onclick="Router.go('/customer/product/${hero.id}')">+ More info</button>
                </div>
              </div>
            </section>
          ` : ''}
          ${offers.length ? netflixRow('On Offer', offers) : ''}
          ${news.length ? netflixRow('New Arrivals', news) : ''}
          ${Object.entries(bySub).map(([subId, ps]) => {
            const sub = Taxonomy.getSubcategoryById(subId);
            return netflixRow(sub?.label || subId, ps);
          }).join('')}
        </main>
      </div>
    `;
  }

  function netflixRow(title, items) {
    return `
      <section class="netflix-row">
        <h2 class="netflix-row-title">${title}</h2>
        <div class="netflix-row-scroll">
          ${items.map(p => `
            <div class="netflix-card" onclick="Router.go('/customer/product/${p.id}')">
              <div class="netflix-card-img">${p.photoUrls?.[0] ? `<img src="${p.photoUrls[0]}" />` : `<span>${icon('cube')}</span>`}</div>
              <div class="netflix-card-info">
                <div class="netflix-card-name">${p.name}</div>
                <div class="netflix-card-price">${Locale.formatPrice(p.salePrice || p.price)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  /* ============================================================
     4. BENTO GRID LAYOUT (modern startup)
     Mixed-size cards in a structured grid
     ============================================================ */
  function bento(shop) {
    const theme = ShopThemes.get(shop.theme?.id);
    const c = { ...theme.colors, ...(shop.theme?.colorOverrides || {}) };
    const products = State.getProductsForShop(shop.id);
    const feat = products[0];
    const rest = products.slice(1);

    return `
      <div class="lt bento-lt" style="${themeVars(shop)}">
        ${topBar(shop, c)}
        <main>
          <section class="bento-intro">
            <h1 class="bento-title">${shop.name}</h1>
            <p class="bento-sub">${shop.tagline || 'Shop in 3D · view every product in AR'}</p>
          </section>

          <section class="bento-grid">
            ${feat ? `
              <div class="bento-card bento-feature" onclick="Router.go('/customer/product/${feat.id}')">
                ${feat.photoUrls?.[0] ? `<img src="${feat.photoUrls[0]}" class="bento-img" />` : `<div class="bento-placeholder">${icon('cube')}</div>`}
                <div class="bento-overlay">
                  <div class="bento-eyebrow">Featured</div>
                  <div class="bento-name">${feat.name}</div>
                  <div class="bento-price">${Locale.formatPrice(feat.salePrice || feat.price)}</div>
                </div>
              </div>
            ` : ''}
            <div class="bento-card bento-stats">
              <div class="bento-stat-val">${products.length}</div>
              <div class="bento-stat-label">products in AR</div>
            </div>
            <div class="bento-card bento-stat-2">
              <div class="bento-stat-val">★ ${(shop.rating || 5).toFixed(1)}</div>
              <div class="bento-stat-label">${shop.reviewCount || 0} reviews</div>
            </div>
            <div class="bento-card bento-cta" onclick="alert('Follow feature coming soon')">
              <div class="bento-cta-icon">${icon('plus')}</div>
              <div class="bento-cta-text">Follow shop</div>
            </div>
            ${rest.slice(0, 8).map((p, i) => `
              <div class="bento-card bento-prod ${i % 4 === 0 ? 'wide' : ''}" onclick="Router.go('/customer/product/${p.id}')">
                ${p.photoUrls?.[0] ? `<img src="${p.photoUrls[0]}" class="bento-img" />` : `<div class="bento-placeholder">${icon('cube')}</div>`}
                <div class="bento-prod-info">
                  <div class="bento-prod-name">${p.name}</div>
                  <div class="bento-prod-price">${Locale.formatPrice(p.salePrice || p.price)}</div>
                </div>
              </div>
            `).join('')}
          </section>

          ${rest.length > 8 ? `
            <section class="bento-all">
              <h2 class="bento-section-title">All products</h2>
              <div class="bento-all-grid">
                ${rest.slice(8).map(p => prodCard(p)).join('')}
              </div>
            </section>
          ` : ''}
        </main>
      </div>
    `;
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  const LAYOUTS = [
    { id: 'classic',  name: 'Classic Marketplace', desc: 'Best sellers, offers, product grid — flexible block layout', render: classic },
    { id: 'apple',    name: 'Apple Premium',       desc: 'Fullscreen hero, scroll-story showcase — for luxury/premium', render: apple },
    { id: 'netflix',  name: 'Netflix Streaming',   desc: 'Dark theme, horizontal rows of products — for catalog discovery', render: netflix },
    { id: 'bento',    name: 'Bento Grid',          desc: 'Modern mixed-size grid — for startups/lifestyle/AI brands', render: bento },
  ];

  function render(shop) {
    const layoutId = shop.theme?.layout || 'classic';
    const layout = LAYOUTS.find(l => l.id === layoutId) || LAYOUTS[0];
    return layout.render(shop);
  }

  function get(id) { return LAYOUTS.find(l => l.id === id); }

  return { LAYOUTS, render, get };
})();

window.ShopLayouts = ShopLayouts;
log('ShopLayouts', LAYOUTS_COUNT() + ' layouts loaded');
function LAYOUTS_COUNT() { return window.ShopLayouts ? window.ShopLayouts.LAYOUTS.length : 0; }
