-- ============================================================
-- HOLOS — Migration 5: Fix model upload MIME whitelist
--
-- Problem: browsers report .glb / .usdz files with inconsistent
-- MIME types (sometimes empty, sometimes "application/octet-stream",
-- sometimes the correct "model/gltf-binary" / "model/vnd.usdz+zip").
-- The strict whitelist blocked legit uploads.
--
-- Fix: open the MIME whitelist for the product-models bucket.
-- File-size limit (50MB) is preserved; client-side validation
-- still gates by extension.
-- ============================================================

update storage.buckets
set allowed_mime_types = null
where id = 'product-models';

-- Also relax the shop-assets bucket to accept whatever the user picks
-- (still images, but some browsers report .png as application/octet-stream
-- when the file is renamed or copied from certain apps).
update storage.buckets
set allowed_mime_types = null
where id = 'shop-assets';
