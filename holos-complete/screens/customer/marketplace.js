/* ============================================================
   HOLOS — Customer Marketplace (v3, defensive rebuild)
   Routes: /customer/marketplace, /all-shops, /all-products,
           /category/:id, /search
   Every section wrapped in try/safe so one broken thing won't
   blank the whole page.
   ============================================================ */

/* Tiny helper: render a block of HTML, but if it throws, swallow
   and return an empty string so the page keeps going. */
function safe(label, fn) {
  try { return fn() || ''; }
  catch (e) {
    log('Customer/Marketplace', `${label} render error: ${e.message}`, 'error');
    return '';
  }
}

/* Image error handler used by every product image. Hides the broken
   img and lets the parent's CSS background show through. Defined as
   a global so the inline onerror attribute can call it cheaply. */
window.__mkImgErr = function(img) {
  img.onerror = null;
  img.style.display = 'none';
};

/* ============================================================
   /customer/marketplace — Home
   ============================================================ */
Router.register('/customer/marketplace', () => {
  log('Customer/Marketplace', 'mounted');
  const customer = State.get('customer') || { name: '', signedIn: false };
  const loc = window.Locale && Locale.get ? Locale.get() : null;

  const allShops = State.getShopsList();
  const visibleShops = loc?.country
    ? allShops.filter(s => !s.country || s.country === loc.country || s.country === 'PK')
    : allShops;
  const visibleShopIds = new Set(visibleShops.map(s => s.id));

  const liveProducts = State.getAllProducts().filter(p =>
    p.status === 'live' && visibleShopIds.has(p.shop)
  );

  // Build the set of category IDs that actually have live products.
  // Products may store either `category` directly, or only `subcategory`
  // (in which case we look up the parent via Taxonomy).
  const usedCategoryIds = new Set();
  liveProducts.forEach(p => {
    if (p.category) usedCategoryIds.add(p.category);
    if (p.subcategory && window.Taxonomy && Taxonomy.getSubcategoryById) {
      const sub = Taxonomy.getSubcategoryById(p.subcategory);
      if (sub?.categoryId) usedCategoryIds.add(sub.categoryId);
    }
  });
  const categories = (window.Taxonomy && Taxonomy.getCategories ? Taxonomy.getCategories() : [])
    .filter(c => usedCategoryIds.has(c.id));

  const featuredProduct = liveProducts[0];
  const bestSellers = liveProducts.filter(p => p.bestSeller).slice(0, 8);
  const onOffer = liveProducts.filter(p => p.salePrice && p.salePrice < p.price).slice(0, 6);
  const trending = liveProducts.slice(0, 12);
  const featuredShops = visibleShops.slice(0, 6);

  log('Customer/Marketplace', `data: ${liveProducts.length} live products, ${categories.length} categories, ${visibleShops.length} shops`);

  return `
    ${safe('nav', () => navMarkup(customer))}

    <div class="screen mk-screen">
      <main>
        <!-- Editorial hero text -->
        <section class="mk-container mk-hero mk-reveal">
          <h1 class="mk-hero-title">Shop in <em>your space</em>.<br/>Not on a screen.</h1>
          <p class="mk-hero-sub">Every product here appears at its true real-world size in your room — before you buy. Furniture, fashion, decor, electronics. From verified sellers worldwide.</p>
        </section>

        <!-- Hero banner (small, contained) -->
        <section class="mk-container">
          <div id="mp-hero-carousel" class="mk-hero-banner"></div>
        </section>

        <!-- Category tile grid (prominent, always visible if we have categories) -->
        ${safe('categories', () => categories.length ? `
          <section class="mk-container mk-section mk-reveal">
            <div class="mk-section-head">
              <div>
                <div class="mk-section-eyebrow">Browse</div>
                <h2 class="mk-section-title">Shop by category</h2>
              </div>
            </div>
            <div class="mk-cat-tiles mk-reveal-stagger">
              ${categories.map(c => categoryTile(c)).join('')}
            </div>
          </section>
        ` : '')}

        <!-- Stats strip (replaces marquee) -->
        ${safe('stats', () => `
          <section class="mk-container mk-section" style="padding:var(--s-6) 0;">
            <div class="mk-stats">
              <div class="mk-stat"><div class="mk-stat-num">${liveProducts.length}</div><div class="mk-stat-label">Products</div></div>
              <div class="mk-stat"><div class="mk-stat-num">${visibleShops.length}</div><div class="mk-stat-label">Verified shops</div></div>
              <div class="mk-stat"><div class="mk-stat-num">100%</div><div class="mk-stat-label">Real-world scale</div></div>
              <div class="mk-stat"><div class="mk-stat-num">0₨</div><div class="mk-stat-label">To browse</div></div>
            </div>
          </section>
        `)}

        <!-- Best sellers grid -->
        ${safe('bestSellers', () => bestSellers.length ? `
          <section class="mk-container mk-section mk-reveal">
            <div class="mk-section-head">
              <div>
                <div class="mk-section-eyebrow">What's loved</div>
                <h2 class="mk-section-title">Best sellers</h2>
              </div>
              <a href="#/customer/all-products" class="mk-section-cta">View all <span class="mk-section-cta-arrow">→</span></a>
            </div>
            <div class="mk-product-grid mk-reveal-stagger">
              ${bestSellers.map(p => productCard(p)).join('')}
            </div>
          </section>
        ` : '')}

        <!-- Featured editorial -->
        ${safe('editorial', () => featuredProduct ? editorialBlock(featuredProduct) : '')}

        <!-- Featured shops -->
        ${safe('shops', () => featuredShops.length ? `
          <section class="mk-container mk-section mk-reveal">
            <div class="mk-section-head">
              <div>
                <div class="mk-section-eyebrow">Where to shop</div>
                <h2 class="mk-section-title">Featured shops</h2>
                <p class="mk-section-sub">Verified sellers from across Pakistan, each with their own AR-enabled storefront.</p>
              </div>
              <a href="#/customer/all-shops" class="mk-section-cta">All shops <span class="mk-section-cta-arrow">→</span></a>
            </div>
            <div class="mk-shop-grid mk-reveal-stagger">
              ${featuredShops.map(s => shopCard(s)).join('')}
            </div>
          </section>
        ` : '')}

        <!-- On offer -->
        ${safe('onOffer', () => onOffer.length ? `
          <section class="mk-container mk-section mk-reveal">
            <div class="mk-section-head">
              <div>
                <div class="mk-section-eyebrow">Save on this</div>
                <h2 class="mk-section-title">On offer right now</h2>
              </div>
              <a href="#/customer/all-products" class="mk-section-cta">All deals <span class="mk-section-cta-arrow">→</span></a>
            </div>
            <div class="mk-product-grid mk-reveal-stagger">
              ${onOffer.map(p => productCard(p)).join('')}
            </div>
          </section>
        ` : '')}

        <!-- Trending grid -->
        ${safe('trending', () => trending.length ? `
          <section class="mk-container mk-section mk-reveal">
            <div class="mk-section-head">
              <div>
                <div class="mk-section-eyebrow">Just dropped</div>
                <h2 class="mk-section-title">Trending now</h2>
              </div>
              <a href="#/customer/all-products" class="mk-section-cta">See everything <span class="mk-section-cta-arrow">→</span></a>
            </div>
            <div class="mk-product-grid mk-reveal-stagger">
              ${trending.map(p => productCard(p)).join('')}
            </div>
          </section>
        ` : '')}

        <!-- Empty state if nothing live -->
        ${safe('empty', () => liveProducts.length === 0 ? `
          <section class="mk-container mk-section">
            <div class="mk-empty">
              <div class="mk-empty-icon">🛍</div>
              <h3>Marketplace is filling up</h3>
              <p>Shops are uploading their products. Check back soon for the first live listings.</p>
            </div>
          </section>
        ` : '')}

        ${safe('footer', () => footerMarkup())}
      </main>
    </div>
  `;
});

