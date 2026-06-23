/* ============================================================
   ADMIN QUEUES: shop approvals, product queue, category requests,
   create-shop. All gated behind admin login.
   ============================================================ */

function requireAdmin() {
  if (!State.isAdminLoggedIn()) { setTimeout(() => Router.go('/admin/login'), 0); return false; }
  return true;
}

function adminHeader(title) {
  return `
    <header class="aq-top">
      <button class="btn-icon-bare" onclick="Router.go('/admin/home')">${icon('arrow_left')}</button>
      <div class="aq-top-title">${title}</div>
      <div style="width:40px;"></div>
    </header>
  `;
}

const AQ_STYLES = `
  <style>
    .aq { min-height: 100vh; background: var(--bg); padding-bottom: var(--s-7); }
    .aq-top { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4) var(--s-5); position: sticky; top: 0; background: var(--bg); z-index: 10; border-bottom: 1px solid var(--border); }
    .aq-top-title { font-weight: 700; font-size: var(--t-h2); }
    .aq-main { padding: var(--s-5); max-width: 820px; margin: 0 auto; }
    .aq-empty { text-align: center; padding: var(--s-9) var(--s-5); }
    .aq-empty-icon { width: 64px; height: 64px; margin: 0 auto var(--s-4); border-radius: 50%; background: var(--success-soft); color: var(--success); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; }
    .aq-empty h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: var(--s-2); }
    .aq-empty p { color: var(--ink-dim); }
    .aq-list { display: flex; flex-direction: column; gap: var(--s-3); }
    .aq-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: var(--s-4); }
    .aq-card-head { display: grid; grid-template-columns: 48px 1fr auto; gap: var(--s-3); align-items: center; margin-bottom: var(--s-3); }
    .aq-card-avatar { width: 48px; height: 48px; border-radius: var(--r-md); background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .aq-card-name { font-size: var(--t-body); font-weight: 700; }
    .aq-card-owner { font-size: var(--t-small); color: var(--ink-dim); margin-top: 2px; }
    .aq-card-time { font-size: var(--t-micro); color: var(--ink-dim); }
    .aq-meta { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2); padding: var(--s-3); background: var(--bg); border-radius: var(--r-md); margin-bottom: var(--s-3); }
    .aq-meta-key { font-size: var(--t-micro); color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
    .aq-meta-val { font-size: var(--t-small); text-transform: capitalize; }
    .aq-docs { display: flex; flex-wrap: wrap; gap: var(--s-2); margin-bottom: var(--s-3); }
    .aq-doc { font-size: var(--t-micro); padding: 4px var(--s-2); background: var(--success-soft); color: var(--success); border-radius: var(--r-sm); font-weight: 500; }
    .aq-actions { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2); }
    .aq-actions.three { grid-template-columns: 1fr 1fr 1fr; }
    .aq-btn-reject { background: transparent; color: var(--danger); border: 1px solid var(--danger-soft); padding: var(--s-3); border-radius: var(--r-md); font-weight: 500; cursor: pointer; }
    .aq-btn-reject:hover { background: var(--danger-soft); }
    .aq-btn-secondary { background: var(--surface-elev); color: var(--ink); border: none; padding: var(--s-3); border-radius: var(--r-md); font-weight: 500; cursor: pointer; }
    .aq-btn-approve { background: var(--success); color: white; border: none; padding: var(--s-3); border-radius: var(--r-md); font-weight: 600; cursor: pointer; }
    .aq-btn-approve:hover { opacity: 0.92; }
    .aq-photoissue { font-size: var(--t-small); color: var(--danger); background: var(--danger-soft); padding: var(--s-2) var(--s-3); border-radius: var(--r-sm); margin-bottom: var(--s-3); }
    .aq-field { display: flex; flex-direction: column; margin-bottom: var(--s-4); }
    .aq-label { font-size: var(--t-small); color: var(--ink-dim); margin-bottom: var(--s-2); font-weight: 500; }
    .aq-input { padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); font-size: var(--t-body); }
    .aq-input:focus { border-color: var(--accent); }
    select.aq-input { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236F6B62' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right var(--s-4) center; padding-right: var(--s-7); }
    .aq-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4); background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); margin-bottom: var(--s-4); }
    .aq-toggle { width: 48px; height: 28px; border-radius: var(--r-pill); background: var(--surface-elev); position: relative; flex-shrink: 0; }
    .aq-toggle.on { background: var(--success); }
    .aq-toggle-knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: white; transition: transform var(--d-fast); }
    .aq-toggle.on .aq-toggle-knob { transform: translateX(20px); }
  </style>
`;

/* ============================================================
   SHOP REQUESTS (approvals)
   ============================================================ */
