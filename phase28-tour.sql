-- ============================================================
-- ArtistOS Phase 28: Guided tour progress column
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{}'::jsonb;
