/* ============================================================
   HOLOS — Reveal On Scroll
   IntersectionObserver-driven entry animations. Auto-wires
   anything with class="reveal" or "reveal-stagger" on each
   page navigation. Re-runs after Router renders.
   ============================================================ */

const Reveal = (() => {
  let observer = null;

  function ensureObserver() {
    if (observer) return observer;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.05,
    });
    return observer;
  }

  function scan(root = document) {
    const obs = ensureObserver();
    const els = root.querySelectorAll('.reveal:not(.is-visible), .reveal-stagger:not(.is-visible)');
    els.forEach(el => obs.observe(el));
  }

  function reset() {
    if (observer) observer.disconnect();
    observer = null;
    document.querySelectorAll('.reveal.is-visible, .reveal-stagger.is-visible')
      .forEach(el => el.classList.remove('is-visible'));
  }

  return { scan, reset };
})();

window.Reveal = Reveal;

/* Auto-rescan after every screen render */
window.addEventListener('screen:mounted', () => {
  setTimeout(() => Reveal.scan(), 50);
});
/* And on initial load too */
document.addEventListener('DOMContentLoaded', () => Reveal.scan());