Router.register('/admin/approvals', () => {
  if (!requireAdmin()) return '<div></div>';
  log('Admin/Approvals', 'mounted');
  const requests = State.getShopRequests();

  return `
    <div class="screen aq">
      ${adminHeader('Shop requests')}
      <main class="aq-main">
        ${requests.length === 0 ? `
          <div class="aq-empty">
            <div class="aq-empty-icon">✓</div>
            <h3>All clear!</h3>
            <p>No shop applications waiting.</p>
          </div>
        ` : `
          <div class="aq-list">
            ${requests.map(r => `
              <div class="aq-card" id="aq-${r.id}">
                ${r.banner ? `<div class="aq-card-banner" style="background:url('${r.banner}') center ${r.bannerPosY||50}%/cover;"></div>` : ''}
                <div class="aq-card-head">
                  <div class="aq-card-avatar" style="${r.logo ? `background:url('${r.logo}') center/cover;` : ''}">${r.logo ? '' : r.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                  <div>
                    <div class="aq-card-name">${r.name}</div>
                    <div class="aq-card-owner">${r.owner} · ${r.city}</div>
                    ${r.tagline ? `<div class="aq-card-tagline">"${r.tagline}"</div>` : ''}
                  </div>
                  <div class="aq-card-time">${r.requestedAt}</div>
                </div>
                <div class="aq-meta">
                  <div><div class="aq-meta-key">Category</div><div class="aq-meta-val">${Taxonomy.getCategory(r.category)?.label || r.category}</div></div>
                  <div><div class="aq-meta-key">Contact</div><div class="aq-meta-val" style="text-transform:none;">${r.email}</div></div>
                  <div><div class="aq-meta-key">Branding</div><div class="aq-meta-val" style="text-transform:none;">${r.logo ? '✓ Logo' : '✗ No logo'} · ${r.banner ? '✓ Banner' : '✗ No banner'}</div></div>
                </div>
                <div class="aq-docs">
                  ${r.docs.map(d => `<span class="aq-doc">✓ ${d}</span>`).join('')}
                </div>
                <div class="aq-actions three">
                  <button class="aq-btn-reject" onclick="rejShop('${r.id}')">Reject</button>
                  <button class="aq-btn-secondary" onclick="approveShopWith('${r.id}', false)">Approve · Manual</button>
                  <button class="aq-btn-approve" onclick="approveShopWith('${r.id}', true)">Approve · Auto-live</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </main>
      ${AQ_STYLES}
    </div>
  `;
});

async function approveShopWith(reqId, autoLive) {
  const result = State.approveShopRequest(reqId, autoLive);
  if (result) {
    // Persist: create the new shop in DB + remove the request
    try {
      const newShop = State.getShop(result.shopId);
      if (newShop) await DB.createShop(newShop);
      await DB.deleteShopRequest(reqId);
    } catch (e) { log('Admin', 'DB sync failed: ' + e.message, 'error'); }
    alert(`Shop approved!\n\nGenerated credentials:\nShop ID: ${result.credentials.shopId}\nPassword: ${result.credentials.password}\n\nIn production these are emailed to the owner.`);
  }
  Router.go('/admin/approvals');
}
async function rejShop(reqId) {
  if (!confirm('Reject this application?')) return;
  State.rejectShopRequest(reqId);
  try { await DB.deleteShopRequest(reqId); } catch (e) {}
  Router.go('/admin/approvals');
}

/* ============================================================
   PRODUCT QUEUE (pending approval + photo review)
   ============================================================ */
Router.register('/admin/product-queue', () => {
  if (!requireAdmin()) return '<div></div>';
  log('Admin/ProductQueue', 'mounted');
  const pending = State.getPendingProducts();
  const photoReview = State.getPhotoReviewProducts();
  const all = [...pending, ...photoReview];

  return `
    <div class="screen aq">
      ${adminHeader('Product queue')}
      <main class="aq-main">
        ${all.length === 0 ? `
          <div class="aq-empty"><div class="aq-empty-icon">✓</div><h3>Queue empty</h3><p>All products reviewed.</p></div>
        ` : `
          <div class="aq-list">
            ${all.map(p => {
              const shop = State.getShop(p.shop);
              const sub = Taxonomy.getSubcategoryById(p.subcategory);
              return `
                <div class="aq-card" id="aq-${p.id}">
                  <div class="aq-card-head">
                    <div class="aq-card-avatar" style="background:${shop?.accent}">${categoryGlyphForSub(p.subcategory)}</div>
                    <div>
                      <div class="aq-card-name">${p.name}</div>
                      <div class="aq-card-owner">${shop?.name} · ${sub?.label || p.subcategory}</div>
                    </div>
                    <div class="aq-card-time">${p.photos} photos</div>
                  </div>
                  <div class="aq-meta">
                    <div><div class="aq-meta-key">Price</div><div class="aq-meta-val">Rs. ${(p.salePrice||p.price).toLocaleString()}</div></div>
                    <div><div class="aq-meta-key">Status</div><div class="aq-meta-val">${statusLabel(p.status)}</div></div>
                  </div>
                  ${p.photoIssue ? `<div class="aq-photoissue">⚠ ${p.photoIssue}</div>` : ''}
                  <div class="aq-actions three">
                    <button class="aq-btn-reject" onclick="askChanges('${p.id}')">Request photos</button>
                    <button class="aq-btn-secondary" onclick="viewProductDetail('${p.id}')">View details</button>
                    <button class="aq-btn-approve" onclick="approveProd('${p.id}')">Approve & go live</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </main>
      ${AQ_STYLES}
    </div>
  `;
});

async function approveProd(pid) {
  State.approveProduct(pid);
  const p = State.getProduct(pid);
  try { await DB.updateProductStatus(pid, 'live'); } catch (e) {}
  // Notify the seller
  try {
    if (p && window.DB && DB.isReady()) {
      await DB.sendMessage({
        shopId: p.shop,
        sender: 'admin',
        body: `✅ Approved\n\nYour changes to "${p.name}" are now live. Customers can see them.`
      });
    }
  } catch (e) { /* non-fatal */ }
  Router.go('/admin/product-queue');
}
async function askChanges(pid) {
  const issue = prompt('What needs fixing? (sent to shopkeeper)', 'Please re-upload clearer photos of the product from the front and side.');
  if (!issue) return;
  State.requestProductChanges(pid, issue);
  const p = State.getProduct(pid);
  try { await DB.updateProductStatus(pid, 'photo_review', issue); } catch (e) {}
  // Notify the seller with the reason
  try {
    if (p && window.DB && DB.isReady()) {
      await DB.sendMessage({
        shopId: p.shop,
        sender: 'admin',
        body: `⚠ Changes requested\n\nProduct: "${p.name}"\n\nReason: ${issue}\n\nPlease update the product and re-submit.`
      });
    }
  } catch (e) { /* non-fatal */ }
  Router.go('/admin/product-queue');
}

/* ============================================================
   CATEGORY REQUESTS
   ============================================================ */
Router.register('/admin/category-queue', () => {
  if (!requireAdmin()) return '<div></div>';
  log('Admin/CategoryQueue', 'mounted');
  const requests = State.getSubcatRequests();
  const catRequests = State.getCategoryRequests();

  return `
    <div class="screen aq">
      ${adminHeader('Category management')}
      <main class="aq-main">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-2);margin-bottom:var(--s-5);">
          <button class="btn btn-accent" onclick="Router.go('/admin/create-category')">
            ${icon('plus')} New category
          </button>
          <button class="btn btn-primary" onclick="Router.go('/admin/create-subcategory')">
            ${icon('plus')} New subcategory
          </button>
        </div>

        ${catRequests.length ? `
          <h2 style="font-size:var(--t-h3);font-weight:700;margin-bottom:var(--s-3);">New main-category requests</h2>
          <div class="aq-list" style="margin-bottom:var(--s-6);">
            ${catRequests.map(r => `
              <div class="aq-card">
                <div class="aq-card-head">
                  <div class="aq-card-avatar">${r.icon || '📦'}</div>
                  <div>
                    <div class="aq-card-name">${r.proposedName}</div>
                    <div class="aq-card-owner">main category · by ${r.shopName}</div>
                  </div>
                  <div class="aq-card-time">${r.requestedAt}</div>
                </div>
                ${r.reason ? `<div style="font-size:var(--t-small);color:var(--ink-dim);margin-bottom:var(--s-3);padding:var(--s-2) var(--s-3);background:var(--bg);border-radius:var(--r-sm);">"${r.reason}"</div>` : ''}
                <div class="aq-actions">
                  <button class="aq-btn-reject" onclick="rejCatReq('${r.id}')">Reject</button>
                  <button class="aq-btn-approve" onclick="approveCatReq('${r.id}')">Create category</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <h2 style="font-size:var(--t-h3);font-weight:700;margin-bottom:var(--s-3);">Subcategory requests</h2>
        ${requests.length === 0 ? `
          <div class="aq-empty"><div class="aq-empty-icon">✓</div><h3>No requests</h3><p>No new subcategory requests.</p></div>
        ` : `
          <div class="aq-list">
            ${requests.map(r => `
              <div class="aq-card" id="aq-${r.id}">
                <div class="aq-card-head">
                  <div class="aq-card-avatar">${icon('plus')}</div>
                  <div>
                    <div class="aq-card-name">${r.proposedName}</div>
                    <div class="aq-card-owner">requested by ${r.shopName}</div>
                  </div>
                  <div class="aq-card-time">${r.requestedAt}</div>
                </div>
                <div class="aq-meta">
                  <div><div class="aq-meta-key">Suggested category</div><div class="aq-meta-val">${Taxonomy.getCategory(r.suggestedCategory)?.label || r.suggestedCategory}</div></div>
                  <div><div class="aq-meta-key">Type</div><div class="aq-meta-val">New subcategory</div></div>
                </div>
                <div style="font-size:var(--t-small);color:var(--ink-dim);margin-bottom:var(--s-3);padding:var(--s-2) var(--s-3);background:var(--bg);border-radius:var(--r-sm);">"${r.reason}"</div>
                <div class="aq-actions three">
                  <button class="aq-btn-reject" onclick="rejSubcat('${r.id}')">Reject</button>
                  <button class="aq-btn-secondary" onclick="redirectSubcat('${r.id}')">Already exists →</button>
                  <button class="aq-btn-approve" onclick="approveSubcat('${r.id}')">Create it</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}

        <h2 style="font-size:var(--t-h3);font-weight:700;margin:var(--s-7) 0 var(--s-3);">All categories</h2>
        <p style="font-size:var(--t-small);color:var(--ink-dim);margin-bottom:var(--s-4);">Manage every category and subcategory. Click a category to see which shops are in it.</p>
        <div class="aq-cat-list">
          ${Taxonomy.getCategories().map(cat => {
            const subs = Taxonomy.getSubcategoriesOf(cat.id) || [];
            const shopsInCat = State.getShopsList().filter(s => {
              if (s.category === cat.id) return true;
              const prods = State.getProductsForShop(s.id);
              return prods.some(p => {
                const sub = Taxonomy.getSubcategoryById(p.subcategory);
                return sub?.categoryId === cat.id;
              });
            });
            return `
              <div class="aq-cat-card">
                <div class="aq-cat-head">
                  <div class="aq-cat-icon">${cat.icon && cat.icon.startsWith('http') ? `<img src="${cat.icon}" style="width:80%;height:80%;object-fit:contain;" />` : (cat.icon && cat.icon.startsWith('cat_') ? icon(cat.icon) : (cat.icon || ''))}</div>
                  <div style="flex:1;">
                    <div class="aq-cat-name">${cat.label}</div>
                    <div class="aq-cat-meta">${subs.length} subcategor${subs.length === 1 ? 'y' : 'ies'} · ${shopsInCat.length} shop${shopsInCat.length === 1 ? '' : 's'}</div>
                  </div>
                  <button class="aq-btn-sm" onclick="editCategoryModal('${cat.id}')" title="Edit name/icon">Edit</button>
                  <button class="aq-btn-sm" onclick="Router.go('/admin/create-subcategory?cat=${cat.id}')" title="Add subcategory">+ Sub</button>
                  <button class="aq-btn-icon-danger" onclick="deleteCategoryConfirm('${cat.id}','${cat.label.replace(/'/g, "\\'")}')" title="Delete category">✕</button>
                </div>
                ${subs.length ? `
                  <div class="aq-sub-list">
                    ${subs.map(sub => {
                      const subShopCount = State.getShopsList().filter(s => {
                        const prods = State.getProductsForShop(s.id);
                        return prods.some(p => p.subcategory === sub.id);
                      }).length;
                      return `
                        <div class="aq-sub-row">
                          <span class="aq-sub-name">${sub.label}</span>
                          <span style="font-size:var(--t-micro);color:var(--ink-dim);">${subShopCount} shop${subShopCount === 1 ? '' : 's'}</span>
                          <button class="aq-btn-icon-sm" onclick="editSubcategoryModal('${sub.id}')" title="Edit">✎</button>
                          <button class="aq-btn-icon-danger sm" onclick="deleteSubcategoryConfirm('${sub.id}','${sub.label.replace(/'/g, "\\'")}')" title="Delete">✕</button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : ''}
                ${shopsInCat.length ? `
                  <div class="aq-shops-in-cat">
                    <div class="aq-shops-label">Shops in this category:</div>
                    <div class="aq-shop-chips">
                      ${shopsInCat.slice(0, 6).map(s => `
                        <button class="aq-shop-chip" onclick="Router.go('/admin/shop/${s.id}')">
                          <span class="aq-shop-chip-avatar" style="background:${s.accent};">${s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span>
                          ${s.name}
                        </button>
                      `).join('')}
                      ${shopsInCat.length > 6 ? `<span style="font-size:var(--t-micro);color:var(--ink-dim);align-self:center;">+ ${shopsInCat.length - 6} more</span>` : ''}
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </main>
      ${AQ_STYLES}
    </div>
  `;
});

async function deleteCategoryConfirm(catId, catLabel) {
  if (!confirm(`Permanently delete category "${catLabel}"?\n\nThis also removes all subcategories. Products in those subcategories will be orphaned.`)) return;
  try {
    if (window.DB && DB.isReady()) await DB.deleteCategory(catId);
    delete Taxonomy.TREE[catId];
    log('Admin', `deleted category ${catId}`);
    alert(`Category "${catLabel}" deleted.`);
    Router.reload();
  } catch (e) { alert('Delete failed: ' + e.message); }
}
async function deleteSubcategoryConfirm(subId, subLabel) {
  if (!confirm(`Permanently delete subcategory "${subLabel}"?\n\nProducts in this subcategory will be orphaned.`)) return;
  try {
    if (window.DB && DB.isReady()) await DB.deleteSubcategory(subId);
    Object.values(Taxonomy.TREE).forEach(c => {
      if (c.subcategories && c.subcategories[subId]) delete c.subcategories[subId];
    });
    log('Admin', `deleted subcategory ${subId}`);
    alert(`Subcategory "${subLabel}" deleted.`);
    Router.reload();
  } catch (e) { alert('Delete failed: ' + e.message); }
}

async function approveCatReq(reqId) {
  try {
    await DB.approveCategoryRequest(reqId);
    // also remove from local state
    State.update('categoryRequests', m => { const n = {...m}; delete n[reqId]; return n; });
    alert('Main category created! It now appears for all sellers. (Define its subcategories next.)');
  } catch (e) { alert('Failed: ' + e.message); }
  Router.go('/admin/category-queue');
}
async function rejCatReq(reqId) {
  if (!confirm('Reject this category request?')) return;
  try { await DB.deleteCategoryRequest(reqId); } catch (e) {}
  State.update('categoryRequests', m => { const n = {...m}; delete n[reqId]; return n; });
  Router.go('/admin/category-queue');
}

/* ---- Admin: create a main category directly ---- */
Router.register('/admin/create-category', () => {
  if (!requireAdmin()) return '<div></div>';
  setTimeout(() => {
    const btn = document.getElementById('cc-submit');
    if (btn) btn.addEventListener('click', createCategoryDirect);
  }, 50);
  const catIcons = [
    { id: 'cat_fashion', label: 'Fashion' },
    { id: 'cat_accessories', label: 'Accessories' },
    { id: 'cat_electronics', label: 'Electronics' },
    { id: 'cat_home', label: 'Home' },
    { id: 'cat_kitchen', label: 'Kitchen' },
    { id: 'cat_beauty', label: 'Beauty' },
    { id: 'cat_grocery', label: 'Grocery' },
    { id: 'cat_toys', label: 'Toys' },
    { id: 'cat_sports', label: 'Sports' },
    { id: 'cat_health', label: 'Health' },
    { id: 'cat_automotive', label: 'Auto' },
    { id: 'cat_books', label: 'Books' },
    { id: 'cat_baby', label: 'Baby' },
    { id: 'cat_pets', label: 'Pets' },
  ];
  return `
    <div class="screen aq">
      ${adminHeader('Create category')}
      <main class="aq-main">
        <div class="aq-field">
          <label class="aq-label">Category name</label>
          <input id="cc-name" class="aq-input" placeholder="e.g. Industrial Equipment" />
        </div>
        <div class="aq-field">
          <label class="aq-label">Pick an icon</label>
          <div id="cc-icons" style="display:flex;flex-wrap:wrap;gap:var(--s-2);">
            ${catIcons.map((ic,i) => `<button type="button" class="cc-icon ${i===0?'active':''}" data-icon="${ic.id}" onclick="document.querySelectorAll('.cc-icon').forEach(x=>x.classList.remove('active'));this.classList.add('active');" title="${ic.label}">${icon(ic.id)}</button>`).join('')}
          </div>
        </div>
        <button id="cc-submit" class="btn btn-primary btn-large btn-block" style="margin-top:var(--s-4);">Create category</button>
      </main>
      <style>
        .cc-icon { width:48px; height:48px; border-radius:var(--r-md); background:var(--surface); border:2px solid var(--border); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--ink-dim); }
        .cc-icon svg { width:22px; height:22px; }
        .cc-icon.active { border-color:var(--accent); background:var(--accent-soft); color:var(--accent); }
        .cc-icon:hover { border-color:var(--accent); color:var(--accent); }
      </style>
      ${AQ_STYLES}
    </div>
  `;
});

async function createCategoryDirect() {
  const name = document.getElementById('cc-name').value.trim();
  const iconBtn = document.querySelector('.cc-icon.active');
  const emoji = iconBtn ? iconBtn.dataset.icon : '📦';
  if (!name) { alert('Enter a category name.'); return; }
  const catId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  try {
    await DB.addCategory({ id: catId, label: name, icon: emoji, createdBy: 'admin' });
    // add to live taxonomy immediately
    Taxonomy.addCategory({ id: catId, label: name, icon: emoji, subcategories: {} });
    alert(`Category "${name}" created. Sellers can now request subcategories under it.`);
  } catch (e) { alert('Failed: ' + e.message); }
  Router.go('/admin/category-queue');
}


async function approveSubcat(reqId) {
  State.approveSubcatRequest(reqId);
  try { await DB.approveSubcatRequest(reqId); } catch (e) { log('Admin','subcat DB sync failed: '+e.message,'error'); }
  alert('Subcategory created with default fields. In production you would now define its full field schema (sizes, materials, etc.).');
  Router.go('/admin/category-queue');
}
async function rejSubcat(reqId) {
  if (!confirm('Reject this request?')) return;
  State.rejectSubcatRequest(reqId);
  try { await DB.deleteSubcatRequest(reqId); } catch (e) {}
  Router.go('/admin/category-queue');
}
function redirectSubcat(reqId) {
  const existing = prompt('Point shopkeeper to which existing subcategory? (this auto-replies to them)', 'carpets');
  if (existing) {
    State.rejectSubcatRequest(reqId);
    alert(`Auto-replied to shopkeeper: "Please use the existing '${existing}' subcategory."`);
    Router.go('/admin/category-queue');
  }
}

/* ============================================================
   CREATE SHOP (admin creates directly)
   ============================================================ */
Router.register('/admin/create-shop', () => {
  if (!requireAdmin()) return '<div></div>';
  log('Admin/CreateShop', 'mounted');

  setTimeout(() => {
    const form = document.getElementById('cs-form');
    if (form) form.addEventListener('submit', handleCreateShop);
    const toggle = document.getElementById('cs-autolive');
    if (toggle) toggle.addEventListener('click', () => toggle.classList.toggle('on'));
  }, 50);

  const countryOpts = Locale.getCountryList().map(c => `<option value="${c.code}">${c.code} — ${c.name}</option>`).join('');
  return `
    <div class="screen aq">
      ${adminHeader('Create shop')}
      <main class="aq-main">
        <form id="cs-form">
          <div class="aq-field">
            <label class="aq-label">Shop name</label>
            <input id="cs-name" class="aq-input" placeholder="e.g. Karachi Kitchenware" required />
          </div>
          <div class="aq-field">
            <label class="aq-label">Owner name</label>
            <input id="cs-owner" class="aq-input" placeholder="Owner full name" required />
          </div>
          <div class="aq-field">
            <label class="aq-label">Owner email</label>
            <input id="cs-email" type="email" class="aq-input" placeholder="owner@example.com" required />
          </div>
          <div class="aq-field">
            <label class="aq-label">Country</label>
            <select id="cs-country" class="aq-input" required onchange="updateCitySelect('cs-city', this.value)">
              <option value="">Choose...</option>
              ${countryOpts}
            </select>
          </div>
          <div class="aq-field">
            <label class="aq-label">City</label>
            <select id="cs-city" class="aq-input" required>
              <option value="">Choose country first...</option>
            </select>
          </div>
          <div class="aq-field">
            <label class="aq-label">Primary category</label>
            <select id="cs-category" class="aq-input" required>
              <option value="">Choose...</option>
              ${Taxonomy.getCategories().map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
            </select>
          </div>
          <div class="aq-toggle-row">
            <div>
              <div style="font-size:var(--t-small);font-weight:600;">Auto-live products</div>
              <div style="font-size:var(--t-micro);color:var(--ink-dim);margin-top:2px;">Products go live without manual approval</div>
            </div>
            <button type="button" id="cs-autolive" class="aq-toggle"><span class="aq-toggle-knob"></span></button>
          </div>

          <div class="aq-field">
            <label class="aq-label">Shop branding (optional, can be added later)</label>
            <div class="cs-visuals">
              <div class="cs-visual-card">
                <div class="cs-visual-preview cs-logo-preview" id="cs-logo-preview">${icon('camera')}<span>Logo</span></div>
                <input type="file" id="cs-logo-input" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="csHandleLogo(event)" />
                <button type="button" class="aq-btn-sm" onclick="document.getElementById('cs-logo-input').click()">Upload logo</button>
              </div>
              <div class="cs-visual-card">
                <div class="cs-visual-preview cs-banner-preview" id="cs-banner-preview">${icon('camera')}<span>Banner</span></div>
                <input type="file" id="cs-banner-input" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="csHandleBanner(event)" />
                <button type="button" class="aq-btn-sm" onclick="document.getElementById('cs-banner-input').click()">Upload banner</button>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-large btn-block">Create shop & generate login</button>
        </form>
      </main>
      ${AQ_STYLES}
    </div>
  `;
});

async function handleCreateShop(e) {
  e.preventDefault();
  const info = {
    name: document.getElementById('cs-name').value,
    owner: document.getElementById('cs-owner').value,
    email: document.getElementById('cs-email').value,
    city: document.getElementById('cs-city').value,
    country: document.getElementById('cs-country')?.value || '',
    category: document.getElementById('cs-category').value,
    autoLive: document.getElementById('cs-autolive').classList.contains('on'),
    logo: window._csPendingLogo || null,
    banner: window._csPendingBanner || null,
  };
  const result = State.createShopDirect(info);
  delete window._csPendingLogo;
  delete window._csPendingBanner;
  // Persist to DB
  try {
    const newShop = State.getShop(result.shopId);
    if (newShop) await DB.createShop(newShop);
  } catch (e) { log('Admin', 'DB sync failed: ' + e.message, 'error'); }
  alert(`Shop created!\n\nGenerated credentials:\nShop ID: ${result.credentials.shopId}\nPassword: ${result.credentials.password}\n\nIn production these are emailed to ${info.email}.`);
  Router.go('/admin/home');
}

/* ============================================================
   ADMIN: Product detail review (with 3D model preview)
   ============================================================ */
Router.registerDynamic('/admin/product-review/', (pid) => {
  if (!requireAdmin()) return '<div></div>';
  const p = State.getProduct(pid);
  if (!p) return '<div style="padding:2rem;">Product not found</div>';
  const shop = State.getShop(p.shop);
  const sub = Taxonomy.getSubcategoryById(p.subcategory);
  const hasModel = p.models && p.models.glb && (p.models.glb.startsWith('blob:') || p.models.glb.startsWith('http'));

  log('Admin/ProductReview', pid);
  setTimeout(() => {
    const mv = document.getElementById('apr-model');
    SizeEditor.injectStyles();
    if (window.ModelAudit) ModelAudit.injectStyles();

    // Audit preview shows the ACTUAL model at the entered size (framed), with
    // the chosen strategy, so the admin can see any squeeze/stretch.
    const rd0 = p.models && p.models.realDimsCm;
    if (mv && rd0 && (rd0.w || rd0.h || rd0.d)) ModelFit.apply(mv, rd0, { strategy: p.models.scaleStrategy || 'auto', frame: true });
    else if (mv) ModelFit.resetFit(mv);

    // Live-update preview when any W/H/D input changes. Use whichever
    // strategy the admin has currently picked (if they ran audit), else
    // the saved one, else 'auto'.
    const updatePreview = () => {
      if (!mv) return;
      const size = SizeEditor.read('apr');
      const { w, h, d } = size.realDimsCm;
      const strategy = (window.ModelAudit && ModelAudit.readChoice('apr')) || (p.models && p.models.scaleStrategy) || 'auto';
      if (w || h || d) ModelFit.apply(mv, size.realDimsCm, { strategy, frame: true });
      else ModelFit.resetFit(mv);
    };
    ['apr-w','apr-h','apr-d'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updatePreview);
    });
    if (mv) mv.addEventListener('load', updatePreview);
    if (mv) mv.addEventListener('load', async () => {
      try {
        const raw = await ModelFit.measureRaw(mv);
        SizeEditor.setRawWarning('apr', raw);
        // Bridge: the seller form saves a single real size (realSizeCm) with no
        // W/H/D. Convert it into concrete W/H/D using the model's real
        // proportions so the admin sees and can edit the seller's size (and it
        // matches what AR/baking will use). Only fills empty fields.
        const cur = SizeEditor.read('apr').realDimsCm;
        const single = p.models && p.models.realSizeCm;
        if (raw && single > 0 && !(cur.w || cur.h || cur.d)) {
          const longest = Math.max(raw.x, raw.y, raw.z) || 1;
          const f = single / (longest * 100); // scale so longest axis = single cm
          const fill = (id, meters) => {
            const el = document.getElementById(id);
            if (el && !el.value) el.value = Math.round(meters * 100 * f * 10) / 10;
          };
          fill('apr-w', raw.x); fill('apr-h', raw.y); fill('apr-d', raw.z);
          SizeEditor.updateDiagram('apr');
          updatePreview();
        }
      } catch (e) {}
    });
  }, 100);

  // Build spec rows from schema
  const opts = p.options || {};
  const specRows = (sub?.fields || []).map(f => {
    let v = opts[f.key];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) return '';
    if (Array.isArray(v)) v = v[0]?.label ? v.map(x => x.label).join(', ') : v.join(', ');
    if (typeof v === 'boolean') v = v ? 'Yes' : 'No';
    return `<div class="aq-meta" style="grid-template-columns:1fr;margin-bottom:var(--s-1);"><div><div class="aq-meta-key">${f.label}</div><div class="aq-meta-val">${v}</div></div></div>`;
  }).filter(Boolean).join('');

  return `
    <div class="screen aq">
      ${adminHeader('Review product')}
      <main class="aq-main">
        <div class="aq-card">
          <div class="aq-card-head">
            <div class="aq-card-avatar" style="background:${shop?.accent}">${categoryGlyphForSub(p.subcategory)}</div>
            <div><div class="aq-card-name">${p.name}</div><div class="aq-card-owner">${shop?.name} · ${sub?.label}</div></div>
            <div class="aq-card-time">${statusLabel(p.status)}</div>
          </div>

          ${(p.photoUrls && p.photoUrls.length) ? `
            <div class="aq-section" style="margin-bottom:var(--s-4);">
              <div class="aq-meta-key" style="margin-bottom:var(--s-2);">Product photos · cover is the thumbnail customers see</div>
              <div class="apr-photos-grid">
                ${p.photoUrls.map((url, i) => `
                  <div class="apr-photo ${i === 0 ? 'is-cover' : ''}" style="background:url('${url}') center/cover;">
                    ${i === 0 ? '<span class="apr-photo-cover">COVER</span>' : `<button class="apr-photo-make-cover" onclick="adminMakeCover('${p.id}', ${i})" title="Make cover photo">Use as cover</button>`}
                    <button class="apr-photo-del" onclick="adminDeleteProductPhoto('${p.id}', ${i})" title="Delete">×</button>
                  </div>
                `).join('')}
                <div class="apr-photo apr-photo-add" onclick="document.getElementById('apr-add-photo-${p.id}').click()">
                  + Add photo
                  <input type="file" id="apr-add-photo-${p.id}" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="adminAddProductPhoto(event, '${p.id}')" />
                </div>
              </div>
              <div class="fr-hint">Click "Use as cover" to make any photo the thumbnail. Click × to delete.</div>
            </div>
          ` : `
            <div class="aq-section" style="margin-bottom:var(--s-4);">
              <div class="aq-meta-key" style="margin-bottom:var(--s-2);">Product photos</div>
              <div class="aq-photoissue" style="margin-bottom:var(--s-2);">No photos uploaded yet. Add one to give this product a thumbnail.</div>
              <button class="btn btn-ghost" onclick="document.getElementById('apr-add-photo-${p.id}').click()">+ Upload first photo</button>
              <input type="file" id="apr-add-photo-${p.id}" accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="adminAddProductPhoto(event, '${p.id}')" />
            </div>
          `}

          ${hasModel ? `
            <div style="margin-bottom:var(--s-4);">
              <div class="aq-meta-key" style="margin-bottom:var(--s-2);">Uploaded 3D model ${p.models.realSizeCm ? '· ' + p.models.realSizeCm + 'cm real size' : ''}</div>
              <model-viewer id="apr-model" src="${p.models.glb}" alt="${p.name}" camera-controls auto-rotate ar-scale="fixed" shadow-intensity="1" exposure="1.1" environment-image="neutral" style="width:100%;height:300px;background:var(--bg);border-radius:var(--r-md);"></model-viewer>
            </div>
          ` : `
            <div class="aq-photoissue" style="margin-bottom:var(--s-4);">No 3D model yet — admin can upload one below, or HOLOS team builds it from the ${p.photos} photos.</div>
          `}

          <!-- Admin AR Model Upload -->
          <div class="apr-ar-section">
            <div class="apr-ar-title">${icon('cube')} ${hasModel ? 'Replace' : 'Upload'} AR model</div>
            <p class="apr-ar-desc">Upload .glb (Android/Web) and .usdz (iOS) so this product is viewable in AR by customers.</p>
            <div class="apr-ar-grid">
              <div class="apr-ar-slot" id="apr-glb-slot">
                <input type="file" id="apr-glb-input" accept=".glb,.gltf" style="display:none;" />
                <div class="apr-ar-slot-label">.glb (Android / Web)</div>
                <div class="apr-ar-slot-status" id="apr-glb-status">${p.models?.glb ? '✓ Uploaded' : 'Tap to upload'}</div>
              </div>
              <div class="apr-ar-slot" id="apr-usdz-slot">
                <input type="file" id="apr-usdz-input" accept=".usdz,.zip" style="display:none;" />
                <div class="apr-ar-slot-label">.usdz (iOS / iPadOS)</div>
                <div class="apr-ar-slot-status" id="apr-usdz-status">${p.models?.usdz ? '✓ Uploaded' : 'Tap to upload'}</div>
              </div>
            </div>
            <div style="margin-top:var(--s-4);padding-top:var(--s-4);border-top:1px solid var(--border);">
              <label class="fr-label" style="margin-bottom:var(--s-3);display:block;">Real-world size (W × H × D) — required for accurate AR</label>
              ${SizeEditor.render('apr', p.subcategory, p.models)}
              ${(!(p.models?.realDimsCm?.w || p.models?.realDimsCm?.h || p.models?.realDimsCm?.d || p.models?.realSizeCm)) ? `<div class="fr-hint" style="color:var(--danger);font-weight:600;margin-top:var(--s-3);">⚠ No size set yet — AR will show the model at its raw export size which is often wrong.</div>` : ''}
            </div>

            <!-- Model Audit panel -->
            <div style="margin-top:var(--s-4);padding-top:var(--s-4);border-top:1px solid var(--border);">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--s-3);flex-wrap:wrap;gap:var(--s-2);">
                <label class="fr-label" style="margin:0;">Model audit</label>
                <button type="button" class="aq-btn-sm" onclick="runModelAudit('${p.id}')">Run audit</button>
              </div>
              <div id="apr-audit-panel">
                ${p.models?.scaleStrategy && p.models.scaleStrategy !== 'auto' ? `
                  <div class="ma-saved">
                    <div class="ma-saved-label">Last saved strategy</div>
                    <div class="ma-saved-value">${({uniform:'Uniform fit (model shape preserved)','per-axis':'Per-axis fit (exact dimensions)',rejected:'❌ Model rejected'})[p.models.scaleStrategy] || p.models.scaleStrategy}</div>
                  </div>
                ` : `
                  <div class="fr-hint" style="margin-top:var(--s-2);">No audit run yet. Customer AR is using automatic detection — click "Run audit" to compare the .glb against the declared size and lock in a strategy.</div>
                `}
              </div>
            </div>

            <div style="margin-top:var(--s-4);padding-top:var(--s-4);border-top:1px solid var(--border);">
              <label class="fr-label" style="margin:0 0 var(--s-2);">Fix size on every phone</label>
              <p class="fr-hint" style="margin:0 0 var(--s-3);">Bakes the size above into fresh <strong>.glb + .usdz</strong> files so AR is correct on <strong>iPhone and Android</strong> — even if the seller exported the model at the wrong scale. Set the size (and pick a strategy in audit) first.</p>
              <button type="button" class="btn btn-block" id="apr-normalize-btn" onclick="normalizeModelToRealSize('${p.id}')" style="background:var(--ink);color:#fff;">Normalize to real size &amp; save</button>
              <div id="apr-normalize-status" class="fr-hint" style="margin-top:var(--s-2);display:none;"></div>
            </div>

            <button class="btn btn-primary btn-block" onclick="saveAdminModelEdits('${p.id}')" style="margin-top:var(--s-3);">Save AR model changes</button>
          </div>

          <div class="aq-meta">
            <div><div class="aq-meta-key">Price</div><div class="aq-meta-val">Rs. ${(p.salePrice||p.price).toLocaleString()}</div></div>
            <div><div class="aq-meta-key">Photos</div><div class="aq-meta-val">${p.photos} uploaded</div></div>
          </div>

          <div style="margin:var(--s-3) 0;">${specRows}</div>

          ${p.description ? `<div style="font-size:var(--t-small);color:var(--ink-dim);line-height:1.5;margin-bottom:var(--s-3);">${p.description}</div>` : ''}

          <div class="aq-actions three">
            <button class="aq-btn-reject" onclick="askChanges('${p.id}')">Request photos</button>
            <button class="aq-btn-secondary" onclick="Router.go('/admin/product-queue')">Back</button>
            <button class="aq-btn-approve" onclick="approveProd('${p.id}')">Approve & go live</button>
          </div>
        </div>
      </main>
      ${AQ_STYLES}
    </div>
  `;
});

function viewProductDetail(pid) {
  Router.go('/admin/product-review/' + pid);
}

function updateCitySelect(selectId, countryCode) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const country = Locale.COUNTRIES[countryCode];
  if (!country) { sel.innerHTML = '<option value="">Choose country first...</option>'; return; }
  sel.innerHTML = '<option value="">Choose city...</option>' +
    country.cities.map(ct => '<option value="' + ct + '">' + ct + '</option>').join('');
}

/* ============================================================
   ADMIN: Create subcategory under any category (with schema builder)
   ============================================================ */
Router.register('/admin/create-subcategory', () => {
  if (!requireAdmin()) return '<div></div>';
  log('Admin/CreateSubcategory', 'mounted');
  const cats = Taxonomy.getCategories();
  // Read ?cat= from URL hash to pre-select parent
  const hashStr = window.location.hash || '';
  const queryStart = hashStr.indexOf('?');
  const preselectCat = queryStart >= 0
    ? (new URLSearchParams(hashStr.slice(queryStart + 1))).get('cat') || ''
    : '';
  const tryOnOptions = [
    { val: 'room', label: 'Room placement' },
    { val: 'face', label: 'Face try-on' },
    { val: 'foot', label: 'Foot try-on' },
    { val: 'wrist', label: 'Wrist try-on' },
    { val: 'finger', label: 'Finger try-on' },
    { val: 'body-ai', label: 'AI body try-on' },
    { val: 'wall', label: 'Wall placement' },
    { val: '', label: 'None (no AR)' },
  ];

  setTimeout(() => {
    const addFieldBtn = document.getElementById('csub-add-field');
    if (addFieldBtn) addFieldBtn.addEventListener('click', addSchemaField);
    const submitBtn = document.getElementById('csub-submit');
    if (submitBtn) submitBtn.addEventListener('click', submitSubcategory);
    if (preselectCat) {
      const sel = document.getElementById('csub-cat');
      if (sel) sel.value = preselectCat;
    }
  }, 60);

  return `
    <div class="screen aq">
      ${adminHeader('Create subcategory')}
      <main class="aq-main">
        <div class="aq-field">
          <label class="aq-label">Parent category</label>
          <select id="csub-cat" class="aq-input" required>
            <option value="">Choose...</option>
            ${cats.map(c => `<option value="${c.id}">${c.icon ? (c.icon.startsWith('cat_') ? '' : c.icon + ' ') : ''}${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="aq-field">
          <label class="aq-label">Subcategory name</label>
          <input id="csub-name" class="aq-input" placeholder="e.g. Air Conditioners" required />
        </div>
        <div class="aq-field">
          <label class="aq-label">AR try-on type</label>
          <select id="csub-tryon" class="aq-input">
            ${tryOnOptions.map(o => `<option value="${o.val}">${o.label}</option>`).join('')}
          </select>
        </div>

        <div class="ap2-divider"><span>Field schema</span></div>
        <p style="font-size:var(--t-small);color:var(--ink-dim);margin-bottom:var(--s-4);">Define what sellers fill in when adding products in this subcategory. Add fields for sizes, colors, materials, specs — whatever this product type needs.</p>

        <div id="csub-fields" class="csub-fields"></div>
        <button type="button" id="csub-add-field" class="btn btn-ghost btn-block" style="margin-bottom:var(--s-5);">${icon('plus')} Add a field</button>

        <button id="csub-submit" class="btn btn-primary btn-large btn-block">Create subcategory</button>
      </main>
      ${AQ_STYLES}
      <style>
        .csub-fields { display: flex; flex-direction: column; gap: var(--s-3); margin-bottom: var(--s-3); }
        .csub-field-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--s-4); }
        .csub-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2); margin-bottom: var(--s-2); }
        .csub-field-opts { margin-top: var(--s-2); }
      </style>
    </div>
  `;
});

let schemaFieldCount = 0;
function addSchemaField() {
  const container = document.getElementById('csub-fields');
  if (!container) return;
  const idx = schemaFieldCount++;
  const fieldTypes = ['text','textarea','number','select','multiselect','sizes','colors','boolean'];
  const div = document.createElement('div');
  div.className = 'csub-field-card';
  div.id = `csub-f-${idx}`;
  div.innerHTML = `
    <div class="csub-field-row">
      <div><label class="aq-label">Field label</label><input class="aq-input csub-flabel" placeholder="e.g. Material" /></div>
      <div><label class="aq-label">Type</label><select class="aq-input csub-ftype" onchange="toggleFieldOpts(${idx})">
        ${fieldTypes.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select></div>
    </div>
    <div class="csub-field-opts" id="csub-fopts-${idx}">
      <!-- shown for select/multiselect/sizes -->
    </div>
    <div style="display:flex;gap:var(--s-2);align-items:center;">
      <label style="font-size:var(--t-small);display:flex;align-items:center;gap:var(--s-2);cursor:pointer;"><input type="checkbox" class="csub-freq" /> Required</label>
      <button type="button" style="margin-left:auto;font-size:var(--t-small);color:var(--danger);cursor:pointer;" onclick="document.getElementById('csub-f-${idx}').remove()">Remove</button>
    </div>
  `;
  container.appendChild(div);
  toggleFieldOpts(idx);
}

function toggleFieldOpts(idx) {
  const card = document.getElementById(`csub-f-${idx}`);
  if (!card) return;
  const type = card.querySelector('.csub-ftype').value;
  const optsContainer = document.getElementById(`csub-fopts-${idx}`);
  if (['select','multiselect','sizes'].includes(type)) {
    optsContainer.innerHTML = `<label class="aq-label">Options (comma-separated)</label><input class="aq-input csub-foptions" placeholder="e.g. Cotton, Silk, Polyester" />`;
  } else if (type === 'number') {
    optsContainer.innerHTML = `<label class="aq-label">Unit (optional)</label><input class="aq-input csub-funit" placeholder="e.g. kg, cm, hours" />`;
  } else {
    optsContainer.innerHTML = '';
  }
}

async function submitSubcategory() {
  const catId = document.getElementById('csub-cat').value;
  const name = document.getElementById('csub-name').value.trim();
  const tryOn = document.getElementById('csub-tryon').value;
  if (!catId || !name) { alert('Please fill in the category and name.'); return; }

  // Collect fields
  const fieldCards = document.querySelectorAll('.csub-field-card');
  const fields = [];
  fieldCards.forEach(card => {
    const label = card.querySelector('.csub-flabel').value.trim();
    const type = card.querySelector('.csub-ftype').value;
    const required = card.querySelector('.csub-freq').checked;
    if (!label) return;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const field = { key, label, type, required };
    const optsInput = card.querySelector('.csub-foptions');
    if (optsInput && optsInput.value.trim()) {
      field.options = optsInput.value.split(',').map(o => o.trim()).filter(Boolean);
    }
    const unitInput = card.querySelector('.csub-funit');
    if (unitInput && unitInput.value.trim()) {
      field.unit = unitInput.value.trim();
    }
    fields.push(field);
  });

  // Always include colors as a default field if not already added
  if (!fields.find(f => f.type === 'colors')) {
    fields.push({ key: 'colors', label: 'Colors', type: 'colors', required: false });
  }

  const subId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const subDef = { id: subId, label: name, tryOn: tryOn || null, fields };

  // Add locally
  Taxonomy.addSubcategory(catId, subDef);

  // Save to DB
  try {
    await DB.addSubcategory(catId, subDef);
    alert(`Subcategory "${name}" created under ${Taxonomy.getCategory(catId)?.label || catId} with ${fields.length} fields. Sellers can now add products in this subcategory.`);
  } catch (e) {
    alert('Created locally. DB save failed: ' + e.message);
  }
  Router.go('/admin/category-queue');
}

/* ---- ADMIN AR MODEL UPLOAD ---- */
// Wire model upload slots on every product-review screen mount
window.addEventListener('screen:mounted', (e) => {
  if (!e.detail || !e.detail.path || !e.detail.path.includes('product-review')) return;
  setTimeout(wireAdminModelSlots, 50);
});

function wireAdminModelSlots() {
  const glbSlot = document.getElementById('apr-glb-slot');
  const glbInput = document.getElementById('apr-glb-input');
  const usdzSlot = document.getElementById('apr-usdz-slot');
  const usdzInput = document.getElementById('apr-usdz-input');

  if (glbSlot && glbInput) {
    glbSlot.onclick = (ev) => {
      // Don't trigger if the click came from the input itself
      if (ev.target === glbInput) return;
      ev.preventDefault();
      glbInput.click();
    };
    glbInput.onchange = (ev) => handleAdminModelUpload(ev, 'glb');
  }
  if (usdzSlot && usdzInput) {
    usdzSlot.onclick = (ev) => {
      if (ev.target === usdzInput) return;
      ev.preventDefault();
      usdzInput.click();
    };
    usdzInput.onchange = (ev) => handleAdminModelUpload(ev, 'usdz');
  }
}

async function handleAdminModelUpload(e, kind) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateModel(file);
  if (err) { alert(err); return; }
  const statusEl = document.getElementById(`apr-${kind}-status`);
  if (statusEl) statusEl.textContent = 'Uploading…';

  // Get product id from URL
  const pid = location.hash.split('/').pop();
  const p = State.getProduct(pid);
  if (!p) { alert('Product not found'); return; }

  try {
    const url = await Storage.uploadProductModel(p.shop, file, kind);
    // Stash into window so save can pick it up
    window._adminPendingModels = window._adminPendingModels || {};
    window._adminPendingModels[kind] = url;
    if (statusEl) statusEl.textContent = `✓ ${file.name}`;
    log('Admin', `${kind.toUpperCase()} uploaded: ${file.name}`);
  } catch (err) {
    alert('Upload failed: ' + err.message);
    if (statusEl) statusEl.textContent = 'Retry';
  }
}

function _bakerReady(timeoutMs) {
  return new Promise((resolve, reject) => {
    if (window.ModelBaker) return resolve();
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (window.ModelBaker) { clearInterval(iv); resolve(); }
      else if (Date.now() - t0 > (timeoutMs || 20000)) { clearInterval(iv); reject(new Error('3D engine failed to load — check your connection and retry')); }
    }, 150);
  });
}

async function normalizeModelToRealSize(pid) {
  const p = State.getProduct(pid);
  const srcGlb = (window._adminPendingModels && window._adminPendingModels.glb) || (p && p.models && p.models.glb);
  if (!p || !srcGlb) { alert('Upload a .glb model first, then normalize.'); return; }

  const sizeData = SizeEditor.read('apr');
  const whd = sizeData.realDimsCm || { w: 0, h: 0, d: 0 };
  const dims = (whd.w || whd.h || whd.d) ? whd
             : (sizeData.realSizeCm ? { w: sizeData.realSizeCm, h: 0, d: 0 } : null);
  if (!dims) { alert('Enter the real-world size (W \u00d7 H \u00d7 D in cm) above first.'); document.getElementById('apr-w')?.focus(); return; }

  const strategy = (window.ModelAudit && ModelAudit.readChoice('apr')) || (p.models && p.models.scaleStrategy) || 'auto';
  const btn = document.getElementById('apr-normalize-btn');
  const st = document.getElementById('apr-normalize-status');
  const show = (m) => { if (st) { st.style.display = 'block'; st.textContent = m; } };
  if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }

  try {
    show('Loading 3D engine\u2026');
    await _bakerReady();
    show('Reading & resizing model\u2026 (this can take a moment for big files)');
    const out = await ModelBaker.bake(srcGlb, dims, { strategy });

    show('Uploading corrected .glb\u2026');
    const glbFile = new File([out.glbBlob], 'normalized.glb', { type: 'model/gltf-binary' });
    const glbUrl = await Storage.uploadProductModel(p.shop, glbFile, 'glb');

    show('Uploading corrected .usdz\u2026');
    const usdzFile = new File([out.usdzBlob], 'normalized.usdz', { type: 'model/vnd.usdz+zip' });
    const usdzUrl = await Storage.uploadProductModel(p.shop, usdzFile, 'usdz');

    window._adminPendingModels = window._adminPendingModels || {};
    window._adminPendingModels.glb = glbUrl;
    window._adminPendingModels.usdz = usdzUrl;

    const n = out.normalized;
    show('\u2713 Normalized to ' + Math.round(n.w) + ' \u00d7 ' + Math.round(n.h) + ' \u00d7 ' + Math.round(n.d) + ' cm. Saving\u2026');
    log('Admin', 'normalized model for ' + pid + ' \u2192 ' + Math.round(n.w) + 'x' + Math.round(n.h) + 'x' + Math.round(n.d) + 'cm');
    await saveAdminModelEdits(pid);
  } catch (e) {
    show('Failed: ' + e.message);
    alert('Normalize failed: ' + e.message + '\n\nThe original model is unchanged.');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  }
}

async function saveAdminModelEdits(pid) {
  const p = State.getProduct(pid);
  if (!p) return;
  const pending = window._adminPendingModels || {};
  const sizeData = SizeEditor.read('apr');
  const hasAnySize = sizeData.realSizeCm > 0 || sizeData.realDimsCm.w > 0 || sizeData.realDimsCm.h > 0 || sizeData.realDimsCm.d > 0;

  if (!hasAnySize) {
    alert('Please enter the real-world Width × Height × Depth in centimeters.\n\nFor reference:\n• Watch: 4 × 4 × 1.2 cm\n• Sunglasses: 14 × 5 × 14 cm\n• Chair: 50 × 90 × 55 cm\n• Sofa: 220 × 90 × 95 cm');
    document.getElementById('apr-w')?.focus();
    return;
  }
  const longest = Math.max(sizeData.realSizeCm, sizeData.realDimsCm.w, sizeData.realDimsCm.h, sizeData.realDimsCm.d);
  if (longest > 1000) {
    if (!confirm(`${longest}cm is over 10 meters — is that correct? Most products are 5-200cm.`)) return;
  }

  // Did the admin run audit and choose a strategy? If so, persist it.
  // If not, keep whatever was already saved (defaults to 'auto').
  const chosenStrategy = (window.ModelAudit && ModelAudit.readChoice('apr')) || p.models?.scaleStrategy || 'auto';

  const newModels = {
    ...p.models,
    glb: pending.glb || p.models?.glb || '',
    usdz: pending.usdz || p.models?.usdz || '',
    realSizeCm: sizeData.realSizeCm,
    realDimsCm: sizeData.realDimsCm,
    scaleStrategy: chosenStrategy,
  };
  p.models = newModels;

  // If rejected, also flip product status so it doesn't go customer-facing
  if (chosenStrategy === 'rejected' || chosenStrategy === 'reject') {
    p.status = 'photo_review';
    p.photoIssue = '3D model rejected at audit — shape doesn\'t match the product. Needs re-modelling.';
  }

  State.update('products', ps => ({ ...ps, [pid]: p }));

  try {
    if (window.DB && DB.isReady()) {
      const sb = window.supabaseClient;
      let res = await sb.from('products').update({
        model_glb: newModels.glb,
        model_usdz: newModels.usdz,
        real_size_cm: newModels.realSizeCm,
        real_w_cm: newModels.realDimsCm.w,
        real_h_cm: newModels.realDimsCm.h,
        real_d_cm: newModels.realDimsCm.d,
        scale_strategy: newModels.scaleStrategy === 'reject' ? 'rejected' : newModels.scaleStrategy,
      }).eq('id', pid);
      // Friendly handling for missing scale_strategy column (migration 11 not run)
      if (res.error && /scale_strategy/.test(res.error.message)) {
        alert('Run "migration_11_scale_strategy.sql" in Supabase to enable Model Audit. Saving size data only for now.');
        res = await sb.from('products').update({
          model_glb: newModels.glb,
          model_usdz: newModels.usdz,
          real_size_cm: newModels.realSizeCm,
          real_w_cm: newModels.realDimsCm.w,
          real_h_cm: newModels.realDimsCm.h,
          real_d_cm: newModels.realDimsCm.d,
        }).eq('id', pid);
      }
      // Friendly handling for missing W/H/D columns (migration 9 not run yet)
      if (res.error && /real_(w|h|d)_cm/.test(res.error.message)) {
        alert('Your database is missing the W × H × D columns.\n\nRun "migration_9_canvas_size.sql" in Supabase, then try again.\n\n(The longest dimension was saved as a fallback.)');
        res = await sb.from('products').update({
          model_glb: newModels.glb,
          model_usdz: newModels.usdz,
          real_size_cm: newModels.realSizeCm,
        }).eq('id', pid);
      }
      if (res.error) throw new Error(res.error.message);
    }
    log('Admin', `models saved for ${pid}`);
    delete window._adminPendingModels;
    alert('AR model saved. Customers can now view this product in AR.');
    Router.reload();
  } catch (e) { alert('Save failed: ' + e.message); }
}

// Inject admin AR upload styles
(function() {
  if (document.getElementById('apr-ar-styles')) return;
  const s = document.createElement('style');
  s.id = 'apr-ar-styles';
  s.textContent = `
    .apr-ar-section { background: var(--accent-soft); border-radius: var(--r-md); padding: var(--s-4); margin: var(--s-4) 0; }
    .apr-ar-title { display: flex; align-items: center; gap: var(--s-2); font-weight: 700; font-size: var(--t-body); margin-bottom: var(--s-2); color: var(--accent); }
    .apr-ar-title svg { width: 16px; height: 16px; }
    .apr-ar-desc { font-size: var(--t-small); color: var(--ink-dim); margin-bottom: var(--s-3); line-height: 1.4; }
    .apr-ar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2); }
    @media (max-width: 500px) { .apr-ar-grid { grid-template-columns: 1fr; } }
    .apr-ar-slot { background: white; border: 2px dashed var(--border-strong); border-radius: var(--r-md); padding: var(--s-4); cursor: pointer; text-align: center; transition: all 160ms; }
    .apr-ar-slot:hover { border-color: var(--accent); background: var(--surface); }
    .apr-ar-slot-label { font-size: var(--t-small); font-weight: 600; margin-bottom: 4px; }
    .apr-ar-slot-status { font-size: var(--t-micro); color: var(--ink-dim); }
  `;
  document.head.appendChild(s);
})();

/* ============================================================
   EDIT CATEGORY MODAL — rename, change icon
   ============================================================ */
function editCategoryModal(catId) {
  const cat = Taxonomy.getCategory(catId);
  if (!cat) return;
  const allIcons = [
    'cat_fashion','cat_accessories','cat_electronics','cat_home','cat_kitchen','cat_beauty',
    'cat_grocery','cat_toys','cat_sports','cat_health','cat_automotive','cat_books','cat_baby','cat_pets'
  ];
  const html = `
    <div id="edcat-modal" class="edcat-modal" onclick="if(event.target===this)closeEditCat()">
      <div class="edcat-card">
        <div class="edcat-head">
          <h3>Edit category</h3>
          <button onclick="closeEditCat()">✕</button>
        </div>
        <div class="edcat-body">
          <div class="fr-field">
            <label class="fr-label">Category name</label>
            <input type="text" id="edcat-name" class="fr-input" value="${cat.label.replace(/"/g, '&quot;')}" />
          </div>
          <div class="fr-field">
            <label class="fr-label">Icon</label>
            <div class="edcat-icons">
              ${allIcons.map(ic => `
                <button type="button" class="edcat-icon ${cat.icon === ic ? 'active' : ''}" data-icon="${ic}" onclick="document.querySelectorAll('.edcat-icon').forEach(x=>x.classList.remove('active'));this.classList.add('active');document.getElementById('edcat-custom-preview').style.display='none';" title="${ic.replace('cat_','')}">${icon(ic)}</button>
              `).join('')}
              <button type="button" class="edcat-icon edcat-icon-upload ${cat.icon && cat.icon.startsWith('http') ? 'active' : ''}" data-icon="custom" onclick="document.getElementById('edcat-icon-input').click()" title="Upload custom icon">
                ${cat.icon && cat.icon.startsWith('http') ? `<img src="${cat.icon}" />` : '<span style="font-size:1.4rem;">+</span>'}
              </button>
              <input type="file" id="edcat-icon-input" accept="image/png,image/jpeg,image/svg+xml,image/webp" style="display:none;" onchange="handleCustomIconUpload(event, '${catId}')" />
            </div>
            <div id="edcat-custom-preview" style="display:${cat.icon && cat.icon.startsWith('http') ? 'block' : 'none'};margin-top:var(--s-3);padding:var(--s-3);background:var(--accent-soft);border-radius:var(--r-md);font-size:var(--t-small);">
              Custom icon: <strong id="edcat-custom-name">${cat.icon && cat.icon.startsWith('http') ? 'Uploaded' : ''}</strong>
            </div>
            <div class="fr-hint">PNG, JPG, SVG, or WebP. Square works best. Max 2 MB.</div>
          </div>
          <button class="btn btn-primary btn-block" onclick="saveCategoryEdit('${catId}')">Save changes</button>
        </div>
      </div>
    </div>
  `;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstElementChild);
  ensureEditCatStyles();
}

function closeEditCat() {
  const m = document.getElementById('edcat-modal');
  if (m) m.remove();
}

async function saveCategoryEdit(catId) {
  const newName = document.getElementById('edcat-name').value.trim();
  const activeIconBtn = document.querySelector('.edcat-icon.active');
  let newIcon = activeIconBtn ? activeIconBtn.dataset.icon : null;
  // If "custom" was selected, use the uploaded URL
  if (newIcon === 'custom') {
    newIcon = window._pendingCustomIcon || (Taxonomy.getCategory(catId)?.icon || null);
    if (!newIcon || !newIcon.startsWith('http')) {
      alert('Please upload an icon file first, or select a built-in icon.');
      return;
    }
  }
  if (!newName) { alert('Category name cannot be empty.'); return; }

  // Update local taxonomy
  if (Taxonomy.TREE[catId]) {
    Taxonomy.TREE[catId].label = newName;
    if (newIcon) Taxonomy.TREE[catId].icon = newIcon;
  }
  // Persist to DB
  try {
    if (window.DB && DB.isReady()) {
      const sb = window.supabaseClient;
      const row = { label: newName };
      if (newIcon) row.icon = newIcon;
      const res = await sb.from('categories').update(row).eq('id', catId);
      if (res.error) throw new Error(res.error.message);
    }
    log('Admin', `category ${catId} renamed to "${newName}"`);
    delete window._pendingCustomIcon;
    closeEditCat();
    alert('Category updated.');
    Router.reload();
  } catch (e) { alert('Save failed: ' + e.message); }
}

async function handleCustomIconUpload(e, catId) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert('File too large (max 2 MB).');
    return;
  }
  try {
    const sb = window.supabaseClient;
    const ext = file.name.split('.').pop().toLowerCase();
    const path = `category-icons/${catId}-${Date.now().toString(36)}.${ext}`;
    const upRes = await sb.storage.from('shop-assets').upload(path, file, { upsert: true });
    if (upRes.error) throw new Error(upRes.error.message);
    const { data } = sb.storage.from('shop-assets').getPublicUrl(path);
    window._pendingCustomIcon = data.publicUrl;

    // Mark the custom button as active
    document.querySelectorAll('.edcat-icon').forEach(x => x.classList.remove('active'));
    const customBtn = document.querySelector('.edcat-icon[data-icon="custom"]');
    if (customBtn) {
      customBtn.classList.add('active');
      customBtn.innerHTML = `<img src="${data.publicUrl}" />`;
    }
    const preview = document.getElementById('edcat-custom-preview');
    const nameEl = document.getElementById('edcat-custom-name');
    if (preview) preview.style.display = 'block';
    if (nameEl) nameEl.textContent = file.name;
    log('Admin', `custom icon uploaded for ${catId}`);
  } catch (err) {
    alert('Upload failed: ' + err.message);
  }
}

/* ============================================================
   EDIT SUBCATEGORY MODAL — rename
   ============================================================ */
function editSubcategoryModal(subId) {
  const sub = Taxonomy.getSubcategoryById(subId);
  if (!sub) return;
  const html = `
    <div id="edcat-modal" class="edcat-modal" onclick="if(event.target===this)closeEditCat()">
      <div class="edcat-card">
        <div class="edcat-head">
          <h3>Edit subcategory</h3>
          <button onclick="closeEditCat()">✕</button>
        </div>
        <div class="edcat-body">
          <div class="fr-field">
            <label class="fr-label">Subcategory name</label>
            <input type="text" id="edsub-name" class="fr-input" value="${sub.label.replace(/"/g, '&quot;')}" />
          </div>
          <div class="fr-hint">Schema fields (sizes, colors, materials etc) can't be changed here — they're set when creating the subcategory.</div>
          <button class="btn btn-primary btn-block" style="margin-top:var(--s-4);" onclick="saveSubcategoryEdit('${subId}')">Save changes</button>
        </div>
      </div>
    </div>
  `;
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstElementChild);
  ensureEditCatStyles();
}

async function saveSubcategoryEdit(subId) {
  const newName = document.getElementById('edsub-name').value.trim();
  if (!newName) { alert('Subcategory name cannot be empty.'); return; }
  const sub = Taxonomy.getSubcategoryById(subId);
  if (!sub) { alert('Subcategory not found.'); return; }

  // Update local taxonomy
  const parentCat = Taxonomy.TREE[sub.categoryId];
  if (parentCat && parentCat.subcategories[subId]) {
    parentCat.subcategories[subId].label = newName;
  }

  try {
    if (window.DB && DB.isReady()) {
      const sb = window.supabaseClient;
      const res = await sb.from('subcategories').update({ label: newName }).eq('id', subId);
      if (res.error) throw new Error(res.error.message);
    }
    log('Admin', `subcategory ${subId} renamed to "${newName}"`);
    closeEditCat();
    alert('Subcategory updated.');
    Router.reload();
  } catch (e) { alert('Save failed: ' + e.message); }
}

function ensureEditCatStyles() {
  if (document.getElementById('edcat-styles')) return;
  const s = document.createElement('style');
  s.id = 'edcat-styles';
  s.textContent = `
    .edcat-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: var(--s-4); }
    .edcat-card { background: var(--surface); border-radius: var(--r-lg); max-width: 480px; width: 100%; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column; }
    .edcat-head { display: flex; align-items: center; justify-content: space-between; padding: var(--s-4) var(--s-5); border-bottom: 1px solid var(--border); }
    .edcat-head h3 { font-size: var(--t-h2); font-weight: 700; }
    .edcat-head button { width: 28px; height: 28px; border-radius: 50%; background: var(--bg); border: none; cursor: pointer; font-size: 0.9rem; }
    .edcat-body { padding: var(--s-4) var(--s-5); overflow-y: auto; }
    .edcat-icons { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--s-2); margin-top: var(--s-2); }
    @media (max-width: 500px) { .edcat-icons { grid-template-columns: repeat(5, 1fr); } }
    .edcat-icon { width: 100%; aspect-ratio: 1; border-radius: var(--r-md); background: var(--bg); border: 2px solid var(--border); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--ink-dim); }
    .edcat-icon svg { width: 22px; height: 22px; }
    .edcat-icon.active { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
    .edcat-icon:hover { border-color: var(--accent); color: var(--accent); }
    .edcat-icon img { width: 80%; height: 80%; object-fit: contain; }
    .edcat-icon-upload { background: var(--accent-soft) !important; color: var(--accent) !important; }
    .aq-btn-icon-sm { width: 22px; height: 22px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); border: none; cursor: pointer; font-size: 0.65rem; }
    .aq-btn-icon-sm:hover { background: var(--accent); color: white; }
  `;
  document.head.appendChild(s);
}

/* Admin Create Shop — logo + banner upload handlers */
async function csHandleLogo(e) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateAsset(file);
  if (err) { alert(err); return; }
  try {
    const tempId = 'pending-' + Date.now().toString(36);
    const url = await Storage.uploadShopAsset(tempId, file, 'logo');
    window._csPendingLogo = url;
    const preview = document.getElementById('cs-logo-preview');
    if (preview) { preview.style.background = `url('${url}') center/cover`; preview.innerHTML = ''; }
    log('Admin/CreateShop', 'logo uploaded');
  } catch (err) { alert('Upload failed: ' + err.message); }
}

async function csHandleBanner(e) {
  const file = e.target.files[0];
  if (!file) return;
  const err = Storage.validateAsset(file);
  if (err) { alert(err); return; }
  try {
    const tempId = 'pending-' + Date.now().toString(36);
    const url = await Storage.uploadShopAsset(tempId, file, 'banner');
    window._csPendingBanner = url;
    const preview = document.getElementById('cs-banner-preview');
    if (preview) { preview.style.background = `url('${url}') center/cover`; preview.innerHTML = ''; }
    log('Admin/CreateShop', 'banner uploaded');
  } catch (err) { alert('Upload failed: ' + err.message); }
}

/* Inject create-shop visual styles */
(function() {
  if (document.getElementById('cs-visual-styles')) return;
  const s = document.createElement('style');
  s.id = 'cs-visual-styles';
  s.textContent = `
    .cs-visuals { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-3); }
    @media (max-width: 500px) { .cs-visuals { grid-template-columns: 1fr; } }
    .cs-visual-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-md); padding: var(--s-3); text-align: center; }
    .cs-visual-preview { width: 100%; border-radius: var(--r-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: var(--ink-muted); font-size: 0.75rem; background: var(--surface); border: 2px dashed var(--border); margin-bottom: var(--s-2); }
    .cs-visual-preview svg { width: 22px; height: 22px; }
    .cs-logo-preview { aspect-ratio: 1; }
    .cs-banner-preview { aspect-ratio: 3 / 1; }
  `;
  document.head.appendChild(s);
})();

/* ============================================================
   ADMIN: Product photo management
   Admin can add, delete, or reorder photos. Photo at index 0
   is the cover thumbnail customers see everywhere.
   ============================================================ */
async function adminAddProductPhoto(e, pid) {
  const file = e.target.files[0];
  if (!file) return;
  const p = State.getProduct(pid);
  if (!p) return;
  const err = Storage.validateProductPhoto ? Storage.validateProductPhoto(file) : Storage.validateAsset(file);
  if (err) { alert(err); return; }
  try {
    const url = await Storage.uploadProductPhoto(p.shop, file);
    const newPhotos = [...(p.photoUrls || []), url];
    p.photoUrls = newPhotos;
    p.photos = newPhotos.length;
    // If poster wasn't set, use this as the model poster too
    if (!p.models?.poster && newPhotos.length === 1) {
      p.models = { ...p.models, poster: url };
    }
    State.update('products', ps => ({ ...ps, [pid]: p }));
    if (window.DB && DB.isReady()) {
      const sb = window.supabaseClient;
      await sb.from('products').update({
        photo_urls: newPhotos,
        photos: newPhotos.length,
        model_poster: p.models?.poster || url,
      }).eq('id', pid);
    }
    log('Admin', `added photo to ${pid}`);
    Router.reload();
  } catch (err) { alert('Upload failed: ' + err.message); }
}

async function adminMakeCover(pid, index) {
  const p = State.getProduct(pid);
  if (!p || !p.photoUrls || index <= 0 || index >= p.photoUrls.length) return;
  // Move chosen photo to index 0
  const photos = [...p.photoUrls];
  const [chosen] = photos.splice(index, 1);
  photos.unshift(chosen);
  p.photoUrls = photos;
  p.models = { ...p.models, poster: chosen };
  State.update('products', ps => ({ ...ps, [pid]: p }));
  if (window.DB && DB.isReady()) {
    const sb = window.supabaseClient;
    await sb.from('products').update({
      photo_urls: photos,
      model_poster: chosen,
    }).eq('id', pid);
  }
  log('Admin', `set cover photo for ${pid}`);
  Router.reload();
}

async function adminDeleteProductPhoto(pid, index) {
  if (!confirm('Delete this photo? This cannot be undone.')) return;
  const p = State.getProduct(pid);
  if (!p || !p.photoUrls || !p.photoUrls[index]) return;
  const removed = p.photoUrls[index];
  const newPhotos = p.photoUrls.filter((_, i) => i !== index);
  p.photoUrls = newPhotos;
  p.photos = newPhotos.length;
  // If we removed the cover, update the poster
  if (index === 0) p.models = { ...p.models, poster: newPhotos[0] || '' };
  State.update('products', ps => ({ ...ps, [pid]: p }));
  if (window.DB && DB.isReady()) {
    const sb = window.supabaseClient;
    await sb.from('products').update({
      photo_urls: newPhotos,
      photos: newPhotos.length,
      model_poster: p.models?.poster || '',
    }).eq('id', pid);
    // Also remove from storage
    try { await Storage.removeByUrl(removed); } catch (e) {}
  }
  log('Admin', `deleted photo from ${pid}`);
  Router.reload();
}

/* Inject admin photo styles */
(function() {
  if (document.getElementById('apr-photos-styles')) return;
  const s = document.createElement('style');
  s.id = 'apr-photos-styles';
  s.textContent = `
    .apr-photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--s-2); margin-bottom: var(--s-2); }
    .apr-photo { aspect-ratio: 1; border-radius: var(--r-md); position: relative; overflow: hidden; border: 1px solid var(--border); background-color: var(--surface); }
    .apr-photo.is-cover { border: 2px solid var(--accent); }
    .apr-photo-cover { position: absolute; top: 6px; left: 6px; background: var(--accent); color: white; font-size: 0.6rem; font-weight: 800; padding: 3px 8px; border-radius: var(--r-pill); letter-spacing: 0.05em; }
    .apr-photo-make-cover { position: absolute; bottom: 6px; left: 6px; right: 32px; background: rgba(0,0,0,0.7); color: white; border: none; padding: 5px 8px; border-radius: var(--r-sm); font-size: 0.7rem; font-weight: 600; cursor: pointer; opacity: 0; transition: opacity 160ms; }
    .apr-photo:hover .apr-photo-make-cover { opacity: 1; }
    .apr-photo-del { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.7); color: white; border: none; font-size: 1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
    .apr-photo-del:hover { background: var(--danger); }
    .apr-photo-add { display: flex; align-items: center; justify-content: center; color: var(--ink-dim); font-size: var(--t-small); font-weight: 600; border: 2px dashed var(--border); cursor: pointer; background: var(--surface); }
    .apr-photo-add:hover { border-color: var(--accent); color: var(--accent); }
  `;
  document.head.appendChild(s);
})();

/* ============================================================
   ADMIN: Model Audit — compare .glb dims vs declared, pick strategy
   ============================================================ */
async function runModelAudit(pid) {
  const panel = document.getElementById('apr-audit-panel');
  if (!panel) return;
  const mv = document.getElementById('apr-model');
  if (!mv) {
    panel.innerHTML = '<div class="ma-empty">No 3D model uploaded yet for this product.</div>';
    return;
  }
  // Read currently-entered W/H/D from the SizeEditor (not what's in DB —
  // the admin may have changed them since loading the page)
  const size = SizeEditor.read('apr');
  panel.innerHTML = '<div class="fr-hint">Reading model file…</div>';
  try {
    const html = await ModelAudit.render(mv, size.realDimsCm, { idPrefix: 'apr' });
    panel.innerHTML = html;
  } catch (e) {
    panel.innerHTML = `<div class="ma-empty">Audit failed: ${e.message}</div>`;
  }
}

/* CSS for the saved-strategy badge shown above the audit panel */
(function() {
  if (document.getElementById('ma-saved-styles')) return;
  const s = document.createElement('style');
  s.id = 'ma-saved-styles';
  s.textContent = `
    .ma-saved { padding: var(--s-3); background: var(--success-soft); border: 1px solid var(--success); border-radius: var(--r-md); }
    .ma-saved-label { font-size: var(--t-micro); color: var(--ink-dim); font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px; }
    .ma-saved-value { font-size: var(--t-body); font-weight: 700; color: var(--success); }
  `;
  document.head.appendChild(s);
})();
