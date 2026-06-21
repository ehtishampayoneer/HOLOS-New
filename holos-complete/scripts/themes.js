/* ============================================================
   HOLOS — Shop Themes
   10 distinct layout themes. Each theme defines:
     - id, name, vibe (description)
     - colors (CSS variables that override defaults)
     - typography (font choices)
     - layout key (which block ordering/template to use)
     - default blocks (which sections are on by default, in what order)
   Sellers pick one of these, then customize via the editor.
   ============================================================ */

const ShopThemes = (() => {

  /* The block types available on a shop page */
  const BLOCK_TYPES = {
    hero: { label: 'Hero / Banner', icon: 'image', editable: ['title','subtitle','image'] },
    featured_product: { label: 'Featured Product', icon: 'star', editable: ['product_id','headline'] },
    best_sellers: { label: 'Best Sellers', icon: 'award', editable: ['headline'] },
    on_offer: { label: 'On Offer', icon: 'tag', editable: ['headline'] },
    product_grid: { label: 'All Products', icon: 'grid', editable: ['headline'] },
    category_strip: { label: 'Categories', icon: 'tabs', editable: ['headline'] },
    about: { label: 'About the Shop', icon: 'user', editable: ['headline','body'] },
    contact: { label: 'Contact / Info', icon: 'mail', editable: ['headline'] },
    gallery: { label: 'Gallery / Lookbook', icon: 'image', editable: ['headline'] },
    testimonials: { label: 'Testimonials', icon: 'quote', editable: ['headline'] },
    qr_code: { label: 'Shop QR Code', icon: 'qr', editable: ['headline'] },
  };

  /* The 10 themes */
  const THEMES = [
    {
      id: 'minimal_light',
      name: 'Minimal Light',
      vibe: 'Clean, airy, lots of whitespace — Apple-inspired',
      preview: ['#FFFFFF', '#1A1A1A', '#666666'],
      colors: { bg: '#FFFFFF', surface: '#FAFAFA', ink: '#1A1A1A', inkDim: '#666666', accent: '#000000', border: 'rgba(0,0,0,0.08)' },
      fonts: { heading: '"Inter", sans-serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '4px', headerWeight: 700, spacing: 'wide' },
      defaultBlocks: ['hero','best_sellers','product_grid','about'],
    },
    {
      id: 'bold_dark',
      name: 'Bold Dark',
      vibe: 'Dark mode, neon accents — for tech brands',
      preview: ['#0A0A0A', '#5FEAAA', '#FFFFFF'],
      colors: { bg: '#0A0A0A', surface: '#141414', ink: '#FFFFFF', inkDim: '#A0A0A0', accent: '#5FEAAA', border: 'rgba(255,255,255,0.08)' },
      fonts: { heading: '"Inter", sans-serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '6px', headerWeight: 800, spacing: 'normal' },
      defaultBlocks: ['hero','featured_product','best_sellers','product_grid','about'],
    },
    {
      id: 'warm_boutique',
      name: 'Warm Boutique',
      vibe: 'Cream, beige, serif — Anthropologie-style',
      preview: ['#F5EFE6', '#8B5E3C', '#3D2C1F'],
      colors: { bg: '#F5EFE6', surface: '#FFFCF7', ink: '#3D2C1F', inkDim: '#7A6B5F', accent: '#8B5E3C', border: 'rgba(139,94,60,0.15)' },
      fonts: { heading: '"Playfair Display", serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '2px', headerWeight: 700, spacing: 'wide' },
      defaultBlocks: ['hero','about','best_sellers','product_grid','gallery'],
    },
    {
      id: 'gold_luxury',
      name: 'Gold Luxury',
      vibe: 'Navy + gold — for jewelry, watches, premium',
      preview: ['#0E1B2C', '#D4AF37', '#FFFFFF'],
      colors: { bg: '#FAF8F3', surface: '#FFFFFF', ink: '#0E1B2C', inkDim: '#5A6678', accent: '#D4AF37', border: 'rgba(14,27,44,0.12)' },
      fonts: { heading: '"Playfair Display", serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '0px', headerWeight: 600, spacing: 'wide' },
      defaultBlocks: ['hero','featured_product','best_sellers','product_grid','testimonials','about'],
    },
    {
      id: 'earthy_natural',
      name: 'Earthy Natural',
      vibe: 'Terracotta, sage, olive — handmade & artisan',
      preview: ['#F3EFE6', '#A35F3E', '#5C6E4A'],
      colors: { bg: '#F3EFE6', surface: '#FFFFFF', ink: '#2C2418', inkDim: '#6B5F4F', accent: '#A35F3E', border: 'rgba(163,95,62,0.18)' },
      fonts: { heading: '"Inter", sans-serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '12px', headerWeight: 700, spacing: 'normal' },
      defaultBlocks: ['hero','about','best_sellers','product_grid','gallery','contact'],
    },
    {
      id: 'modern_marketplace',
      name: 'Modern Marketplace',
      vibe: 'Clean grid, vibrant — Amazon-style focus on products',
      preview: ['#FFFFFF', '#FF6B35', '#1A1A1A'],
      colors: { bg: '#FFFFFF', surface: '#F7F7F7', ink: '#1A1A1A', inkDim: '#666666', accent: '#FF6B35', border: 'rgba(0,0,0,0.08)' },
      fonts: { heading: '"Inter", sans-serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '8px', headerWeight: 700, spacing: 'normal' },
      defaultBlocks: ['hero','category_strip','best_sellers','on_offer','product_grid'],
    },
    {
      id: 'lookbook_editorial',
      name: 'Lookbook Editorial',
      vibe: 'Magazine-style, large imagery — for fashion',
      preview: ['#FFFFFF', '#000000', '#E8E8E8'],
      colors: { bg: '#FFFFFF', surface: '#FAFAFA', ink: '#000000', inkDim: '#888888', accent: '#000000', border: 'rgba(0,0,0,0.1)' },
      fonts: { heading: '"Playfair Display", serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '0px', headerWeight: 800, spacing: 'wide' },
      defaultBlocks: ['hero','gallery','featured_product','product_grid','about'],
    },
    {
      id: 'tech_electronics',
      name: 'Tech Electronics',
      vibe: 'Sleek, blue accents — for electronics, gadgets',
      preview: ['#0F1419', '#0084FF', '#FFFFFF'],
      colors: { bg: '#0F1419', surface: '#1A2028', ink: '#FFFFFF', inkDim: '#9BA1A8', accent: '#0084FF', border: 'rgba(255,255,255,0.08)' },
      fonts: { heading: '"Inter", sans-serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '8px', headerWeight: 600, spacing: 'normal' },
      defaultBlocks: ['hero','featured_product','category_strip','product_grid','about'],
    },
    {
      id: 'vibrant_pop',
      name: 'Vibrant Pop',
      vibe: 'Bright, playful — for kids, toys, gifts',
      preview: ['#FFF5E6', '#FF4D6D', '#5E60CE'],
      colors: { bg: '#FFF5E6', surface: '#FFFFFF', ink: '#2C2C54', inkDim: '#6B6B95', accent: '#FF4D6D', border: 'rgba(255,77,109,0.15)' },
      fonts: { heading: '"Inter", sans-serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '20px', headerWeight: 800, spacing: 'normal' },
      defaultBlocks: ['hero','category_strip','best_sellers','product_grid','about'],
    },
    {
      id: 'south_asian_festive',
      name: 'South Asian Festive',
      vibe: 'Rich jewel tones — for bridal, traditional wear, festivals',
      preview: ['#FFF6EC', '#A52A2A', '#D4AF37'],
      colors: { bg: '#FFF6EC', surface: '#FFFFFF', ink: '#3D1414', inkDim: '#7A4A4A', accent: '#A52A2A', border: 'rgba(165,42,42,0.18)' },
      fonts: { heading: '"Playfair Display", serif', body: '"Inter", sans-serif' },
      style: { borderRadius: '8px', headerWeight: 700, spacing: 'wide' },
      defaultBlocks: ['hero','featured_product','gallery','best_sellers','product_grid','about','contact'],
    },
  ];

  /* Get a theme by id (fallback to first if not found) */
  function get(id) {
    return THEMES.find(t => t.id === id) || THEMES[0];
  }

  /* Apply a theme to a DOM element by setting CSS variables */
  function applyToElement(el, theme, customColors = {}) {
    if (!el || !theme) return;
    const colors = { ...theme.colors, ...customColors };
    el.style.setProperty('--shop-bg', colors.bg);
    el.style.setProperty('--shop-surface', colors.surface);
    el.style.setProperty('--shop-ink', colors.ink);
    el.style.setProperty('--shop-ink-dim', colors.inkDim);
    el.style.setProperty('--shop-accent', colors.accent);
    el.style.setProperty('--shop-border', colors.border);
    el.style.setProperty('--shop-font-heading', theme.fonts.heading);
    el.style.setProperty('--shop-font-body', theme.fonts.body);
    el.style.setProperty('--shop-radius', theme.style.borderRadius);
    el.style.setProperty('--shop-header-weight', theme.style.headerWeight);
  }

  /* Compute the "active blocks" for a shop given its theme + overrides */
  function getActiveBlocks(shop) {
    const theme = get(shop?.theme?.id);
    // If seller has saved a custom block order, use it; otherwise use theme default
    if (shop?.theme?.blocks?.length) return shop.theme.blocks;
    return theme.defaultBlocks.map(type => ({ type, enabled: true, content: {} }));
  }

  /* Get the custom text for a block (or fall back to default) */
  function getBlockText(block, key, fallback) {
    return block?.content?.[key] || fallback;
  }

  return { THEMES, BLOCK_TYPES, get, applyToElement, getActiveBlocks, getBlockText };
})();

window.ShopThemes = ShopThemes;
log('ShopThemes', '10 themes loaded');
