/* ============================================================
   SCREEN: Customer / Scan
   QR code scanner — mocked, taps a shop directly.
   ============================================================ */

Router.register('/customer/scan', () => {
  log('Customer/Scan', 'mounted');

  return `
    <div class="screen sc">
      <header class="sc-top">
        <button class="sc-top-btn" onclick="Router.go('/customer/marketplace')" aria-label="back">
          ${icon('arrow_left')}
        </button>
        <div class="sc-title">Scan to open a shop</div>
        <button class="sc-top-btn" aria-label="flash">
          ${flashIcon()}
        </button>
      </header>

      <div class="sc-stage">
        <div class="sc-camera-mock"></div>

        <!-- Scan frame -->
        <div class="sc-frame">
          <div class="sc-corner sc-c-tl"></div>
          <div class="sc-corner sc-c-tr"></div>
          <div class="sc-corner sc-c-bl"></div>
          <div class="sc-corner sc-c-br"></div>
          <div class="sc-scanline"></div>
        </div>

        <div class="sc-hint">
          Point camera at any HOLOS shop's QR code
        </div>
      </div>

      <div class="sc-bottom">
        <h3 class="sc-bottom-title">Don't have a QR code?</h3>
        <p class="sc-bottom-sub">Try a sample shop — instant teleport.</p>
        <div class="sc-samples">
          ${State.getShopsList().slice(0, 4).map(s => `
            <button class="sc-sample" onclick="Router.go('/customer/shop/${s.id}')">
              <div class="sc-sample-avatar" style="background: ${s.accent}">
                ${s.name.split(' ').map(w => w[0]).slice(0,2).join('')}
              </div>
              <div class="sc-sample-name">${s.name}</div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <style>
      .sc {
        position: fixed; inset: 0;
        background: #000;
        color: white;
      }
      .sc-top {
        position: absolute; top: 0; left: 0; right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--s-4) var(--s-5);
        z-index: 10;
      }
      .sc-top-btn {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(12px);
        color: white;
        display: flex; align-items: center; justify-content: center;
      }
      .sc-top-btn svg { width: 18px; height: 18px; }
      .sc-title {
        font-size: var(--t-body);
        font-weight: var(--w-semibold);
        padding: var(--s-2) var(--s-4);
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(12px);
        border-radius: var(--r-pill);
      }

      .sc-stage {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 280px;
      }
      .sc-camera-mock {
        position: absolute; inset: 0;
        background:
          radial-gradient(circle at 50% 50%, rgba(100,100,100,0.3), rgba(20,20,20,1));
      }
      .sc-camera-mock::after {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0.03;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E");
      }
      .sc-frame {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 250px; height: 250px;
      }
      .sc-corner {
        position: absolute;
        width: 36px; height: 36px;
        border-color: #4DDC8A;
        border-style: solid;
        border-width: 0;
      }
      .sc-c-tl { top: 0; left: 0; border-top-width: 3px; border-left-width: 3px; border-top-left-radius: 8px; }
      .sc-c-tr { top: 0; right: 0; border-top-width: 3px; border-right-width: 3px; border-top-right-radius: 8px; }
      .sc-c-bl { bottom: 0; left: 0; border-bottom-width: 3px; border-left-width: 3px; border-bottom-left-radius: 8px; }
      .sc-c-br { bottom: 0; right: 0; border-bottom-width: 3px; border-right-width: 3px; border-bottom-right-radius: 8px; }
      .sc-scanline {
        position: absolute;
        top: 0; left: 12px; right: 12px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #4DDC8A, transparent);
        box-shadow: 0 0 12px #4DDC8A;
        animation: scan 2.5s ease-in-out infinite;
      }
      @keyframes scan {
        0%, 100% { top: 12px; }
        50% { top: calc(100% - 14px); }
      }
      .sc-hint {
        position: absolute;
        bottom: calc(50% - 160px);
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        font-size: var(--t-small);
        color: rgba(255,255,255,0.6);
        padding: 0 var(--s-5);
      }

      .sc-bottom {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(20px);
        border-radius: var(--r-xl) var(--r-xl) 0 0;
        padding: var(--s-5);
        z-index: 5;
      }
      .sc-bottom-title {
        font-size: var(--t-body);
        font-weight: var(--w-semibold);
        margin-bottom: 2px;
      }
      .sc-bottom-sub {
        font-size: var(--t-small);
        color: rgba(255,255,255,0.5);
        margin-bottom: var(--s-3);
      }
      .sc-samples {
        display: flex;
        gap: var(--s-3);
        overflow-x: auto;
        scrollbar-width: none;
        margin: 0 calc(-1 * var(--s-5));
        padding: 0 var(--s-5);
      }
      .sc-samples::-webkit-scrollbar { display: none; }
      .sc-sample {
        flex: 0 0 auto;
        background: rgba(255,255,255,0.08);
        border-radius: var(--r-md);
        padding: var(--s-3);
        text-align: center;
        min-width: 100px;
        color: white;
      }
      .sc-sample-avatar {
        width: 48px; height: 48px;
        border-radius: 50%;
        margin: 0 auto var(--s-2);
        display: flex; align-items: center; justify-content: center;
        font-size: var(--t-small);
        font-weight: var(--w-bold);
      }
      .sc-sample-name {
        font-size: var(--t-micro);
        color: rgba(255,255,255,0.8);
      }
    </style>
  `;
});

function flashIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
}
