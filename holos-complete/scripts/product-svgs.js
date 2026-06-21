/* ============================================================
   HOLOS — Product Card Thumbnails (v3)
   Clean gradient + icon for cards. model-viewer only on
   product detail page (where we actually want the 3D).
   ============================================================ */

/* ============================================================
   HOLOS — Product Card Thumbnails (v4 — robust)
   Tries every possible field where a photo URL might live,
   handles broken URLs with error fallback, never silently fails.
   ============================================================ */

/**
 * Find a usable photo URL from a product, checking every possible field.
 * Returns null if nothing usable.
 */
window.findProductPhoto = function(p) {
  if (!p) return null;
  // 1. photoUrls array (new schema)
  if (Array.isArray(p.photoUrls)) {
    const first = p.photoUrls.find(u => u && typeof u === 'string' && u.length > 0);
    if (first) return first;
  }
  // 2. photoUrls might be a stringified JSON array (Postgres text[] sometimes returns this)
  if (typeof p.photoUrls === 'string' && p.photoUrls.length > 0) {
    try {
      const arr = JSON.parse(p.photoUrls);
      if (Array.isArray(arr) && arr[0]) return arr[0];
    } catch (e) {
      // not JSON, maybe it's a single URL?
      if (p.photoUrls.startsWith('http')) return p.photoUrls;
    }
  }
  // 3. Model poster (set to first photo on product creation)
  if (p.models?.poster && typeof p.models.poster === 'string' && p.models.poster.startsWith('http')) {
    return p.models.poster;
  }
  // 4. Legacy thumbnail field
  if (p.thumbnail && typeof p.thumbnail === 'string' && p.thumbnail.startsWith('http')) {
    return p.thumbnail;
  }
  // 5. p.photos as an array (unlikely but defensive)
  if (Array.isArray(p.photos)) {
    const first = p.photos.find(u => u && typeof u === 'string' && u.startsWith('http'));
    if (first) return first;
  }
  return null;
};

window.productThumbnail = function(p, opts = {}) {
  const photoUrl = findProductPhoto(p);
  if (photoUrl) {
    return `<div class="thumb-frame thumb-photo"><img src="${photoUrl}" alt="${(p.name || '').replace(/"/g, '&quot;')}" class="thumb-img" loading="lazy" onerror="window.__thumbErr(this)" /></div>`;
  }
  // No photo at all — rich themed placeholder
  return buildPlaceholderThumb(p);
};

/* Global error fallback for broken photo URLs — swap to a cube icon */
window.__thumbErr = function(img) {
  const parent = img.parentElement;
  if (!parent) return;
  parent.classList.remove('thumb-photo');
  parent.innerHTML = `<div class="thumb-icon" style="opacity:0.5;color:var(--ink-dim);">${icon('cube')}</div>`;
};

window.buildPlaceholderThumb = function(p) {
  const colors = p.options?.colors || p.colors || [];
  const accent = colors[0]?.hex || (window.State && State.getShop ? State.getShop(p.shop)?.accent : null) || '#2D3561';
  // Derive a complementary tone for the gradient
  const sub = window.Taxonomy && Taxonomy.getSubcategoryById ? Taxonomy.getSubcategoryById(p.subcategory) : null;
  const catId = sub?.categoryId || p.category || '';
  const catIcon = 'cat_' + catId;
  // Use product name first-letter as a stylish overlay
  const initial = (p.name || '?').trim().charAt(0).toUpperCase();
  const hasIcon = window.Icons && Icons[catIcon];

  return `
    <div class="thumb-frame thumb-placeholder" style="background: linear-gradient(135deg, ${accent}22 0%, ${accent}10 60%, ${accent}05 100%);">
      <div class="thumb-placeholder-pattern" style="background: radial-gradient(circle at 30% 20%, ${accent}33, transparent 50%), radial-gradient(circle at 70% 80%, ${accent}22, transparent 50%);"></div>
      <div class="thumb-placeholder-icon" style="color: ${accent};">
        ${hasIcon ? icon(catIcon) : icon('cube')}
      </div>
      <div class="thumb-placeholder-initial" style="color: ${accent}; opacity: 0.18;">${initial}</div>
    </div>
  `;
};

