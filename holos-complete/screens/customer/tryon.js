/* ============================================================
   SCREEN: Customer / Try-On (v4 — MindAR + model-viewer hybrid)

   Strategy by category:
   - face (glasses):   MindAR face tracking → glasses anchored to face
   - wrist/finger:     "Demo Mode" — camera + product floats in center
                       (real hand tracking in browser is unreliable)
   - foot (shoes):     "Place on floor" via model-viewer AR
                       (browser foot tracking doesn't work reliably)
   - body-ai:          Photo upload mock flow (unchanged)

   This is HONEST about what works. Face try-on is real and tracks
   your head. Wrist/finger/foot are demo overlays — investors see
   the concept, real tracking is roadmap.
   ============================================================ */

// Register all product routes
Object.values(State.get('products')).forEach(p => {
  Router.register(`/customer/tryon/${p.id}`, () => renderTryOnScreen(p.id));
});
Router.register('/customer/tryon', () => renderTryOnScreen(null));

function renderTryOnScreen(productId) {
  log('Customer/TryOn', `mounted: ${productId}`);
  const product = productId
    ? State.getProduct(productId)
    : State.getAllProducts().find(p => p.tryOn);

  if (!product) {
    return `<div style="padding: 2rem;">Product not found</div>`;
  }

  // Compatibility shim for v5 options structure
  if (product.options) {
    if (!product.colors && product.options.colors) product.colors = product.options.colors;
    if (!product.sizes && product.options.sizes) product.sizes = product.options.sizes;
  }
  if (!product.colors) product.colors = [{ hex: '#888', label: 'Default' }];
  if (!product.sizes) product.sizes = [];
  if (product.defaultSize == null) product.defaultSize = 0;

  const type = product.tryOn || 'room';

  // Routing decision
  // 'foot' → redirect to room-AR with floor placement
  if (type === 'foot') {
    return renderFootTryOn(product);
  }
  if (type === 'body-ai') {
    return renderClothingTryOn(product);
  }
  if (type === 'face') {
    return renderFaceTryOn(product);
  }
  if (type === 'wrist' || type === 'finger') {
    return renderHandTryOn(product, type);
  }

  // Fallback
  return renderFootTryOn(product);
}

/* ============================================================
   SHARED UI — bottom controls used by all try-on modes
   ============================================================ */
