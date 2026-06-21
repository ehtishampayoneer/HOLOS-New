/* ============================================================
   SCREEN: Customer / Room AR
   "See it in your room" flow. On real devices, taps go to
   iOS QuickLook or Android Scene Viewer. Prototype mocks the
   experience with a camera-feel screen.
   ============================================================ */

Router.register('/customer/room-ar', () => {
  log('Customer/RoomAR', 'mounted');

  return `
    <div class="screen cu-ra">
      <!-- Mock camera feed background -->
      <div class="cu-ra-camera">
        <div class="cu-ra-camera-bg"></div>
        <div class="cu-ra-camera-noise"></div>
      </div>

      <!-- 3D product floating in "room" -->
      <div class="cu-ra-product">
        <div class="cu-ra-product-shape spin" style="background: linear-gradient(135deg, #8B6F47, #6B5840);"></div>
        <div class="cu-ra-product-shadow"></div>
      </div>

      <header class="cu-ra-topbar">
        <button class="btn-icon" onclick="Router.go('/customer/product')" aria-label="back" style="background: rgba(255,255,255,0.9);">
          ${icon('arrow_left')}
        </button>
        <div class="cu-ra-mode-pill">
          <span class="dot pulse"></span> ROOM AR
        </div>
        <button class="btn-icon" aria-label="capture" style="background: rgba(255,255,255,0.9);">
          ${icon('camera')}
        </button>
      </header>

      <!-- Bottom info card -->
      <section class="cu-ra-card stagger">
        <div class="cu-ra-card-meta">
          <div class="cu-ra-card-label">SUEDE OXFORD</div>
          <h2 class="cu-ra-card-name">Move me anywhere.</h2>
          <p class="cu-ra-card-sub">Pinch to resize. Drag to move. Tap and hold to rotate.</p>
        </div>

        <div class="cu-ra-card-controls">
          <button class="cu-ra-control" data-action="reset">
            ${icon('rotate')}
            <span>Reset</span>
          </button>
          <button class="cu-ra-control" data-action="surface">
            ${icon('cube')}
            <span>Find floor</span>
          </button>
          <button class="cu-ra-control" data-action="lock">
            ${icon('check')}
            <span>Lock</span>
          </button>
        </div>

        <button class="btn btn-accent btn-large btn-block" onclick="Router.go('/customer/tryon')">
          Try on my body ${icon('arrow_right')}
        </button>
        <button class="btn btn-ghost btn-block" onclick="Router.go('/customer/product')">
          Back to product
        </button>
      </section>

      <!-- Hint at top right -->
      <div class="cu-ra-hint">
        <span>👆 Tap the floor to place</span>
      </div>
    </div>

    <style>
      .cu-ra {
        min-height: 100vh;
        background: #1a1a1a;
        position: relative;
        overflow: hidden;
        color: var(--ink-invert);
      }

      /* Camera feed mock - looks like a room */
      .cu-ra-camera {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg,
          #4a4a48 0%,
          #5a5856 35%,
          #8a8682 55%,
          #a8a39a 65%,
          #b8b0a5 100%
        );
        z-index: 0;
      }
      .cu-ra-camera-bg {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at 30% 70%, rgba(0,0,0,0.3), transparent 50%),
          radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.15), transparent 50%);
      }
      .cu-ra-camera-noise {
        position: absolute;
        inset: 0;
        opacity: 0.06;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E");
      }

      /* Floor surface indicator */
      .cu-ra-camera::after {
        content: '';
        position: absolute;
        bottom: 30%;
        left: 50%;
        transform: translateX(-50%) perspective(400px) rotateX(72deg);
        width: 220px;
        height: 220px;
        border: 2px dashed rgba(215, 255, 58, 0.6);
        border-radius: 50%;
        animation: pulse-soft 2s ease-in-out infinite;
      }

      /* Floating product */
      .cu-ra-product {
        position: absolute;
        top: 38%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        animation: float-y 6s ease-in-out infinite;
      }
      .cu-ra-product-shape {
        width: 160px;
        height: 160px;
        border-radius: 50%;
        box-shadow: 0 30px 60px rgba(0,0,0,0.4);
      }
      .cu-ra-product-shadow {
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 20px;
        background: radial-gradient(ellipse, rgba(0,0,0,0.4), transparent 70%);
        filter: blur(8px);
      }

      .cu-ra-topbar {
        position: relative;
        z-index: 5;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--s-4) var(--s-5);
      }
      .cu-ra-mode-pill {
        display: inline-flex;
        align-items: center;
        gap: var(--s-2);
        padding: var(--s-2) var(--s-4);
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(8px);
        border-radius: var(--r-pill);
        color: var(--ink-invert);
        font-family: var(--mono);
        font-size: var(--t-micro);
        letter-spacing: 0.15em;
      }
      .cu-ra-mode-pill .dot {
        width: 6px; height: 6px;
        background: var(--accent);
        border-radius: 50%;
      }
      .cu-ra-mode-pill .pulse { animation: pulse-soft 1.5s ease-in-out infinite; }

      .cu-ra-hint {
        position: absolute;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 4;
        padding: var(--s-2) var(--s-4);
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(8px);
        color: var(--ink-invert);
        font-family: var(--mono);
        font-size: var(--t-micro);
        letter-spacing: 0.1em;
        border-radius: var(--r-pill);
        opacity: 0;
        animation: rise 1s var(--ease-out) 1s forwards;
      }

      /* Bottom card */
      .cu-ra-card {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        background: var(--surface);
        color: var(--ink);
        padding: var(--s-5) var(--s-5) var(--s-6);
        border-radius: var(--r-xl) var(--r-xl) 0 0;
        z-index: 5;
        max-width: 540px;
        margin: 0 auto;
        animation: slide-up 0.5s var(--ease-out) backwards;
        animation-delay: 0.4s;
      }
      .cu-ra-card-meta { margin-bottom: var(--s-4); }
      .cu-ra-card-label {
        font-family: var(--mono);
        font-size: var(--t-micro);
        letter-spacing: 0.15em;
        color: var(--ink-muted);
        margin-bottom: var(--s-2);
      }
      .cu-ra-card-name {
        font-family: var(--serif);
        font-style: italic;
        font-size: 1.8rem;
        line-height: 1;
        margin-bottom: var(--s-2);
      }
      .cu-ra-card-sub {
        color: var(--ink-dim);
        font-size: var(--t-small);
      }

      .cu-ra-card-controls {
        display: flex;
        gap: var(--s-3);
        margin-bottom: var(--s-5);
      }
      .cu-ra-control {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--s-2);
        padding: var(--s-3);
        background: var(--surface-elev);
        border-radius: var(--r-md);
        color: var(--ink-dim);
        font-family: var(--mono);
        font-size: var(--t-micro);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        transition: all var(--d-fast);
      }
      .cu-ra-control:hover { background: var(--ink); color: var(--ink-invert); }
      .cu-ra-control:active { transform: scale(0.96); }
      .cu-ra-control svg { width: 18px; height: 18px; }

      .cu-ra-card .btn { margin-top: var(--s-2); }
      .cu-ra-card .btn-ghost { color: var(--ink-dim); border: none; }
    </style>
  `;
});
