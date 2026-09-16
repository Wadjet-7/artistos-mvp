-- ============================================================
-- ArtistOS Phase 22: Pricing restructure + annual billing
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Billing interval + grandfathering columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legacy_pricing BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legacy_plan_price INTEGER;

-- 2. Grandfather every CURRENT paying subscriber at their existing price.
--    Run this ONCE, before the new prices go live.
UPDATE public.profiles
SET legacy_pricing = true,
    legacy_plan_price = CASE
      WHEN LOWER(plan) = 'pro' THEN 19
      WHEN LOWER(plan) = 'studio' THEN 49
      ELSE NULL
    END
WHERE subscription_status = 'active'
  AND LOWER(plan) IN ('pro', 'studio');

-- 3. Founding Artists program code — 6 months of Pro, capped at 25 redemptions
INSERT INTO public.promo_codes (code, description, grants_plan, duration_months, max_redemptions, expires_at)
VALUES ('FOUNDING', 'Founding Artists Program - 6 months Pro free', 'Pro', 6, 25, '2026-12-31T23:59:59Z')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- NOTE: nothing here changes prices. Prices live in src/lib/plans.js
-- and in the Stripe dashboard. This migration only records who is
-- grandfathered and adds the billing_interval field.
-- ============================================================