function bottomControls(product) {
  return `
    <div class="to-controls">
      <div class="to-product">
        <div class="to-product-name">${product.name}</div>
        <div class="to-product-price">${Locale.formatPrice((product.salePrice || product.price))}</div>
      </div>

      ${product.colors.length > 1 ? `
        <div class="to-row">
          <div class="to-row-label">Color</div>
          <div class="to-swatches">
            ${product.colors.map((c, i) => `
              <button class="to-swatch ${i === 0 ? 'active' : ''}" data-hex="${c.hex}" data-label="${c.label}" aria-label="${c.label}">
                <div class="to-swatch-inner" style="background: ${c.hex}"></div>
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${product.sizes.length > 1 ? `
        <div class="to-row">
          <div class="to-row-label">Size</div>
          <div class="to-sizes">
            ${product.sizes.map((s, i) => `
              <button class="to-size ${i === product.defaultSize ? 'active' : ''}">${s}</button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <button class="to-cta" onclick="orderOnWhatsApp('${product.id}')">
        ${icon('whatsapp')} Order on WhatsApp
      </button>
    </div>
  `;
}

function sharedStyles() {
  return `
    <style>
      .to {
        position: fixed; inset: 0;
        background: #000;
        color: white;
        overflow: hidden;
      }
      .to-top {
        position: absolute; top: 0; left: 0; right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--s-4) var(--s-5);
        z-index: 20;
      }
      .to-top-btn {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(12px);
        color: white;
        display: flex; align-items: center; justify-content: center;
        border: none;
        cursor: pointer;
      }
      .to-top-btn svg { width: 20px; height: 20px; }
      .to-top-title {
        font-size: var(--t-body);
        font-weight: 600;
        padding: var(--s-2) var(--s-4);
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(12px);
        border-radius: var(--r-pill);
      }

      .to-status {
        position: absolute;
        top: 72px; left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: var(--s-2);
        padding: var(--s-2) var(--s-4);
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(12px);
        border-radius: var(--r-pill);
        font-size: var(--t-micro);
        font-weight: 500;
        z-index: 15;
        white-space: nowrap;
      }
      .to-status.live::before {
        content: '';
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #4DDC8A;
        animation: pulse-soft 2s ease-in-out infinite;
      }
      .to-status.demo::before {
        content: '';
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #F5A623;
      }

      .to-loading {
        position: absolute; inset: 0;
        background: linear-gradient(180deg, #1a1a1a, #0a0a0a);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        z-index: 30;
        gap: var(--s-4);
      }
      .to-loading-spinner {
        width: 48px; height: 48px;
        border: 3px solid rgba(255,255,255,0.15);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .to-loading-text { font-size: var(--t-body); font-weight: 500; }
      .to-loading-sub {
        font-size: var(--t-small);
        color: rgba(255,255,255,0.5);
        max-width: 280px;
        text-align: center;
        padding: 0 var(--s-5);
      }
      .to-loading.gone { display: none; }

      .to-error {
        position: absolute; inset: 0;
        background: #0a0a0a;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        z-index: 30;
        padding: var(--s-6);
        text-align: center;
        gap: var(--s-3);
      }
      .to-error-icon { font-size: 3rem; }
      .to-error-title { font-size: 1.3rem; font-weight: 700; }
      .to-error-msg {
        font-size: var(--t-small);
        color: rgba(255,255,255,0.6);
        max-width: 320px;
      }

      .to-instruction {
        position: absolute;
        bottom: 240px; left: var(--s-5); right: var(--s-5);
        z-index: 10;
        pointer-events: none;
      }
      .to-instruction-text {
        padding: var(--s-3) var(--s-4);
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(12px);
        border-radius: var(--r-md);
        font-size: var(--t-small);
        text-align: center;
        max-width: 360px;
        margin: 0 auto;
        line-height: 1.4;
      }

      .to-controls {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(20px);
        padding: var(--s-4) var(--s-5);
        border-radius: var(--r-xl) var(--r-xl) 0 0;
        z-index: 10;
      }
      .to-product {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: var(--s-3);
      }
      .to-product-name {
        font-size: var(--t-body);
        font-weight: 600;
      }
      .to-product-price {
        font-size: var(--t-body);
        font-weight: 700;
        color: #4DDC8A;
      }
      .to-row {
        display: flex;
        align-items: center;
        gap: var(--s-3);
        margin-bottom: var(--s-3);
      }
      .to-row-label {
        font-size: var(--t-micro);
        color: rgba(255,255,255,0.5);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        width: 40px;
        flex-shrink: 0;
      }
      .to-swatches { display: flex; gap: var(--s-2); flex-wrap: wrap; }
      .to-swatch {
        width: 32px; height: 32px;
        border-radius: 50%;
        padding: 3px;
        border: 2px solid transparent;
        background: transparent;
        cursor: pointer;
      }
      .to-swatch.active { border-color: white; }
      .to-swatch-inner {
        width: 100%; height: 100%;
        border-radius: 50%;
      }
      .to-sizes {
        display: flex;
        gap: var(--s-2);
        overflow-x: auto;
        scrollbar-width: none;
      }
      .to-sizes::-webkit-scrollbar { display: none; }
      .to-size {
        padding: var(--s-2) var(--s-3);
        background: rgba(255,255,255,0.1);
        border-radius: var(--r-pill);
        color: white;
        font-size: var(--t-small);
        white-space: nowrap;
        border: none;
        cursor: pointer;
      }
      .to-size.active {
        background: white;
        color: black;
      }
      .to-cta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--s-2);
        width: 100%;
        padding: var(--s-3);
        margin-top: var(--s-2);
        background: #25D366;
        color: white;
        border-radius: var(--r-pill);
        font-weight: 600;
        font-size: var(--t-body);
        border: none;
        cursor: pointer;
      }
      .to-cta svg { width: 18px; height: 18px; }
    </style>
  `;
}

function topbar(product, title) {
  return `
    <header class="to-top">
      <button class="to-top-btn" onclick="stopTryOn(); Router.go('/customer/product/${product.id}')" aria-label="back">
        ${icon('arrow_left')}
      </button>
      <div class="to-top-title">${title}</div>
      <button class="to-top-btn" onclick="captureTryOnPhoto()" aria-label="capture">
        ${icon('camera')}
      </button>
    </header>
  `;
}

/* ============================================================
   FACE TRY-ON — MindAR (real face tracking, works in iOS Safari)
   ============================================================ */
function renderFaceTryOn(product) {
  setTimeout(() => initFaceTryOn(product), 100);

  return `
    <div class="to to-face">
      <div id="to-loading" class="to-loading">
        <div class="to-loading-spinner"></div>
        <div class="to-loading-text">Loading face tracker...</div>
        <div class="to-loading-sub">First load takes ~10 seconds. You'll be asked for camera permission.</div>
      </div>

      <!-- MindAR injects video + canvas into this container -->
      <div id="mindar-face-container" style="position:absolute; inset:0; z-index:1;"></div>

      ${topbar(product, 'Try on your face')}
      <div class="to-status live" id="to-status">Initializing tracker</div>
      <div class="to-instruction">
        <div class="to-instruction-text">Hold phone at arm's length. Look at the camera.</div>
      </div>
      ${bottomControls(product)}
    </div>
    ${sharedStyles()}
  `;
}

async function initFaceTryOn(product) {
  log('TryOn/Face', 'starting');

  try {
    // Load MindAR-face from CDN (it bundles Three.js and the face tracker)
    await loadScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-face-three.prod.js');

    const { MindARThree } = window.MINDAR.FACE;

    const mindar = new MindARThree({
      container: document.querySelector('#mindar-face-container'),
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
    });

    const { renderer, scene, camera } = mindar;

    // Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 1));
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(0, 1, 1);
    scene.add(dir);

    // Anchor for face — anchor index 168 is the nose bridge in MindAR
    const anchor = mindar.addAnchor(168);

    // Load product model into anchor
    const loader = new THREE.GLTFLoader();
    loader.load(product.models.glb, (gltf) => {
      const model = gltf.scene;

      // Scale glasses to roughly real-world size relative to face.
      // MindAR's face anchor is calibrated such that scale 1 ≈ face width.
      // For glasses (14cm wide on a 14cm face): scale roughly 1.0
      // We tune empirically — most authored glasses models need ~0.5-1.5 scale.
      model.scale.set(0.8, 0.8, 0.8);
      // Slight forward offset so they sit on the nose, not in the nose
      model.position.set(0, 0, 0.05);

      anchor.group.add(model);
      log('TryOn/Face', 'model loaded into face anchor');
    }, undefined, (err) => {
      log('TryOn/Face', `model load failed: ${err.message || 'unknown'}`, 'warn');
      // Fallback: simple ring shape so demo still works
      const geo = new THREE.TorusGeometry(0.3, 0.04, 16, 100);
      const mat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.3 });
      const torus = new THREE.Mesh(geo, mat);
      torus.position.set(0, 0, 0.05);
      anchor.group.add(torus);
    });

    await mindar.start();
    window.TryOnState = { active: true, mindar, type: 'face' };

    hideLoading();
    setStatus('Tracking your face', 'live');

    // Render loop
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    log('TryOn/Face', 'started successfully');
  } catch (e) {
    log('TryOn/Face', `failed: ${e.message}`, 'error');
    showError('Could not start face tracker', e.message);
  }
}

/* ============================================================
   HAND TRY-ON (wrist/finger) — Demo Mode
   Honest: real-time browser hand tracking is too unreliable for demo.
   Instead: open camera, overlay product 3D in center with auto-rotate.
   Customer holds their hand near the model — demonstrates the concept.
   ============================================================ */
function renderHandTryOn(product, target) {
  setTimeout(() => initHandTryOn(product, target), 100);

  const title = target === 'wrist' ? 'Try on your wrist' : 'Try on your finger';
  const instruction = target === 'wrist'
    ? 'Hold your wrist next to the watch shown. Take a photo to compare.'
    : 'Place your finger near the ring on screen.';

  return `
    <div class="to to-hand">
      <div id="to-loading" class="to-loading">
        <div class="to-loading-spinner"></div>
        <div class="to-loading-text">Starting camera...</div>
      </div>

      <!-- Camera feed -->
      <video id="to-video" autoplay playsinline muted style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1);"></video>

      <!-- Floating 3D model overlay -->
      <div class="to-hand-model">
        <model-viewer
          src="${product.models.glb}"
          ${product.models.poster ? `poster="${product.models.poster}"` : ''}
          auto-rotate
          rotation-per-second="30deg"
          camera-controls
          interaction-prompt="none"
          shadow-intensity="0.5"
          exposure="1"
          environment-image="neutral"
          style="width:100%;height:100%;background:transparent;">
        </model-viewer>
      </div>

      ${topbar(product, title)}
      <div class="to-status demo" id="to-status">Demo mode · real tracking soon</div>
      <div class="to-instruction">
        <div class="to-instruction-text">${instruction}</div>
      </div>
      ${bottomControls(product)}

      <style>
        .to-hand-model {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 60vw;
          height: 60vw;
          max-width: 320px;
          max-height: 320px;
          z-index: 5;
          pointer-events: none;
        }
        .to-hand-model model-viewer {
          --poster-color: transparent;
        }
      </style>
    </div>
    ${sharedStyles()}
  `;
}

async function initHandTryOn(product, target) {
  log(`TryOn/${target}`, 'starting (demo mode)');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    });
    const video = document.getElementById('to-video');
    video.srcObject = stream;
    await video.play();
    window.TryOnState = { active: true, stream, type: target };
    hideLoading();
    log(`TryOn/${target}`, 'camera ready');
  } catch (e) {
    log(`TryOn/${target}`, `camera failed: ${e.message}`, 'error');
    showError('Camera access needed', e.message);
  }
}

