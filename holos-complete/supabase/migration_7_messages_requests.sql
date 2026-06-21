-- ============================================================
-- HOLOS — Migration 7: Shop change requests + admin-seller messaging
-- 
-- 1. shop_change_requests — sellers ask for changes to shop info
--    (name, tagline, etc) that need admin approval
-- 2. shop_messages — two-way messaging thread between admin and
--    each shop. Used for support, questions, file sharing.
-- 3. shop-messages storage bucket for message attachments
-- ============================================================

-- Shop change requests
create table if not exists shop_change_requests (
  id text primary key,
  shop_id text not null references shops(id) on delete cascade,
  field text not null,
  current_value text,
  requested_value text not null,
  reason text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by text
);
create index if not exists idx_scr_shop on shop_change_requests(shop_id);
create index if not exists idx_scr_status on shop_change_requests(status);

alter table shop_change_requests enable row level security;
drop policy if exists "scr_all" on shop_change_requests;
create policy "scr_all" on shop_change_requests for all using (true);

-- Shop messages (admin ↔ seller chat)
create table if not exists shop_messages (
  id text primary key,
  shop_id text not null references shops(id) on delete cascade,
  sender text not null,
  body text,
  attachment_url text,
  attachment_name text,
  read_by_admin boolean default false,
  read_by_seller boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_msg_shop on shop_messages(shop_id);
create index if not exists idx_msg_created on shop_messages(created_at desc);

alter table shop_messages enable row level security;
drop policy if exists "msg_all" on shop_messages;
create policy "msg_all" on shop_messages for all using (true);

-- Storage bucket for chat attachments (public read since URLs are unguessable)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-messages', 'shop-messages', true, 26214400, null)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "msg_storage_all" on storage.objects;
create policy "msg_storage_all" on storage.objects for all using (bucket_id = 'shop-messages') with check (bucket_id = 'shop-messages');
