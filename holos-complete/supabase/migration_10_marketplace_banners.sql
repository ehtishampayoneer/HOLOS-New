-- ============================================================
-- HOLOS — Migration 10: Marketplace hero banners
--
-- Admin-managed hero carousel that appears at the top of
-- /customer/marketplace. Supports image and video media,
-- per-slide title/subtitle/CTA, custom display duration, and
-- ordering. Falls back gracefully to default slides if empty.
-- ============================================================

create table if not exists marketplace_banners (
  id text primary key,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video', 'gif')),
  title text default '',
  subtitle text default '',
  cta_label text default '',
  cta_link text default '',
  text_align text default 'center' check (text_align in ('left', 'center', 'right')),
  overlay_opacity numeric default 0.3,
  display_order integer not null default 0,
  duration_ms integer not null default 5000,
  enabled boolean not null default true,
  created_at timestamptz default now()
);

-- Marketplace-wide carousel settings (singleton row)
create table if not exists marketplace_settings (
  id text primary key default 'default',
  carousel_default_duration_ms integer default 5000,
  carousel_transition text default 'fade' check (carousel_transition in ('fade','slide')),
  carousel_height_desktop integer default 480,
  carousel_height_mobile integer default 320,
  updated_at timestamptz default now()
);

-- Seed default settings row so the singleton always exists
insert into marketplace_settings (id) values ('default')
on conflict (id) do nothing;

alter table marketplace_banners enable row level security;
alter table marketplace_settings enable row level security;

create policy "anyone can read banners" on marketplace_banners for select using (true);
create policy "anyone can write banners" on marketplace_banners for all using (true) with check (true);
create policy "anyone can read settings" on marketplace_settings for select using (true);
create policy "anyone can write settings" on marketplace_settings for all using (true) with check (true);
