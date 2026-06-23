/* ============================================================
   HOLOS — Model Baker (in-browser normalisation)
   Rewrites an uploaded .glb so its real-world size is baked into
   the file itself, then exports BOTH a corrected .glb and .usdz.

   Why: Android (WebXR) honours runtime scaling, but iPhone Quick
   Look uses the model file's own size and ignores any scale we set.
   The only way to control iPhone AR size is to bake it into the
   file. This module does exactly that, inside HOLOS, so a seller
   can upload a model at ANY export scale and AR is correct on every
   device.

   Exposes: window.ModelBaker.bake(glbUrl, {w,h,d} cm, {strategy})
     -> { glbBlob, usdzBlob, raw:{x,y,z} in m, normalized:{w,h,d} in cm }
   ============================================================ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/';

function makeLoader() {
  const loader = new GLTFLoader();
  try {
    const draco = new DRACOLoader();
    draco.setDecoderPath(CDN + 'libs/draco/');
    loader.setDRACOLoader(draco);
  } catch (e) {}
  try { loader.setMeshoptDecoder(MeshoptDecoder); } catch (e) {}
  return loader;
}

/* Mirror of ModelFit's strategy logic so baked size matches the preview.
   raw: {x,y,z} in metres · target: {w,h,d} in cm (0 = unset). */
function computeScale(raw, target, strategy) {
  const tw = (target.w || 0) / 100;
  const th = (target.h || 0) / 100;
  const td = (target.d || 0) / 100;
  const fx = tw > 0 ? tw / raw.x : null;
  const fy = th > 0 ? th / raw.y : null;
  const fz = td > 0 ? td / raw.z : null;
  const set = [fx, fy, fz].filter(v => v != null && isFinite(v) && v > 0);
  if (set.length === 0) return { x: 1, y: 1, z: 1 };
  const avg = set.reduce((a, b) => a + b, 0) / set.length;
  const drift = Math.max(...set) / Math.min(...set);
  const perAxis = (strategy === 'per-axis') || (strategy === 'auto' && drift > 1.3);
  if (!perAxis) return { x: avg, y: avg, z: avg }; // uniform — shape preserved
  return { x: fx != null ? fx : avg, y: fy != null ? fy : avg, z: fz != null ? fz : avg };
}

async function bake(glbUrl, target, opts = {}) {
  const strategy = opts.strategy || 'auto';

  const resp = await fetch(glbUrl);
  if (!resp.ok) throw new Error('could not download model (' + resp.status + ')');
  const buf = await resp.arrayBuffer();

  const loader = makeLoader();
  const gltf = await new Promise((res, rej) => loader.parse(buf, '', res, rej));
  const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
  if (!model) throw new Error('model had no scene');

  // True size at scale 1
  const box = new THREE.Box3().setFromObject(model);
  const rsize = new THREE.Vector3(); box.getSize(rsize);
  const rcenter = new THREE.Vector3(); box.getCenter(rcenter);
  const raw = { x: rsize.x || 1e-6, y: rsize.y || 1e-6, z: rsize.z || 1e-6 };

  const s = computeScale(raw, target, strategy);

  // Centre the model at the origin, then scale through a wrapper group and
  // rest its base on the floor (y = 0) for clean AR placement.
  model.position.x -= rcenter.x;
  model.position.y -= rcenter.y;
  model.position.z -= rcenter.z;

  const wrap = new THREE.Group();
  wrap.scale.set(s.x, s.y, s.z);
  wrap.add(model);
  wrap.position.y = (raw.y * s.y) / 2;

  const root = new THREE.Scene();
  root.add(wrap);

  const glbOut = await new Promise((res, rej) =>
    new GLTFExporter().parse(root, res, rej, { binary: true }));
  const usdzOut = await new USDZExporter().parse(root);

  return {
    glbBlob: new Blob([glbOut], { type: 'model/gltf-binary' }),
    usdzBlob: new Blob([usdzOut], { type: 'model/vnd.usdz+zip' }),
    raw,
    normalized: { w: raw.x * s.x * 100, h: raw.y * s.y * 100, d: raw.z * s.z * 100 },
  };
}

window.ModelBaker = { bake };
window.dispatchEvent(new Event('modelbaker-ready'));
try { (window.log || function () {})('ModelBaker', 'ready'); } catch (e) {}
