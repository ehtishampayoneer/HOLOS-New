-- ============================================================
-- HOLOS — Migration 6: Shop logo + banner position
-- 
-- Adds columns for the shop logo (separate from banner) and the
-- vertical reposition value for banners (used by the drag-to-
-- reposition feature in seller settings).
-- ============================================================

alter table shops add column if not exists logo text;
alter table shops add column if not exists banner_pos_y numeric default 50;

-- For existing shops, default banner_pos_y to 50 (center) where it's null
update shops set banner_pos_y = 50 where banner_pos_y is null;
