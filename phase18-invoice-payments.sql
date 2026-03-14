-- ============================================================
-- ArtistOS Phase 18: Invoice Payments via Stripe Checkout
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add stripe_session_id to track the Stripe Checkout session
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- 2. Add stripe_payment_url to cache the checkout URL for copy/resend
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stripe_payment_url TEXT;
