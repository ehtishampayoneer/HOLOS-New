/* ============================================================
   HOLOS — Router (v2 · pattern support)
   Exact routes + dynamic prefix routes for runtime IDs.
   ============================================================ */

const Router = (() => {
  const routes = {};            // exact path → renderFn
  const dynamicRoutes = [];     // { prefix, renderFn(id) }
  let currentPath = null;
  let mountEl = null;

  function register(path, renderFn) {
    routes[path] = renderFn;
  }

  /* Register a prefix handler. e.g. registerDynamic('/admin/shop/', id => ...)
     Matches /admin/shop/anything and passes 'anything' as id. */
  function registerDynamic(prefix, renderFn) {
    dynamicRoutes.push({ prefix, renderFn });
  }

  function go(path) {
    if (path === currentPath) {
      log('Router', `already on ${path}, skipping`, 'warn');
      return;
    }
    log('Router', `navigate ${currentPath || 'init'} → ${path}`);
    window.location.hash = path;
  }

  function back() { window.history.back(); }

  function findHandler(path) {
    // Strip query string (e.g. ?cat=fashion) before matching
    const cleanPath = path.split('?')[0];
    // 1. Exact match
    if (routes[cleanPath]) return routes[cleanPath];
    // 2. Dynamic prefix match (longest prefix wins)
    let best = null, bestLen = -1;
    for (const dr of dynamicRoutes) {
      if (cleanPath.startsWith(dr.prefix) && dr.prefix.length > bestLen) {
        const id = cleanPath.slice(dr.prefix.length);
        if (id && !id.includes('/')) { best = () => dr.renderFn(id); bestLen = dr.prefix.length; }
      }
    }
    if (best) return best;
    // 3. Wildcard
    return routes['*'] || null;
  }

  function resolve() {
    const path = window.location.hash.slice(1) || '/';
    const handler = findHandler(path);
    if (!handler) {
      log('Router', `no handler for ${path}`, 'error');
      // Fallback to home
      if (path !== '/') { window.location.hash = '/'; }
      return;
    }
    currentPath = path;
    if (mountEl) {
      mountEl.style.opacity = '0';
      setTimeout(() => {
        mountEl.innerHTML = '';
        const result = handler();
        if (typeof result === 'string') mountEl.innerHTML = result;
        else if (result instanceof HTMLElement) mountEl.appendChild(result);
        mountEl.style.opacity = '1';
        window.scrollTo(0, 0);
        window.dispatchEvent(new CustomEvent('screen:mounted', { detail: { path } }));
      }, 120);
    }
  }

  function reload() {
    if (mountEl && currentPath) {
      const handler = findHandler(currentPath);
      if (handler) {
        mountEl.innerHTML = '';
        const result = handler();
        if (typeof result === 'string') mountEl.innerHTML = result;
        else if (result instanceof HTMLElement) mountEl.appendChild(result);
        window.dispatchEvent(new CustomEvent('screen:mounted', { detail: { path: currentPath } }));
      }
    }
  }

  function init(el) {
    mountEl = el;
    window.addEventListener('hashchange', resolve);
    resolve();
    log('Router', 'initialized');
  }

  return { register, registerDynamic, go, back, reload, init, get current() { return currentPath; } };
})();

window.Router = Router;