/* ============================================================
   /customer/all-shops
   ============================================================ */
Router.register('/customer/all-shops', () => {
  log('Customer/AllShops', 'mounted');
  const customer = State.get('customer') || { name: '', signedIn: false };
  const shops = State.getShopsList();
  return `
    ${navMarkup(customer)}
    <div class="screen mk-screen">
      <main>
        <section class="mk-container mk-hero mk-reveal">
          <div class="mk-hero-eyebrow">${shops.length} verified shops</div>
          <h1 class="mk-hero-title">All shops.</h1>
          <p class="mk-hero-sub">Browse the full directory. Every shop has its own AR-enabled storefront. Click any to walk through.</p>
        </section>
        <section class="mk-container mk-section" style="padding-top:0;">
          <div class="mk-shop-grid mk-reveal-stagger">
            ${shops.length === 0
              ? `<div class="mk-empty"><div class="mk-empty-icon">🏪</div><h3>No shops yet</h3><p>Be the first to set up shop on HOLOS.</p></div>`
              : shops.map(s => shopCard(s)).join('')}
          </div>
        </section>
        ${footerMarkup()}
      </main>
    </div>
  `;
});

/* ============================================================
   /customer/all-products
   ============================================================ */
Router.register('/customer/all-products', () => {
  log('Customer/AllProducts', 'mounted');
  const customer = State.get('customer') || { name: '', signedIn: false };
  const products = State.getAllProducts().filter(p => p.status === 'live');
  return `
    ${navMarkup(customer)}
    <div class="screen mk-screen">
      <main>
        <section class="mk-container mk-hero mk-reveal">
          <div class="mk-hero-eyebrow">${products.length} products</div>
          <h1 class="mk-hero-title">Everything on HOLOS.</h1>
          <p class="mk-hero-sub">Filter, sort, or just scroll. Tap any product to view it at real-world scale in your room.</p>
          <div style="margin-top:var(--s-5);position:relative;max-width:480px;">
            <input type="text" id="ap-filter" placeholder="Search ${products.length} products..." style="width:100%;padding:12px 16px 12px 42px;border:1px solid var(--border-strong);border-radius:var(--r-pill);font-size:var(--t-body);background:var(--surface);" oninput="apFilter(this.value)" />
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--ink-dim);">🔍</span>
          </div>
        </section>
        <section class="mk-container mk-section" style="padding-top:0;">
          <div id="ap-grid" class="mk-product-grid mk-reveal-stagger">
            ${products.length === 0
              ? `<div class="mk-empty"><div class="mk-empty-icon">📦</div><h3>No products live yet</h3><p>Check back soon — sellers are uploading.</p></div>`
              : products.map(p => `<div data-product-search="${(p.name + ' ' + (State.getShop(p.shop)?.name || '') + ' ' + (p.subcategory||'') + ' ' + (p.category||'')).toLowerCase()}">${productCard(p)}</div>`).join('')}
          </div>
        </section>
        ${footerMarkup()}
      </main>
    </div>
  `;
});

