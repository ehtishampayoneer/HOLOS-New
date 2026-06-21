-- ============================================================
-- HOLOS — Migration 4: Shop themes
-- Stores the seller's chosen theme + customizations.
-- ============================================================

-- Add a theme JSON column to shops
alter table shops add column if not exists theme jsonb default '{}';

-- Example theme value:
-- {
--   "id": "warm_boutique",
--   "colorOverrides": { "accent": "#D4AF37" },
--   "blocks": [
--     { "type": "hero", "enabled": true, "content": {"title":"Welcome","subtitle":"Premium leather"} },
--     { "type": "best_sellers", "enabled": true, "content": {"headline":"Customer favorites"} }
--   ]
-- }

-- Track when a shop has completed onboarding (chose a theme)
alter table shops add column if not exists onboarded boolean default false;

-- Mark existing demo shops as already onboarded so they don't get forced through the flow
update shops set onboarded = true where onboarded is null or onboarded = false;
