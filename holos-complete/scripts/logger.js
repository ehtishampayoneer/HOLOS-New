/* ============================================================
   HOLOS — Logger
   A visible, persistent log for debugging on real devices.
   Every meaningful action calls log(source, message, level).
   Tap the floating button (bottom right) to view.
   ============================================================ */

const Logger = (() => {
  const MAX_LINES = 200;
  const buffer = [];
  let panel = null;

  function ts() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
  }

  function log(source, message, level = 'info') {
    const entry = { ts: ts(), source, message, level };
    buffer.push(entry);
    if (buffer.length > MAX_LINES) buffer.shift();
    console.log(`[${entry.ts}] [${source}] ${message}`);
    render();
  }

  function render() {
    if (!panel) return;
    panel.innerHTML = buffer.map(e => `
      <div class="log-line ${e.level}">
        <span class="ts">${e.ts}</span>
        <span class="src">[${e.source}]</span>
        <span class="msg">${e.message}</span>
      </div>
    `).reverse().join('');
  }

  function attach(panelEl) {
    panel = panelEl;
    render();
  }

  function clear() {
    buffer.length = 0;
    render();
  }

  return { log, attach, clear };
})();

// Global shortcut so every file can just call log()
window.log = (src, msg, level) => Logger.log(src, msg, level);
window.Logger = Logger;
