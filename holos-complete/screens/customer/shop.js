/* ============================================================
   HOLOS — Customer Shop Page (v2, editorial rebuild)
   ============================================================ */

Router.register('/customer/shop', () => {
  const first = State.getShopsList()[0];
  return renderShopPage(first ? first.id : null);
});

// Use the dynamic route handler so we don't need to register each shop
// individually. This avoids any issue with State not being populated at
// script-load time.
Router.registerDynamic('/customer/shop/', (id) => renderShopPage(id));

function renderShopPage(shopId) {
  log('Customer/Shop', `mounted: ${shopId}`);
  const shop = State.getShop(shopId);
  if (!shop) return shopNotFoundMarkup();

  // NOTE: Themed shop rendering is bypassed for now. The legacy ShopLayouts
  // renderer produces broken layouts (giant icons, wrong top bar, etc).
  // All shops use the new unified renderer below until themes are rebuilt
  // to match the new design system.

  const customer = State.get('customer') || { name: '', signedIn: false };
  const products = State.getProductsForShop(shopId);
  const liveProducts = products.filter(p => p.status === 'live');
  const bestSellers = liveProducts.filter(p => p.bestSeller).slice(0, 6);
  const onOffer = liveProducts.filter(p => p.salePrice && p.salePrice < p.price).slice(0, 6);
  const initials = shop.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  setTimeout(() => {
    // Mount mock QR if container exists
    const qrSlot = document.getElementById('sp2-qr-canvas');
    if (qrSlot) qrSlot.innerHTML = renderMockQR();
    const qrSheet = document.getElementById('sp2-qr-sheet-canvas');
    if (qrSheet) qrSheet.innerHTML = renderMockQR();
  }, 60);

  return `
    ${navMarkup(customer)}

    <div class="screen mk-screen">
      <main>
        <!-- Hero cover -->
        <section class="sp2-cover" style="${shop.banner ? `background:url('${shop.banner}') center ${shop.bannerPosY || 50}%/cover` : (shop.coverGradient || `background:linear-gradient(135deg, ${shop.accent} 0%, var(--ink) 100%)`)};">
          <div class="mk-container sp2-cover-inner">
            <div class="sp2-cover-actions">
              <button class="sp2-cover-btn" onclick="document.getElementById('sp2-qr-sheet').classList.add('open')" aria-label="Share QR">${qrIcon()}</button>
              <button class="sp2-cover-btn" aria-label="Share" onclick="navigator.share && navigator.share({title:'${shop.name} on HOLOS', url:location.href})">${icon('share')}</button>
            </div>
          </div>
        </section>

        <!-- Shop identity card -->
        <section class="mk-container sp2-identity">
          <div class="sp2-id-card">
            <div class="sp2-id-logo" style="${shop.logo ? `background-image:url('${shop.logo}');background-size:cover;background-position:center;` : `background:${shop.accent || 'var(--accent)'};`}">
              ${shop.logo ? '' : initials}
            </div>
            <div class="sp2-id-body">
              <div class="sp2-id-eyebrow">${shop.verified ? '✓ Verified seller' : 'Seller'} · ${shop.city}</div>
              <h1 class="sp2-id-name">${shop.name}</h1>
              ${shop.tagline ? `<p class="sp2-id-tagline">${shop.tagline}</p>` : ''}
              <div class="sp2-id-meta">
                <span class="sp2-id-stat">★ <strong>${(shop.rating || 0).toFixed(1)}</strong> <span class="text-dim">(${shop.reviewCount || 0})</span></span>
                <span class="sp2-id-dot">·</span>
                <span class="sp2-id-stat"><strong>${liveProducts.length}</strong> products</span>
                <span class="sp2-id-dot">·</span>
                <span class="sp2-id-stat"><strong>${shop.followers || 0}</strong> followers</span>
              </div>
              <div class="sp2-id-cta">
                <button class="sp2-btn sp2-btn-primary">+ Follow</button>
                <button class="sp2-btn sp2-btn-secondary" onclick="window.open('https://wa.me/${shop.phone || '923001234567'}?text=Hi%20${encodeURIComponent(shop.name)}!', '_blank')">${icon('whatsapp')} Message</button>
                <a class="sp2-btn sp2-btn-secondary" href="#/customer/shop-ar/${shop.id}">${icon('cube')} Walk through in AR</a>
              </div>
            </div>
          </div>
        </section>

        <!-- QR feature block -->
        <section class="mk-container mk-section sp2-qr-feature">
          <div class="sp2-qr-content">
            <div class="mk-section-eyebrow">${icon('qr')} Shop address</div>
            <h2 class="sp2-qr-title">Scan to open this shop anywhere</h2>
            <p class="sp2-qr-sub">Share this code on a card, a window, or social. Anyone who scans it walks straight into ${shop.name} — no app download needed.</p>
            <div class="sp2-qr-actions">
              <button class="mk-editorial-cta" onclick="document.getElementById('sp2-qr-sheet').classList.add('open')">Download &amp; share <span>→</span></button>
              <span class="sp2-qr-url">holos.app/s/${shop.id}</span>
            </div>
          </div>
          <div class="sp2-qr-card">
            <div id="sp2-qr-canvas" class="sp2-qr-canvas"></div>
            <div class="sp2-qr-card-label">${shop.name}</div>
          </div>
        </section>

        ${bestSellers.length ? `
          <section class="mk-container mk-section mk-reveal">
            <div class="mk-section-head">
              <div>
                <div class="mk-section-eyebrow">Most loved here</div>
                <h2 class="mk-section-title">Best sellers</h2>
              </div>
            </div>
            <div class="mk-product-grid mk-reveal-stagger">
              ${bestSellers.map(p => productCard(p)).join('')}
            </div>
          </section>
        ` : ''}

        ${onOffer.length ? `
          <section class="mk-container mk-section mk-reveal">
            <div class="mk-section-head">
              <div>
                <div class="mk-section-eyebrow">Save now</div>
                <h2 class="mk-section-title">On offer</h2>
              </div>
            </div>
            <div class="mk-product-grid mk-reveal-stagger">
              ${onOffer.map(p => productCard(p)).join('')}
            </div>
          </section>
        ` : ''}

        <section class="mk-container mk-section mk-reveal">
          <div class="mk-section-head">
            <div>
              <div class="mk-section-eyebrow">Catalog</div>
              <h2 class="mk-section-title">All products</h2>
              <p class="mk-section-sub">${liveProducts.length} live products from ${shop.name}</p>
            </div>
          </div>
          <div class="mk-product-grid mk-reveal-stagger">
            ${liveProducts.length === 0
              ? `<div class="mk-empty"><div class="mk-empty-icon">📦</div><h3>No products yet</h3><p>${shop.name} hasn't listed anything yet. Follow to be notified when they do.</p></div>`
              : liveProducts.map(p => productCard(p)).join('')}
          </div>
        </section>

        ${footerMarkup()}
      </main>
    </div>

    <!-- QR sheet modal -->
    <div id="sp2-qr-sheet" class="sp2-sheet">
      <div class="sp2-sheet-backdrop" onclick="document.getElementById('sp2-qr-sheet').classList.remove('open')"></div>
      <div class="sp2-sheet-card">
        <div class="sp2-sheet-handle"></div>
        <h2 class="sp2-sheet-title">${shop.name}</h2>
        <p class="sp2-sheet-sub">Scan with any phone camera to open the shop in AR</p>
        <div class="sp2-sheet-qr">
          <div id="sp2-qr-sheet-canvas" style="width:240px;height:240px;"></div>
        </div>
        <div class="sp2-sheet-actions">
          <button class="sp2-btn sp2-btn-primary" onclick="alert('Download not yet wired up in demo')">Download PNG</button>
          <button class="sp2-btn sp2-btn-secondary" onclick="navigator.share && navigator.share({title:'${shop.name}', url:location.href})">Share link</button>
        </div>
      </div>
    </div>

    <style>${shopPageStyles()}</style>
  `;
}

function shopNotFoundMarkup() {
  const customer = State.get('customer') || { name: '', signedIn: false };
  return `
    ${navMarkup(customer)}
    <div class="screen mk-screen">
      <main>
        <section class="mk-container mk-section">
          <div class="mk-empty">
            <div class="mk-empty-icon">🏪</div>
            <h3>Shop not found</h3>
            <a href="#/customer/marketplace" class="mk-editorial-cta" style="margin-top:var(--s-4);">Back to home</a>
          </div>
        </section>
      </main>
    </div>
  `;
}

/* QR / map / clock icons (preserved) */
function qrIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/></svg>`;
}
function pinIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
}
function clockIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
}

