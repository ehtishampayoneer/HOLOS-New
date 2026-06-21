/* ============================================================
   HOLOS — State Bridge
   Hydrates the in-memory State from Supabase on startup,
   then keeps a local cache so screens (which read sync) work
   unchanged. Writes go to cache immediately + DB in background.
   ============================================================ */

const StateBridge = (() => {
  let hydrated = false;
  const listeners = [];

  async function hydrate() {
    if (!DB.isReady()) {
      log('Bridge', 'DB not ready, cannot hydrate', 'error');
      return false;
    }
    log('Bridge', 'hydrating from Supabase...');
    try {
      // Run all queries in parallel for speed
      const [shops, shopReqs, subcatReqs, products, reviews, cats, subs, admin] =
        await Promise.all([
          DB.getShops(), DB.getShopRequests(), DB.getSubcatRequests(),
          DB.getProducts(), DB.getAllReviews(),
          DB.getCategories(), DB.getSubcategories(), DB.getAdminSettings(),
        ]);

      // category requests (separate call, non-fatal if table missing)
      let catReqs = [];
      try { catReqs = await DB.getCategoryRequests(); } catch (e) { log('Bridge', 'no category_requests yet', 'warn'); }
      const catReqMap = {};
      catReqs.forEach(r => { catReqMap[r.id] = r; });
      State.set('categoryRequests', catReqMap);

      // ---- Populate State.data.shops keyed by id ----
      const shopsMap = {};
      shops.forEach(s => { shopsMap[s.id] = s; });
      State.set('shops', shopsMap);

      // ---- Populate State.data.products ----
      const productsMap = {};
      products.forEach(p => { productsMap[p.id] = p; });
      State.set('products', productsMap);

      // ---- Requests ----
      const sReqMap = {}, scReqMap = {};
      shopReqs.forEach(r => { sReqMap[r.id] = r; });
      subcatReqs.forEach(r => { scReqMap[r.id] = r; });
      State.set('shopRequests', sReqMap);
      State.set('subcatRequests', scReqMap);

      // ---- Reviews keyed by productId ----
      const reviewsMap = {};
      reviews.forEach(r => {
        if (!reviewsMap[r.productId]) reviewsMap[r.productId] = [];
        reviewsMap[r.productId].push({
          id: r.id, accountId: r.accountId, author: r.author,
          stars: r.stars, text: r.text, weight: r.weight, date: r.date,
        });
      });
      State.set('reviews', reviewsMap);

      // ---- Rebuild taxonomy from DB rows ----
      // First merge any custom MAIN categories that aren't in the static tree.
      cats.forEach(cat => {
        if (!Taxonomy.TREE[cat.id]) {
          Taxonomy.TREE[cat.id] = {
            id: cat.id, label: cat.label, icon: cat.icon || '📦',
            subcategories: {},
          };
        }
      });
      // Then merge subcategories (admin-approved new ones appear here).
      subs.forEach(sub => {
        if (!Taxonomy.TREE[sub.category_id]) {
          // category row may not have loaded; create a placeholder
          Taxonomy.TREE[sub.category_id] = { id: sub.category_id, label: sub.category_id, icon: '📦', subcategories: {} };
        }
        Taxonomy.TREE[sub.category_id].subcategories[sub.id] = {
          id: sub.id, label: sub.label, tryOn: sub.try_on,
          fields: sub.fields || [],
        };
      });

      // ---- Admin settings ----
      State.update('admin', a => ({ ...a, mrr: admin.mrr, newSignups: admin.newSignups }));

      hydrated = true;
      log('Bridge', `hydrated · ${shops.length} shops · ${products.length} products · ${reviews.length} reviews`);
      listeners.forEach(cb => { try { cb(); } catch(e) {} });
      return true;
    } catch (e) {
      log('Bridge', 'hydrate failed: ' + e.message, 'error');
      return false;
    }
  }

  function isHydrated() { return hydrated; }
  function onHydrated(cb) {
    if (hydrated) cb();
    else listeners.push(cb);
  }

  /* =========================================================
     Write-through wrappers — call these instead of mutating
     State directly. They update cache AND fire DB write.
     ========================================================= */

  async function persistShop(shop) {
    const shopsMap = State.get('shops');
    shopsMap[shop.id] = shop;
    State.set('shops', shopsMap);
    await DB.createShop(shop);
  }

  async function persistShopUpdate(id, patch) {
    const shopsMap = State.get('shops');
    if (shopsMap[id]) Object.assign(shopsMap[id], patch);
    State.set('shops', shopsMap);
    await DB.updateShop(id, patch);
  }

  async function persistShopRequest(req) {
    const m = State.get('shopRequests');
    m[req.id] = req;
    State.set('shopRequests', m);
    await DB.createShopRequest(req);
  }

  async function removeShopRequest(id) {
    const m = State.get('shopRequests');
    delete m[id];
    State.set('shopRequests', m);
    await DB.deleteShopRequest(id);
  }

  async function persistSubcatRequest(req) {
    const m = State.get('subcatRequests');
    m[req.id] = req;
    State.set('subcatRequests', m);
    await DB.createSubcatRequest(req);
  }

  async function removeSubcatRequest(id) {
    const m = State.get('subcatRequests');
    delete m[id];
    State.set('subcatRequests', m);
    await DB.deleteSubcatRequest(id);
  }

  async function persistProduct(product) {
    const m = State.get('products');
    m[product.id] = product;
    State.set('products', m);
    await DB.createProduct(product);
  }

  async function persistProductStatus(id, status, photoIssue) {
    const m = State.get('products');
    if (m[id]) { m[id].status = status; if (photoIssue !== undefined) m[id].photoIssue = photoIssue; }
    State.set('products', m);
    await DB.updateProductStatus(id, status, photoIssue);
  }

  async function persistReview(productId, stars, text) {
    const customer = State.get('customer');
    const reviews = State.get('reviews');
    if (!reviews[productId]) reviews[productId] = [];
    const existing = reviews[productId].filter(r => r.accountId === customer.id).length;
    const weight = existing > 0 ? 0.3 : 1.0;
    const review = {
      id: 'r' + Date.now().toString(36),
      accountId: customer.id,
      author: customer.name + ' ' + (customer.name[0] || '') + '.',
      stars, text, weight, date: 'just now',
    };
    reviews[productId].unshift(review);
    State.set('reviews', reviews);
    await DB.addReview(productId, customer.id, review.author, stars, text, weight);
  }

  return {
    hydrate, isHydrated, onHydrated,
    persistShop, persistShopUpdate,
    persistShopRequest, removeShopRequest,
    persistSubcatRequest, removeSubcatRequest,
    persistProduct, persistProductStatus,
    persistReview,
  };
})();

window.StateBridge = StateBridge;