/* ============================================================
   FOOT TRY-ON — Place on floor via model-viewer AR
   The honest answer for shoes in browser. Customer points camera
   at the floor, the shoe model appears next to/on their foot.
   ============================================================ */
function renderFootTryOn(product) {
  setTimeout(() => initFootTryOn(product), 100);

  return `
    <div class="to to-foot" style="background: var(--bg-pure); color: var(--ink);">
      ${topbar(product, 'Try on shoes')}

      <main style="padding: 80px var(--s-5) 280px; max-width: var(--phone-max); margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column;">
        <div style="text-align: center; margin-bottom: var(--s-5);">
          <div style="font-size: var(--t-small); color: var(--ink-dim); margin-bottom: var(--s-2);">${product.subtitle}</div>
          <h1 style="font-size: 1.6rem; font-weight: 700; letter-spacing: -0.02em;">${product.name}</h1>
        </div>

        <!-- Big 3D viewer -->
        <div style="flex: 1; min-height: 360px; margin-bottom: var(--s-5); background: var(--bg); border-radius: var(--r-lg); position: relative; overflow: hidden;">
          <model-viewer
            id="foot-model"
            src="${product.models.glb}"
            ${product.models.usdz ? `ios-src="${product.models.usdz}"` : ''}
            ${product.models.poster ? `poster="${product.models.poster}"` : ''}
            alt="${product.name}"
            ar
            ar-modes="webxr quick-look"
            ar-scale="fixed"
            ar-placement="floor"
            scale="1 1 1"
            camera-controls
            auto-rotate
            rotation-per-second="30deg"
            interaction-prompt="none"
            shadow-intensity="1"
            exposure="1.1"
            environment-image="neutral"
            style="width:100%; height:100%; background: transparent;">
          </model-viewer>
        </div>

        <!-- Floor AR primary action -->
        <button class="to-floor-btn" onclick="launchFootAR()">
          ${icon('cube')}
          <div>
            <div style="font-weight: 700; font-size: var(--t-body);">Place on floor</div>
            <div style="font-size: var(--t-small); opacity: 0.7;">Point camera at your foot</div>
          </div>
          ${icon('arrow_right')}
        </button>
      </main>

      ${bottomControlsLight(product)}

      <style>
        .to-floor-btn {
          display: grid;
          grid-template-columns: 24px 1fr 18px;
          gap: var(--s-4);
          align-items: center;
          padding: var(--s-4) var(--s-5);
          background: var(--ink-strong);
          color: white;
          border-radius: var(--r-lg);
          margin-bottom: var(--s-3);
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
        }
        .to-floor-btn svg { color: #4DDC8A; }
        .to-floor-btn:active { transform: scale(0.99); }
      </style>
    </div>
  `;
}