window.apFilter = function(q) {
  const ql = (q || '').toLowerCase().trim();
  document.querySelectorAll('#ap-grid > [data-product-search]').forEach(el => {
    el.style.display = !ql || el.dataset.productSearch.includes(ql) ? '' : 'none';
  });
};

/* ============================================================
   /customer/category/:id
   ============================================================ */
Router.registerDynamic('/customer/category/', (catId) => {
  log('Customer/Category', 'mounted: ' + catId);
  const customer = State.get('customer') || { name: '', signedIn: false };
  const cat = window.Taxonomy && Taxonomy.getCategory ? Taxonomy.getCategory(catId) : null;
  if (!cat) {
    return `${navMarkup(customer)}<div class="screen mk-screen"><main><section class="mk-container mk-section"><div class="mk-empty"><h3>Category not found</h3><a href="#/customer/marketplace" class="mk-editorial-cta" style="margin-top:var(--s-4);">Back to home</a></div></section></main></div>`;
  }
  const products = State.getProductsByCategory(catId).filter(p => p.status === 'live');
  const shopIds = [...new Set(products.map(p => p.shop))];
  const shops = shopIds.map(id => State.getShop(id)).filter(Boolean).slice(0, 6);

  return `
    ${navMarkup(customer)}
    <div class="screen mk-screen">
      <main>
        <section class="mk-container mk-hero mk-reveal">
          <div class="mk-hero-eyebrow">${cat.label}</div>
          <h1 class="mk-hero-title">${cat.label}.</h1>
          <p class="mk-hero-sub">${products.length} products from ${shops.length} shops. All viewable in AR.</p>
        </section>

        ${shops.length ? `
          <section class="mk-container mk-section mk-reveal" style="padding-top:0;">
            <div class="mk-section-head">
              <div><div class="mk-section-eyebrow">Specialists</div><h2 class="mk-section-title">Shops in ${cat.label}</h2></div>
            </div>
            <div class="mk-shop-grid mk-reveal-stagger">${shops.map(s => shopCard(s)).join('')}</div>
          </section>
        ` : ''}

        <section class="mk-container mk-section mk-reveal">
          <div class="mk-section-head">
            <div><div class="mk-section-eyebrow">All</div><h2 class="mk-section-title">All ${cat.label}</h2></div>
          </div>
          <div class="mk-product-grid mk-reveal-stagger">
            ${products.length === 0
              ? `<div class="mk-empty"><div class="mk-empty-icon">📦</div><h3>Nothing in ${cat.label} yet</h3><p>Shops are uploading products. Check back soon.</p></div>`
              : products.map(p => productCard(p)).join('')}
          </div>
        </section>
        ${footerMarkup()}
      </main>
    </div>
  `;
});