window.heartFilledSmall = function() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="18" height="18"><path d="M12 21s-7-4.5-9-9c-1.2-2.6 0-6 3-6 1.7 0 3 1 4 3 1-2 2.3-3 4-3 3 0 4.2 3.4 3 6-2 4.5-9 9-9 9z"/></svg>`;
};

window.heartOutlineSmall = function() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
};

window.miniProductSvg = window.productThumbnail;

/* Shared card styles */
(function injectThumbStyles() {
  const css = `
    .thumb-frame {
      width: 100%; height: 100%;
      border-radius: var(--r-md);
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }
    .thumb-photo { padding: 0; background: var(--surface); }
    .thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .thumb-icon {
      color: var(--ink-dim); opacity: 0.35;
    }
    .thumb-icon svg { width: 48px; height: 48px; }
    .thumb-placeholder { position: relative; }
    .thumb-placeholder-pattern { position: absolute; inset: 0; opacity: 0.6; pointer-events: none; }
    .thumb-placeholder-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.45; z-index: 2; }
    .thumb-placeholder-icon svg { width: 38%; height: 38%; max-width: 64px; max-height: 64px; min-width: 32px; min-height: 32px; }
    .thumb-placeholder-initial { position: absolute; right: 10%; bottom: 4%; font-size: clamp(48px, 14vw, 110px); font-weight: 800; line-height: 1; letter-spacing: -0.04em; font-family: -apple-system, system-ui, sans-serif; z-index: 1; pointer-events: none; }


    .ar-badge {
      position: absolute; bottom: 8px; left: 8px;
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      color: white; font-size: 0.6rem; font-weight: 700;
      letter-spacing: 0.06em; border-radius: 999px;
      z-index: 2; pointer-events: none;
    }
    .ar-badge::before {
      content: ''; width: 6px; height: 6px;
      border-radius: 50%; background: #4DDC8A;
    }

    .fav-btn {
      position: absolute; top: 10px; right: 10px; z-index: 3;
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      color: #6B6B6B; border: none; cursor: pointer;
      transition: all 160ms;
    }
    .fav-btn:hover { background: rgba(255, 255, 255, 1); }
    .fav-btn.faved { color: #C44040; }
    .fav-btn svg { width: 16px; height: 16px; }

    .card-offer-badge {
      position: absolute; top: 8px; left: 8px; z-index: 2;
      background: var(--success); color: white;
      font-size: 0.6rem; font-weight: 700;
      padding: 2px 8px; border-radius: 999px;
    }
    .card-bs { color: var(--warn); }
    .mp-pcard-was { font-size: 0.6875rem; color: var(--ink-muted); text-decoration: line-through; }
    .mp-pcard { position: relative; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

/* ============================================================
   SHOP VISUAL HELPERS — always use uploaded banner/logo
   when available, fall back to gradient/initials otherwise.
   ============================================================ */

/**
 * Returns CSS background string for a shop cover/banner.
 * Uses uploaded banner if set, otherwise coverGradient.
 */
window.shopCoverBg = function(s) {
  if (!s) return 'var(--bg)';
  if (s.banner) return `url('${s.banner}') center ${s.bannerPosY || 50}%/cover`;
  return s.coverGradient || s.accent || 'var(--accent)';
};

/**
 * Returns HTML for a circular shop avatar.
 * Uses uploaded logo if set, otherwise initials on accent color.
 * @param size: 'sm' (32px), 'md' (44px), 'lg' (60px), 'xl' (80px)
 */
window.shopAvatar = function(s, size = 'md') {
  if (!s) return '';
  const px = { sm: 32, md: 44, lg: 60, xl: 80 }[size] || 44;
  const fontSize = { sm: '0.7rem', md: '0.85rem', lg: '1rem', xl: '1.4rem' }[size];
  if (s.logo) {
    return `<div class="shop-avatar shop-avatar-${size}" style="background:url('${s.logo}') center/cover;width:${px}px;height:${px}px;border-radius:50%;flex-shrink:0;"></div>`;
  }
  const initials = (s.name || '').split(' ').map(w => w[0]).slice(0, 2).join('');
  return `<div class="shop-avatar shop-avatar-${size}" style="background:${s.accent || 'var(--accent)'};width:${px}px;height:${px}px;border-radius:50%;color:white;font-weight:700;font-size:${fontSize};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials}</div>`;
};

/* Debug utility — run in browser console: window.debugProducts() */
window.debugProducts = function() {
  if (!window.State) { console.log('State not loaded'); return; }
  const products = State.getAllProducts();
  console.group('🔍 Product Photos Debug — ' + products.length + ' products');
  products.forEach(p => {
    const photo = findProductPhoto(p);
    console.log(
      `${photo ? '✓' : '✗'} ${p.name} [${p.status}]`,
      { photoUrls: p.photoUrls, found: photo, posterUrl: p.models?.poster }
    );
  });
  console.groupEnd();
  return products;
};
