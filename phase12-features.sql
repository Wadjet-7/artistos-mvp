-- ============================================================
-- Phase 12: Stripe Payments, Plan Gating, Onboarding
-- ============================================================
-- Run this in Supabase SQL Editor

-- Add Stripe-related columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_period_end TIMESTAMPTZ;

-- Add onboarding tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Normalize existing plan values to lowercase
UPDATE profiles SET plan = LOWER(plan) WHERE plan != LOWER(plan);

-- Set existing users as onboarding complete (they're already using the app)
UPDATE profiles SET onboarding_complete = true WHERE onboarding_complete IS NULL OR onboarding_complete = false;

-- For the test user, ensure plan is 'starter' (lowercase)
UPDATE profiles SET plan = 'starter' WHERE plan IS NULL;
