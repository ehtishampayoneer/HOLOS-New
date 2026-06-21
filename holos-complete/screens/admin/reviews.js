/* ============================================================
   SCREEN: Admin / Review Management
   Admin can view all reviews across all products and remove any.
   ============================================================ */

Router.register('/admin/reviews', () => {
  if (!State.isAdminLoggedIn()) { setTimeout(() => Router.go('/admin/login'), 0); return '<div></div>'; }
  log('Admin/Reviews', 'mounted');

  const allProducts = State.getAllProducts().filter(p => p.status === 'live');
  const allReviews = [];
  allProducts.forEach(p => {
    const reviews = State.getReviews(p.id);
    reviews.forEach(r => allReviews.push({ ...r, productId: p.id, productName: p.name, shopId: p.shop }));
  });
  allReviews.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return `
    <div class="screen aq">
      <header class="aq-top">
        <button class="btn-icon-bare" onclick="Router.go('/admin/analytics')">${icon('arrow_left')}</button>
        <div class="aq-top-title">Review management</div>
        <div style="width:40px;"></div>
      </header>
      <main class="aq-main">
        <div style="margin-bottom:var(--s-4);color:var(--ink-dim);font-size:var(--t-small);">
          ${allReviews.length} review${allReviews.length === 1 ? '' : 's'} across ${allProducts.length} products
        </div>
        ${allReviews.length === 0 ? `
          <div class="aq-empty"><div class="aq-empty-icon">✓</div><h3>No reviews</h3><p>No reviews to manage yet.</p></div>
        ` : `
          <div class="aq-list">
            ${allReviews.map(r => {
              const shop = State.getShop(r.shopId);
              const isDampened = r.weight < 1;
              return `
                <div class="aq-card rv-card" id="rv-${r.id}" style="${isDampened ? 'opacity:0.7;' : ''}">
                  <div class="aq-card-head">
                    <div class="aq-card-avatar" style="background:var(--warn);font-size:1.2rem;color:white;">${'★'.repeat(r.stars)}</div>
                    <div>
                      <div class="aq-card-name">${r.author} · ${r.stars}★</div>
                      <div class="aq-card-owner">${r.productName} · ${shop?.name || ''}</div>
                    </div>
                    <div class="aq-card-time">${r.date}${isDampened ? ' · dampened' : ''}</div>
                  </div>
                  <div style="font-size:var(--t-small);color:var(--ink-dim);padding:var(--s-2) var(--s-3);background:var(--bg);border-radius:var(--r-sm);margin-bottom:var(--s-3);">"${r.text}"</div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:var(--t-micro);color:var(--ink-muted);">Account: ${r.accountId} · Weight: ${r.weight}</span>
                    <button class="aq-btn-reject" style="font-size:var(--t-small);padding:var(--s-2) var(--s-3);" onclick="removeReview('${r.id}','${r.productId}')">Remove</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </main>
      ${typeof AQ_STYLES !== 'undefined' ? AQ_STYLES : ''}
    </div>
  `;
});

async function removeReview(reviewId, productId) {
  if (!confirm('Remove this review permanently?')) return;
  // Remove from local state
  State.update('reviews', revs => {
    const list = revs[productId];
    if (list) revs[productId] = list.filter(r => r.id !== reviewId);
    return { ...revs };
  });
  // Remove from DB
  try {
    await window.supabaseClient.from('reviews').delete().eq('id', reviewId);
    log('Admin/Reviews', `removed review ${reviewId}`);
  } catch (e) { log('Admin/Reviews', 'DB delete failed: ' + e.message, 'error'); }
  Router.go('/admin/reviews');
}
