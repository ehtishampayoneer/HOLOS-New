/* ============================================================
   SCREEN: Shopkeeper / Customize Shop
   Block-based editor:
   - Drag blocks up/down to reorder
   - Toggle blocks on/off
   - Click text to edit it inline
   - Color overrides via pickers
   - Save to DB
   ============================================================ */

Router.register('/shopkeeper/customize', () => {
  const shop = State.get('shop') || State.getShopsList()[0];
  if (!shop) { setTimeout(()=>Router.go('/shopkeeper/login'),0); return '<div></div>'; }
  if (!shop.theme?.id) { setTimeout(()=>Router.go('/shopkeeper/themes'),0); return '<div></div>'; }
  log('Shopkeeper/Customize', 'mounted');

  const theme = ShopThemes.get(shop.theme.id);
  const blocks = shop.theme.blocks || theme.defaultBlocks.map(t => ({ type: t, enabled: true, content: {} }));
  const isFirstTime = !shop.onboarded;
  const overrides = shop.theme.colorOverrides || {};

  setTimeout(() => initCustomizeEditor(blocks), 60);

  return `
    <div class="screen cz">
      <header class="cz-top">
        <button class="btn-icon-bare cz-tb-btn" onclick="Router.go('/shopkeeper/themes')">${icon('arrow_left')}</button>
        <div class="cz-top-title">${isFirstTime ? 'Step 2 of 2 · Customize' : 'Customize shop'}</div>
        <button class="cz-preview-btn" onclick="Router.go('/customer/shop/${shop.id}')" title="Preview">${icon('eye')}</button>
      </header>

      <main class="cz-main">
        <div class="cz-layout">
          <!-- Left: Block list (the editor) -->
          <aside class="cz-sidebar">
            <div class="cz-sidebar-section">
              <h3 class="cz-sidebar-h">Theme</h3>
              <div class="cz-theme-card">
                <div class="cz-theme-swatch" style="background:${theme.colors.accent};"></div>
                <div>
                  <div class="cz-theme-name">${theme.name}</div>
                  <button class="cz-theme-change" onclick="Router.go('/shopkeeper/themes')">Change theme</button>
                </div>
              </div>
            </div>

            <div class="cz-sidebar-section">
              <h3 class="cz-sidebar-h">Colors</h3>
              <div class="cz-color-grid">
                ${[
                  { key: 'accent', label: 'Accent', def: theme.colors.accent },
                  { key: 'bg', label: 'Background', def: theme.colors.bg },
                  { key: 'ink', label: 'Text', def: theme.colors.ink },
                ].map(c => `
                  <div class="cz-color-row">
                    <label class="cz-color-label">${c.label}</label>
                    <input type="color" class="cz-color-input" data-key="${c.key}" value="${overrides[c.key] || c.def}" oninput="changeColor('${c.key}', this.value)" />
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="cz-sidebar-section">
              <h3 class="cz-sidebar-h">Sections <span class="cz-sidebar-hint">drag to reorder</span></h3>
              <div class="cz-blocks" id="cz-blocks">
                ${blocks.map((b, i) => renderBlockRow(b, i)).join('')}
              </div>

              <button class="cz-add-block-btn" onclick="openBlockPicker()">${icon('plus')} Add section</button>
            </div>

            <div class="cz-sidebar-section">
              <button class="btn btn-primary btn-large btn-block" onclick="saveCustomization()">
                ${isFirstTime ? 'Save & launch shop ✓' : 'Save changes'}
              </button>
            </div>
          </aside>

          <!-- Right: Live preview -->
          <div class="cz-preview" id="cz-preview">
            <div class="cz-preview-frame" id="cz-preview-frame">
              ${renderShopPreview(shop, blocks, theme, overrides)}
            </div>
          </div>
        </div>
      </main>

      <!-- Block picker modal -->
      <div class="cz-modal" id="cz-block-picker" style="display:none;">
        <div class="cz-modal-card">
          <div class="cz-modal-head">
            <h3>Add a section</h3>
            <button onclick="closeBlockPicker()">✕</button>
          </div>
          <div class="cz-modal-body">
            ${Object.entries(ShopThemes.BLOCK_TYPES).map(([key, def]) => `
              <button class="cz-block-option" onclick="addBlock('${key}')">
                <div class="cz-block-opt-name">${def.label}</div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Block edit modal -->
      <div class="cz-modal" id="cz-block-editor" style="display:none;">
        <div class="cz-modal-card">
          <div class="cz-modal-head">
            <h3 id="cz-block-editor-title">Edit section</h3>
            <button onclick="closeBlockEditor()">✕</button>
          </div>
          <div class="cz-modal-body" id="cz-block-editor-body"></div>
        </div>
      </div>
    </div>

    ${CUSTOMIZE_STYLES}
  `;
});

/* ============================================================
   RENDERERS
   ============================================================ */

function renderBlockRow(b, i) {
  const def = ShopThemes.BLOCK_TYPES[b.type];
  if (!def) return '';
  return `
    <div class="cz-block-row ${b.enabled ? '' : 'disabled'}" draggable="true" data-idx="${i}" data-type="${b.type}">
      <span class="cz-drag-handle" title="Drag to reorder">⋮⋮</span>
      <span class="cz-block-name">${def.label}</span>
      <div class="cz-block-actions">
        <button class="cz-block-edit" onclick="editBlock(${i})" title="Edit">${icon('settings')}</button>
        <button class="cz-block-toggle" onclick="toggleBlock(${i})" title="Toggle">${b.enabled ? '✓' : '○'}</button>
        <button class="cz-block-remove" onclick="removeBlock(${i})" title="Remove">✕</button>
      </div>
    </div>
  `;
}

function renderShopPreview(shop, blocks, theme, overrides) {
  const colors = { ...theme.colors, ...overrides };
  const previewStyle = `
    --shop-bg:${colors.bg};
    --shop-surface:${colors.surface};
    --shop-ink:${colors.ink};
    --shop-ink-dim:${colors.inkDim};
    --shop-accent:${colors.accent};
    --shop-border:${colors.border};
    --shop-radius:${theme.style.borderRadius};
    --shop-font-heading:${theme.fonts.heading};
    --shop-font-body:${theme.fonts.body};
  `;
  return `
    <div class="shp-preview" style="${previewStyle}">
      ${blocks.filter(b => b.enabled).map(b => renderBlockPreview(b, shop, theme, colors)).join('')}
    </div>
  `;
}

function renderBlockPreview(b, shop, theme, colors) {
  switch (b.type) {
    case 'hero':
      return `
        <div class="shp-hero" style="background:linear-gradient(135deg, ${colors.accent}40, ${colors.accent}10);">
          ${shop.banner ? `<img src="${shop.banner}" class="shp-hero-bg" />` : ''}
          <div class="shp-hero-content">
            <h1 class="shp-hero-title">${ShopThemes.getBlockText(b, 'title', shop.name)}</h1>
            <p class="shp-hero-sub">${ShopThemes.getBlockText(b, 'subtitle', shop.tagline || 'Welcome to our shop')}</p>
          </div>
        </div>
      `;
    case 'featured_product': {
      const prods = State.getProductsForShop(shop.id);
      const p = prods[0];
      if (!p) return '';
      return `
        <div class="shp-featured">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'Featured product')}</h2>
          <div class="shp-featured-card">
            <div class="shp-featured-img">${p.photoUrls?.[0] ? `<img src="${p.photoUrls[0]}" />` : icon('cube')}</div>
            <div class="shp-featured-info">
              <div class="shp-featured-name">${p.name}</div>
              <div class="shp-featured-price">${Locale.formatPrice(p.salePrice||p.price)}</div>
            </div>
          </div>
        </div>
      `;
    }
    case 'best_sellers': {
      const prods = State.getProductsForShop(shop.id).filter(p => p.bestSeller).slice(0, 4);
      return `
        <div class="shp-section">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'Best sellers')}</h2>
          <div class="shp-prod-row">
            ${prods.length ? prods.map(p => previewProdCard(p)).join('') : '<div class="shp-empty">No best sellers yet</div>'}
          </div>
        </div>
      `;
    }
    case 'on_offer': {
      const prods = State.getProductsForShop(shop.id).filter(p => p.offer).slice(0, 4);
      return `
        <div class="shp-section">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'On offer now')}</h2>
          <div class="shp-prod-row">
            ${prods.length ? prods.map(p => previewProdCard(p)).join('') : '<div class="shp-empty">No offers yet</div>'}
          </div>
        </div>
      `;
    }
    case 'product_grid': {
      const prods = State.getProductsForShop(shop.id);
      return `
        <div class="shp-section">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'All products')}</h2>
          <div class="shp-prod-grid">
            ${prods.map(p => previewProdCard(p)).join('')}
          </div>
        </div>
      `;
    }
    case 'about':
      return `
        <div class="shp-about">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'About this shop')}</h2>
          <p class="shp-about-body">${ShopThemes.getBlockText(b, 'body', shop.tagline || 'Quality products, handcrafted with care.')}</p>
          <div class="shp-about-meta">
            <span>${icon('user')} ${shop.owner || 'Owner'}</span>
            <span>${icon('package')} ${State.getProductsForShop(shop.id).length} products</span>
            <span>★ ${shop.rating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>
      `;
    case 'contact':
      return `
        <div class="shp-contact">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'Contact')}</h2>
          <div class="shp-contact-row">${icon('mail')} ${shop.email || 'shop@example.com'}</div>
          <div class="shp-contact-row">${icon('phone')} ${shop.phone || '+92 300 000 0000'}</div>
          <div class="shp-contact-row">${icon('map')} ${shop.city || 'Lahore'}</div>
        </div>
      `;
    case 'gallery':
      return `
        <div class="shp-section">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'Gallery')}</h2>
          <div class="shp-gallery-grid">
            ${[1,2,3,4,5,6].map(() => `<div class="shp-gallery-tile" style="background:${colors.accent}10;"></div>`).join('')}
          </div>
        </div>
      `;
    case 'category_strip':
      return `
        <div class="shp-section">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'Shop by category')}</h2>
          <div class="shp-cats">
            ${(shop.categories || []).slice(0,5).map(c => `<button class="shp-cat-btn">${c}</button>`).join('')}
          </div>
        </div>
      `;
    case 'testimonials':
      return `
        <div class="shp-section">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'What customers say')}</h2>
          <div class="shp-testimonial">"Quality is amazing, will order again." — Happy customer</div>
        </div>
      `;
    case 'qr_code':
      return `
        <div class="shp-section shp-qr-section">
          <h2 class="shp-h2">${ShopThemes.getBlockText(b, 'headline', 'Visit our shop')}</h2>
          <div class="shp-qr-box">${QRGen.generateSVG('https://holos.app/s/' + shop.id, 140)}</div>
          <div class="shp-qr-cap">Scan to open this shop</div>
        </div>
      `;
    default: return '';
  }
}

function wrapBlock(content) {
  return `<div class="shp-block">${content}</div>`;
}

function previewProdCard(p) {
  return `
    <div class="shp-prod-card">
      <div class="shp-prod-img">${p.photoUrls?.[0] ? `<img src="${p.photoUrls[0]}" />` : icon('cube')}</div>
      <div class="shp-prod-name">${p.name}</div>
      <div class="shp-prod-price">${Locale.formatPrice(p.salePrice||p.price)}</div>
    </div>
  `;
}

/* ============================================================
   EDITOR INTERACTIONS
   ============================================================ */

function initCustomizeEditor(blocks) {
  // Initialize drag-and-drop reordering on the block list
  const container = document.getElementById('cz-blocks');
  if (!container) return;
  let draggedIdx = null;

  container.querySelectorAll('.cz-block-row').forEach(row => {
    row.addEventListener('dragstart', e => {
      draggedIdx = parseInt(row.dataset.idx);
      row.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', () => row.classList.remove('dragging'));
    row.addEventListener('dragover', e => {
      e.preventDefault();
      const dragging = container.querySelector('.dragging');
      if (!dragging || dragging === row) return;
      const rect = row.getBoundingClientRect();
      const after = (e.clientY - rect.top) > rect.height / 2;
      container.insertBefore(dragging, after ? row.nextSibling : row);
    });
    row.addEventListener('drop', e => {
      e.preventDefault();
      commitReorder();
    });
  });
}

function commitReorder() {
  const container = document.getElementById('cz-blocks');
  const shop = State.get('shop');
  const newOrder = [...container.querySelectorAll('.cz-block-row')].map(row => {
    const idx = parseInt(row.dataset.idx);
    return shop.theme.blocks[idx];
  });
  shop.theme.blocks = newOrder;
  State.set('shop', shop);
  refreshPreview();
  // Re-render the block list with fresh indices
  rebuildBlockList();
}

function rebuildBlockList() {
  const shop = State.get('shop');
  const container = document.getElementById('cz-blocks');
  if (!container) return;
  container.innerHTML = shop.theme.blocks.map((b, i) => renderBlockRow(b, i)).join('');
  initCustomizeEditor(shop.theme.blocks);
}

function toggleBlock(i) {
  const shop = State.get('shop');
  shop.theme.blocks[i].enabled = !shop.theme.blocks[i].enabled;
  State.set('shop', shop);
  rebuildBlockList();
  refreshPreview();
}

function removeBlock(i) {
  if (!confirm('Remove this section?')) return;
  const shop = State.get('shop');
  shop.theme.blocks.splice(i, 1);
  State.set('shop', shop);
  rebuildBlockList();
  refreshPreview();
}

function openBlockPicker() {
  document.getElementById('cz-block-picker').style.display = 'flex';
}
function closeBlockPicker() {
  document.getElementById('cz-block-picker').style.display = 'none';
}
function addBlock(type) {
  const shop = State.get('shop');
  shop.theme.blocks.push({ type, enabled: true, content: {} });
  State.set('shop', shop);
  closeBlockPicker();
  rebuildBlockList();
  refreshPreview();
}

function editBlock(i) {
  const shop = State.get('shop');
  const block = shop.theme.blocks[i];
  const def = ShopThemes.BLOCK_TYPES[block.type];
  document.getElementById('cz-block-editor-title').textContent = 'Edit: ' + def.label;
  const body = document.getElementById('cz-block-editor-body');
  body.innerHTML = def.editable.filter(k => k !== 'image' && k !== 'product_id').map(key => {
    const cur = block.content[key] || '';
    const isLong = key === 'body';
    return `
      <div class="fr-field">
        <label class="fr-label">${key.charAt(0).toUpperCase() + key.slice(1)}</label>
        ${isLong
          ? `<textarea class="fr-input fr-textarea" rows="3" data-key="${key}">${cur}</textarea>`
          : `<input type="text" class="fr-input" data-key="${key}" value="${cur}" />`}
      </div>
    `;
  }).join('') + `
    <button class="btn btn-primary btn-block" onclick="saveBlockEdit(${i})">Save</button>
  `;
  document.getElementById('cz-block-editor').style.display = 'flex';
}
function closeBlockEditor() {
  document.getElementById('cz-block-editor').style.display = 'none';
}
function saveBlockEdit(i) {
  const shop = State.get('shop');
  const body = document.getElementById('cz-block-editor-body');
  const content = {};
  body.querySelectorAll('[data-key]').forEach(el => { content[el.dataset.key] = el.value; });
  shop.theme.blocks[i].content = content;
  State.set('shop', shop);
  closeBlockEditor();
  refreshPreview();
}

function changeColor(key, value) {
  const shop = State.get('shop');
  shop.theme.colorOverrides = shop.theme.colorOverrides || {};
  shop.theme.colorOverrides[key] = value;

  // Auto-adjust derived colors when background changes — fixes the
  // "everything becomes invisible when I pick dark bg" problem.
  if (key === 'bg') {
    const lum = colorLuminance(value);
    // Dark background → light text + slightly-lighter surface
    if (lum < 0.4) {
      if (!shop.theme.colorOverrides._userTouchedInk) shop.theme.colorOverrides.ink = '#FFFFFF';
      if (!shop.theme.colorOverrides._userTouchedSurface) shop.theme.colorOverrides.surface = lightenColor(value, 0.08);
      if (!shop.theme.colorOverrides._userTouchedBorder) shop.theme.colorOverrides.border = lightenColor(value, 0.15);
      // sync the visible color pickers
      const inkInput = document.querySelector('[data-key="ink"]');
      if (inkInput) inkInput.value = shop.theme.colorOverrides.ink;
    } else {
      // Light background → dark text + near-white surface (so card content stays readable)
      if (!shop.theme.colorOverrides._userTouchedInk) shop.theme.colorOverrides.ink = '#1A1A1A';
      if (!shop.theme.colorOverrides._userTouchedSurface) shop.theme.colorOverrides.surface = '#FFFFFF';
      if (!shop.theme.colorOverrides._userTouchedBorder) shop.theme.colorOverrides.border = 'rgba(0,0,0,0.08)';
      const inkInput = document.querySelector('[data-key="ink"]');
      if (inkInput) inkInput.value = shop.theme.colorOverrides.ink;
    }
  }
  // Mark when seller manually touched a color so we don't auto-override it later
  if (key === 'ink') shop.theme.colorOverrides._userTouchedInk = true;
  if (key === 'surface') shop.theme.colorOverrides._userTouchedSurface = true;
  if (key === 'border') shop.theme.colorOverrides._userTouchedBorder = true;

  State.set('shop', shop);
  refreshPreview();
}

/* ---- Color utilities ---- */
function colorLuminance(hex) {
  const c = hex.replace('#','');
  const r = parseInt(c.substr(0,2),16) / 255;
  const g = parseInt(c.substr(2,2),16) / 255;
  const b = parseInt(c.substr(4,2),16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
function lightenColor(hex, amount) {
  const c = hex.replace('#','');
  const r = Math.max(0, Math.min(255, parseInt(c.substr(0,2),16) + Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, parseInt(c.substr(2,2),16) + Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, parseInt(c.substr(4,2),16) + Math.round(255 * amount)));
  return '#' + [r,g,b].map(n => n.toString(16).padStart(2,'0')).join('');
}

function refreshPreview() {
  const shop = State.get('shop');
  const theme = ShopThemes.get(shop.theme.id);
  const frame = document.getElementById('cz-preview-frame');
  if (frame) frame.innerHTML = renderShopPreview(shop, shop.theme.blocks, theme, shop.theme.colorOverrides || {});
}

async function saveCustomization() {
  const shop = State.get('shop');
  try {
    if (window.DB && DB.isReady()) {
      await DB.updateShopTheme(shop.id, shop.theme, true);
    }
    shop.onboarded = true;
    State.set('shop', shop);
    State.update('shops', s => ({ ...s, [shop.id]: { ...s[shop.id], onboarded: true, theme: shop.theme } }));
    log('Shopkeeper/Customize', 'theme + customization saved');
    alert('Shop saved! Customers will now see your new design.');
    Router.go('/shopkeeper/home');
  } catch (e) {
    alert('Save failed: ' + e.message);
  }
}

const CUSTOMIZE_STYLES = `
<style>
.cz { min-height: 100vh; background: var(--bg); }
.cz-top { display: flex; align-items: center; justify-content: space-between; padding: var(--s-3) var(--s-5); background: var(--accent); position: sticky; top: 0; z-index: 10; }
.cz-tb-btn, .cz-top-title { color: white !important; }
.cz-top-title { font-weight: 700; font-size: var(--t-h2); }
.cz-preview-btn { background: rgba(255,255,255,0.15); color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; }
.cz-preview-btn svg { width: 16px; height: 16px; }

.cz-main { max-width: 1400px; margin: 0 auto; padding: 0; }
.cz-layout { display: grid; grid-template-columns: 360px 1fr; gap: 0; min-height: calc(100vh - 64px); }
@media (max-width: 900px) { .cz-layout { grid-template-columns: 1fr; } }

.cz-sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: var(--s-5); overflow-y: auto; }
.cz-sidebar-section { margin-bottom: var(--s-6); }
.cz-sidebar-h { font-size: var(--t-small); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-dim); margin-bottom: var(--s-3); display: flex; justify-content: space-between; align-items: center; }
.cz-sidebar-hint { font-size: var(--t-micro); font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--ink-muted); }

.cz-theme-card { display: flex; align-items: center; gap: var(--s-3); padding: var(--s-3); background: var(--bg); border-radius: var(--r-md); }
.cz-theme-swatch { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
.cz-theme-name { font-size: var(--t-body); font-weight: 700; }
.cz-theme-change { font-size: var(--t-micro); color: var(--accent); cursor: pointer; background: none; border: none; padding: 0; margin-top: 2px; }

.cz-color-grid { display: flex; flex-direction: column; gap: var(--s-2); }
.cz-color-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-2) var(--s-3); background: var(--bg); border-radius: var(--r-sm); }
.cz-color-label { font-size: var(--t-small); }
.cz-color-input { width: 36px; height: 28px; border: none; cursor: pointer; padding: 0; border-radius: var(--r-sm); }

.cz-blocks { display: flex; flex-direction: column; gap: var(--s-2); margin-bottom: var(--s-3); }
.cz-block-row { display: flex; align-items: center; gap: var(--s-2); padding: var(--s-2) var(--s-3); background: var(--bg); border-radius: var(--r-sm); cursor: grab; transition: opacity 160ms; }
.cz-block-row.dragging { opacity: 0.4; cursor: grabbing; }
.cz-block-row.disabled { opacity: 0.5; }
.cz-drag-handle { color: var(--ink-muted); cursor: grab; user-select: none; font-size: 0.7rem; }
.cz-block-name { flex: 1; font-size: var(--t-small); font-weight: 500; }
.cz-block-actions { display: flex; gap: 4px; }
.cz-block-actions button { width: 26px; height: 26px; border-radius: 50%; border: none; background: transparent; color: var(--ink-dim); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
.cz-block-actions button:hover { background: var(--surface-elev); color: var(--ink); }
.cz-block-actions svg { width: 12px; height: 12px; }
.cz-block-remove:hover { color: var(--danger) !important; }

.cz-add-block-btn { width: 100%; padding: var(--s-3); border: 2px dashed var(--border-strong); border-radius: var(--r-md); color: var(--ink-dim); font-size: var(--t-small); font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: var(--s-2); background: none; transition: all 160ms; }
.cz-add-block-btn:hover { border-color: var(--accent); color: var(--accent); }
.cz-add-block-btn svg { width: 14px; height: 14px; }

.cz-preview { background: var(--bg-deep); padding: var(--s-5); overflow-y: auto; max-height: calc(100vh - 64px); }
.cz-preview-frame { max-width: 800px; margin: 0 auto; background: var(--shop-bg, white); border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--shadow-lg); }

/* The shop preview content uses --shop-* variables set inline */
.shp-preview { font-family: var(--shop-font-body); color: var(--shop-ink); background: var(--shop-bg); padding: 0; }
.shp-h2 { font-family: var(--shop-font-heading); color: var(--shop-ink); font-weight: var(--shop-header-weight); font-size: 1.3rem; margin-bottom: var(--s-3); padding: 0 var(--s-5); }
.shp-hero { position: relative; min-height: 220px; display: flex; align-items: flex-end; padding: var(--s-6) var(--s-5); overflow: hidden; }
.shp-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.6; }
.shp-hero-content { position: relative; z-index: 1; }
.shp-hero-title { font-family: var(--shop-font-heading); color: var(--shop-ink); font-size: 1.8rem; font-weight: var(--shop-header-weight); letter-spacing: -0.02em; margin-bottom: var(--s-2); }
.shp-hero-sub { color: var(--shop-ink-dim); }
.shp-section { background: var(--shop-surface); margin: var(--s-3); border-radius: var(--shop-radius); border: 1px solid var(--shop-border); padding: var(--s-4) 0; overflow: hidden; }
.shp-section .shp-h2 { padding: 0 var(--s-5); }
.shp-prod-row { display: flex; gap: var(--s-3); overflow-x: auto; padding: 0 var(--s-5); scrollbar-width: none; }
.shp-prod-row::-webkit-scrollbar { display: none; }
.shp-prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--s-3); padding: 0 var(--s-5); }
.shp-prod-card { background: var(--shop-surface); border-radius: var(--shop-radius); border: 1px solid var(--shop-border); overflow: hidden; flex-shrink: 0; min-width: 140px; }
.shp-prod-img { aspect-ratio: 1; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; color: var(--shop-ink-dim); overflow: hidden; }
.shp-prod-img img { width: 100%; height: 100%; object-fit: cover; }
.shp-prod-img svg { width: 36px; height: 36px; opacity: 0.4; }
.shp-prod-name { padding: var(--s-3) var(--s-3) 4px; font-size: var(--t-small); font-weight: 600; color: var(--shop-ink); }
.shp-prod-price { padding: 0 var(--s-3) var(--s-3); font-size: var(--t-small); font-weight: 700; color: var(--shop-accent); }
.shp-empty { padding: var(--s-5); color: var(--shop-ink-dim); text-align: center; font-size: var(--t-small); }
.shp-block { background: var(--shop-surface); margin: var(--s-3); border-radius: var(--shop-radius); border: 1px solid var(--shop-border); padding: var(--s-4) 0; }
.shp-featured { padding: var(--s-5); background: var(--shop-surface); margin: var(--s-3); border-radius: var(--shop-radius); border: 1px solid var(--shop-border); }
.shp-featured-card { display: grid; grid-template-columns: 200px 1fr; gap: var(--s-4); align-items: center; padding: var(--s-3) var(--s-5); }
.shp-featured-img { aspect-ratio: 1; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; border-radius: var(--shop-radius); overflow: hidden; }
.shp-featured-img img { width: 100%; height: 100%; object-fit: cover; }
.shp-featured-name { font-size: 1.1rem; font-weight: 700; color: var(--shop-ink); margin-bottom: var(--s-2); }
.shp-featured-price { font-size: 1.3rem; font-weight: 700; color: var(--shop-accent); }
.shp-about { padding: var(--s-5); background: var(--shop-surface); margin: var(--s-3); border-radius: var(--shop-radius); border: 1px solid var(--shop-border); }
.shp-about-body { line-height: 1.6; color: var(--shop-ink-dim); margin-bottom: var(--s-4); }
.shp-about-meta { display: flex; flex-wrap: wrap; gap: var(--s-4); font-size: var(--t-small); color: var(--shop-ink-dim); }
.shp-about-meta svg { width: 14px; height: 14px; display: inline-block; vertical-align: middle; }
.shp-contact { padding: var(--s-5); }
.shp-contact-row { padding: var(--s-2) 0; font-size: var(--t-small); color: var(--shop-ink-dim); display: flex; align-items: center; gap: var(--s-2); }
.shp-contact-row svg { width: 14px; height: 14px; }
.shp-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 0 var(--s-5); }
.shp-gallery-tile { aspect-ratio: 1; border-radius: var(--shop-radius); }
.shp-cats { display: flex; flex-wrap: wrap; gap: var(--s-2); padding: 0 var(--s-5); }
.shp-cat-btn { padding: var(--s-2) var(--s-4); background: var(--shop-surface); border: 1px solid var(--shop-border); border-radius: var(--r-pill); font-size: var(--t-small); color: var(--shop-ink); }
.shp-testimonial { padding: var(--s-5); margin: 0 var(--s-5); background: var(--shop-surface); border-left: 3px solid var(--shop-accent); font-style: italic; color: var(--shop-ink-dim); border-radius: var(--shop-radius); }
.shp-qr-section { text-align: center; padding: var(--s-6) var(--s-5); }
.shp-qr-box { width: 140px; height: 140px; margin: 0 auto var(--s-3); }
.shp-qr-box svg { width: 100%; height: 100%; }
.shp-qr-cap { font-size: var(--t-small); color: var(--shop-ink-dim); }

.cz-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: var(--s-5); }
.cz-modal-card { background: var(--surface); border-radius: var(--r-lg); max-width: 480px; width: 100%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; }
.cz-modal-head { display: flex; justify-content: space-between; align-items: center; padding: var(--s-4) var(--s-5); border-bottom: 1px solid var(--border); }
.cz-modal-head h3 { font-size: var(--t-h2); font-weight: 700; }
.cz-modal-head button { width: 28px; height: 28px; border-radius: 50%; background: var(--bg); border: none; cursor: pointer; font-size: 0.9rem; }
.cz-modal-body { padding: var(--s-4) var(--s-5); overflow-y: auto; }
.cz-block-option { display: block; width: 100%; padding: var(--s-3) var(--s-4); margin-bottom: var(--s-2); background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); text-align: left; cursor: pointer; transition: all 160ms; }
.cz-block-option:hover { border-color: var(--accent); background: var(--accent-soft); }
.cz-block-opt-name { font-weight: 600; }
</style>
`;
