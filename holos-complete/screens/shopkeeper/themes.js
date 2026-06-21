/* ============================================================
   SCREEN: Shopkeeper / Theme Picker
   Seller picks one of 10 themes. Each theme has a live preview
   showing how the shop will look. After picking, they go to
   the customize screen to tweak.
   ============================================================ */

Router.register('/shopkeeper/themes', () => {
  const shop = State.get('shop') || State.getShopsList()[0];
  if (!shop) { setTimeout(()=>Router.go('/shopkeeper/login'),0); return '<div></div>'; }
  State.set('shop', shop);
  log('Shopkeeper/Themes', 'mounted');

  const currentThemeId = shop.theme?.id || 'minimal_light';
  const isFirstTime = !shop.onboarded;

  return `
    <div class="screen th">
      <header class="th-top">
        ${!isFirstTime ? `<button class="btn-icon-bare th-tb-btn" onclick="Router.go('/shopkeeper/home')">${icon('arrow_left')}</button>` : '<div style="width:40px;"></div>'}
        <div class="th-top-title">${isFirstTime ? 'Choose your shop theme' : 'Change theme'}</div>
        <div style="width:40px;"></div>
      </header>

      <main class="th-main">
        ${isFirstTime ? `
          <div class="th-onboard-note">
            <div class="th-onboard-badge">Step 1 of 2</div>
            <h2 class="th-onboard-title">Welcome to HOLOS — let's design your shop</h2>
            <p class="th-onboard-sub">Pick a theme that matches your brand. You can customize colors, text, and layout in the next step.</p>
          </div>
        ` : `
          <p class="th-intro">Your customers see this look when they visit your shop. Pick one and customize it next.</p>
        `}

        <div class="th-grid">
          ${ShopThemes.THEMES.map(t => `
            <div class="th-card ${t.id === currentThemeId ? 'selected' : ''}" onclick="selectTheme('${t.id}')">
              <div class="th-preview" style="background:${t.colors.bg};">
                <div class="th-preview-header" style="background:${t.colors.accent};"></div>
                <div class="th-preview-body">
                  <div class="th-preview-title" style="color:${t.colors.ink};font-family:${t.fonts.heading};">${t.name}</div>
                  <div class="th-preview-line" style="background:${t.colors.inkDim};opacity:0.3;"></div>
                  <div class="th-preview-grid">
                    <div class="th-preview-card" style="background:${t.colors.surface};border-radius:${t.style.borderRadius};border:1px solid ${t.colors.border};"></div>
                    <div class="th-preview-card" style="background:${t.colors.surface};border-radius:${t.style.borderRadius};border:1px solid ${t.colors.border};"></div>
                    <div class="th-preview-card" style="background:${t.colors.surface};border-radius:${t.style.borderRadius};border:1px solid ${t.colors.border};"></div>
                    <div class="th-preview-card" style="background:${t.colors.surface};border-radius:${t.style.borderRadius};border:1px solid ${t.colors.border};"></div>
                  </div>
                </div>
              </div>
              <div class="th-info">
                <div class="th-info-name">${t.name}</div>
                <div class="th-info-vibe">${t.vibe}</div>
                <div class="th-info-colors">
                  ${t.preview.map(c => `<span class="th-swatch" style="background:${c};"></span>`).join('')}
                </div>
              </div>
              ${t.id === currentThemeId ? `<div class="th-selected-badge">✓ Current</div>` : ''}
            </div>
          `).join('')}
        </div>

        <h2 class="th-section-h">Choose your layout</h2>
        <p class="th-section-sub">The layout determines your shop's overall structure. The theme above sets the colors. You can change either anytime.</p>
        <div class="th-layout-grid">
          ${ShopLayouts.LAYOUTS.map((l, i) => `
            <div class="th-layout-card ${l.id === (shop.theme?.layout || 'classic') ? 'selected' : ''}" data-layout="${l.id}" onclick="selectLayout('${l.id}')">
              <div class="th-layout-preview th-lp-${l.id}">
                ${layoutThumbnail(l.id)}
              </div>
              <div class="th-layout-info">
                <div class="th-layout-name">${l.name}</div>
                <div class="th-layout-desc">${l.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="th-bottom-bar">
          <button class="btn btn-primary btn-large btn-block" onclick="confirmTheme()" id="th-confirm-btn">
            ${isFirstTime ? 'Continue to customize →' : 'Save & continue →'}
          </button>
        </div>
      </main>
    </div>

    <style>
      .th { min-height: 100vh; background: var(--bg); padding-bottom: 100px; }
      .th-top { display: flex; align-items: center; justify-content: space-between; padding: var(--s-3) var(--s-5); background: var(--accent); position: sticky; top: 0; z-index: 10; }
      .th-tb-btn, .th-top-title { color: white !important; }
      .th-top-title { font-weight: 700; font-size: var(--t-h2); }
      .th-main { max-width: 1100px; margin: 0 auto; padding: var(--s-5); }

      .th-onboard-note { background: linear-gradient(135deg, var(--accent), var(--accent-hover)); color: white; padding: var(--s-6); border-radius: var(--r-xl); margin-bottom: var(--s-6); }
      .th-onboard-badge { display: inline-block; font-size: var(--t-micro); font-weight: 700; letter-spacing: 0.12em; background: rgba(255,255,255,0.2); padding: 4px var(--s-3); border-radius: var(--r-pill); margin-bottom: var(--s-3); }
      .th-onboard-title { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: var(--s-2); }
      .th-onboard-sub { opacity: 0.85; line-height: 1.5; }
      .th-intro { color: var(--ink-dim); margin-bottom: var(--s-5); line-height: 1.5; }

      .th-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--s-4); margin-bottom: var(--s-7); }
      .th-card { background: var(--surface); border-radius: var(--r-lg); border: 2px solid var(--border); overflow: hidden; cursor: pointer; transition: all var(--d-fast); position: relative; }
      .th-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
      .th-card.selected { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }

      .th-preview { height: 180px; padding: var(--s-3); display: flex; flex-direction: column; gap: var(--s-2); }
      .th-preview-header { height: 12px; border-radius: 4px; opacity: 0.9; }
      .th-preview-body { flex: 1; display: flex; flex-direction: column; gap: var(--s-2); }
      .th-preview-title { font-size: 0.95rem; font-weight: 700; }
      .th-preview-line { height: 2px; width: 50%; border-radius: 1px; }
      .th-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; flex: 1; }
      .th-preview-card { min-height: 30px; }

      .th-info { padding: var(--s-4); border-top: 1px solid var(--border); }
      .th-info-name { font-size: var(--t-body); font-weight: 700; margin-bottom: 4px; }
      .th-info-vibe { font-size: var(--t-micro); color: var(--ink-dim); margin-bottom: var(--s-3); line-height: 1.4; }
      .th-info-colors { display: flex; gap: var(--s-1); }
      .th-swatch { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

      .th-selected-badge { position: absolute; top: var(--s-3); right: var(--s-3); background: var(--accent); color: white; font-size: var(--t-micro); font-weight: 700; padding: 4px var(--s-2); border-radius: var(--r-pill); }

      .th-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: var(--s-4) var(--s-5); background: rgba(248,246,241,0.95); backdrop-filter: blur(10px); border-top: 1px solid var(--border); z-index: 100; }
      .th-bottom-bar .btn-block { max-width: 480px; margin: 0 auto; display: block; }
    </style>
  `;
});

let _selectedThemeId = null;
function selectTheme(themeId) {
  _selectedThemeId = themeId;
  document.querySelectorAll('.th-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  // Update confirm button text
  const btn = document.getElementById('th-confirm-btn');
  if (btn) {
    const theme = ShopThemes.get(themeId);
    btn.innerHTML = `Continue with "${theme.name}" →`;
  }
}

async function confirmTheme() {
  const shop = State.get('shop');
  const themeId = _selectedThemeId || shop.theme?.id || 'minimal_light';
  const theme = ShopThemes.get(themeId);

  // Build the default theme object with default blocks for the chosen theme
  const themeObj = {
    id: themeId,
    layout: shop.theme?.layout || 'classic',
    colorOverrides: shop.theme?.colorOverrides || {},
    blocks: shop.theme?.blocks || theme.defaultBlocks.map(type => ({ type, enabled: true, content: {} })),
  };

  shop.theme = themeObj;
  State.set('shop', shop);
  State.update('shops', s => ({ ...s, [shop.id]: { ...s[shop.id], theme: themeObj } }));

  try {
    if (window.DB && DB.isReady()) {
      await DB.updateShopTheme(shop.id, themeObj);
    }
    log('Shopkeeper/Themes', `theme set: ${themeId}`);
  } catch (e) {
    log('Shopkeeper/Themes', 'save failed: ' + e.message, 'warn');
  }

  Router.go('/shopkeeper/customize');
}

function layoutThumbnail(layoutId) {
  // Visual thumbnails that hint at the layout's structure
  switch (layoutId) {
    case 'classic':
      return '<div class="thumb-bar"></div><div class="thumb-row"><div></div><div></div><div></div></div><div class="thumb-row"><div></div><div></div><div></div></div>';
    case 'apple':
      return '<div class="thumb-hero"></div><div class="thumb-fullscreen"></div><div class="thumb-row"><div></div><div></div></div>';
    case 'netflix':
      return '<div class="thumb-banner"></div><div class="thumb-strip"><div></div><div></div><div></div><div></div></div><div class="thumb-strip"><div></div><div></div><div></div><div></div></div>';
    case 'bento':
      return '<div class="thumb-bento"><div class="b-big"></div><div class="b-sm"></div><div class="b-sm"></div><div class="b-wide"></div><div class="b-sm"></div><div class="b-sm"></div></div>';
    default:
      return '';
  }
}

function selectLayout(layoutId) {
  const shop = State.get('shop');
  shop.theme = shop.theme || {};
  shop.theme.layout = layoutId;
  State.set('shop', shop);
  document.querySelectorAll('.th-layout-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
}

// Inject layout selector styles
(function() {
  if (document.getElementById('th-layout-styles')) return;
  const s = document.createElement('style');
  s.id = 'th-layout-styles';
  s.textContent = `
    .th-section-h { font-size: var(--t-h2); font-weight: 700; margin: var(--s-6) 0 var(--s-2); letter-spacing: -0.01em; }
    .th-section-sub { color: var(--ink-dim); margin-bottom: var(--s-5); line-height: 1.5; }
    .th-layout-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--s-4); margin-bottom: var(--s-7); }
    .th-layout-card { background: var(--surface); border: 2px solid var(--border); border-radius: var(--r-lg); overflow: hidden; cursor: pointer; transition: all var(--d-fast); }
    .th-layout-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .th-layout-card.selected { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
    .th-layout-preview { height: 140px; background: #f5f5f5; padding: var(--s-3); display: flex; flex-direction: column; gap: 4px; }
    .th-layout-info { padding: var(--s-3) var(--s-4); border-top: 1px solid var(--border); }
    .th-layout-name { font-weight: 700; margin-bottom: 2px; }
    .th-layout-desc { font-size: var(--t-micro); color: var(--ink-dim); line-height: 1.4; }

    /* Thumbnail visual hints */
    .thumb-bar { height: 8px; background: #999; border-radius: 2px; }
    .thumb-row { display: flex; gap: 4px; flex: 1; }
    .thumb-row > div { flex: 1; background: #ccc; border-radius: 2px; }
    .thumb-hero { height: 60%; background: linear-gradient(135deg, #333, #666); border-radius: 4px; }
    .thumb-fullscreen { height: 20%; background: #999; border-radius: 2px; }
    .thumb-banner { height: 40%; background: linear-gradient(to right, #222, #444); border-radius: 4px; }
    .thumb-strip { display: flex; gap: 3px; height: 18%; }
    .thumb-strip > div { flex: 1; background: #555; border-radius: 2px; }
    .thumb-bento { display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 4px; height: 100%; }
    .thumb-bento .b-big { grid-row: 1 / 3; background: linear-gradient(135deg, #333, #666); border-radius: 4px; }
    .thumb-bento .b-sm { background: #aaa; border-radius: 2px; }
    .thumb-bento .b-wide { grid-column: 2 / 4; background: #888; border-radius: 2px; }
  `;
  document.head.appendChild(s);
})();
