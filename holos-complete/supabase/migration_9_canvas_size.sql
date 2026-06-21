-- ============================================================
-- HOLOS — Migration 9: Canvas-size AR (W × H × D)
--
-- Previously we stored only "real_size_cm" (longest dimension).
-- Now we also store explicit width / height / depth so sellers
-- can precisely size their AR models, especially for items with
-- specific dimensions (wall art, rugs, posters, furniture).
--
-- real_size_cm is preserved for back-compat; if the W/H/D are
-- all 0, we fall back to the single-dimension approach.
-- ============================================================

alter table products add column if not exists real_w_cm numeric default 0;
alter table products add column if not exists real_h_cm numeric default 0;
alter table products add column if not exists real_d_cm numeric default 0;
