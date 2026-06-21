/* ============================================================
   HOLOS — Hero Banner Carousel
   Renders the marketplace top hero with admin-managed slides.
   Supports images and videos. Auto-advances per slide duration.
   ============================================================ */

const HeroCarousel = (() => {
  let timer = null;
  let currentIndex = 0;
  let slides = [];
  let settings = { defaultDurationMs: 5000, transition: 'fade', heightDesktop: 480, heightMobile: 320 };

  /* Fallback / default slides used if admin hasn't configured anything */
  const DEFAULTS = [
    {
      id: 'd1',
      mediaUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=2000&auto=format&fit=crop',
      mediaType: 'image',
      title: 'See it before you buy it.',
      subtitle: 'Every product on HOLOS appears at exact real-world scale in your room.',
      ctaLabel: 'How AR works',
      ctaLink: '#/customer/how-it-works',
      textAlign: 'left',
      overlayOpacity: 0.35,
      durationMs: 6000,
    },
    {
      id: 'd2',
      mediaUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2000&auto=format&fit=crop',
      mediaType: 'image',
      title: 'Furniture, fashion, decor — at scale.',
      subtitle: 'No more guessing. Place a sofa, try a watch, hang a mirror — virtually.',
      ctaLabel: 'Browse all products',
      ctaLink: '#/customer/all-products',
      textAlign: 'center',
      overlayOpacity: 0.4,
      durationMs: 6000,
    },
    {
      id: 'd3',
      mediaUrl: 'https://images.unsplash.com/photo-1487744480471-9ca1bca6fb7d?w=2000&auto=format&fit=crop',
      mediaType: 'image',
      title: 'Own a shop?',
      subtitle: 'Join the first AR marketplace in Pakistan. Free to start.',
      ctaLabel: 'Become a seller',
      ctaLink: '#/shopkeeper/signup',
      textAlign: 'right',
      overlayOpacity: 0.35,
      durationMs: 6000,
    },
  ];

  async function hydrate() {
    const container = document.getElementById('mp-hero-carousel');
    if (!container) return;
    try {
      if (window.DB && DB.isReady && DB.isReady()) {
        const [s, banners] = await Promise.all([
          DB.getMarketplaceSettings(),
          DB.getBanners()
        ]);
        if (s) settings = s;
        slides = (banners || []).filter(b => b.enabled);
      }
    } catch (e) { /* fall through to defaults */ }
    if (!slides.length) slides = DEFAULTS;
    render(container);
  }

  function render(container) {
    container.innerHTML = `
      ${slides.map((s, i) => slideMarkup(s, i)).join('')}
      ${slides.length > 1 ? `
        <button class="mp-hero-nav mp-hero-prev" onclick="HeroCarousel.prev()" aria-label="Previous slide">${icon('arrow_left')}</button>
        <button class="mp-hero-nav mp-hero-next" onclick="HeroCarousel.next()" aria-label="Next slide">${icon('arrow_right')}</button>
        <div class="mp-hero-dots">
          ${slides.map((_, i) => `<button class="mp-hero-dot ${i === 0 ? 'active' : ''}" data-dot="${i}" onclick="HeroCarousel.goTo(${i})" aria-label="Slide ${i+1}"></button>`).join('')}
        </div>
      ` : ''}
    `;
    currentIndex = 0;
    scheduleNext();
    // Pause on hover
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', scheduleNext);
    // Touch swipe (mobile)
    bindSwipe(container);
  }

  function slideMarkup(s, i) {
    const isFirst = i === 0;
    // Defensive: clamp overlay so it can NEVER be solid black (max 0.7)
    const overlayRaw = Number(s.overlayOpacity);
    const overlay = isFinite(overlayRaw) ? Math.max(0, Math.min(0.7, overlayRaw)) : 0.3;
    // Defensive: only render media if URL looks valid; hide broken images
    const hasMedia = s.mediaUrl && typeof s.mediaUrl === 'string' && s.mediaUrl.length > 8;
    const media = !hasMedia ? '' : (s.mediaType === 'video'
      ? `<video class="mp-hero-media" autoplay muted loop playsinline src="${s.mediaUrl}" onerror="this.style.display='none'"></video>`
      : `<img class="mp-hero-media" src="${s.mediaUrl}" alt="${(s.title || '').replace(/"/g, '&quot;')}" loading="${isFirst ? 'eager' : 'lazy'}" onerror="this.style.display='none'" />`);
    return `
      <div class="mp-hero-slide ${isFirst ? 'is-active' : ''}" data-slide="${i}" data-align="${s.textAlign || 'center'}">
        ${media}
        <div class="mp-hero-overlay" style="background:linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,${overlay}) 100%);"></div>
        <div class="mp-hero-content">
          ${s.title ? `<h2 class="mp-hero-title display-serif">${s.title}</h2>` : ''}
          ${s.subtitle ? `<p class="mp-hero-sub">${s.subtitle}</p>` : ''}
          ${s.ctaLabel && s.ctaLink ? `<a href="${s.ctaLink}" class="mp-hero-cta">${s.ctaLabel} <span class="mp-hero-cta-arrow">→</span></a>` : ''}
        </div>
      </div>
    `;
  }

  function scheduleNext() {
    pause();
    if (slides.length <= 1) return;
    const slide = slides[currentIndex];
    const duration = slide.durationMs || settings.defaultDurationMs || 5000;
    timer = setTimeout(next, duration);
  }
  function pause() { if (timer) { clearTimeout(timer); timer = null; } }

  function goTo(idx) {
    if (!slides.length) return;
    const container = document.getElementById('mp-hero-carousel');
    if (!container) return;
    const prevIdx = currentIndex;
    currentIndex = ((idx % slides.length) + slides.length) % slides.length;
    container.querySelectorAll('.mp-hero-slide').forEach((el, i) => {
      el.classList.toggle('is-active', i === currentIndex);
    });
    container.querySelectorAll('.mp-hero-dot').forEach((el, i) => {
      el.classList.toggle('active', i === currentIndex);
    });
    scheduleNext();
  }
  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  function bindSwipe(container) {
    let startX = 0;
    container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    }, { passive: true });
  }

  return { hydrate, next, prev, goTo };
})();

window.HeroCarousel = HeroCarousel;

/* Auto-hydrate when the marketplace screen mounts */
window.addEventListener('screen:mounted', e => {
  if (e.detail?.path === '/customer/marketplace') {
    setTimeout(() => HeroCarousel.hydrate(), 100);
  }
});
