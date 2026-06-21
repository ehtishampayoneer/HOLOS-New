/* ============================================================
   HOLOS — State Store (v5 · full marketplace)
   Shops with credentials + approval states, products tied to
   subcategories with schema-driven options, admin queues,
   reviews with anti-fraud weighting.
   ============================================================ */

const State = (() => {

  /* ============================================================
     SHOPS — with credentials, approval status, autoLive flag
     ============================================================ */
  const SHOPS = {
    'bilal-footwear': {
      id: 'bilal-footwear', name: 'Bilal Footwear',
      tagline: 'Handcrafted shoes since 1998',
      owner: 'Bilal Ahmed', email: 'bilal@example.com', city: 'Lahore',
      phone: '923001234567',
      plan: 'growth', categories: ['fashion'],
      accent: '#3D2914',
      coverGradient: 'linear-gradient(135deg, #2A1F15 0%, #5A3F2A 100%)',
      banner: null,
      rating: 4.8, reviewCount: 247, followers: 1840,
      verified: true, status: 'active', autoLive: false,
      credentials: { shopId: 'SHOP-BF-4471', password: 'bilal@4471' },
      joinedMonths: 7,
      stats: { revenue: 1284000, orders: 342, refunds: 8, scansToday: 47, scansMonth: 1284, views: 18400 },
    },
    'lahore-optics': {
      id: 'lahore-optics', name: 'Lahore Optics',
      tagline: 'Vision meets style',
      owner: 'Hassan Ali', email: 'hassan@example.com', city: 'Lahore',
      phone: '923011234567',
      plan: 'pro', categories: ['accessories'],
      accent: '#2D4A47',
      coverGradient: 'linear-gradient(135deg, #1B262C 0%, #2D4A47 100%)',
      banner: null,
      rating: 4.9, reviewCount: 412, followers: 3210,
      verified: true, status: 'active', autoLive: true,
      credentials: { shopId: 'SHOP-LO-8832', password: 'hassan@8832' },
      joinedMonths: 11,
      stats: { revenue: 2840000, orders: 612, refunds: 12, scansToday: 89, scansMonth: 2940, views: 41200 },
    },
    'khan-watches': {
      id: 'khan-watches', name: 'Khan Watches',
      tagline: 'Timepieces that tell a story',
      owner: 'Imran Khan', email: 'imran@example.com', city: 'Lahore',
      phone: '923021234567',
      plan: 'pro', categories: ['accessories'],
      accent: '#5C2E26',
      coverGradient: 'linear-gradient(135deg, #2C1814 0%, #5C2E26 100%)',
      banner: null,
      rating: 4.7, reviewCount: 189, followers: 920,
      verified: true, status: 'active', autoLive: false,
      credentials: { shopId: 'SHOP-KW-2203', password: 'imran@2203' },
      joinedMonths: 5,
      stats: { revenue: 3680000, orders: 142, refunds: 3, scansToday: 34, scansMonth: 890, views: 12400 },
    },
    'saira-bridal': {
      id: 'saira-bridal', name: 'Saira Bridal',
      tagline: 'Wear your story',
      owner: 'Saira Mahmood', email: 'saira@example.com', city: 'Karachi',
      phone: '923031234567',
      plan: 'growth', categories: ['fashion'],
      accent: '#7C3B5B',
      coverGradient: 'linear-gradient(135deg, #4A1B36 0%, #7C3B5B 100%)',
      banner: null,
      rating: 4.9, reviewCount: 624, followers: 8120,
      verified: true, status: 'active', autoLive: false,
      credentials: { shopId: 'SHOP-SB-9100', password: 'saira@9100' },
      joinedMonths: 14,
      stats: { revenue: 5120000, orders: 428, refunds: 18, scansToday: 124, scansMonth: 4200, views: 68000 },
    },
    'karachi-living': {
      id: 'karachi-living', name: 'Karachi Living',
      tagline: 'Furniture for modern homes',
      owner: 'Ayesha Khan', email: 'ayesha@example.com', city: 'Karachi',
      phone: '923041234567',
      plan: 'growth', categories: ['home'],
      accent: '#3D2914',
      coverGradient: 'linear-gradient(135deg, #2C1F14 0%, #6B4E2E 100%)',
      banner: null,
      rating: 4.6, reviewCount: 156, followers: 1240,
      verified: false, status: 'active', autoLive: false,
      credentials: { shopId: 'SHOP-KL-5567', password: 'ayesha@5567' },
      joinedMonths: 3,
      stats: { revenue: 980000, orders: 87, refunds: 4, scansToday: 28, scansMonth: 640, views: 9200 },
    },
    'multan-crafts': {
      id: 'multan-crafts', name: 'Multan Crafts',
      tagline: 'Decor with a soul',
      owner: 'Fatima Sheikh', email: 'fatima@example.com', city: 'Multan',
      phone: '923051234567',
      plan: 'starter', categories: ['home'],
      accent: '#3D5A4A',
      coverGradient: 'linear-gradient(135deg, #1B3322 0%, #3D5A4A 100%)',
      banner: null,
      rating: 4.7, reviewCount: 87, followers: 540,
      verified: false, status: 'active', autoLive: false,
      credentials: { shopId: 'SHOP-MC-3344', password: 'fatima@3344' },
      joinedMonths: 2,
      stats: { revenue: 420000, orders: 54, refunds: 2, scansToday: 18, scansMonth: 380, views: 5400 },
    },
    'islamabad-tech': {
      id: 'islamabad-tech', name: 'Islamabad Tech',
      tagline: 'Premium electronics & audio',
      owner: 'Usman Riaz', email: 'usman@example.com', city: 'Islamabad',
      phone: '923061234567',
      plan: 'pro', categories: ['electronics'],
      accent: '#1F2933',
      coverGradient: 'linear-gradient(135deg, #0F1419 0%, #1F2933 100%)',
      banner: null,
      rating: 4.8, reviewCount: 203, followers: 2100,
      verified: true, status: 'active', autoLive: true,
      credentials: { shopId: 'SHOP-IT-7788', password: 'usman@7788' },
      joinedMonths: 8,
      stats: { revenue: 6240000, orders: 312, refunds: 9, scansToday: 67, scansMonth: 1840, views: 28000 },
    },
  };

  /* Shop applications awaiting admin approval */
  const SHOP_REQUESTS = {
    'req-001': {
      id: 'req-001', name: 'Quetta Carpets', owner: 'Abdul Rahman',
      email: 'abdul@example.com', city: 'Quetta', phone: '923071234567',
      category: 'home', requestedAt: '2 hours ago',
      docs: ['CNIC', 'Business permit', 'Sample products'], status: 'pending',
    },
    'req-002': {
      id: 'req-002', name: 'Faisalabad Fabrics', owner: 'Nadia Tariq',
      email: 'nadia@example.com', city: 'Faisalabad', phone: '923081234567',
      category: 'fashion', requestedAt: '5 hours ago',
      docs: ['CNIC', 'Tax certificate'], status: 'pending',
    },
    'req-003': {
      id: 'req-003', name: 'Peshawar Pottery', owner: 'Khalid Mahmood',
      email: 'khalid@example.com', city: 'Peshawar', phone: '923091234567',
      category: 'home', requestedAt: '1 day ago',
      docs: ['CNIC', 'Business permit', 'Sample products', 'Bank account'], status: 'review',
    },
  };

  /* Subcategory creation requests from shopkeepers */
  const SUBCAT_REQUESTS = {
    'sreq-001': {
      id: 'sreq-001', shopId: 'multan-crafts', shopName: 'Multan Crafts',
      proposedName: 'Handwoven Baskets', suggestedCategory: 'home',
      reason: 'I sell traditional cane baskets, no matching subcategory found.',
      requestedAt: '3 hours ago', status: 'pending',
    },
    'sreq-002': {
      id: 'sreq-002', shopId: 'islamabad-tech', shopName: 'Islamabad Tech',
      proposedName: 'Smart Home Devices', suggestedCategory: 'electronics',
      reason: 'Smart bulbs, plugs, sensors — need a dedicated section.',
      requestedAt: '1 day ago', status: 'pending',
    },
  };

  /* ============================================================
     PRODUCTS — tied to subcategory, schema-driven options
     status: 'live' | 'pending_approval' | 'photo_review' | 'draft'
     ============================================================ */
  const PRODUCTS = {
    'p-shoe-001': {
      id: 'p-shoe-001', shop: 'bilal-footwear',
      category: 'fashion', subcategory: 'mens-shoes',
      name: 'Suede Oxford', subtitle: 'Handcrafted leather',
      price: 14500, salePrice: 11900, currency: 'PKR',
      offer: { type: 'discount', label: '18% OFF', endsIn: '3 days' },
      options: {
        gender: 'Men',
        sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
        colors: [
          { hex: '#A67B5B', label: 'Tan' },
          { hex: '#1a1a1a', label: 'Black' },
          { hex: '#5c1f1f', label: 'Oxblood' },
        ],
        material: 'Suede', style: 'Oxford', sole: 'Leather',
      },
      defaultColor: 0, defaultSize: 1,
      description: 'Hand-stitched suede oxford with soft leather lining. Crafted in Lahore by master cobblers with over 25 years of experience.',
      photos: 5, rating: 4.8, reviewCount: 23, bestSeller: true,
      status: 'live',
      models: {
        glb: 'assets/models/shoe-oxford/model.glb',
        usdz: 'assets/models/shoe-oxford/model.usdz',
        poster: 'assets/models/shoe-oxford/poster.jpg',
        realSizeCm: 30
      },
      tryOn: 'foot',
    },
    'p-shoe-002': {
      id: 'p-shoe-002', shop: 'bilal-footwear',
      category: 'fashion', subcategory: 'mens-shoes',
      name: 'High-Top Sneaker', subtitle: 'Canvas · Unisex',
      price: 9500, salePrice: 8200, currency: 'PKR',
      offer: { type: 'discount', label: '14% OFF', endsIn: '5 days' },
      options: {
        gender: 'Unisex',
        sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
        colors: [
          { hex: '#F4F2EE', label: 'White' },
          { hex: '#C13438', label: 'Red' },
          { hex: '#1B2A4E', label: 'Navy' },
        ],
        material: 'Canvas', style: 'Sneaker', sole: 'Rubber',
      },
      defaultColor: 0, defaultSize: 2,
      description: 'Classic canvas high-top. Reinforced rubber sole. Vegan materials throughout.',
      photos: 4, rating: 4.6, reviewCount: 12, bestSeller: false,
      status: 'live',
      models: {
        glb: 'assets/models/shoe-hightop/model.glb',
        usdz: 'assets/models/shoe-hightop/model.usdz',
        poster: 'assets/models/shoe-hightop/poster.jpg',
        realSizeCm: 30
      },
      tryOn: 'foot',
    },
    'p-glass-001': {
      id: 'p-glass-001', shop: 'lahore-optics',
      category: 'accessories', subcategory: 'eyewear',
      name: 'Aviator Classic', subtitle: 'Polarized · Unisex',
      price: 8500, salePrice: 7200, currency: 'PKR',
      offer: { type: 'discount', label: '15% OFF', endsIn: '2 days' },
      options: {
        gender: 'Unisex',
        colors: [
          { hex: '#C9A961', label: 'Gold' },
          { hex: '#C0C0C0', label: 'Silver' },
        ],
        frameShape: 'Aviator', lensType: 'Polarized', frameMaterial: 'Metal',
      },
      defaultColor: 0,
      description: 'Timeless aviator silhouette with UV400 polarized lenses. Italian-made frame.',
      photos: 6, rating: 4.9, reviewCount: 47, bestSeller: true,
      status: 'live',
      models: {
        glb: 'assets/models/glasses-aviator/model.glb',
        usdz: 'assets/models/glasses-aviator/model.usdz',
        poster: 'assets/models/glasses-aviator/poster.jpg',
        realSizeCm: 14
      },
      tryOn: 'face',
    },
    'p-glass-002': {
      id: 'p-glass-002', shop: 'lahore-optics',
      category: 'accessories', subcategory: 'eyewear',
      name: 'Square Tortoise', subtitle: 'Acetate · Women',
      price: 6200, salePrice: 0, currency: 'PKR',
      offer: null,
      options: {
        gender: 'Women',
        colors: [
          { hex: '#704228', label: 'Tortoise' },
          { hex: '#1a1a1a', label: 'Black' },
        ],
        frameShape: 'Square', lensType: 'Blue-light', frameMaterial: 'Acetate',
      },
      defaultColor: 0,
      description: 'Bold square frames in handmade acetate with anti-glare coating.',
      photos: 4, rating: 4.7, reviewCount: 28, bestSeller: false,
      status: 'live',
      models: {
        glb: 'assets/models/glasses-square/model.glb',
        usdz: 'assets/models/glasses-square/model.usdz',
        poster: 'assets/models/glasses-square/poster.jpg',
        realSizeCm: 14
      },
      tryOn: 'face',
    },
    'p-watch-001': {
      id: 'p-watch-001', shop: 'khan-watches',
      category: 'accessories', subcategory: 'watches',
      name: 'Pilot Chronograph', subtitle: 'Automatic · Men',
      price: 38000, salePrice: 32500, currency: 'PKR',
      offer: { type: 'discount', label: '14% OFF', endsIn: '6 days' },
      options: {
        gender: 'Men',
        colors: [
          { hex: '#1a1a1a', label: 'Black' },
          { hex: '#5C3A21', label: 'Brown' },
        ],
        caseSize: '42mm', movement: 'Automatic', strap: 'Leather', waterResist: '100m',
      },
      defaultColor: 0,
      description: 'Swiss-style chronograph with genuine leather strap. 100m water resistant.',
      photos: 5, rating: 4.7, reviewCount: 18, bestSeller: true,
      status: 'live',
      models: {
        glb: 'assets/models/watch-pilot/model.glb',
        usdz: 'assets/models/watch-pilot/model.usdz',
        poster: 'assets/models/watch-pilot/poster.jpg',
        realSizeCm: 4
      },
      tryOn: 'wrist',
    },
    'p-cloth-001': {
      id: 'p-cloth-001', shop: 'saira-bridal',
      category: 'fashion', subcategory: 'womens-clothing',
      name: 'Embroidered Kurta', subtitle: 'Cotton silk · Women',
      price: 8500, salePrice: 7200, currency: 'PKR',
      offer: { type: 'discount', label: '15% OFF', endsIn: '4 days' },
      options: {
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { hex: '#7C2D5B', label: 'Maroon' },
          { hex: '#2D7C7C', label: 'Teal' },
          { hex: '#F4E8D0', label: 'Cream' },
        ],
        garmentType: 'Kurta', fabric: 'Silk',
        work: ['Embroidered'], occasion: ['Festive', 'Party'],
      },
      defaultColor: 0, defaultSize: 2,
      description: 'Hand-embroidered cotton silk kurta showcasing traditional Pakistani craftsmanship.',
      photos: 7, rating: 4.9, reviewCount: 64, bestSeller: true,
      status: 'live',
      models: {
        glb: 'assets/models/kurta/model.glb',
        usdz: 'assets/models/kurta/model.usdz',
        poster: 'assets/models/kurta/poster.jpg',
        realSizeCm: 90
      },
      tryOn: 'body-ai',
    },
    'p-cloth-002': {
      id: 'p-cloth-002', shop: 'saira-bridal',
      category: 'fashion', subcategory: 'womens-clothing',
      name: 'Bridal Lehenga', subtitle: 'Hand-worked · Women',
      price: 85000, salePrice: 72000, currency: 'PKR',
      offer: { type: 'discount', label: '15% OFF', endsIn: '7 days' },
      options: {
        sizes: ['S', 'M', 'L'],
        colors: [
          { hex: '#A04545', label: 'Red & Gold' },
          { hex: '#C99694', label: 'Pink & Silver' },
        ],
        garmentType: 'Lehenga', fabric: 'Velvet',
        work: ['Gota', 'Sequins'], occasion: ['Bridal'],
      },
      defaultColor: 0, defaultSize: 1,
      description: 'Show-stopping bridal lehenga with hand-stitched gota work. Includes dupatta and blouse.',
      photos: 8, rating: 5.0, reviewCount: 12, bestSeller: false,
      status: 'live',
      models: {
        glb: 'assets/models/lehenga/model.glb',
        usdz: 'assets/models/lehenga/model.usdz',
        poster: 'assets/models/lehenga/poster.jpg',
        realSizeCm: 100
      },
      tryOn: 'body-ai',
    },
    'p-furn-001': {
      id: 'p-furn-001', shop: 'karachi-living',
      category: 'home', subcategory: 'furniture',
      name: 'Lounge Chair', subtitle: 'Walnut & linen',
      price: 48000, salePrice: 42500, currency: 'PKR',
      offer: { type: 'discount', label: '11% OFF', endsIn: '10 days' },
      options: {
        furnitureType: 'Chair',
        colors: [
          { hex: '#E8DCC4', label: 'Natural linen' },
          { hex: '#4A5A3A', label: 'Olive green' },
        ],
        material: 'Solid wood', dimensions: '70 × 75 × 85 cm', assembly: true,
      },
      defaultColor: 0,
      description: 'Mid-century lounge chair with solid walnut frame and removable linen cushions.',
      photos: 6, rating: 4.8, reviewCount: 14, bestSeller: true,
      status: 'live',
      models: {
        glb: 'assets/models/chair-lounge/model.glb',
        usdz: 'assets/models/chair-lounge/model.usdz',
        poster: 'assets/models/chair-lounge/poster.jpg',
        realSizeCm: 85
      },
      tryOn: 'room',
    },
    'p-carpet-001': {
      id: 'p-carpet-001', shop: 'multan-crafts',
      category: 'home', subcategory: 'carpets',
      name: 'Persian Wool Rug', subtitle: 'Hand-knotted',
      price: 32000, salePrice: 0, currency: 'PKR',
      offer: null,
      options: {
        dimensions: '200 × 300 cm',
        colors: [
          { hex: '#A04545', label: 'Crimson' },
          { hex: '#2D4A47', label: 'Forest' },
        ],
        material: 'Wool', pileHeight: 'Medium', shape: 'Rectangle',
        weave: 'Hand-knotted', origin: 'Multan',
      },
      defaultColor: 0,
      description: 'Hand-knotted wool rug with traditional Multani patterns. Each piece takes 3 months to weave.',
      photos: 5, rating: 4.9, reviewCount: 9, bestSeller: true,
      status: 'live',
      models: {
        glb: 'assets/models/carpet/model.glb',
        usdz: 'assets/models/carpet/model.usdz',
        poster: 'assets/models/carpet/poster.jpg',
        realSizeCm: 300
      },
      tryOn: 'room',
    },
    'p-lamp-001': {
      id: 'p-lamp-001', shop: 'multan-crafts',
      category: 'home', subcategory: 'lighting',
      name: 'Pendant Lamp', subtitle: 'Brass & glass',
      price: 14500, salePrice: 0, currency: 'PKR',
      offer: null,
      options: {
        lightType: 'Pendant',
        colors: [{ hex: '#C9A961', label: 'Brass' }],
        material: 'Brass', bulbType: 'E27', dimmable: true,
      },
      defaultColor: 0,
      description: 'Hand-blown glass pendant lamp with brushed brass fitting.',
      photos: 4, rating: 4.7, reviewCount: 8, bestSeller: false,
      status: 'live',
      models: {
        glb: 'assets/models/lamp-pendant/model.glb',
        usdz: 'assets/models/lamp-pendant/model.usdz',
        poster: 'assets/models/lamp-pendant/poster.jpg',
        realSizeCm: 35
      },
      tryOn: 'room',
    },
    'p-audio-001': {
      id: 'p-audio-001', shop: 'islamabad-tech',
      category: 'electronics', subcategory: 'audio',
      name: 'Over-Ear Headphones', subtitle: 'Wireless · ANC',
      price: 18500, salePrice: 16000, currency: 'PKR',
      offer: { type: 'discount', label: '13% OFF', endsIn: '3 days' },
      options: {
        audioType: 'Headphones',
        colors: [
          { hex: '#1a1a1a', label: 'Matte black' },
          { hex: '#C0C0C0', label: 'Silver' },
        ],
        connectivity: ['Bluetooth', 'USB-C'], battery: 30, anc: true,
      },
      defaultColor: 0,
      description: 'Active noise cancellation, 30-hour battery, premium build quality.',
      photos: 6, rating: 4.8, reviewCount: 41, bestSeller: true,
      status: 'live',
      models: {
        glb: 'assets/models/headphones/model.glb',
        usdz: 'assets/models/headphones/model.usdz',
        poster: 'assets/models/headphones/poster.jpg',
        realSizeCm: 20
      },
      tryOn: 'room',
    },
    'p-laptop-001': {
      id: 'p-laptop-001', shop: 'islamabad-tech',
      category: 'electronics', subcategory: 'laptops',
      name: 'UltraBook Pro 14', subtitle: 'M3 · 16GB',
      price: 285000, salePrice: 0, currency: 'PKR',
      offer: null,
      options: {
        brand: 'Apple', processor: 'Apple M3', ram: '16GB',
        storage: '512GB SSD', screenSize: '14"',
        colors: [
          { hex: '#3D4A52', label: 'Space Grey' },
          { hex: '#E8E8E8', label: 'Silver' },
        ],
        warranty: '1 year',
      },
      defaultColor: 0,
      description: 'Flagship 14-inch laptop with M3 chip, 16GB unified memory, all-day battery.',
      photos: 5, rating: 4.9, reviewCount: 27, bestSeller: true,
      status: 'live',
      models: {
        glb: 'assets/models/laptop/model.glb',
        usdz: 'assets/models/laptop/model.usdz',
        poster: 'assets/models/laptop/poster.jpg',
        realSizeCm: 31
      },
      tryOn: 'room',
    },

    /* --- Products awaiting admin approval (for demo of approval queue) --- */
    'p-pending-001': {
      id: 'p-pending-001', shop: 'bilal-footwear',
      category: 'fashion', subcategory: 'mens-shoes',
      name: 'Chelsea Boot', subtitle: 'Leather · Men',
      price: 17500, salePrice: 0, currency: 'PKR',
      offer: null,
      options: {
        gender: 'Men', sizes: ['UK 8', 'UK 9', 'UK 10'],
        colors: [{ hex: '#3A2317', label: 'Dark brown' }],
        material: 'Leather', style: 'Boot', sole: 'Rubber',
      },
      defaultColor: 0, defaultSize: 0,
      description: 'Classic Chelsea boot in full-grain leather.',
      photos: 5, rating: 0, reviewCount: 0, bestSeller: false,
      status: 'pending_approval',
      models: { glb: 'assets/models/shoe-chelsea/model.glb', usdz: '', poster: '' },
      tryOn: 'foot',
    },
    'p-photo-001': {
      id: 'p-photo-001', shop: 'multan-crafts',
      category: 'home', subcategory: 'wall-decor',
      name: 'Abstract Canvas', subtitle: 'Framed print',
      price: 6800, salePrice: 0, currency: 'PKR',
      offer: null,
      options: {
        decorType: 'Canvas', dimensions: '60 × 90 cm',
        colors: [{ hex: '#1a1a1a', label: 'Monochrome' }],
        frameMaterial: 'Wood', orientation: 'Portrait',
      },
      defaultColor: 0,
      description: 'Limited-edition giclée print on canvas.',
      photos: 3, rating: 0, reviewCount: 0, bestSeller: false,
      status: 'photo_review',
      photoIssue: 'Photo 2 and 3 are blurry — need re-shoot for 3D model generation.',
      models: { glb: 'assets/models/wall-art/model.glb', usdz: '', poster: '' },
      tryOn: 'wall',
    },
  };

  /* ============================================================
     REVIEWS — with accountId for anti-fraud weighting
     ============================================================ */
  const REVIEWS = {
    'p-shoe-001': [
      { id: 'r1', accountId: 'acc_1', author: 'Ahmed K.', stars: 5, text: 'Excellent quality, fits perfectly.', date: '1 week ago', weight: 1.0 },
      { id: 'r2', accountId: 'acc_2', author: 'Sara M.', stars: 5, text: 'Bought for my husband, he loves them.', date: '2 weeks ago', weight: 1.0 },
      { id: 'r3', accountId: 'acc_3', author: 'Bilal R.', stars: 4, text: 'Good but slightly tight.', date: '3 weeks ago', weight: 1.0 },
      { id: 'r4', accountId: 'acc_2', author: 'Sara M.', stars: 5, text: 'Ordering another pair!', date: '3 weeks ago', weight: 0.3 },
    ],
    'p-glass-001': [
      { id: 'r5', accountId: 'acc_4', author: 'Hassan T.', stars: 5, text: 'Perfect for driving, great polarization.', date: '4 days ago', weight: 1.0 },
      { id: 'r6', accountId: 'acc_5', author: 'Zara A.', stars: 5, text: 'Stylish and lightweight.', date: '1 week ago', weight: 1.0 },
    ],
  };

  /* ============================================================
     ADMIN
     ============================================================ */
  const ADMIN = {
    loggedIn: false,
    credentials: { username: 'admin', password: 'holos2025' },
    mrr: 12840,
    newSignups: 12,
  };

  const CUSTOMER = {
    id: 'cust_001', name: 'Ahmed', email: 'ahmed@example.com', avatar: 'A',
    city: 'Lahore', favorites: ['p-shoe-001', 'p-glass-001'], cart: [],
    addresses: [{ id: 'a1', label: 'Home', line: '24 Gulberg III, Lahore', primary: true }],
    orders: [
      { id: 'ord_104', date: '2 days ago', shop: 'bilal-footwear', items: 1, total: 11900, status: 'delivered' },
      { id: 'ord_098', date: 'May 12', shop: 'lahore-optics', items: 1, total: 7200, status: 'in transit' },
    ],
    signedIn: false,
  };

  const data = {
    app: 'launcher', screen: 'home',
    shops: SHOPS,
    shopRequests: SHOP_REQUESTS,
    subcatRequests: SUBCAT_REQUESTS,
    categoryRequests: {},
    products: PRODUCTS,
    reviews: REVIEWS,
    customer: { ...CUSTOMER },
    admin: { ...ADMIN },
    shop: null, // active shopkeeper context
    currentShop: null, currentProduct: null,
    draftProduct: null, // product being added by shopkeeper
  };

  const subscribers = {};
  function get(key) { return key ? data[key] : data; }
  function set(key, value) {
    data[key] = value;
    log('State', `set ${key}`);
    if (subscribers[key]) subscribers[key].forEach(cb => cb(value));
  }
  function update(key, mutator) { set(key, mutator(data[key])); }
  function on(key, cb) {
    if (!subscribers[key]) subscribers[key] = [];
    subscribers[key].push(cb);
    return () => { subscribers[key] = subscribers[key].filter(c => c !== cb); };
  }

  /* ---- Shops ---- */
  function getShop(id) { return data.shops[id]; }
  function getShopsList() { return Object.values(data.shops); }
  function getActiveShops() { return Object.values(data.shops).filter(s => s.status === 'active'); }
  function getShopRequests() { return Object.values(data.shopRequests); }
  function getSubcatRequests() { return Object.values(data.subcatRequests); }
  function getCategoryRequests() { return Object.values(data.categoryRequests || {}); }

  /* ---- Products ---- */
  function getProduct(id) { return data.products[id]; }
  function getAllProducts() { return Object.values(data.products); }
  function getLiveProducts() { return Object.values(data.products).filter(p => p.status === 'live'); }
  function getProductsForShop(shopId, includeNonLive) {
    return Object.values(data.products).filter(p =>
      p.shop === shopId && (includeNonLive || p.status === 'live'));
  }
  function getProductsByCategory(catId) {
    return Object.values(data.products).filter(p => p.category === catId && p.status === 'live');
  }
  function getProductsBySubcategory(subId) {
    return Object.values(data.products).filter(p => p.subcategory === subId && p.status === 'live');
  }
  function getPendingProducts() {
    return Object.values(data.products).filter(p => p.status === 'pending_approval');
  }
  function getPhotoReviewProducts() {
    return Object.values(data.products).filter(p => p.status === 'photo_review');
  }
  function getBestSellers(shopId) {
    return Object.values(data.products).filter(p =>
      p.shop === shopId && p.bestSeller && p.status === 'live');
  }

  /* ---- Reviews with anti-fraud weighting ---- */
  function getReviews(productId) { return data.reviews[productId] || []; }
  function addReview(productId, stars, text) {
    if (!data.reviews[productId]) data.reviews[productId] = [];
    const accountId = data.customer.id;
    const existing = data.reviews[productId].filter(r => r.accountId === accountId).length;
    const reviewObj = {
      id: 'r' + Date.now().toString(36),
      accountId,
      author: data.customer.name + ' ' + (data.customer.name[0] || '') + '.',
      stars, text,
      date: 'just now',
      weight: existing > 0 ? 0.3 : 1.0,
    };
    data.reviews[productId].unshift(reviewObj);
    log('State', `review added for ${productId} (${stars}★)`);
    if (window.DB && DB.isReady()) DB.addReview(productId, accountId, reviewObj.author, stars, text, reviewObj.weight);
  }

  function getWeightedRating(productId) {
    const reviews = data.reviews[productId] || [];
    if (reviews.length === 0) return { rating: 0, count: 0 };
    // Count reviews per account; repeat accounts get reduced weight
    const accountCounts = {};
    reviews.forEach(r => { accountCounts[r.accountId] = (accountCounts[r.accountId] || 0) + 1; });
    let weightedSum = 0, weightTotal = 0;
    reviews.forEach(r => {
      // First review from an account = full weight; subsequent = 0.3
      const w = accountCounts[r.accountId] > 1 ? r.weight : 1.0;
      weightedSum += r.stars * w;
      weightTotal += w;
    });
    return {
      rating: weightTotal > 0 ? (weightedSum / weightTotal) : 0,
      count: reviews.length,
    };
  }

  /* ---- Favorites ---- */
  function toggleFavorite(pid) {
    const favs = data.customer.favorites;
    const idx = favs.indexOf(pid);
    if (idx >= 0) favs.splice(idx, 1); else favs.push(pid);
    if (subscribers['customer']) subscribers['customer'].forEach(cb => cb(data.customer));
  }
  function isFavorite(pid) { return data.customer.favorites.includes(pid); }

  /* ---- Admin actions ---- */
  function adminLogin(username, password) {
    if (username === data.admin.credentials.username && password === data.admin.credentials.password) {
      data.admin.loggedIn = true;
      log('State', 'admin logged in');
      return true;
    }
    return false;
  }
  function adminLogout() { data.admin.loggedIn = false; }
  function isAdminLoggedIn() { return data.admin.loggedIn; }

  function genShopCredentials(name) {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const num = Math.floor(1000 + Math.random() * 9000);
    return {
      shopId: `SHOP-${initials}-${num}`,
      password: `${name.split(' ')[0].toLowerCase()}@${num}`,
    };
  }

  function approveShopRequest(reqId, autoLive) {
    const req = data.shopRequests[reqId];
    if (!req) return null;
    const newId = req.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const creds = genShopCredentials(req.name);
    data.shops[newId] = {
      id: newId, name: req.name, owner: req.owner, email: req.email,
      city: req.city, phone: req.phone, plan: 'starter',
      categories: [req.category],
      accent: '#2D4A47',
      coverGradient: 'linear-gradient(135deg, #1B2620 0%, #2D4A47 100%)',
      banner: req.banner || null,
      bannerPosY: req.bannerPosY || 50,
      logo: req.logo || null,
      tagline: req.tagline || 'Newly approved seller',
      rating: 0, reviewCount: 0, followers: 0,
      verified: false, status: 'active', autoLive: !!autoLive,
      credentials: creds, joinedMonths: 0,
      stats: { revenue: 0, orders: 0, refunds: 0, scansToday: 0, scansMonth: 0, views: 0 },
    };
    delete data.shopRequests[reqId];
    log('State', `approved shop ${newId} · creds ${creds.shopId} · logo:${!!req.logo} · banner:${!!req.banner}`);
    // Persist: create new shop in DB, delete the request
    if (window.StateBridge && window.DB && DB.isReady()) {
      DB.createShop(data.shops[newId]);
      DB.deleteShopRequest(reqId);
    }
    return { shopId: newId, credentials: creds };
  }
  function rejectShopRequest(reqId) {
    delete data.shopRequests[reqId];
    log('State', `rejected shop request ${reqId}`);
    if (window.DB && DB.isReady()) DB.deleteShopRequest(reqId);
  }

  function createShopDirect(info) {
    const newId = info.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const creds = genShopCredentials(info.name);
    data.shops[newId] = {
      id: newId, name: info.name, owner: info.owner, email: info.email,
      city: info.city, phone: info.phone || '', plan: 'starter',
      categories: [info.category],
      accent: '#2D4A47',
      coverGradient: 'linear-gradient(135deg, #1B2620 0%, #2D4A47 100%)',
      banner: info.banner || null,
      bannerPosY: info.bannerPosY || 50,
      logo: info.logo || null,
      tagline: info.tagline || 'New shop',
      rating: 0, reviewCount: 0, followers: 0,
      verified: false, status: 'active', autoLive: !!info.autoLive,
      credentials: creds, joinedMonths: 0,
      stats: { revenue: 0, orders: 0, refunds: 0, scansToday: 0, scansMonth: 0, views: 0 },
    };
    log('State', `created shop ${newId} directly · logo:${!!info.logo} · banner:${!!info.banner}`);
    if (window.DB && DB.isReady()) DB.createShop(data.shops[newId]);
    return { shopId: newId, credentials: creds };
  }

  function resetShopPassword(shopId) {
    const shop = data.shops[shopId];
    if (!shop) return null;
    const num = Math.floor(1000 + Math.random() * 9000);
    shop.credentials.password = `reset@${num}`;
    log('State', `reset password for ${shopId}`);
    if (window.DB && DB.isReady()) DB.updateShop(shopId, { credentials: shop.credentials });
    return shop.credentials.password;
  }
  function toggleShopAutoLive(shopId) {
    const shop = data.shops[shopId];
    if (shop) {
      shop.autoLive = !shop.autoLive;
      log('State', `${shopId} autoLive → ${shop.autoLive}`);
      if (window.DB && DB.isReady()) DB.updateShop(shopId, { autoLive: shop.autoLive });
    }
    return shop?.autoLive;
  }

  function approveProduct(productId) {
    const p = data.products[productId];
    if (p) {
      p.status = 'live';
      log('State', `approved product ${productId}`);
      if (window.DB && DB.isReady()) DB.updateProductStatus(productId, 'live');
    }
  }
  function requestProductChanges(productId, issue) {
    const p = data.products[productId];
    if (p) {
      p.status = 'photo_review';
      p.photoIssue = issue;
      log('State', `requested changes ${productId}`);
      if (window.DB && DB.isReady()) DB.updateProductStatus(productId, 'photo_review', issue);
    }
  }

  function approveSubcatRequest(reqId, categoryId, fields) {
    const req = data.subcatRequests[reqId];
    if (!req) return;
    const subId = req.proposedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    Taxonomy.addSubcategory(categoryId || req.suggestedCategory, {
      id: subId, label: req.proposedName, tryOn: 'room',
      fields: fields || [{ key: 'colors', label: 'Colors', type: 'colors' }],
    });
    delete data.subcatRequests[reqId];
    log('State', `approved subcat ${subId}`);
    if (window.DB && DB.isReady()) {
      DB.addSubcategory({ id: subId, categoryId: categoryId || req.suggestedCategory, label: req.proposedName, tryOn: 'room', fields: fields || [{ key: 'colors', label: 'Colors', type: 'colors' }] });
      DB.deleteSubcatRequest(reqId);
    }
  }
  function rejectSubcatRequest(reqId) {
    delete data.subcatRequests[reqId];
    if (window.DB && DB.isReady()) DB.deleteSubcatRequest(reqId);
  }

  /* ---- AR model pipeline ---- */
  function setProductModel(productId, glbUrl, usdzUrl, posterUrl) {
    const p = data.products[productId];
    if (!p) return;
    p.models = p.models || {};
    if (glbUrl) p.models.glb = glbUrl;
    if (usdzUrl) p.models.usdz = usdzUrl;
    if (posterUrl) p.models.poster = posterUrl;
    p.modelStatus = 'ready';
    log('State', `model set for ${productId} → ready`);
  }
  function setModelProcessing(productId) {
    const p = data.products[productId];
    if (p) { p.modelStatus = 'processing'; }
  }
  // Products needing an AR model: live/approved but no real model yet
  function getModelQueue() {
    return Object.values(data.products).filter(p =>
      (p.status === 'live' || p.status === 'pending_approval') &&
      p.modelStatus !== 'ready'
    );
  }
  function getModelReady() {
    return Object.values(data.products).filter(p => p.modelStatus === 'ready');
  }

  /* ---- Market-wide aggregates for admin ---- */
  function getMarketStats() {
    const shops = Object.values(data.shops);
    return {
      totalShops: shops.length,
      activeShops: shops.filter(s => s.status === 'active').length,
      totalRevenue: shops.reduce((sum, s) => sum + (s.stats?.revenue || 0), 0),
      totalOrders: shops.reduce((sum, s) => sum + (s.stats?.orders || 0), 0),
      totalRefunds: shops.reduce((sum, s) => sum + (s.stats?.refunds || 0), 0),
      totalProducts: Object.values(data.products).filter(p => p.status === 'live').length,
      pendingShops: Object.keys(data.shopRequests).length,
      pendingProducts: Object.values(data.products).filter(p => p.status === 'pending_approval').length,
      photoReviews: Object.values(data.products).filter(p => p.status === 'photo_review').length,
      subcatRequests: Object.keys(data.subcatRequests).length,
      categoryRequests: Object.keys(data.categoryRequests || {}).length,
      mrr: data.admin.mrr,
    };
  }

  return {
    get, set, update, on,
    getShop, getShopsList, getActiveShops, getShopRequests, getSubcatRequests, getCategoryRequests,
    getProduct, getAllProducts, getLiveProducts, getProductsForShop,
    getProductsByCategory, getProductsBySubcategory, getPendingProducts,
    getPhotoReviewProducts, getBestSellers,
    getReviews, getWeightedRating, addReview,
    toggleFavorite, isFavorite,
    adminLogin, adminLogout, isAdminLoggedIn,
    approveShopRequest, rejectShopRequest, createShopDirect,
    resetShopPassword, toggleShopAutoLive,
    approveProduct, requestProductChanges,
    setProductModel, setModelProcessing, getModelQueue, getModelReady,
    approveSubcatRequest, rejectSubcatRequest,
    genShopCredentials, getMarketStats,
  };
})();


// Seed: mark flagship products as having AR models already built (demo realism)
['p-shoe-001','p-glass-001','p-cloth-001','p-furn-001','p-watch-001','p-carpet-001'].forEach(pid => {
  const p = State.get('products')[pid];
  if (p) p.modelStatus = 'ready';
});

window.State = State;
