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
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- 3. Create the locked-down SELECT policy: own row or admin only
CREATE POLICY "Own profile or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- 4. Protect sensitive columns from user self-update
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user IN ('postgres','service_role','supabase_admin') OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF NEW.plan               IS DISTINCT FROM OLD.plan
  OR NEW.lifetime_plan      IS DISTINCT FROM OLD.lifetime_plan
  OR NEW.is_admin           IS DISTINCT FROM OLD.is_admin
  OR NEW.vip                IS DISTINCT FROM OLD.vip
  OR NEW.is_demo            IS DISTINCT FROM OLD.is_demo
  OR NEW.plan_expires_at    IS DISTINCT FROM OLD.plan_expires_at
  OR NEW.founder_referral_code IS DISTINCT FROM OLD.founder_referral_code
  OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
  OR NEW.stripe_account_id  IS DISTINCT FROM OLD.stripe_account_id
  OR NEW.stripe_charges_enabled IS DISTINCT FROM OLD.stripe_charges_enabled
  OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
  THEN
    RAISE EXCEPTION 'You cannot change plan or account flags directly.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_profile_columns ON public.profiles;
CREATE TRIGGER protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- 5. Verify
SELECT column_name FROM information_schema.columns
WHERE table_name = 'public_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
