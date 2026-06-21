-- ============================================================
-- HOLOS — Migration 11: Scale strategy from Model Audit
--
-- When admin runs Model Audit on a product, they pick how the
-- model should be scaled to match the declared real-world size:
--   'uniform'   — single scale factor (preserves model shape)
--   'per-axis'  — independent X/Y/Z scales (exact dims, may distort)
--   'rejected'  — model is unfit for AR, send back to modeler
--   null/auto   — no audit run yet, fall back to auto detection
-- ============================================================

alter table products add column if not exists scale_strategy text
  check (scale_strategy in ('uniform', 'per-axis', 'rejected', 'auto'));

-- Default existing products to 'auto' so they keep working with the
-- automatic detection we had before
update products set scale_strategy = 'auto' where scale_strategy is null;

-- Force PostgREST to reload its schema cache immediately
notify pgrst, 'reload schema';