function renderMockQR() {
  const grid = [];
  const size = 25;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isCorner = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      const cornerInner = isCorner && (
        (x === 0 || x === 6 || y === 0 || y === 6) ||
        (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
        (x >= size - 7 && x <= size - 1 && (x === size - 7 || x === size - 1 || y === 0 || y === 6)) ||
        (x >= size - 5 && x <= size - 3 && y >= 2 && y <= 4) ||
        (y >= size - 7 && y <= size - 1 && (y === size - 7 || y === size - 1 || x === 0 || x === 6)) ||
        (y >= size - 5 && y <= size - 3 && x >= 2 && x <= 4)
      );
      const random = ((x * 7 + y * 13 + x*y) % 7) < 3;
      const fill = cornerInner || (random && !isCorner);
      if (fill) grid.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="black"/>`);
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="width:100%;height:100%;">${grid.join('')}</svg>`;
}

/* Themed shop renderer (preserved as-is) */
function renderThemedShop(shop) {
  if (window.DB && DB.isReady()) {
    DB.getShop(shop.id).then(fresh => {
      if (fresh && fresh.theme && JSON.stringify(fresh.theme) !== JSON.stringify(shop.theme)) {
        State.update('shops', s => ({ ...s, [shop.id]: { ...s[shop.id], theme: fresh.theme, banner: fresh.banner || s[shop.id].banner } }));
        Router.reload();
      }
    }).catch(()=>{});
  }
  return ShopLayouts.render(shop);
}

function renderThemedBlock(b, shop, theme, colors) {
  if (typeof renderBlockPreview === 'function') {
    return renderBlockPreview(b, shop, theme, colors);
  }
  return `<div style="padding:var(--s-4);color:var(--shop-ink);">${b.type}</div>`;
}

function shopPageStyles() {
  return `
    .sp2-cover { aspect-ratio: 16 / 7; max-height: 380px; min-height: 200px; position: relative; }
    .sp2-cover-inner { position: relative; height: 100%; padding-top: var(--s-4); padding-bottom: var(--s-4); }
    .sp2-cover-actions { position: absolute; top: var(--s-4); right: var(--page-pad); display: flex; gap: var(--s-2); }
    .sp2-cover-btn { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--ink); transition: all var(--d-fast); }
    .sp2-cover-btn:hover { background: white; transform: scale(1.05); }
    .sp2-cover-btn svg { width: 18px; height: 18px; }

    .sp2-identity { margin-top: -64px; position: relative; z-index: 5; }
    .sp2-id-card { background: var(--surface); border-radius: var(--r-2xl); padding: var(--s-6); display: grid; grid-template-columns: 1fr; gap: var(--s-5); box-shadow: var(--shadow-lg); border: 1px solid var(--border); }
    @media (min-width: 760px) { .sp2-id-card { grid-template-columns: auto 1fr; gap: var(--s-6); padding: var(--s-7); align-items: center; } }

    .sp2-id-logo { width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0; color: white; font-weight: 700; font-size: 1.75rem; display: flex; align-items: center; justify-content: center; border: 4px solid var(--surface); box-shadow: var(--shadow-md); }
    @media (min-width: 760px) { .sp2-id-logo { width: 120px; height: 120px; font-size: 2rem; } }

    .sp2-id-body { min-width: 0; }
    .sp2-id-eyebrow { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--success); margin-bottom: 6px; }
    .sp2-id-name { font-family: var(--font-serif); font-weight: 400; font-size: clamp(1.75rem, 3.5vw, 2.5rem); letter-spacing: -0.015em; line-height: 1.1; margin: 0 0 var(--s-2); color: var(--ink); }
    .sp2-id-tagline { font-size: var(--t-body); color: var(--ink-dim); margin: 0 0 var(--s-3); line-height: 1.45; max-width: 56ch; }
    .sp2-id-meta { display: flex; gap: 10px; align-items: center; font-size: var(--t-small); color: var(--ink-dim); flex-wrap: wrap; margin-bottom: var(--s-4); }
    .sp2-id-meta strong { color: var(--ink); font-weight: 600; }
    .sp2-id-dot { color: var(--ink-muted); }

    .sp2-id-cta { display: flex; gap: var(--s-2); flex-wrap: wrap; }
    .sp2-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: var(--r-md); font-size: var(--t-small); font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: all var(--d-fast); }
    .sp2-btn svg { width: 16px; height: 16px; }
    .sp2-btn-primary { background: var(--ink); color: var(--bg); }
    .sp2-btn-primary:hover { background: var(--bg); color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
    .sp2-btn-secondary { background: var(--surface); color: var(--ink); border: 1px solid var(--border-strong); }
    .sp2-btn-secondary:hover { background: var(--bg); border-color: var(--ink); }

    .sp2-qr-feature { display: grid; grid-template-columns: 1fr; gap: var(--s-6); align-items: center; }
    @media (min-width: 800px) { .sp2-qr-feature { grid-template-columns: 1.4fr 1fr; gap: var(--s-8); } }
    .sp2-qr-content {}
    .sp2-qr-title { font-family: var(--font-serif); font-weight: 400; font-size: clamp(1.5rem, 3vw, 2.25rem); margin: 0 0 var(--s-3); line-height: 1.1; letter-spacing: -0.015em; }
    .sp2-qr-sub { color: var(--ink-dim); margin: 0 0 var(--s-4); max-width: 52ch; line-height: 1.6; }
    .sp2-qr-actions { display: flex; gap: var(--s-4); align-items: center; flex-wrap: wrap; }
    .sp2-qr-url { font-family: var(--mono); font-size: var(--t-small); color: var(--ink-dim); padding: 8px 14px; background: var(--surface); border-radius: var(--r-pill); border: 1px solid var(--border); }
    .sp2-qr-card { background: white; padding: var(--s-5); border-radius: var(--r-xl); box-shadow: var(--shadow-md); text-align: center; max-width: 260px; margin: 0 auto; }
    .sp2-qr-canvas { width: 220px; height: 220px; margin: 0 auto; }
    .sp2-qr-card-label { font-size: var(--t-small); font-weight: 600; color: var(--ink); margin-top: var(--s-3); letter-spacing: -0.01em; }

    /* Sheet modal */
    .sp2-sheet { position: fixed; inset: 0; z-index: var(--z-modal); opacity: 0; pointer-events: none; transition: opacity var(--d-base); }
    .sp2-sheet.open { opacity: 1; pointer-events: auto; }
    .sp2-sheet-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
    .sp2-sheet-card { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%) translateY(100%); width: 100%; max-width: 480px; background: var(--surface); border-radius: var(--r-2xl) var(--r-2xl) 0 0; padding: var(--s-3) var(--s-6) var(--s-7); transition: transform var(--d-base) var(--ease-out); }
    .sp2-sheet.open .sp2-sheet-card { transform: translateX(-50%) translateY(0); }
    @media (min-width: 700px) { .sp2-sheet-card { bottom: 50%; transform: translateX(-50%) translateY(50%) scale(0.95); border-radius: var(--r-2xl); margin-bottom: 0; transition: transform var(--d-base) var(--ease-out), opacity var(--d-base); opacity: 0; } .sp2-sheet.open .sp2-sheet-card { transform: translateX(-50%) translateY(50%) scale(1); opacity: 1; } }
    .sp2-sheet-handle { width: 36px; height: 4px; background: var(--ink-muted); border-radius: 2px; margin: 0 auto var(--s-4); }
    @media (min-width: 700px) { .sp2-sheet-handle { display: none; } }
    .sp2-sheet-title { font-family: var(--font-serif); font-size: 1.75rem; font-weight: 400; margin: 0 0 var(--s-2); letter-spacing: -0.015em; text-align: center; }
    .sp2-sheet-sub { font-size: var(--t-small); color: var(--ink-dim); margin: 0 0 var(--s-5); text-align: center; }
    .sp2-sheet-qr { padding: var(--s-5); background: white; border-radius: var(--r-lg); margin-bottom: var(--s-5); display: flex; align-items: center; justify-content: center; }
    .sp2-sheet-actions { display: flex; gap: var(--s-3); }
    .sp2-sheet-actions .sp2-btn { flex: 1; justify-content: center; }
  `;
}
