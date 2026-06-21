-- ============================================================
-- HOLOS — Migration 2
-- Run this in Supabase SQL Editor AFTER the initial setup.
-- Adds: category requests, custom-category support, shop region.
-- ============================================================

-- 1. Category requests (sellers requesting NEW MAIN categories)
create table if not exists category_requests (
  id            text primary key,
  shop_id       text,
  shop_name     text,
  proposed_name text not null,
  icon          text default '📦',
  reason        text,
  status        text default 'pending',
  requested_at  text,
  created_at    timestamptz default now()
);
alter table category_requests enable row level security;
drop policy if exists "public_all" on category_requests;
create policy "public_all" on category_requests for all using (true) with check (true);

-- 2. Categories: track creator + approval
alter table categories add column if not exists created_by text default 'admin';
alter table categories add column if not exists approved boolean default true;

-- 3. Shops: country + city for region targeting
alter table shops add column if not exists country text;
alter table shops add column if not exists region  text;

-- (Demo shops keep country = null → visible to everyone.)
