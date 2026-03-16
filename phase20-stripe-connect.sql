-- Phase 20: Stripe Connect — Artist Direct Payments
-- Run this in Supabase SQL Editor

-- Add Stripe Connect columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false;
