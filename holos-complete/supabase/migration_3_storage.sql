-- ============================================================
-- HOLOS — Migration 3: Storage buckets for product files
-- Paste this in Supabase SQL Editor → Run.
-- 
-- Creates two public buckets so anyone with the URL can view
-- the file (product photos and 3D models are public anyway —
-- buyers need to see them). Uploads are open during prototype
-- and will tighten when real auth lands in Phase D.
-- ============================================================

-- 1. Create the photos bucket (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-photos',
  'product-photos',
  true,
  10485760,  -- 10 MB per file
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Create the 3D models bucket (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-models',
  'product-models',
  true,
  52428800,  -- 50 MB per file (3D models can be large)
  array['model/gltf-binary','application/octet-stream','model/vnd.usdz+zip','model/gltf+json']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3. Create the shop banners/logos bucket (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-assets',
  'shop-assets',
  true,
  5242880,  -- 5 MB
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 4. RLS policies for storage.objects
-- During prototype: allow anyone to upload, read, delete.
-- Phase D: restrict by auth.uid()
do $$
begin
  -- Drop old policies if they exist
  drop policy if exists "holos_public_read"   on storage.objects;
  drop policy if exists "holos_public_insert" on storage.objects;
  drop policy if exists "holos_public_update" on storage.objects;
  drop policy if exists "holos_public_delete" on storage.objects;
end $$;

create policy "holos_public_read" on storage.objects
  for select using (bucket_id in ('product-photos','product-models','shop-assets'));

create policy "holos_public_insert" on storage.objects
  for insert with check (bucket_id in ('product-photos','product-models','shop-assets'));

create policy "holos_public_update" on storage.objects
  for update using (bucket_id in ('product-photos','product-models','shop-assets'));

create policy "holos_public_delete" on storage.objects
  for delete using (bucket_id in ('product-photos','product-models','shop-assets'));

-- ============================================================
-- DONE. Three public buckets ready: product-photos, 
-- product-models, shop-assets.
-- ============================================================

-- 5. Add photo_urls array column to products
alter table products add column if not exists photo_urls text[] default '{}';