function bottomControlsLight(product) {
  // Light version for foot try-on which uses a white background
  return `
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg-pure); border-top: 1px solid var(--border); padding: var(--s-4) var(--s-5); max-width: var(--phone-max); margin: 0 auto;">
      ${product.sizes.length > 1 ? `
        <div style="display: flex; align-items: center; gap: var(--s-3); margin-bottom: var(--s-3);">
          <div style="font-size: var(--t-micro); color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.1em;">Size</div>
          <div style="display: flex; gap: var(--s-2); overflow-x: auto;">
            ${product.sizes.map((s, i) => `
              <button class="chip ${i === product.defaultSize ? 'active' : ''}" style="white-space: nowrap;">${s}</button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <button onclick="orderOnWhatsApp('${product.id}')" style="display: flex; align-items: center; justify-content: center; gap: var(--s-2); width: 100%; padding: var(--s-4); background: #25D366; color: white; border-radius: var(--r-pill); font-weight: 600; border: none; cursor: pointer;">
        ${icon('whatsapp')} Order on WhatsApp · ${Locale.formatPrice((product.salePrice || product.price))}
      </button>
    </div>
  `;
}

function initFootTryOn(product) {
  log('TryOn/Foot', 'mounted (model-viewer AR)');
}

window.launchFootAR = function() {
  log('TryOn/Foot', 'launching AR');
  const mv = document.getElementById('foot-model');
  if (mv && mv.activateAR) {
    mv.activateAR();
  } else {
    alert('AR not supported on this device. Try on iOS Safari or Chrome on Android.');
  }
};

/* ============================================================
   CLOTHING TRY-ON — AI Photo upload flow (mocked)
   ============================================================ */
function renderClothingTryOn(product) {
  setTimeout(() => initClothingTryOn(product), 100);
  return `
    <div class="to to-bai">
      ${topbar(product, 'AI Photo Try-On')}

      <div id="bai-step-upload" class="bai-step" style="display:flex;">
        <div class="bai-illust">${uploadIcon()}</div>
        <h2>Upload your photo</h2>
        <p>Full body, front-facing, neutral background works best.</p>
        <label class="bai-upload-btn">
          <input type="file" accept="image/*" id="bai-file" style="display:none;" />
          ${icon('camera')} Take or choose photo
        </label>
        <button class="bai-sample-btn" id="bai-sample">Use sample photo instead</button>
      </div>

      <div id="bai-step-processing" class="bai-step" style="display:none;">
        <div class="bai-spinner-big"></div>
        <h2>Generating your fitting</h2>
        <p id="bai-status">Detecting body pose</p>
        <div class="bai-progress"><div class="bai-progress-fill" id="bai-progress"></div></div>
        <p class="bai-fineprint">Powered by HOLOS AI · usually 8-12 seconds</p>
      </div>

      <div id="bai-step-result" class="bai-step" style="display:none;">
        <div class="bai-result-card" style="background: linear-gradient(135deg, ${product.colors[0].hex}, ${product.colors[0].hex}99);">
          <div class="bai-result-emoji">${product.category === 'clothing' ? '👗' : '🎽'}</div>
        </div>
        <h2>Looking great!</h2>
        <p>${product.name} fits well in your size.</p>
        <div class="bai-actions">
          <button class="btn btn-ghost" id="bai-retry">Try another photo</button>
          <button class="btn btn-primary" onclick="orderOnWhatsApp('${product.id}')">${icon('whatsapp')} Order</button>
        </div>
      </div>

      <style>
        .to-bai { background: linear-gradient(180deg, #1a1a1a, #0a0a0a); display: flex; align-items: center; justify-content: center; }
        .bai-step {
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--s-6);
          max-width: 360px;
          width: 100%;
        }
        .bai-step h2 {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: var(--s-2);
          letter-spacing: -0.02em;
        }
        .bai-step p {
          color: rgba(255,255,255,0.6);
          font-size: var(--t-small);
          margin-bottom: var(--s-5);
          line-height: 1.5;
        }
        .bai-illust { margin-bottom: var(--s-5); opacity: 0.7; }
        .bai-upload-btn {
          display: inline-flex; align-items: center; gap: var(--s-2);
          padding: var(--s-4) var(--s-6);
          background: white; color: black;
          border-radius: var(--r-pill);
          font-weight: 600;
          cursor: pointer;
          margin-bottom: var(--s-3);
        }
        .bai-upload-btn svg { width: 18px; height: 18px; }
        .bai-sample-btn {
          color: rgba(255,255,255,0.5);
          font-size: var(--t-small);
          text-decoration: underline;
          background: none; border: none; cursor: pointer;
        }
        .bai-spinner-big {
          width: 64px; height: 64px;
          margin: 0 auto var(--s-5);
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .bai-progress {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin: var(--s-3) 0;
        }
        .bai-progress-fill {
          height: 100%;
          background: #4DDC8A;
          width: 0%;
          transition: width 0.3s ease;
        }
        .bai-fineprint {
          font-size: var(--t-micro);
          color: rgba(255,255,255,0.4);
        }
        .bai-result-card {
          width: 240px; height: 320px;
          border-radius: var(--r-lg);
          margin: 0 auto var(--s-5);
          display: flex; align-items: center; justify-content: center;
          font-size: 5rem;
          opacity: 0.9;
        }
        .bai-actions {
          display: flex; gap: var(--s-3); justify-content: center;
        }
        .bai-actions .btn { padding: var(--s-3) var(--s-5); }
        .bai-actions .btn-ghost {
          background: rgba(255,255,255,0.1);
          color: white;
          border-color: rgba(255,255,255,0.2);
        }
      </style>
    </div>
    ${sharedStyles()}
  `;
}

function initClothingTryOn(product) {
  const file = document.getElementById('bai-file');
  const sample = document.getElementById('bai-sample');
  const retry = document.getElementById('bai-retry');

  const startProcessing = () => {
    document.getElementById('bai-step-upload').style.display = 'none';
    document.getElementById('bai-step-processing').style.display = 'flex';

    const stages = ['Detecting body pose', 'Segmenting body shape', 'Generating fit', 'Rendering result'];
    let p = 0, s = 0;
    const interval = setInterval(() => {
      p += 2;
      document.getElementById('bai-progress').style.width = p + '%';
      if (p > (s + 1) * 25 && s < stages.length - 1) {
        s++;
        document.getElementById('bai-status').textContent = stages[s];
      }
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          document.getElementById('bai-step-processing').style.display = 'none';
          document.getElementById('bai-step-result').style.display = 'flex';
        }, 400);
      }
    }, 200);
  };

  if (file) file.addEventListener('change', startProcessing);
  if (sample) sample.addEventListener('click', startProcessing);
  if (retry) retry.addEventListener('click', () => {
    document.getElementById('bai-step-result').style.display = 'none';
    document.getElementById('bai-step-upload').style.display = 'flex';
  });
}

