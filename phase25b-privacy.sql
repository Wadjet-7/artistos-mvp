-- ============================================================
-- ArtistOS Phase 25 Part B: Privacy fix
-- Locks down profiles so logged-in users can only read their
-- own row. Public data is served through a view.
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- 1. Create a public-safe view with only the columns visitors need
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, name, bio, website, medium, style, location, avatar_url, initials,
       website_settings, artist_statement, is_demo, created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 2. Drop existing overly-broad SELECT policies on profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- 3. Create the locked-down SELECT policy: own row or admin only
CREATE POLICY "Own profile or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- 4. Verify: should return column list for the view
SELECT column_name FROM information_schema.columns
WHERE table_name = 'public_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