/* ============================================================
   /customer/search
   ============================================================ */
Router.register('/customer/search', () => {
  log('Customer/Search', 'mounted');
  const customer = State.get('customer') || { name: '', signedIn: false };
  return `
    ${navMarkup(customer)}
    <div class="screen mk-screen">
      <main>
        <section class="mk-container mk-hero">
          <div class="mk-hero-eyebrow">Search</div>
          <h1 class="mk-hero-title">Find what you want.</h1>
          <div style="margin-top:var(--s-5);position:relative;max-width:560px;">
            <input type="text" id="sr-q" autofocus placeholder="Search products, shops, categories..." oninput="srUpdate(this.value)" style="width:100%;padding:16px 20px;border:1px solid var(--border-strong);border-radius:var(--r-md);font-size:var(--t-h3);background:var(--surface);" />
          </div>
        </section>
        <section class="mk-container mk-section" style="padding-top:0;">
          <div id="sr-results"></div>
        </section>
        ${footerMarkup()}
      </main>
    </div>
  `;
});

window.srUpdate = function(q) {
  const ql = (q || '').toLowerCase().trim();
  const out = document.getElementById('sr-results');
  if (!out) return;
  if (!ql) { out.innerHTML = ''; return; }
  const prods = State.getAllProducts().filter(p =>
    p.status === 'live' && (
      p.name.toLowerCase().includes(ql) ||
      (p.subcategory || '').toLowerCase().includes(ql) ||
      (p.category || '').toLowerCase().includes(ql)
    )
  ).slice(0, 18);
  const shops = State.getShopsList().filter(s =>
    s.name.toLowerCase().includes(ql) ||
    s.city.toLowerCase().includes(ql) ||
    (s.tagline || '').toLowerCase().includes(ql)
  ).slice(0, 6);
  let html = '';
  if (shops.length) {
    html += `<div class="mk-section-eyebrow" style="margin-bottom:var(--s-3);">Shops</div>`;
    html += `<div class="mk-shop-grid" style="margin-bottom:var(--s-7);">${shops.map(s => shopCard(s)).join('')}</div>`;
  }
  if (prods.length) {
    html += `<div class="mk-section-eyebrow" style="margin-bottom:var(--s-3);">Products</div>`;
    html += `<div class="mk-product-grid">${prods.map(p => productCard(p)).join('')}</div>`;
  }
  if (!shops.length && !prods.length) {
    html = `<div class="mk-empty"><div class="mk-empty-icon">🔍</div><h3>No matches</h3><p>Try a different word.</p></div>`;
  }
  out.innerHTML = html;
};

