-- ============================================================
-- ArtistOS Phase 26: fixes found during the SEO audit
-- Run the whole file once: Supabase -> SQL Editor -> New query -> paste -> Run
-- Safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- 1. PUBLIC ARTIST PAGES ARE CURRENTLY BROKEN
--    The Sept 22 "demo account toggle" code reads profiles.is_demo,
--    but that column was never created, so every public artist page
--    shows "Artist not found" and Discover Artists is empty.
-- ------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- Hide demo / placeholder accounts from the public directory and search engines:
--   * the three seeded sample artists (Sophie Laurent, Priya Nair, Carlos Mendes)
--   * the old duplicate demo "Larry Jones" account (Brooklyn)
--   * Larry's main account, because its portfolio is public-domain placeholder
--     paintings from the demo video. Unhide it (Admin -> Users -> Unhide)
--     once real work is uploaded.
UPDATE public.profiles SET is_demo = true
WHERE email LIKE '%.demo@artistos.app'
   OR id IN ('266aad36-ed30-4946-9539-485d37320f25', '426b2398-339b-428a-8dd6-5422f1354b64');

-- ------------------------------------------------------------
-- 2. PRIVACY: logged-out visitors can currently read every user's
--    email, plan and Stripe customer ID from the profiles table.
--    Limit anonymous (logged-out) access to the public profile fields
--    the public pages actually use.
-- ------------------------------------------------------------
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, name, bio, website, medium, style, location, avatar_url, initials,
              website_settings, artist_statement, is_demo, created_at)
  ON public.profiles TO anon;

-- ------------------------------------------------------------
-- 3. GRANT FINDER DATA: three Louisiana listings are wrong
--    (verified Sept 24, 2026)
--    * Arts New Orleans Community Arts Grants: organizations only
--    * Louisiana Division of the Arts "Artist Fellowship": no longer offered
--    * A Studio in the Woods: 2026-27 residencies are by invitation only
--    Deactivate them so Studio users aren't told to apply.
-- ------------------------------------------------------------
UPDATE public.opportunities SET is_active = false, updated_at = now()
WHERE (organization = 'Arts Council of New Orleans' AND title = 'Community Arts Grant')
   OR (organization = 'Louisiana Division of the Arts' AND title = 'Artist Fellowship')
   OR (organization = 'A Studio in the Woods' AND title = 'Studio Program Residency');

-- ------------------------------------------------------------
-- Checks
-- ------------------------------------------------------------
SELECT name, email, is_demo FROM public.profiles ORDER BY created_at;
SELECT title, organization, is_active FROM public.opportunities ORDER BY is_active DESC, title;
