/* ============================================================
   HOLOS — Customer Product Detail Page (v2, editorial rebuild)
   Two-column on desktop: gallery left, sticky info right.
   Single column stack on mobile.
   ============================================================ */

let reviewStars = 0;

Router.register('/customer/product', () => renderProductPage(null));
Router.registerDynamic('/customer/product/', (pid) => renderProductPage(pid));

function renderProductPage(productId) {
  log('Customer/Product', `mounted: ${productId}`);
  const product = productId ? State.getProduct(productId) : State.getLiveProducts()[0];
  if (!product) return notFoundMarkup();

  const customer = State.get('customer') || { name: '', signedIn: false };
  const shop = State.getShop(product.shop);
  const sub = Taxonomy.getSubcategoryById(product.subcategory);
  const opts = product.options || {};
  const colors = opts.colors || [];
  const sizes = opts.sizes || opts.ageGroup || [];
  const hasOffer = product.salePrice && product.salePrice < product.price;
  const off = hasOffer ? Math.round((1 - product.salePrice/product.price) * 100) : 0;
  const price = product.salePrice || product.price;
  const hasAR = !!(product.models?.glb);
  const photos = product.photoUrls || [];

  const wr = State.getWeightedRating ? State.getWeightedRating(product.id) : null;
  const reviews = State.getReviews ? State.getReviews(product.id) : [];

  setTimeout(() => {
    // Bind size and color picker behavior
    document.querySelectorAll('.pp2-chip[data-kind="size"]').forEach(s => s.addEventListener('click', () => {
      document.querySelectorAll('.pp2-chip[data-kind="size"]').forEach(x => x.classList.remove('active'));
      s.classList.add('active');
    }));
    document.querySelectorAll('.pp2-color').forEach(c => c.addEventListener('click', () => {
      document.querySelectorAll('.pp2-color').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      const lbl = document.querySelector('.pp2-color-label');
      if (lbl) lbl.textContent = c.dataset.label;
    }));

    // Thumbnail clicks swap the main photo
    document.querySelectorAll('.pp2-thumb').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.pp2-thumb').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const main = document.getElementById('pp2-main-photo');
      if (main && t.dataset.src) main.src = t.dataset.src;
    }));

    // Store preview auto-fits the frame (scale 1). Real-world size is applied
    // ONLY when AR launches (launchRoomAR) and reset when AR closes.
    const mv = document.getElementById('pp2-model');
    if (mv) { ModelFit.resetFit(mv); mv.addEventListener('load', () => ModelFit.resetFit(mv)); }
  }, 60);

  const arPlacement = (product.tryOn === 'wall' || /wall|art|mirror|poster|frame|wallpaper|tapestr/i.test((product.subcategory||'')+' '+(product.category||''))) ? 'wall' : 'floor';
  const arName = (product.name || 'this item').replace(/&/g,'&amp;').replace(/"/g,'&quot;');

  return `
    ${navMarkup(customer)}
    <div class="screen mk-screen">
      <main>
        <!-- Breadcrumb -->
        <div class="mk-container pp2-crumbs">
          <a href="#/customer/marketplace">Home</a>
          <span>/</span>
          ${shop ? `<a href="#/customer/shop/${shop.id}">${shop.name}</a>` : ''}
          <span>/</span>
          <span class="pp2-crumb-current">${product.name}</span>
        </div>

        <!-- Main two-column layout -->
        <div class="mk-container pp2-layout">

          <!-- LEFT: media gallery -->
          <section class="pp2-media">
            ${hasAR ? `
              <div class="pp2-stage">
                <model-viewer
                  id="pp2-model"
                  src="${product.models.glb}"
                  ${product.models.poster ? `poster="${product.models.poster}"` : ''}
                  alt="${(product.name || '').replace(/"/g, '&quot;')}"
                  ar ar-modes="webxr quick-look" ar-scale="fixed"
                  data-rw="${product.models.realDimsCm?.w || 0}"
                  data-rh="${product.models.realDimsCm?.h || 0}"
                  data-rd="${product.models.realDimsCm?.d || 0}"
                  data-rlongest="${product.models.realSizeCm || 0}"
                  data-strategy="${product.models.scaleStrategy || 'auto'}"
                  ar-placement="${arPlacement}"
                  data-placement="${arPlacement}"
                  data-name="${arName}"
                  camera-controls touch-action="pan-y"
                  auto-rotate auto-rotate-delay="2400" rotation-per-second="14deg"
                  shadow-intensity="1" exposure="1.15"
                  environment-image="neutral"
                  class="pp2-model-el">
                </model-viewer>
                <div class="pp2-stage-overlay">
                  <span class="pp2-stage-pill">${icon('cube')} 3D · Drag to rotate</span>
                </div>
              </div>
            ` : photos.length > 0 ? `
              <div class="pp2-photo-stage">
                <img id="pp2-main-photo" src="${photos[0]}" alt="${(product.name || '').replace(/"/g, '&quot;')}" />
              </div>
            ` : `
              <div class="pp2-photo-stage pp2-placeholder">
                ${categoryGlyphForSub(product.subcategory)}
              </div>
            `}

            ${photos.length > 1 || hasAR ? `
              <div class="pp2-thumbs">
                ${hasAR ? `<div class="pp2-thumb pp2-thumb-3d active" title="3D model">${icon('cube')}</div>` : ''}
                ${photos.map((url, i) => `
                  <div class="pp2-thumb ${!hasAR && i === 0 ? 'active' : ''}" data-src="${url}" title="Photo ${i+1}">
                    <img src="${url}" alt="" loading="lazy" />
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </section>

          <!-- RIGHT: info column (sticky on desktop) -->
          <section class="pp2-info">
            ${shop ? `<a href="#/customer/shop/${shop.id}" class="pp2-shop-link">${shop.name}</a>` : ''}
            <h1 class="pp2-title">${product.name}</h1>

            <div class="pp2-rating-row">
              ${(wr?.shown || product.rating) > 0 ? `
                <div class="pp2-stars">★ ${(wr?.shown || product.rating).toFixed(1)}</div>
                <span class="pp2-rating-count">${reviews.length} review${reviews.length === 1 ? '' : 's'}</span>
              ` : `<span class="pp2-rating-count">No reviews yet</span>`}
              ${hasAR ? `<span class="pp2-ar-tag">${icon('cube')} AR available</span>` : ''}
            </div>

            <div class="pp2-price-row">
              <div class="pp2-price">${Locale.formatPrice(price)}</div>
              ${hasOffer ? `
                <div class="pp2-price-was">${Locale.formatPrice(product.price)}</div>
                <div class="pp2-price-off">-${off}%</div>
              ` : ''}
            </div>

            ${product.description ? `<p class="pp2-desc">${product.description}</p>` : ''}

            ${colors.length ? `
              <div class="pp2-option-block">
                <div class="pp2-option-head">
                  <span class="pp2-option-label">Color</span>
                  <span class="pp2-color-label">${colors[0]?.label || colors[0] || ''}</span>
                </div>
                <div class="pp2-colors">
                  ${colors.map((c, i) => {
                    const lbl = c.label || c;
                    const hex = c.hex || c;
                    return `<button class="pp2-color ${i===0?'active':''}" data-label="${lbl}" style="background:${hex};" aria-label="${lbl}"></button>`;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            ${sizes.length ? `
              <div class="pp2-option-block">
                <div class="pp2-option-head"><span class="pp2-option-label">Size</span></div>
                <div class="pp2-chips">
                  ${sizes.map((s, i) => `<button class="pp2-chip ${i===0?'active':''}" data-kind="size">${s.label || s}</button>`).join('')}
                </div>
              </div>
            ` : ''}

            ${hasAR ? `
              <div class="pp2-ar-cta">
                <button class="pp2-btn pp2-btn-ar" onclick="launchRoomAR()">
                  ${icon('cube')} See it in your room
                </button>
                <div class="pp2-ar-hint">Open AR · works on iPhone (iOS 12+) and Android (ARCore phones)</div>
              </div>
            ` : ''}

            <div class="pp2-cta-row">
              <button class="pp2-btn pp2-btn-buy" onclick="orderOnWhatsApp('${product.id}')">
                ${icon('whatsapp')} Order via WhatsApp
              </button>
              <button id="pp2-fav" class="pp2-btn-icon ${State.isFavorite(product.id) ? 'faved' : ''}" aria-label="Add to favorites" onclick="event.stopPropagation(); State.toggleFavorite('${product.id}'); this.classList.toggle('faved'); this.innerHTML = State.isFavorite('${product.id}') ? heartFilledSmall() : heartOutlineSmall();">
                ${State.isFavorite(product.id) ? heartFilledSmall() : heartOutlineSmall()}
              </button>
            </div>

            <!-- Real-world size pill -->
            ${product.models?.realDimsCm ? (() => {
              const d = product.models.realDimsCm;
              if (d.w || d.h || d.d) {
                return `<div class="pp2-size-pill">
                  <span class="pp2-size-pill-icon">${icon('ruler')}</span>
                  <div>
                    <div class="pp2-size-pill-label">Real-world size</div>
                    <div class="pp2-size-pill-value">${d.w||'—'} × ${d.h||'—'} × ${d.d||'—'} cm</div>
                  </div>
                </div>`;
              }
              return '';
            })() : ''}

            <!-- Trust strip -->
            <ul class="pp2-trust">
              <li>${icon('check')} <span>Verified seller</span></li>
              <li>${icon('check')} <span>True real-world scale in AR</span></li>
              <li>${icon('check')} <span>Direct chat with the shop</span></li>
            </ul>
          </section>
        </div>

        <!-- Specs + Reviews -->
        <div class="mk-container pp2-bottom">
          ${renderSpecs(product, sub)}

          <section class="pp2-block">
            <div class="pp2-block-head">
              <h2 class="pp2-block-title">Reviews ${reviews.length ? `<span class="pp2-block-count">${reviews.length}</span>` : ''}</h2>
              <button class="pp2-link-btn" onclick="openReviewModal('${product.id}')">+ Write a review</button>
            </div>
            ${reviews.length === 0 ? `
              <div class="pp2-empty-review">
                <p>No reviews yet. Be the first.</p>
              </div>
            ` : `
              <div class="pp2-reviews">
                ${reviews.slice(0, 6).map(r => renderReview(r, reviews)).join('')}
              </div>
            `}
          </section>

          <!-- Back to shop -->
          ${shop ? `
            <section class="pp2-block pp2-back-shop">
              <div>
                <div class="mk-section-eyebrow">From this shop</div>
                <h2 class="pp2-block-title">More from ${shop.name}</h2>
              </div>
              <a href="#/customer/shop/${shop.id}" class="mk-section-cta">Visit shop <span class="mk-section-cta-arrow">→</span></a>
            </section>
          ` : ''}

          ${shop ? (() => {
            const more = State.getProductsForShop(shop.id).filter(p => p.id !== product.id && p.status === 'live').slice(0, 6);
            if (more.length === 0) return '';
            return `<div class="mk-product-grid mk-reveal-stagger" style="margin-bottom:var(--s-7);">${more.map(p => productCard(p)).join('')}</div>`;
          })() : ''}
        </div>

        ${footerMarkup()}
      </main>
    </div>

    <style>${productPageStyles()}</style>
  `;
}

function notFoundMarkup() {
  const customer = State.get('customer') || { name: '', signedIn: false };
  return `
    ${navMarkup(customer)}
    <div class="screen mk-screen">
      <main>
        <section class="mk-container mk-section">
          <div class="mk-empty">
            <div class="mk-empty-icon">📦</div>
            <h3>Product not found</h3>
            <p>This product may have been removed.</p>
            <a href="#/customer/marketplace" class="mk-editorial-cta" style="margin-top:var(--s-4);">Back to home</a>
          </div>
        </section>
      </main>
    </div>
  `;
}

function renderSpecs(product, sub) {
  if (!sub || !sub.fields) return '';
  const opts = product.options || {};
  const skip = ['colors', 'sizes', 'ageGroup'];
  const rows = sub.fields.filter(f => !skip.includes(f.key)).map(f => {
    let v = opts[f.key];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) return '';
    if (Array.isArray(v)) v = v.join(', ');
    if (typeof v === 'boolean') v = v ? 'Yes' : 'No';
    if (f.unit) v = `${v} ${f.unit}`;
    return `<div class="pp2-spec-row"><span class="pp2-spec-key">${f.label}</span><span class="pp2-spec-val">${v}</span></div>`;
  }).filter(Boolean).join('');
  if (!rows) return '';
  return `
    <section class="pp2-block">
      <h2 class="pp2-block-title">Details</h2>
      <div class="pp2-specs">${rows}</div>
    </section>
  `;
}

function renderReview(r, allReviews) {
  const sameAccount = allReviews.filter(x => x.accountId === r.accountId);
  const isDampened = sameAccount.length > 1 && sameAccount.indexOf(r) > 0;
  return `
    <div class="pp2-review ${isDampened ? 'dampened' : ''}">
      <div class="pp2-review-head">
        <div class="pp2-review-avatar">${r.author[0]}</div>
        <div class="pp2-review-meta">
          <div class="pp2-review-author">${r.author}</div>
          <div class="pp2-review-date">${r.date}</div>
        </div>
        <div class="pp2-review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
      </div>
      <div class="pp2-review-text">${r.text}</div>
      ${isDampened ? `<div class="pp2-review-flag">Repeat review · reduced weight</div>` : ''}
    </div>
  `;
}

function openReviewModal(productId) {
  reviewStars = 0;
  const modal = document.createElement('div');
  modal.id = 'review-modal';
  modal.className = 'rv-modal';
  modal.innerHTML = `
    <div class="rv-backdrop" onclick="closeReviewModal()"></div>
    <div class="rv-card">
      <div class="rv-handle"></div>
      <h2 class="rv-title">Write a review</h2>
      <p class="rv-sub">Share your experience with this product.</p>
      <div class="rv-stars" id="rv-stars">
        ${[1,2,3,4,5].map(n => `<button class="rv-star" data-n="${n}" onclick="setReviewStars(${n})">☆</button>`).join('')}
      </div>
      <textarea id="rv-text" class="fr-input fr-textarea" rows="3" placeholder="What did you like? How was the fit / quality?"></textarea>
      <button class="btn btn-primary btn-large btn-block" style="margin-top:var(--s-4);" onclick="submitReview('${productId}')">Post review</button>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
}
function setReviewStars(n) {
  reviewStars = n;
  document.querySelectorAll('#rv-stars .rv-star').forEach(s => {
    s.textContent = Number(s.dataset.n) <= n ? '★' : '☆';
    s.classList.toggle('lit', Number(s.dataset.n) <= n);
  });
}
function closeReviewModal() {
  const m = document.getElementById('review-modal');
  if (m) { m.classList.remove('open'); setTimeout(() => m.remove(), 300); }
}
function submitReview(productId) {
  if (reviewStars === 0) { alert('Please tap a star rating first.'); return; }
  const text = document.getElementById('rv-text').value.trim() || 'Great product!';
  State.addReview(productId, reviewStars, text);
  try {
    const customer = State.get('customer');
    const author = customer.name + ' ' + (customer.name[0] || '') + '.';
    DB.addReview(productId, customer.id, author, reviewStars, text);
  } catch (e) { log('Customer/Product', 'review DB sync failed: ' + e.message, 'error'); }
  closeReviewModal();
  Router.reload();
}

function launchRoomAR() {
  const mv = document.getElementById('pp2-model');
  if (!mv) { alert('AR requires a phone with iOS Safari or Android Chrome.'); return; }
  const w = +mv.dataset.rw || 0, h = +mv.dataset.rh || 0, d = +mv.dataset.rd || 0;
  const longest = +mv.dataset.rlongest || 0;
  const strategy = mv.dataset.strategy || 'auto';
  const size = (w || h || d) ? { w, h, d } : (longest || null);
  ModelFit.launchAR(mv, size, { strategy, placement: mv.dataset.placement || 'floor', name: mv.dataset.name || 'this item' });
}

function orderOnWhatsApp(productId) {
  const product = State.getProduct(productId);
  const shop = State.getShop(product.shop);
  const msg = `Hi ${shop.name}!\n\nI'd like to order:\n${product.name}\nPrice: ${Locale.formatPrice(product.salePrice||product.price)}\n\nFound via HOLOS`;
  window.open(`https://wa.me/${shop.phone||'923001234567'}?text=${encodeURIComponent(msg)}`, '_blank');
}

function categoryGlyphForSub(subId) {
  const sub = Taxonomy.getSubcategoryById(subId);
  const catId = sub?.categoryId || '';
  const iconId = 'cat_' + catId;
  if (Icons && Icons[iconId]) return icon(iconId);
  return icon('cube');
}

/* All product page styles in one block */
function productPageStyles() {
  return `
    .pp2-crumbs { padding: var(--s-3) var(--page-pad); font-size: var(--t-small); color: var(--ink-dim); display: flex; gap: var(--s-2); align-items: center; flex-wrap: wrap; }
    .pp2-crumbs a { color: var(--ink-dim); text-decoration: none; }
    .pp2-crumbs a:hover { color: var(--ink); }
    .pp2-crumb-current { color: var(--ink); }

    .pp2-layout { display: grid; grid-template-columns: 1fr; gap: var(--s-6); padding-bottom: var(--s-7); }
    @media (min-width: 900px) { .pp2-layout { grid-template-columns: 1.3fr 1fr; gap: var(--s-8); } }
    @media (min-width: 1200px) { .pp2-layout { grid-template-columns: 1.5fr 1fr; gap: var(--s-9); } }

    .pp2-media { display: flex; flex-direction: column; gap: var(--s-3); position: relative; }
    .pp2-stage, .pp2-photo-stage { aspect-ratio: 1 / 1; background: var(--surface-tint); border-radius: var(--r-xl); overflow: hidden; position: relative; }
    @media (min-width: 900px) { .pp2-stage, .pp2-photo-stage { aspect-ratio: 4 / 5; } }
    .pp2-model-el { width: 100%; height: 100%; background: linear-gradient(135deg, var(--surface) 0%, var(--surface-tint) 100%); }
    .pp2-photo-stage img { width: 100%; height: 100%; object-fit: cover; }
    .pp2-placeholder { display: flex; align-items: center; justify-content: center; color: var(--ink-muted); }
    .pp2-placeholder svg { width: 38%; height: 38%; max-width: 96px; opacity: 0.4; }

    .pp2-stage-overlay { position: absolute; bottom: var(--s-3); left: var(--s-3); pointer-events: none; }
    .pp2-stage-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-radius: var(--r-pill); font-size: 0.7rem; font-weight: 600; color: var(--ink); letter-spacing: 0.02em; }
    .pp2-stage-pill svg { width: 12px; height: 12px; }

    .pp2-thumbs { display: flex; gap: var(--s-2); overflow-x: auto; padding-bottom: 4px; }
    .pp2-thumbs::-webkit-scrollbar { display: none; }
    .pp2-thumb { width: 72px; height: 72px; flex-shrink: 0; border-radius: var(--r-md); overflow: hidden; cursor: pointer; background: var(--surface-tint); border: 2px solid transparent; transition: border-color var(--d-fast); display: flex; align-items: center; justify-content: center; color: var(--ink-dim); }
    .pp2-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .pp2-thumb svg { width: 30px; height: 30px; }
    .pp2-thumb:hover { border-color: var(--border-strong); }
    .pp2-thumb.active { border-color: var(--ink); }
    .pp2-thumb-3d { background: var(--ink); color: var(--bg); }

    /* Info column */
    .pp2-info { padding-top: var(--s-2); }
    @media (min-width: 900px) { .pp2-info { position: sticky; top: 90px; align-self: start; padding-top: 0; } }

    .pp2-shop-link { display: inline-block; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); text-decoration: none; margin-bottom: var(--s-3); }
    .pp2-shop-link:hover { color: var(--accent-hover); }
    .pp2-title { font-family: var(--font-serif); font-weight: 400; font-size: clamp(1.75rem, 3vw, 2.5rem); line-height: 1.1; letter-spacing: -0.015em; color: var(--ink); margin: 0 0 var(--s-3); }
    .pp2-rating-row { display: flex; align-items: center; gap: var(--s-3); margin-bottom: var(--s-4); flex-wrap: wrap; }
    .pp2-stars { font-size: var(--t-small); font-weight: 600; color: var(--ink); }
    .pp2-rating-count { font-size: var(--t-small); color: var(--ink-dim); }
    .pp2-ar-tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; background: var(--ink); color: var(--bg); border-radius: var(--r-pill); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    .pp2-ar-tag svg { width: 12px; height: 12px; }

    .pp2-price-row { display: flex; align-items: baseline; gap: var(--s-3); margin-bottom: var(--s-4); flex-wrap: wrap; }
    .pp2-price { font-family: var(--font-serif); font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 500; color: var(--ink); letter-spacing: -0.02em; }
    .pp2-price-was { font-size: 1.1rem; color: var(--ink-muted); text-decoration: line-through; }
    .pp2-price-off { padding: 4px 10px; background: var(--coral); color: white; border-radius: var(--r-pill); font-size: 0.75rem; font-weight: 700; }

    .pp2-desc { font-size: var(--t-body); color: var(--ink-dim); line-height: 1.6; margin: 0 0 var(--s-5); }

    .pp2-option-block { margin-bottom: var(--s-5); }
    .pp2-option-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: var(--s-2); }
    .pp2-option-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-dim); }
    .pp2-color-label { font-size: var(--t-small); color: var(--ink); font-weight: 500; }

    .pp2-colors { display: flex; gap: 10px; flex-wrap: wrap; }
    .pp2-color { width: 36px; height: 36px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: all var(--d-fast); box-shadow: inset 0 0 0 1px var(--border); }
    .pp2-color:hover { transform: scale(1.08); }
    .pp2-color.active { border-color: var(--ink); transform: scale(1.08); box-shadow: 0 0 0 2px var(--bg) inset; }

    .pp2-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .pp2-chip { padding: 10px 18px; background: var(--surface); border: 1px solid var(--border-strong); border-radius: var(--r-md); font-size: var(--t-small); font-weight: 500; color: var(--ink); cursor: pointer; transition: all var(--d-fast); }
    .pp2-chip:hover { border-color: var(--ink); }
    .pp2-chip.active { background: var(--ink); color: var(--bg); border-color: var(--ink); }

    .pp2-ar-cta { margin-bottom: var(--s-4); }
    .pp2-ar-hint { font-size: var(--t-micro); color: var(--ink-dim); text-align: center; margin-top: var(--s-2); }

    .pp2-cta-row { display: flex; gap: var(--s-2); margin-bottom: var(--s-5); }

    .pp2-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; flex: 1; padding: 16px 24px; border-radius: var(--r-md); font-size: var(--t-body); font-weight: 600; cursor: pointer; transition: all var(--d-fast); border: none; text-decoration: none; }
    .pp2-btn svg { width: 18px; height: 18px; }
    .pp2-btn-ar { width: 100%; background: var(--ink); color: var(--bg); padding: 18px 24px; font-size: 1.05rem; }
    .pp2-btn-ar:hover { background: var(--bg); color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
    .pp2-btn-buy { background: var(--coral); color: white; }
    .pp2-btn-buy:hover { background: var(--coral-hover); }

    .pp2-btn-icon { width: 56px; height: 56px; flex-shrink: 0; background: var(--surface); border: 1px solid var(--border-strong); border-radius: var(--r-md); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--ink); transition: all var(--d-fast); }
    .pp2-btn-icon:hover { background: var(--bg); }
    .pp2-btn-icon.faved { color: var(--coral); border-color: var(--coral); background: var(--coral-soft); }
    .pp2-btn-icon svg { width: 22px; height: 22px; }

    .pp2-size-pill { display: flex; align-items: center; gap: var(--s-3); padding: var(--s-3) var(--s-4); background: var(--accent-soft); border-radius: var(--r-md); margin-bottom: var(--s-4); }
    .pp2-size-pill-icon { display: flex; color: var(--accent); }
    .pp2-size-pill-icon svg { width: 24px; height: 24px; }
    .pp2-size-pill-label { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-dim); font-weight: 600; }
    .pp2-size-pill-value { font-family: var(--font-serif); font-size: 1.15rem; font-weight: 500; color: var(--accent); }

    .pp2-trust { list-style: none; padding: var(--s-4) 0 0; margin: 0; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: var(--s-2); }
    .pp2-trust li { display: flex; align-items: center; gap: 10px; font-size: var(--t-small); color: var(--ink-dim); }
    .pp2-trust svg { width: 16px; height: 16px; color: var(--success); flex-shrink: 0; }

    /* Bottom blocks */
    .pp2-bottom { padding-top: var(--s-7); }
    .pp2-block { padding: var(--s-7) 0; border-top: 1px solid var(--border); }
    .pp2-block-head { display: flex; align-items: end; justify-content: space-between; margin-bottom: var(--s-4); flex-wrap: wrap; gap: var(--s-3); }
    .pp2-block-title { font-family: var(--font-serif); font-weight: 400; font-size: clamp(1.4rem, 2.5vw, 1.8rem); margin: 0; color: var(--ink); letter-spacing: -0.01em; }
    .pp2-block-count { font-size: 1rem; color: var(--ink-muted); font-family: var(--font); margin-left: 8px; }
    .pp2-back-shop { display: flex; align-items: end; justify-content: space-between; gap: var(--s-4); flex-wrap: wrap; padding-bottom: var(--s-4); border-bottom: none; }
    .pp2-link-btn { background: none; border: none; padding: 8px 0; font-size: var(--t-small); font-weight: 600; color: var(--ink); cursor: pointer; border-bottom: 1px solid var(--ink); }

    .pp2-specs { display: grid; grid-template-columns: 1fr; gap: 0; max-width: 720px; }
    @media (min-width: 600px) { .pp2-specs { grid-template-columns: 1fr 1fr; gap: 0 var(--s-7); } }
    .pp2-spec-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); gap: var(--s-4); }
    .pp2-spec-key { color: var(--ink-dim); font-size: var(--t-small); }
    .pp2-spec-val { color: var(--ink); font-size: var(--t-small); font-weight: 500; text-align: right; }

    .pp2-empty-review { padding: var(--s-7) 0; text-align: center; color: var(--ink-dim); font-style: italic; }
    .pp2-reviews { display: grid; grid-template-columns: 1fr; gap: var(--s-4); }
    @media (min-width: 700px) { .pp2-reviews { grid-template-columns: 1fr 1fr; } }
    .pp2-review { padding: var(--s-4); background: var(--surface); border-radius: var(--r-md); border: 1px solid var(--border); }
    .pp2-review.dampened { opacity: 0.7; }
    .pp2-review-head { display: flex; align-items: center; gap: var(--s-2); margin-bottom: var(--s-2); }
    .pp2-review-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: var(--t-small); }
    .pp2-review-meta { flex: 1; min-width: 0; }
    .pp2-review-author { font-size: var(--t-small); font-weight: 600; color: var(--ink); }
    .pp2-review-date { font-size: 0.7rem; color: var(--ink-dim); }
    .pp2-review-stars { font-size: var(--t-small); color: var(--warn); letter-spacing: 1px; }
    .pp2-review-text { font-size: var(--t-small); line-height: 1.5; color: var(--ink); margin: 0; }
    .pp2-review-flag { font-size: 0.7rem; color: var(--ink-dim); margin-top: 8px; font-style: italic; }
  `;
}
