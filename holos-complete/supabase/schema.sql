-- ============================================================
-- HOLOS — Database Schema (Supabase / PostgreSQL)
-- Paste this whole file into Supabase SQL Editor and run it.
-- It creates all tables, security policies, and demo data.
-- ============================================================

-- ---------- CATEGORIES (top level) ----------
create table if not exists categories (
  id          text primary key,        -- 'fashion', 'home', etc.
  label       text not null,
  icon        text,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ---------- SUBCATEGORIES (with field schema) ----------
create table if not exists subcategories (
  id           text primary key,       -- 'mens-shoes', 'carpets', etc.
  category_id  text references categories(id) on delete cascade,
  label        text not null,
  try_on       text,                   -- 'foot','face','room', etc. (nullable)
  fields       jsonb not null default '[]',  -- the field schema array
  approved     boolean default true,
  created_by   text default 'admin',   -- 'admin' or a shop id
  created_at   timestamptz default now()
);

-- ---------- SHOPS ----------
create table if not exists shops (
  id             text primary key,      -- 'bilal-footwear'
  name           text not null,
  tagline        text,
  owner          text,
  email          text,
  phone          text,
  city           text,
  plan           text default 'starter',
  categories     text[] default '{}',
  accent         text default '#2D4A47',
  cover_gradient text,
  banner         text,                  -- storage path/url, nullable
  rating         numeric default 0,
  review_count   int default 0,
  followers      int default 0,
  verified       boolean default false,
  status         text default 'active', -- 'active','suspended'
  auto_live      boolean default false,
  -- credentials (demo only; real auth comes in Phase D)
  shop_login_id  text,
  shop_password  text,
  joined_months  int default 0,
  -- stats
  revenue        bigint default 0,
  orders         int default 0,
  refunds        int default 0,
  scans_today    int default 0,
  scans_month    int default 0,
  views          int default 0,
  created_at     timestamptz default now()
);

-- ---------- SHOP REQUESTS (pending approval) ----------
create table if not exists shop_requests (
  id            text primary key,
  name          text not null,
  owner         text,
  email         text,
  phone         text,
  city          text,
  category      text,
  docs          text[] default '{}',
  status        text default 'pending', -- 'pending','review'
  requested_at  text,
  created_at    timestamptz default now()
);

-- ---------- SUBCATEGORY REQUESTS ----------
create table if not exists subcat_requests (
  id                 text primary key,
  shop_id            text,
  shop_name          text,
  proposed_name      text not null,
  suggested_category text,
  reason             text,
  status             text default 'pending',
  requested_at       text,
  created_at         timestamptz default now()
);

-- ---------- PRODUCTS ----------
create table if not exists products (
  id            text primary key,       -- 'p-shoe-001'
  shop_id       text references shops(id) on delete cascade,
  category      text,
  subcategory   text,
  name          text not null,
  subtitle      text,
  price         bigint not null,
  sale_price    bigint default 0,
  currency      text default 'PKR',
  offer         jsonb,                  -- { type, label, endsIn } or null
  options       jsonb default '{}',     -- schema-driven values incl colors/sizes
  default_color int default 0,
  default_size  int default 0,
  description   text,
  photos        int default 0,
  rating        numeric default 0,
  review_count  int default 0,
  best_seller   boolean default false,
  status        text default 'pending_approval', -- live/pending_approval/photo_review/draft
  photo_issue   text,
  -- model
  model_glb     text,
  model_usdz    text,
  model_poster  text,
  real_size_cm  numeric default 0,
  try_on        text,
  created_at    timestamptz default now()
);

-- ---------- REVIEWS (with anti-fraud weight) ----------
create table if not exists reviews (
  id          text primary key,
  product_id  text references products(id) on delete cascade,
  account_id  text,                     -- who wrote it (for anti-fraud)
  author      text,
  stars       int not null check (stars between 1 and 5),
  text        text,
  weight      numeric default 1.0,
  date        text,
  created_at  timestamptz default now()
);

-- ---------- ADMIN SETTINGS (single row) ----------
create table if not exists admin_settings (
  id           int primary key default 1,
  mrr          int default 12840,
  new_signups  int default 12,
  created_at   timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- For now (no real auth yet) we allow public read + write so the
-- prototype works. We TIGHTEN this in Phase D when auth lands.
-- ============================================================
alter table categories      enable row level security;
alter table subcategories   enable row level security;
alter table shops           enable row level security;
alter table shop_requests   enable row level security;
alter table subcat_requests enable row level security;
alter table products        enable row level security;
alter table reviews         enable row level security;
alter table admin_settings  enable row level security;

-- Open policies (prototype phase). Replaced with strict rules in Phase D.
do $$
declare t text;
begin
  foreach t in array array['categories','subcategories','shops','shop_requests','subcat_requests','products','reviews','admin_settings']
  loop
    execute format('drop policy if exists "public_all" on %I;', t);
    execute format('create policy "public_all" on %I for all using (true) with check (true);', t);
  end loop;
end $$;

-- ============================================================
-- DONE. Demo data is inserted by a separate seed file.
-- ============================================================
