/* ============================================================
   HOLOS — Database Layer (DB)
   Async API matching State.* shapes, backed by Supabase.

   Strategy: each function returns a Promise. Screens that have
   been migrated to async data flow use DB.*; screens not yet
   migrated keep using the in-memory State (still works, just
   doesn't persist). We migrate one section at a time.

   Important: DB returns objects with camelCase keys to match
   the existing State shapes. The mapper functions below handle
   the snake_case (DB) ↔ camelCase (app) conversion.
   ============================================================ */

const DB = (() => {
  const sb = window.supabaseClient;

  /* ---------- MAPPERS: snake_case (DB) → camelCase (app) ---------- */

  function mapShop(r) {
    if (!r) return null;
    return {
      id: r.id, name: r.name, tagline: r.tagline,
      owner: r.owner, email: r.email, phone: r.phone,
      city: r.city, plan: r.plan, categories: r.categories || [],
      accent: r.accent, coverGradient: r.cover_gradient, banner: r.banner,
      rating: Number(r.rating) || 0, reviewCount: r.review_count || 0,
      followers: r.followers || 0, verified: !!r.verified,
      status: r.status, autoLive: !!r.auto_live,
      credentials: { shopId: r.shop_login_id, password: r.shop_password },
      joinedMonths: r.joined_months || 0,
      country: r.country || null, region: r.region || null,
      theme: r.theme || {}, onboarded: !!r.onboarded,
      logo: r.logo || null, bannerPosY: r.banner_pos_y !== null ? Number(r.banner_pos_y) : 50,
      stats: {
        revenue: r.revenue || 0, orders: r.orders || 0, refunds: r.refunds || 0,
        scansToday: r.scans_today || 0, scansMonth: r.scans_month || 0,
        views: r.views || 0,
      },
    };
  }

  function mapProduct(r) {
    if (!r) return null;
    return {
      id: r.id, shop: r.shop_id,
      category: r.category, subcategory: r.subcategory,
      name: r.name, subtitle: r.subtitle,
      price: r.price, salePrice: r.sale_price || 0, currency: r.currency,
      offer: r.offer, options: r.options || {},
      defaultColor: r.default_color || 0, defaultSize: r.default_size || 0,
      description: r.description, photos: r.photos || 0,
      photoUrls: r.photo_urls || [],
      rating: Number(r.rating) || 0, reviewCount: r.review_count || 0,
      bestSeller: !!r.best_seller, status: r.status,
      photoIssue: r.photo_issue,
      models: {
        glb: r.model_glb, usdz: r.model_usdz, poster: r.model_poster,
        realSizeCm: Number(r.real_size_cm) || 0,
        realDimsCm: {
          w: Number(r.real_w_cm) || 0,
          h: Number(r.real_h_cm) || 0,
          d: Number(r.real_d_cm) || 0,
        },
        scaleStrategy: r.scale_strategy || 'auto',
      },
      tryOn: r.try_on,
    };
  }

  function mapShopRequest(r) {
    if (!r) return null;
    return {
      id: r.id, name: r.name, owner: r.owner, email: r.email,
      phone: r.phone, city: r.city, category: r.category,
      tagline: r.tagline || '',
      logo: r.logo || null, banner: r.banner || null, bannerPosY: r.banner_pos_y || 50,
      docs: r.docs || [], status: r.status, requestedAt: r.requested_at,
    };
  }

  function mapSubcatRequest(r) {
    if (!r) return null;
    return {
      id: r.id, shopId: r.shop_id, shopName: r.shop_name,
      proposedName: r.proposed_name, suggestedCategory: r.suggested_category,
      reason: r.reason, status: r.status, requestedAt: r.requested_at,
    };
  }

  function mapReview(r) {
    if (!r) return null;
    return {
      id: r.id, productId: r.product_id, accountId: r.account_id,
      author: r.author, stars: r.stars, text: r.text,
      weight: Number(r.weight) || 1.0, date: r.date,
    };
  }

  /* ---------- ERROR HELPER ---------- */
  function check(res, label) {
    if (res.error) {
      log('DB', `${label} error: ${res.error.message}`, 'error');
      throw new Error(res.error.message);
    }
    return res.data;
  }

  /* =========================================================
     CATEGORIES + SUBCATEGORIES (the taxonomy, now in DB)
     ========================================================= */
  async function getCategories() {
    const res = await sb.from('categories').select('*').order('sort_order');
    return check(res, 'getCategories');
  }

  async function getSubcategories() {
    const res = await sb.from('subcategories').select('*').eq('approved', true);
    return check(res, 'getSubcategories');
  }

  async function addSubcategory(catId, sub) {
    const res = await sb.from('subcategories').insert({
      id: sub.id, category_id: catId, label: sub.label,
      try_on: sub.tryOn, fields: sub.fields || [], approved: true,
    });
    return check(res, 'addSubcategory');
  }

  /* =========================================================
     SHOPS
     ========================================================= */
  async function getShopsList() {
    const res = await sb.from('shops').select('*');
    return check(res, 'getShopsList').map(mapShop);
  }

  async function getShop(id) {
    const res = await sb.from('shops').select('*').eq('id', id).maybeSingle();
    return mapShop(check(res, 'getShop'));
  }

  async function createShop(shop) {
    const row = {
      id: shop.id, name: shop.name, tagline: shop.tagline || '',
      owner: shop.owner, email: shop.email, phone: shop.phone || '',
      city: shop.city, plan: shop.plan || 'starter',
      categories: shop.categories || [],
      accent: shop.accent || '#2D4A47',
      cover_gradient: shop.coverGradient || 'linear-gradient(135deg, #1B2620 0%, #2D4A47 100%)',
      banner: shop.banner || null,
      banner_pos_y: shop.bannerPosY || 50,
      logo: shop.logo || null,
      rating: 0, review_count: 0, followers: 0,
      verified: false, status: 'active', auto_live: !!shop.autoLive,
      shop_login_id: shop.credentials?.shopId,
      shop_password: shop.credentials?.password,
      joined_months: 0,
      country: shop.country || null, region: shop.region || null,
      revenue: 0, orders: 0, refunds: 0,
      scans_today: 0, scans_month: 0, views: 0,
    };
    const res = await sb.from('shops').insert(row);
    return check(res, 'createShop');
  }

  /* ---------- ADMIN DELETE OPERATIONS ---------- */
  async function deleteShop(id) {
    // products + reviews cascade via DB FK ON DELETE CASCADE
    const res = await sb.from('shops').delete().eq('id', id);
    return check(res, 'deleteShop');
  }
  async function deleteCategory(id) {
    // First delete all subcategories of this category
    await sb.from('subcategories').delete().eq('category_id', id);
    const res = await sb.from('categories').delete().eq('id', id);
    return check(res, 'deleteCategory');
  }
  async function deleteSubcategory(id) {
    const res = await sb.from('subcategories').delete().eq('id', id);
    return check(res, 'deleteSubcategory');
  }
  async function deleteProduct(id) {
    const res = await sb.from('products').delete().eq('id', id);
    return check(res, 'deleteProduct');
  }

  async function updateShopTheme(id, theme, onboarded) {
    const row = { theme };
    if (onboarded !== undefined) row.onboarded = onboarded;
    const res = await sb.from('shops').update(row).eq('id', id);
    return check(res, 'updateShopTheme');
  }

  async function updateShop(id, patch) {
    const row = {};
    if ('name' in patch) row.name = patch.name;
    if ('tagline' in patch) row.tagline = patch.tagline;
    if ('banner' in patch) row.banner = patch.banner;
    if ('logo' in patch) row.logo = patch.logo;
    if ('bannerPosY' in patch) row.banner_pos_y = patch.bannerPosY;
    if ('autoLive' in patch) row.auto_live = patch.autoLive;
    if ('credentials' in patch) {
      row.shop_login_id = patch.credentials.shopId;
      row.shop_password = patch.credentials.password;
    }
    const res = await sb.from('shops').update(row).eq('id', id);
    return check(res, 'updateShop');
  }

  /* =========================================================
     SHOP REQUESTS
     ========================================================= */
  async function getShopRequests() {
    const res = await sb.from('shop_requests').select('*').order('created_at', { ascending: false });
    return check(res, 'getShopRequests').map(mapShopRequest);
  }

  async function createShopRequest(r) {
    const res = await sb.from('shop_requests').insert({
      id: r.id, name: r.name, owner: r.owner, email: r.email,
      phone: r.phone || '', city: r.city, category: r.category,
      tagline: r.tagline || null,
      logo: r.logo || null, banner: r.banner || null,
      docs: r.docs || [], status: r.status || 'pending',
      requested_at: r.requestedAt || 'just now',
    });
    return check(res, 'createShopRequest');
  }

  async function deleteShopRequest(id) {
    const res = await sb.from('shop_requests').delete().eq('id', id);
    return check(res, 'deleteShopRequest');
  }

  /* =========================================================
     SUBCATEGORY REQUESTS
     ========================================================= */
  async function getSubcatRequests() {
    const res = await sb.from('subcat_requests').select('*').order('created_at', { ascending: false });
    return check(res, 'getSubcatRequests').map(mapSubcatRequest);
  }

  async function createSubcatRequest(r) {
    const res = await sb.from('subcat_requests').insert({
      id: r.id, shop_id: r.shopId, shop_name: r.shopName,
      proposed_name: r.proposedName, suggested_category: r.suggestedCategory,
      reason: r.reason, status: r.status || 'pending',
      requested_at: r.requestedAt || 'just now',
    });
    return check(res, 'createSubcatRequest');
  }

  async function deleteSubcatRequest(id) {
    const res = await sb.from('subcat_requests').delete().eq('id', id);
    return check(res, 'deleteSubcatRequest');
  }

  /* =========================================================
     PRODUCTS
     ========================================================= */
  async function getAllProducts() {
    const res = await sb.from('products').select('*').order('created_at', { ascending: false });
    return check(res, 'getAllProducts').map(mapProduct);
  }

  async function getLiveProducts() {
    const res = await sb.from('products').select('*').eq('status', 'live');
    return check(res, 'getLiveProducts').map(mapProduct);
  }

  async function getProduct(id) {
    const res = await sb.from('products').select('*').eq('id', id).maybeSingle();
    return mapProduct(check(res, 'getProduct'));
  }

  async function getProductsForShop(shopId, includeNonLive = false) {
    let q = sb.from('products').select('*').eq('shop_id', shopId);
    if (!includeNonLive) q = q.eq('status', 'live');
    const res = await q;
    return check(res, 'getProductsForShop').map(mapProduct);
  }

  async function getProductsByCategory(catId) {
    const res = await sb.from('products').select('*').eq('category', catId).eq('status', 'live');
    return check(res, 'getProductsByCategory').map(mapProduct);
  }

  async function getPendingProducts() {
    const res = await sb.from('products').select('*').eq('status', 'pending_approval');
    return check(res, 'getPendingProducts').map(mapProduct);
  }

  async function getPhotoReviewProducts() {
    const res = await sb.from('products').select('*').eq('status', 'photo_review');
    return check(res, 'getPhotoReviewProducts').map(mapProduct);
  }

  async function createProduct(p) {
    const m = p.models || {};
    // Core columns that always exist + the model URLs and single real size.
    const baseRow = {
      id: p.id, shop_id: p.shop, category: p.category, subcategory: p.subcategory,
      name: p.name, subtitle: p.subtitle || '',
      price: p.price, sale_price: p.salePrice || 0, currency: p.currency || 'PKR',
      offer: p.offer || null, options: p.options || {},
      default_color: p.defaultColor || 0, default_size: p.defaultSize || 0,
      description: p.description || '', photos: p.photos || 0,
      photo_urls: p.photoUrls || [],
      rating: 0, review_count: 0, best_seller: !!p.bestSeller,
      status: p.status || 'pending_approval',
      photo_issue: p.photoIssue || null,
      model_glb: m.glb || '', model_usdz: m.usdz || '',
      model_poster: m.poster || '', real_size_cm: m.realSizeCm || 0,
      try_on: p.tryOn || null,
    };
    // Optional columns (added by migrations 9 & 11). If the DB doesn't have
    // them, the full insert fails — so we retry with just the base row rather
    // than silently losing the whole product (models + size included).
    const fullRow = {
      ...baseRow,
      real_w_cm: m.realDimsCm?.w || 0,
      real_h_cm: m.realDimsCm?.h || 0,
      real_d_cm: m.realDimsCm?.d || 0,
      scale_strategy: m.scaleStrategy || 'auto',
    };
    let res = await sb.from('products').insert(fullRow);
    if (res.error && /real_(w|h|d)_cm|scale_strategy|column/.test(res.error.message)) {
      log('DB', 'createProduct: optional size columns missing — saving base row (run migrations 9 & 11 for W/H/D)', 'warn');
      res = await sb.from('products').insert(baseRow);
    }
    return check(res, 'createProduct');
  }

  async function updateProductStatus(id, status, extra = {}) {
    const row = { status };
    if ('photoIssue' in extra) row.photo_issue = extra.photoIssue;
    const res = await sb.from('products').update(row).eq('id', id);
    return check(res, 'updateProductStatus');
  }

  /* =========================================================
     REVIEWS
     ========================================================= */
  async function getReviews(productId) {
    const res = await sb.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
    return check(res, 'getReviews').map(mapReview);
  }

  async function addReview(productId, accountId, author, stars, text, weight) {
    // If caller didn't provide weight, compute it (1.0 first time, 0.3 for repeats)
    let w = weight;
    if (w === undefined) {
      const existing = await sb.from('reviews').select('id').eq('product_id', productId).eq('account_id', accountId);
      w = (existing.data?.length || 0) > 0 ? 0.3 : 1.0;
    }
    const id = 'r' + Date.now().toString(36);
    const res = await sb.from('reviews').insert({
      id, product_id: productId, account_id: accountId,
      author, stars, text, weight: w, date: 'just now',
    });
    return check(res, 'addReview');
  }

  async function getWeightedRating(productId) {
    const reviews = await getReviews(productId);
    if (!reviews.length) return { rating: 0, count: 0 };
    const counts = {};
    reviews.forEach(r => { counts[r.accountId] = (counts[r.accountId] || 0) + 1; });
    let sum = 0, total = 0;
    reviews.forEach(r => {
      const w = counts[r.accountId] > 1 ? r.weight : 1.0;
      sum += r.stars * w; total += w;
    });
    return { rating: total > 0 ? sum / total : 0, count: reviews.length };
  }

  /* =========================================================
     ADMIN: shop approval workflow
     ========================================================= */
  function genCredentials(name) {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const num = Math.floor(1000 + Math.random() * 9000);
    return {
      shopId: `SHOP-${initials}-${num}`,
      password: `${name.split(' ')[0].toLowerCase()}@${num}`,
    };
  }

  async function approveShopRequest(reqId, autoLive) {
    const reqRes = await sb.from('shop_requests').select('*').eq('id', reqId).maybeSingle();
    const req = check(reqRes, 'approveShopRequest:read');
    if (!req) return null;
    const newId = req.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const creds = genCredentials(req.name);
    await createShop({
      id: newId, name: req.name, owner: req.owner, email: req.email,
      phone: req.phone, city: req.city, plan: 'starter',
      categories: [req.category], accent: '#2D4A47',
      coverGradient: 'linear-gradient(135deg, #1B2620 0%, #2D4A47 100%)',
      tagline: 'Newly approved seller',
      autoLive: !!autoLive, credentials: creds,
    });
    await deleteShopRequest(reqId);
    log('DB', `approved shop request ${reqId} → ${newId}`);
    return { shopId: newId, credentials: creds };
  }

  async function approveSubcatRequest(reqId, categoryId, fields) {
    const reqRes = await sb.from('subcat_requests').select('*').eq('id', reqId).maybeSingle();
    const req = check(reqRes, 'approveSubcatRequest:read');
    if (!req) return null;
    const subId = req.proposed_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await addSubcategory(categoryId || req.suggested_category, {
      id: subId, label: req.proposed_name, tryOn: 'room',
      fields: fields || [{ key: 'colors', label: 'Colors', type: 'colors' }],
    });
    await deleteSubcatRequest(reqId);
    return { subId };
  }

  /* =========================================================
     ADMIN: market overview
     ========================================================= */
  async function getMarketStats() {
    const [shops, products, shopReqs, subcatReqs, admin] = await Promise.all([
      sb.from('shops').select('*'),
      sb.from('products').select('id,status,shop_id'),
      sb.from('shop_requests').select('id'),
      sb.from('subcat_requests').select('id'),
      sb.from('admin_settings').select('*').eq('id', 1).maybeSingle(),
    ]);
    const shopRows = shops.data || [];
    const prodRows = products.data || [];
    const a = admin.data || { mrr: 0 };
    return {
      totalShops: shopRows.length,
      activeShops: shopRows.filter(s => s.status === 'active').length,
      totalRevenue: shopRows.reduce((s, r) => s + (r.revenue || 0), 0),
      totalOrders: shopRows.reduce((s, r) => s + (r.orders || 0), 0),
      totalRefunds: shopRows.reduce((s, r) => s + (r.refunds || 0), 0),
      totalProducts: prodRows.filter(p => p.status === 'live').length,
      pendingShops: (shopReqs.data || []).length,
      pendingProducts: prodRows.filter(p => p.status === 'pending_approval').length,
      photoReviews: prodRows.filter(p => p.status === 'photo_review').length,
      subcatRequests: (subcatReqs.data || []).length,
      mrr: a.mrr || 0,
    };
  }

  /* =========================================================
     ADMIN: log in (demo-level — real auth comes in Phase D)
     ========================================================= */
  let _adminLoggedIn = false;
  function adminLogin(u, p) {
    if (u === 'admin' && p === 'holos2025') {
      _adminLoggedIn = true;
      log('DB', 'admin logged in');
      return true;
    }
    return false;
  }
  function adminLogout() { _adminLoggedIn = false; }
  function isAdminLoggedIn() { return _adminLoggedIn; }

  /* ---------- CATEGORY MANAGEMENT (main categories) ---------- */
  async function addCategory(cat) {
    const res = await sb.from('categories').insert({
      id: cat.id, label: cat.label, icon: cat.icon || '📦',
      sort_order: cat.sortOrder || 99,
      created_by: cat.createdBy || 'admin', approved: true,
    });
    return check(res, 'addCategory');
  }
  async function getCategoryRequests() {
    const res = await sb.from('category_requests').select('*').order('created_at', { ascending: false });
    return (res.data || []).map(r => ({
      id: r.id, shopId: r.shop_id, shopName: r.shop_name,
      proposedName: r.proposed_name, icon: r.icon, reason: r.reason,
      status: r.status, requestedAt: r.requested_at,
    }));
  }
  async function createCategoryRequest(r) {
    const res = await sb.from('category_requests').insert({
      id: r.id, shop_id: r.shopId, shop_name: r.shopName,
      proposed_name: r.proposedName, icon: r.icon || '📦',
      reason: r.reason, status: 'pending', requested_at: r.requestedAt || 'just now',
    });
    return check(res, 'createCategoryRequest');
  }
  async function deleteCategoryRequest(id) {
    const res = await sb.from('category_requests').delete().eq('id', id);
    return check(res, 'deleteCategoryRequest');
  }
  async function approveCategoryRequest(reqId) {
    const reqRes = await sb.from('category_requests').select('*').eq('id', reqId).maybeSingle();
    const req = reqRes.data;
    if (!req) return null;
    const catId = req.proposed_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await addCategory({ id: catId, label: req.proposed_name, icon: req.icon || '📦', createdBy: req.shop_id });
    await deleteCategoryRequest(reqId);
    return { catId };
  }

    /* ---------- Aliases needed by StateBridge ---------- */
  function init() { return !!sb; }
  function isReady() { return !!sb; }
  async function getShops() { return await getShopsList(); }
  async function getProducts() { return await getAllProducts(); }
  async function getAllReviews() {
    const res = await sb.from('reviews').select('*');
    return check(res, 'getAllReviews').map(mapReview);
  }
  async function getAdminSettings() {
    const res = await sb.from('admin_settings').select('*').eq('id', 1).maybeSingle();
    const d = check(res, 'getAdminSettings') || {};
    return { mrr: d.mrr || 0, newSignups: d.new_signups || 0 };
  }
  async function deleteShopRequest_(id) { return deleteShopRequest(id); }
  async function deleteSubcatRequest_(id) { return deleteSubcatRequest(id); }
  async function updateProductStatus_(id, status, photoIssue) {
    return updateProductStatus(id, status, photoIssue !== undefined ? { photoIssue } : {});
  }

  /* =========================================================
     SHOP CHANGE REQUESTS  (name, tagline, etc)
     ========================================================= */
  async function getChangeRequests(shopId) {
    let q = sb.from('shop_change_requests').select('*').order('created_at', { ascending: false });
    if (shopId) q = q.eq('shop_id', shopId);
    const res = await q;
    return check(res, 'getChangeRequests').map(r => ({
      id: r.id, shopId: r.shop_id, field: r.field,
      currentValue: r.current_value, requestedValue: r.requested_value,
      reason: r.reason, status: r.status, createdAt: r.created_at,
      resolvedAt: r.resolved_at, resolvedBy: r.resolved_by,
    }));
  }
  async function createChangeRequest(req) {
    const row = {
      id: req.id || 'cr-' + Math.random().toString(36).slice(2, 10),
      shop_id: req.shopId,
      field: req.field,
      current_value: req.currentValue || null,
      requested_value: req.requestedValue,
      reason: req.reason || null,
      status: 'pending',
    };
    const res = await sb.from('shop_change_requests').insert(row);
    return check(res, 'createChangeRequest');
  }
  async function resolveChangeRequest(id, action) {
    const res = await sb.from('shop_change_requests').update({
      status: action,
      resolved_at: new Date().toISOString(),
      resolved_by: 'admin',
    }).eq('id', id);
    return check(res, 'resolveChangeRequest');
  }

  /* =========================================================
     SHOP MESSAGES  (admin ↔ seller chat)
     ========================================================= */
  async function getMessages(shopId) {
    const res = await sb.from('shop_messages').select('*').eq('shop_id', shopId).order('created_at', { ascending: true });
    return check(res, 'getMessages').map(r => ({
      id: r.id, shopId: r.shop_id, sender: r.sender, body: r.body,
      attachmentUrl: r.attachment_url, attachmentName: r.attachment_name,
      readByAdmin: r.read_by_admin, readBySeller: r.read_by_seller,
      createdAt: r.created_at,
    }));
  }
  async function sendMessage(msg) {
    const row = {
      id: msg.id || 'm-' + Math.random().toString(36).slice(2, 10),
      shop_id: msg.shopId,
      sender: msg.sender,
      body: msg.body || null,
      attachment_url: msg.attachmentUrl || null,
      attachment_name: msg.attachmentName || null,
      read_by_admin: msg.sender === 'admin',
      read_by_seller: msg.sender === 'seller',
    };
    const res = await sb.from('shop_messages').insert(row);
    return check(res, 'sendMessage');
  }
  async function markMessagesRead(shopId, asWho) {
    const col = asWho === 'admin' ? 'read_by_admin' : 'read_by_seller';
    const res = await sb.from('shop_messages').update({ [col]: true }).eq('shop_id', shopId).eq(col, false);
    return check(res, 'markMessagesRead');
  }
  async function getUnreadCounts(asWho) {
    const col = asWho === 'admin' ? 'read_by_admin' : 'read_by_seller';
    const res = await sb.from('shop_messages').select('shop_id').eq(col, false);
    if (res.error) { log('DB', 'getUnreadCounts: ' + res.error.message, 'error'); return {}; }
    const counts = {};
    (res.data || []).forEach(m => { counts[m.shop_id] = (counts[m.shop_id] || 0) + 1; });
    return counts;
  }

  /* ============================================================
     MARKETPLACE BANNERS — hero carousel slides + settings
     ============================================================ */
  async function getBanners() {
    const res = await sb.from('marketplace_banners')
      .select('*').order('display_order', { ascending: true });
    if (res.error) {
      if (res.error.code === '42P01') { log('DB', 'banners table missing — run migration 10'); return []; }
      log('DB', 'getBanners: ' + res.error.message, 'error'); return [];
    }
    return (res.data || []).map(b => ({
      id: b.id, mediaUrl: b.media_url, mediaType: b.media_type,
      title: b.title, subtitle: b.subtitle,
      ctaLabel: b.cta_label, ctaLink: b.cta_link,
      textAlign: b.text_align, overlayOpacity: Number(b.overlay_opacity) || 0,
      displayOrder: b.display_order, durationMs: b.duration_ms,
      enabled: b.enabled,
    }));
  }
  async function createBanner(b) {
    const res = await sb.from('marketplace_banners').insert({
      id: b.id, media_url: b.mediaUrl, media_type: b.mediaType || 'image',
      title: b.title || '', subtitle: b.subtitle || '',
      cta_label: b.ctaLabel || '', cta_link: b.ctaLink || '',
      text_align: b.textAlign || 'center', overlay_opacity: b.overlayOpacity || 0.3,
      display_order: b.displayOrder || 0, duration_ms: b.durationMs || 5000,
      enabled: b.enabled !== false,
    });
    return check(res, 'createBanner');
  }
  async function updateBanner(id, patch) {
    const row = {};
    if ('mediaUrl' in patch) row.media_url = patch.mediaUrl;
    if ('mediaType' in patch) row.media_type = patch.mediaType;
    if ('title' in patch) row.title = patch.title;
    if ('subtitle' in patch) row.subtitle = patch.subtitle;
    if ('ctaLabel' in patch) row.cta_label = patch.ctaLabel;
    if ('ctaLink' in patch) row.cta_link = patch.ctaLink;
    if ('textAlign' in patch) row.text_align = patch.textAlign;
    if ('overlayOpacity' in patch) row.overlay_opacity = patch.overlayOpacity;
    if ('displayOrder' in patch) row.display_order = patch.displayOrder;
    if ('durationMs' in patch) row.duration_ms = patch.durationMs;
    if ('enabled' in patch) row.enabled = patch.enabled;
    const res = await sb.from('marketplace_banners').update(row).eq('id', id);
    return check(res, 'updateBanner');
  }
  async function deleteBanner(id) {
    const res = await sb.from('marketplace_banners').delete().eq('id', id);
    return check(res, 'deleteBanner');
  }
  async function getMarketplaceSettings() {
    const res = await sb.from('marketplace_settings').select('*').eq('id', 'default').single();
    if (res.error) {
      if (res.error.code === '42P01' || res.error.code === 'PGRST116') {
        return { defaultDurationMs: 5000, transition: 'fade', heightDesktop: 480, heightMobile: 320 };
      }
      return { defaultDurationMs: 5000, transition: 'fade', heightDesktop: 480, heightMobile: 320 };
    }
    const r = res.data;
    return {
      defaultDurationMs: r.carousel_default_duration_ms || 5000,
      transition: r.carousel_transition || 'fade',
      heightDesktop: r.carousel_height_desktop || 480,
      heightMobile: r.carousel_height_mobile || 320,
    };
  }
  async function updateMarketplaceSettings(patch) {
    const row = {};
    if ('defaultDurationMs' in patch) row.carousel_default_duration_ms = patch.defaultDurationMs;
    if ('transition' in patch) row.carousel_transition = patch.transition;
    if ('heightDesktop' in patch) row.carousel_height_desktop = patch.heightDesktop;
    if ('heightMobile' in patch) row.carousel_height_mobile = patch.heightMobile;
    row.updated_at = new Date().toISOString();
    const res = await sb.from('marketplace_settings').update(row).eq('id', 'default');
    return check(res, 'updateMarketplaceSettings');
  }

  return {
    init, isReady,
    addCategory, getCategoryRequests, createCategoryRequest, deleteCategoryRequest, approveCategoryRequest,
    getShops, getProducts, getAllReviews, getAdminSettings,
    // categories / taxonomy
    getCategories, getSubcategories, addSubcategory,
    // shops
    getShopsList, getShop, createShop, updateShop, updateShopTheme,
    deleteShop, deleteCategory, deleteSubcategory, deleteProduct,
    getChangeRequests, createChangeRequest, resolveChangeRequest,
    getMessages, sendMessage, markMessagesRead, getUnreadCounts,
    // shop requests
    getShopRequests, createShopRequest, deleteShopRequest,
    // subcat requests
    getSubcatRequests, createSubcatRequest, deleteSubcatRequest,
    // products
    getAllProducts, getLiveProducts, getProduct,
    getProductsForShop, getProductsByCategory,
    getPendingProducts, getPhotoReviewProducts,
    createProduct, updateProductStatus: updateProductStatus_,
    // reviews
    getReviews, addReview, getWeightedRating,
    // admin
    approveShopRequest, approveSubcatRequest, getMarketStats,
    adminLogin, adminLogout, isAdminLoggedIn,
    // banners
    getBanners, createBanner, updateBanner, deleteBanner,
    getMarketplaceSettings, updateMarketplaceSettings,
    // helpers
    genCredentials,
  };
})();

window.DB = DB;
log('DB', 'data layer ready');