/* ============================================================
   Shared components (used across customer screens as globals)
   ============================================================ */

function backBtn() {
  const h = location.hash || '';
  const noBack = ['', '#/', '#/customer/marketplace', '#/launcher', '#/onboarding'];
  if (noBack.includes(h)) return '';
  return `<button class="mk-nav-btn" onclick="(window.history.length>1?history.back():Router.go('/customer/marketplace'))" aria-label="Back" title="Back" style="margin-right:6px;flex-shrink:0;">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
  </button>`;
}

function navMarkup(customer) {
  const favCount = (customer.favorites || []).length;
  return `
    <header class="mk-nav">
      <div class="mk-nav-inner">
        ${backBtn()}
        <a href="#/customer/marketplace" class="mk-nav-brand">HOL<span>O</span>S</a>
        <div class="mk-nav-search">
          <svg class="mk-nav-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search products, shops..." onfocus="Router.go('/customer/search')" />
        </div>
        <div class="mk-nav-actions">
          <button class="mk-nav-btn" onclick="Router.go('/customer/search')" aria-label="Search" title="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button class="mk-nav-btn" onclick="Router.go('/customer/favorites')" aria-label="Favorites" title="Favorites">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${favCount > 0 ? `<span class="mk-nav-badge"></span>` : ''}
          </button>
          <button class="mk-nav-btn" onclick="Router.go('${customer.signedIn ? '/customer/account' : '/customer/signup'}')" aria-label="Account" title="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </div>
    </header>
  `;
}

function footerMarkup() {
  return `
    <footer class="mk-footer">
      <div class="mk-container">
        <div class="mk-footer-grid">
          <div class="mk-footer-brand">
            <span class="serif">HOLOS</span>
            <p>Pakistan's first AR-native marketplace. Every product appears at exact real-world scale in your room before you buy.</p>
          </div>
          <div class="mk-footer-col">
            <h5>Shop</h5>
            <ul>
              <li><a href="#/customer/all-products">All products</a></li>
              <li><a href="#/customer/all-shops">All shops</a></li>
              <li><a href="#/customer/favorites">Favorites</a></li>
            </ul>
          </div>
          <div class="mk-footer-col">
            <h5>Sell</h5>
            <ul>
              <li><a href="#/shopkeeper/signup">Become a seller</a></li>
              <li><a href="#/shopkeeper/login">Shop login</a></li>
            </ul>
          </div>
          <div class="mk-footer-col">
            <h5>Help</h5>
            <ul>
              <li><a href="#/customer/how-it-works">How AR works</a></li>
              <li><a href="#/customer/about">About HOLOS</a></li>
            </ul>
          </div>
        </div>
        <div class="mk-footer-bottom">
          <span>&copy; ${new Date().getFullYear()} HOLOS · Lahore, Pakistan</span>
          <span>Made with care.</span>
        </div>
      </div>
    </footer>
  `;
}

/* Category tile — always shows label, has SVG fallback when icon missing */
function categoryTile(c) {
  if (!c || !c.label) return '';
  const iconKey = c.icon || ('cat_' + c.id);
  const hasIcon = window.Icons && window.Icons[iconKey];
  // Fallback to a simple "grid of squares" SVG so the tile never looks empty
  const fallbackIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
  return `
    <a href="#/customer/category/${c.id}" class="mk-cat-tile">
      <div class="mk-cat-tile-icon">${hasIcon ? icon(iconKey) : fallbackIcon}</div>
      <div class="mk-cat-tile-label">${c.label}</div>
    </a>
  `;
}

