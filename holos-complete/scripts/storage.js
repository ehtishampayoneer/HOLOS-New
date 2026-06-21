/* ============================================================
   HOLOS — Storage Helper
   Uploads files to Supabase Storage and returns public URLs.
   Three buckets:
     - product-photos  (jpg/png/webp, 10MB each)
     - product-models  (glb/usdz, 50MB each)
     - shop-assets     (logos/banners, 5MB each)
   ============================================================ */

const Storage = (() => {
  const sb = window.supabaseClient;

  /* Generate a unique file path. We use timestamps and random suffixes
     so two uploads can't clash even with identical names. */
  function makePath(shopId, prefix, file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 6);
    return `${shopId}/${prefix}-${stamp}-${rand}.${ext}`;
  }

  /* Upload a file and return its public URL (or throw). */
  async function upload(bucket, path, file) {
    const res = await sb.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (res.error) {
      log('Storage', `upload failed: ${res.error.message}`, 'error');
      throw new Error(res.error.message);
    }
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    log('Storage', `uploaded → ${path}`);
    return data.publicUrl;
  }

  /* High-level helpers used by upload flows */
  async function uploadProductPhoto(shopId, file) {
    return upload('product-photos', makePath(shopId, 'photo', file), file);
  }

  async function uploadProductModel(shopId, file, kind = 'glb') {
    // kind is just for path readability — actual format is in the extension
    return upload('product-models', makePath(shopId, kind, file), file);
  }

  async function uploadShopAsset(shopId, file, kind = 'logo') {
    return upload('shop-assets', makePath(shopId, kind, file), file);
  }

  /* Delete a file by its full URL (best-effort, errors are non-fatal) */
  async function removeByUrl(url) {
    try {
      const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
      if (!m) return;
      const [, bucket, path] = m;
      await sb.storage.from(bucket).remove([path]);
      log('Storage', `removed ${bucket}/${path}`);
    } catch (e) { log('Storage', `remove failed: ${e.message}`, 'warn'); }
  }

  /* Validation helpers — useful for client-side checks before upload */
  const PHOTO_MAX = 10 * 1024 * 1024;
  const MODEL_MAX = 50 * 1024 * 1024;
  const ASSET_MAX = 5 * 1024 * 1024;

  function validatePhoto(file) {
    if (!file.type.startsWith('image/')) return 'Please choose an image file.';
    if (file.size > PHOTO_MAX) return `Image is too big (max 10 MB). Yours is ${(file.size/1024/1024).toFixed(1)} MB.`;
    return null;
  }
  function validateModel(file) {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.glb') && !name.endsWith('.gltf') && !name.endsWith('.usdz')) {
      return 'Please choose a .glb, .gltf, or .usdz file.';
    }
    if (file.size > MODEL_MAX) return `File is too big (max 50 MB). Yours is ${(file.size/1024/1024).toFixed(1)} MB.`;
    return null;
  }
  function validateAsset(file) {
    if (!file.type.startsWith('image/')) return 'Please choose an image file.';
    if (file.size > ASSET_MAX) return `Image is too big (max 5 MB). Yours is ${(file.size/1024/1024).toFixed(1)} MB.`;
    return null;
  }

  return {
    uploadProductPhoto, uploadProductModel, uploadShopAsset,
    removeByUrl, validatePhoto, validateModel, validateAsset,
  };
})();

window.Storage = Storage;
log('Storage', 'helper ready');