/* ============================================================
   SHARED UTILITIES
   ============================================================ */

window.TryOnState = window.TryOnState || { active: false };

window.stopTryOn = function() {
  log('TryOn', 'stopping');
  if (TryOnState.mindar) {
    try { TryOnState.mindar.stop(); } catch(e) {}
  }
  if (TryOnState.stream) {
    TryOnState.stream.getTracks().forEach(t => t.stop());
  }
  TryOnState = { active: false };
};

window.captureTryOnPhoto = function() {
  log('TryOn', 'photo captured (mocked)');
  alert('Photo saved to gallery!');
};

function hideLoading() {
  const el = document.getElementById('to-loading');
  if (el) el.classList.add('gone');
}

function setStatus(text, type = 'live') {
  const el = document.getElementById('to-status');
  if (el) {
    el.className = `to-status ${type}`;
    el.textContent = text;
  }
}

function showError(title, msg) {
  const loading = document.getElementById('to-loading');
  if (loading) loading.style.display = 'none';
  const screen = document.querySelector('.to');
  if (!screen) return;
  const errDiv = document.createElement('div');
  errDiv.className = 'to-error';
  errDiv.innerHTML = `
    <div class="to-error-icon">⚠</div>
    <div class="to-error-title">${title}</div>
    <div class="to-error-msg">${msg}<br/><br/>This feature needs HTTPS + camera permission. Try on Safari (iOS) or Chrome (Android).</div>
    <button class="btn btn-primary" onclick="location.reload()">Try again</button>
  `;
  screen.appendChild(errDiv);
}

async function loadScript(url) {
  if (document.querySelector(`script[src="${url}"]`)) return;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function uploadIcon() {
  return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="16" width="48" height="40" rx="6" stroke="white" stroke-width="2" opacity="0.5"/>
    <path d="M20 40 L 28 32 L 36 40 L 44 28 L 52 40" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.7" fill="none"/>
    <circle cx="44" cy="26" r="4" fill="white" opacity="0.7"/>
    <path d="M 32 4 L 32 18 M 26 10 L 32 4 L 38 10" stroke="#4DDC8A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
