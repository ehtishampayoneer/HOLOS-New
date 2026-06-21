/* ============================================================
   SCREEN: Customer / Shop AR Walkthrough
   Parallax "virtual shelves" view — products on display shelves.
   Visual mockup of the future walkable AR shop.
   ============================================================ */

// Register routes for all shops dynamically
State.getShopsList().forEach(s => {
  Router.register(`/customer/shop-ar/${s.id}`, () => renderShopAr(s.id));
});

function renderShopAr(shopId) {
  log('Customer/ShopAr', `mounted: ${shopId}`);
  const shop = State.getShop(shopId);
  const products = State.getProductsForShop(shopId);

  // Group products by category — each category becomes a "shelf"
  const shelves = {};
  products.forEach(p => {
    if (!shelves[p.category]) shelves[p.category] = [];
    shelves[p.category].push(p);
  });

  setTimeout(() => {
    // Parallax scrolling effect
    const stage = document.getElementById('sa-stage');
    if (stage) {
      stage.addEventListener('scroll', () => {
        const scroll = stage.scrollTop;
        document.querySelectorAll('[data-parallax]').forEach(el => {
          const speed = parseFloat(el.dataset.parallax);
          el.style.transform = `translateY(${scroll * speed}px)`;
        });
      });
    }
  }, 100);

  return `
    <div class="screen sa">
      <!-- Sticky top -->
      <header class="sa-top">
        <button class="sa-top-btn" type="button" onclick="Router.go('/customer/shop/${shop.id}')" aria-label="Back to shop">
          ${icon('arrow_left')}
        </button>
        <div class="sa-top-title">
          <div class="sa-top-shop">${shop.name}</div>
          <div class="sa-top-mode">${icon('cube')} AR STORE</div>
        </div>
        <button class="sa-top-btn" type="button" onclick="alert('AR Store Tips:\\n\\n• Scroll down to browse shelves by category\\n• Tap any product to view it in AR\\n• Pinch or scroll to zoom on individual items\\n• Use the back arrow to leave the AR view')" aria-label="Help">?</button>
      </header>

      <!-- 3D-feel stage with parallax shelves -->
      <main class="sa-stage" id="sa-stage" style="background: ${shop.banner ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${shop.banner}') center ${shop.bannerPosY || 50}%/cover` : shop.coverGradient};">
        <!-- Atmospheric layers -->
        <div class="sa-fog" data-parallax="0.2"></div>
        <div class="sa-grid-floor"></div>

        <!-- Welcome card -->
        <section class="sa-welcome stagger">
          ${shop.logo ? `<img src="${shop.logo}" class="sa-welcome-logo" alt="${shop.name}" />` : ''}
          <div class="sa-welcome-label">WELCOME TO</div>
          <h1 class="sa-welcome-title">${shop.name}</h1>
          <p class="sa-welcome-sub">${shop.tagline}</p>
          <div class="sa-welcome-stats">
            <span>${products.length} products</span>
            <span>·</span>
            <span>${Object.keys(shelves).length} categories</span>
          </div>
        </section>

        <!-- Shelves: one per category -->
        ${Object.entries(shelves).map(([cat, items], i) => renderShelf(cat, items, i)).join('')}

        <!-- Exit cap -->
        <section class="sa-exit stagger">
          <div class="sa-exit-emoji">✨</div>
          <h2 class="sa-exit-title">That's the whole shop.</h2>
          <p class="sa-exit-sub">Browse any product, place it in your room, or contact ${shop.owner} directly.</p>
          <div class="sa-exit-actions">
            <button class="btn btn-ghost" onclick="Router.go('/customer/shop/${shop.id}')">Back to shop</button>
            <button class="btn btn-primary">${icon('whatsapp')} Message owner</button>
          </div>
        </section>

        <div style="height: 80px;"></div>
      </main>
    </div>

    <style>
      .sa { position: fixed; inset: 0; overflow: hidden; color: white; }
      .sa-top {
        position: absolute; top: 0; left: 0; right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--s-4) var(--s-5);
        z-index: 50;
        background: linear-gradient(180deg, rgba(0,0,0,0.6), transparent);
        pointer-events: none;
      }
      .sa-top > * { pointer-events: auto; }
      .sa-top-btn {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(12px);
        color: white;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid rgba(255,255,255,0.15);
        cursor: pointer;
        font-size: 1rem;
        font-weight: 700;
        transition: background 160ms;
      }
      .sa-top-btn:hover { background: rgba(0,0,0,0.75); }
      .sa-top-btn svg { width: 18px; height: 18px; }
      .sa-top-title { text-align: center; }
      .sa-top-shop {
        font-size: var(--t-body);
        font-weight: var(--w-semibold);
      }
      .sa-top-mode {
        display: inline-flex;
        align-items: center;
        gap: var(--s-1);
        font-size: 0.6rem;
        letter-spacing: 0.15em;
        color: #4DDC8A;
        margin-top: 2px;
      }
      .sa-top-mode svg { width: 10px; height: 10px; }

      /* The 3D-feeling stage */
      .sa-stage {
        position: absolute; inset: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
        scrollbar-width: none;
        padding: 90px var(--s-5) var(--s-9);
      }
      .sa-stage::-webkit-scrollbar { display: none; }
      .sa-fog {
        position: fixed;
        inset: 0;
        background:
          radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.1), transparent 60%),
          radial-gradient(ellipse at 30% 80%, rgba(0,0,0,0.3), transparent 60%);
        pointer-events: none;
        z-index: 1;
      }
      .sa-grid-floor {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 200px;
        background-image:
          linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
        background-size: 40px 40px;
        transform: perspective(400px) rotateX(60deg);
        transform-origin: bottom;
        opacity: 0.4;
        pointer-events: none;
      }

      .sa-welcome {
        text-align: center;
        padding: var(--s-6) var(--s-5);
        margin: var(--s-6) auto;
        position: relative;
        z-index: 2;
        max-width: 640px;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.5);
      }
      .sa-welcome-logo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto var(--s-3); display: block; border: 3px solid rgba(255,255,255,0.2); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
      .sa-welcome-label {
        font-size: var(--t-micro);
        letter-spacing: 0.2em;
        color: rgba(255,255,255,0.5);
        margin-bottom: var(--s-3);
      }
      .sa-welcome-title {
        font-size: 2.4rem;
        font-weight: var(--w-bold);
        letter-spacing: -0.03em;
        margin-bottom: var(--s-2);
      }
      .sa-welcome-sub {
        color: rgba(255,255,255,0.7);
        font-size: var(--t-body);
        margin-bottom: var(--s-4);
      }
      .sa-welcome-stats {
        display: inline-flex;
        gap: var(--s-2);
        font-size: var(--t-small);
        color: rgba(255,255,255,0.5);
        padding: var(--s-2) var(--s-4);
        background: rgba(0,0,0,0.3);
        backdrop-filter: blur(12px);
        border-radius: var(--r-pill);
      }

      /* Shelves */
      .sa-shelf {
        position: relative;
        z-index: 2;
        margin: var(--s-7) calc(-1 * var(--s-5));
        padding: var(--s-5);
      }
      .sa-shelf-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 var(--s-3);
        margin-bottom: var(--s-3);
      }
      .sa-shelf-name {
        font-size: 1.4rem;
        font-weight: var(--w-bold);
        letter-spacing: -0.02em;
      }
      .sa-shelf-count {
        font-size: var(--t-micro);
        color: rgba(255,255,255,0.5);
        letter-spacing: 0.1em;
        padding: 4px var(--s-3);
        background: rgba(255,255,255,0.1);
        border-radius: var(--r-pill);
      }

      /* The actual shelf — wood-look bar with products on top */
      .sa-shelf-display {
        position: relative;
        margin-bottom: var(--s-4);
      }
      .sa-shelf-items {
        display: flex;
        gap: var(--s-3);
        overflow-x: auto;
        scrollbar-width: none;
        padding: var(--s-3) var(--s-5) var(--s-5);
        scroll-snap-type: x mandatory;
        position: relative;
        z-index: 2;
      }
      .sa-shelf-items::-webkit-scrollbar { display: none; }
      /* Wood plank */
      .sa-shelf-plank {
        position: absolute;
        left: 0; right: 0;
        bottom: 0;
        height: 16px;
        background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.4));
        border-radius: 4px 4px 0 0;
        box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      .sa-shelf-plank::after {
        content: '';
        position: absolute;
        left: 0; right: 0;
        bottom: -8px;
        height: 8px;
        background: linear-gradient(180deg, rgba(0,0,0,0.6), transparent);
      }

      /* Product on shelf */
      .sa-item {
        flex: 0 0 180px;
        scroll-snap-align: start;
        background: rgba(255,255,255,0.06);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: var(--r-md);
        padding: var(--s-3);
        cursor: pointer;
        text-align: left;
        transition: all var(--d-base);
        position: relative;
      }
      @media (min-width: 900px) { .sa-item { flex: 0 0 220px; padding: var(--s-4); } }
      @media (min-width: 1300px) { .sa-item { flex: 0 0 260px; } }
      .sa-item:hover {
        transform: translateY(-4px);
        background: rgba(255,255,255,0.1);
      }
      .sa-item-img {
        aspect-ratio: 1;
        background: rgba(255,255,255,0.06);
        border-radius: var(--r-sm);
        margin-bottom: var(--s-3);
        display: block;
        position: relative;
        overflow: hidden;
      }
      .sa-item-img .thumb-frame, .sa-item-img .thumb-photo {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        border-radius: var(--r-sm);
      }
      .sa-item-img .thumb-img {
        width: 100%; height: 100%;
        object-fit: cover;
        display: block;
      }
      .sa-item-img svg.product-svg {
        width: 75%;
        filter: drop-shadow(0 8px 12px rgba(0,0,0,0.5));
      }
      .sa-item-ar-tag {
        position: absolute;
        top: var(--s-2); right: var(--s-2);
        font-size: 0.5rem;
        font-weight: var(--w-bold);
        letter-spacing: 0.1em;
        padding: 2px 6px;
        background: rgba(0,0,0,0.7);
        color: #4DDC8A;
        border-radius: var(--r-pill);
      }
      .sa-item-name {
        font-size: var(--t-small);
        font-weight: var(--w-semibold);
        margin-bottom: 2px;
        color: white;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .sa-item-price {
        font-size: var(--t-micro);
        color: rgba(255,255,255,0.7);
        font-weight: var(--w-medium);
      }

      .sa-exit {
        text-align: center;
        padding: var(--s-6) var(--s-5);
        margin: var(--s-6) auto var(--s-7);
        max-width: 640px;
        position: relative;
        z-index: 2;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.5);
      }
      .sa-exit-emoji {
        font-size: 3rem;
        margin-bottom: var(--s-3);
      }
      .sa-exit-title {
        font-size: 1.6rem;
        font-weight: var(--w-bold);
        margin-bottom: var(--s-2);
        letter-spacing: -0.02em;
      }
      .sa-exit-sub {
        color: rgba(255,255,255,0.6);
        margin-bottom: var(--s-5);
      }
      .sa-exit-actions {
        display: flex;
        gap: var(--s-3);
        justify-content: center;
        flex-wrap: wrap;
      }
      .sa-exit-actions .btn-ghost {
        background: rgba(255,255,255,0.1);
        color: white;
        border-color: rgba(255,255,255,0.2);
      }
      .sa-exit-actions .btn-primary {
        background: #25D366;
        color: white;
      }
    </style>
  `;
}

function renderShelf(cat, items, idx) {
  const catLabels = {
    shoes: 'Shoes Aisle',
    glasses: 'Eyewear Wall',
    watches: 'Watch Display',
    jewelry: 'Jewelry Case',
    clothing: 'Clothing Rack',
    bags: 'Bags Section',
    furniture: 'Furniture Showcase',
    decor: 'Decor Gallery',
    electronics: 'Electronics Bench',
  };
  return `
    <section class="sa-shelf" data-parallax="${0.05 * (idx % 2 === 0 ? 1 : -1)}">
      <div class="sa-shelf-head">
        <div class="sa-shelf-name">${catLabels[cat] || cat}</div>
        <div class="sa-shelf-count">${items.length} items</div>
      </div>
      <div class="sa-shelf-display">
        <div class="sa-shelf-items">
          ${items.map(p => `
            <button class="sa-item" onclick="Router.go('/customer/product/${p.id}')">
              <div class="sa-item-img">
                ${typeof miniProductSvg === 'function' ? miniProductSvg(p) : ''}
                <span class="sa-item-ar-tag">AR</span>
              </div>
              <div class="sa-item-name">${p.name}</div>
              <div class="sa-item-price">${Locale.formatPrice((p.salePrice || p.price))}</div>
            </button>
          `).join('')}
        </div>
        <div class="sa-shelf-plank"></div>
      </div>
    </section>
  `;
}