/* Universal product card. Uses inline styles for layout-critical bits so no
   external CSS can break it. When the image is missing or fails to load,
   shows a clean "no image yet" placeholder with a broken-image icon. */
function productCard(p) {
  if (!p) return '';
  const shop = State.getShop(p.shop);
  const photo = (window.findProductPhoto ? findProductPhoto(p) : null) || (p.photoUrls && p.photoUrls[0]) || null;
  const onSale = p.salePrice > 0 && p.salePrice < p.price;
  const hasAR = !!(p.models && p.models.glb);
  const newish = !!(p.createdAt && (Date.now() - p.createdAt) < 14 * 24 * 60 * 60 * 1000);
  const isFav = window.State && State.isFavorite ? State.isFavorite(p.id) : false;
  const priceShown = onSale ? p.salePrice : p.price;
  const priceText = window.Locale && Locale.formatPrice ? Locale.formatPrice(priceShown) : ('Rs ' + priceShown);
  const wasText = onSale && window.Locale && Locale.formatPrice ? Locale.formatPrice(p.price) : '';
  const nameSafe = (p.name || '').replace(/"/g, '&quot;');

  // Inline-styled "no image yet" placeholder — universally readable.
  // Image-with-slash icon + clear text. Uses cream-tone neutral background
  // so it never picks up the shop's accent color.
  const noImagePlaceholder = `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px;background:linear-gradient(135deg,#EFEAE0 0%,#F5F2EC 100%);color:#A8A096;text-align:center;">
      <div style="width:42px;height:42px;display:flex;align-items:center;justify-content:center;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-5-5L5 21" />
          <line x1="3" y1="3" x2="21" y2="21" stroke-width="1.5" />
        </svg>
      </div>
      <div style="font-size:0.7rem;font-weight:500;letter-spacing:0.02em;color:#A8A096;line-height:1.3;max-width:100%;">No image yet</div>
    </div>
  `;

  return `
    <a href="#/customer/product/${p.id}" class="mk-pcard" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;">
      <div class="mk-pcard-media" style="position:relative;aspect-ratio:4/5;background:#F5F2EC;border-radius:12px;overflow:hidden;margin-bottom:12px;">
        ${noImagePlaceholder}
        ${photo ? `<img src="${photo}" alt="${nameSafe}" loading="lazy" onerror="window.__mkImgErr(this)" style="position:absolute;inset:0;z-index:2;width:100%;height:100%;object-fit:cover;" />` : ''}
        <div class="mk-pcard-badges" style="position:absolute;top:12px;left:12px;display:flex;gap:6px;flex-wrap:wrap;z-index:3;">
          ${hasAR ? `<span style="padding:4px 10px;border-radius:999px;font-size:0.65rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;background:#1A1714;color:#F5F2EC;">AR</span>` : ''}
          ${onSale ? `<span style="padding:4px 10px;border-radius:999px;font-size:0.65rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;background:#B8553A;color:white;">-${Math.round((1 - p.salePrice/p.price) * 100)}%</span>` : ''}
          ${newish && !onSale ? `<span style="padding:4px 10px;border-radius:999px;font-size:0.65rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;background:#5C8A6D;color:white;">New</span>` : ''}
        </div>
        <button class="mk-pcard-fav ${isFav ? 'is-fav' : ''}" onclick="event.preventDefault(); event.stopPropagation(); State.toggleFavorite('${p.id}'); this.classList.toggle('is-fav');" aria-label="Favorite" style="position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:3;">
          <svg viewBox="0 0 24 24" fill="${isFav ? '#B8553A' : 'none'}" stroke="${isFav ? '#B8553A' : '#1A1714'}" stroke-width="2" style="width:18px;height:18px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div style="padding:0 4px;display:flex;flex-direction:column;gap:2px;">
        <div style="font-size:0.7rem;color:#6B665E;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;">${shop ? shop.name : ''}</div>
        <h3 style="font-size:0.95rem;font-weight:500;color:#1A1714;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:4px 0;">${p.name || ''}</h3>
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
          <span style="font-size:0.95rem;font-weight:600;color:#1A1714;">${priceText}</span>
          ${wasText ? `<span style="font-size:0.8rem;color:#A8A096;text-decoration:line-through;">${wasText}</span>` : ''}
          ${p.rating > 0 ? `<span style="font-size:0.75rem;color:#6B665E;margin-left:auto;">★ ${p.rating.toFixed(1)}</span>` : ''}
        </div>
      </div>
    </a>
  `;
}

/* Universal shop card with inline styles */
function shopCard(s) {
  if (!s) return '';
  const productCount = (window.State && State.getProductsForShop) ? State.getProductsForShop(s.id).length : 0;
  const initials = (s.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const coverStyle = s.banner
    ? `background:url('${s.banner}') center ${s.bannerPosY || 50}%/cover;`
    : `background:linear-gradient(135deg, ${s.accent || '#8B6F47'} 0%, #1A1714 100%);`;
  const logoStyle = s.logo
    ? `background-image:url('${s.logo}');background-size:cover;background-position:center;`
    : `background:${s.accent || '#8B6F47'};`;
  return `
    <a href="#/customer/shop/${s.id}" style="background:#FFFFFF;border-radius:24px;overflow:hidden;text-decoration:none;color:inherit;display:block;border:1px solid rgba(26,23,20,0.06);transition:transform 280ms,box-shadow 280ms;">
      <div style="aspect-ratio:16/7;${coverStyle}"></div>
      <div style="padding:20px;">
        <div style="width:64px;height:64px;border-radius:50%;border:3px solid #FFFFFF;margin-top:-52px;margin-bottom:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:1.1rem;box-shadow:0 4px 16px rgba(26,23,20,0.06);${logoStyle}">${s.logo ? '' : initials}</div>
        <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.4rem;font-weight:500;letter-spacing:-0.01em;margin:0 0 4px;color:#1A1714;">${s.name}</h3>
        ${s.tagline ? `<p style="font-size:0.8125rem;color:#6B665E;margin:0 0 12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${s.tagline}</p>` : ''}
        <div style="display:flex;gap:16px;font-size:0.75rem;color:#6B665E;border-top:1px solid rgba(26,23,20,0.06);padding-top:12px;">
          <span>★ <strong style="color:#1A1714;font-weight:600;">${(s.rating || 0).toFixed(1)}</strong></span>
          <span><strong style="color:#1A1714;font-weight:600;">${productCount}</strong> products</span>
          <span><strong style="color:#1A1714;font-weight:600;">${s.city || ''}</strong></span>
        </div>
      </div>
    </a>
  `;
}

/* Editorial split block */
function editorialBlock(p) {
  if (!p) return '';
  const shop = State.getShop(p.shop);
  const photo = (window.findProductPhoto ? findProductPhoto(p) : null) || (p.photoUrls && p.photoUrls[0]) || null;
  return `
    <section class="mk-container mk-section mk-reveal">
      <div class="mk-editorial">
        <div class="mk-editorial-media">
          ${photo ? `<img src="${photo}" alt="${(p.name || '').replace(/"/g,'&quot;')}" onerror="window.__mkImgErr(this)" />` : ''}
        </div>
        <div class="mk-editorial-content">
          <div class="mk-editorial-eyebrow">${shop?.name || 'Featured'}</div>
          <h2 class="mk-editorial-title">${p.name}.</h2>
          <p class="mk-editorial-body">${p.description || `Place it in your room before you buy. Walk around it. Check the size. Decide with confidence.`}</p>
          <a href="#/customer/product/${p.id}" class="mk-editorial-cta">${p.models?.glb ? 'View in AR' : 'View product'} <span>→</span></a>
        </div>
      </div>
    </section>
  `;
}

/* Heart icons (small) — kept for compat with other screens that use these */
function heartOutlineSmall() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
}
function heartFilledSmall() {
  return '<svg viewBox="0 0 24 24" fill="var(--coral)" stroke="var(--coral)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
}
