-- ============================================================
-- HOLOS — Migration 8: Logo + banner on shop signup requests
--
-- When a seller signs up, they can now upload a logo and banner
-- as part of their application. These get transferred to the
-- created shop when admin approves.
-- ============================================================

alter table shop_requests add column if not exists logo text;
alter table shop_requests add column if not exists banner text;
alter table shop_requests add column if not exists banner_pos_y numeric default 50;
alter table shop_requests add column if not exists tagline text;
