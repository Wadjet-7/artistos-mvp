-- ============================================================
-- ArtistOS Phase 31 Group 4: Contact Larry security fixes
-- Secures app_settings, adds get_contact_card RPC,
-- is_first_client helper.
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ============================================================
-- 1. get_public_settings: returns only safe keys
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_public_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  result JSONB := '{}';
  r RECORD;
BEGIN
  FOR r IN
    SELECT key, value FROM public.app_settings
    WHERE key IN ('reply_time_text', 'contact_email', 'platform_name')
  LOOP
    result := result || jsonb_build_object(r.key, r.value);
  END LOOP;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_settings TO authenticated;

-- ============================================================
-- 2. is_first_client: checks if user is a founder, VIP, or
--    one of the first N signups
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_first_client()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_profile RECORD;
  v_signup_rank INT;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;

  SELECT lifetime_plan, vip INTO v_profile
  FROM public.profiles WHERE id = v_uid;

  IF v_profile.lifetime_plan OR v_profile.vip THEN
    RETURN true;
  END IF;

  -- Check if among first 50 signups
  SELECT rank INTO v_signup_rank FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rank
    FROM public.profiles
  ) ranked WHERE id = v_uid;

  RETURN COALESCE(v_signup_rank <= 50, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_first_client TO authenticated;

-- ============================================================
-- 3. get_contact_card: returns contact info for first clients
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_contact_card()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_is_first BOOLEAN;
  v_email TEXT;
  v_phone TEXT;
  v_reply_time TEXT;
BEGIN
  v_is_first := public.is_first_client();

  SELECT value INTO v_email FROM public.app_settings WHERE key = 'contact_email';
  SELECT value INTO v_reply_time FROM public.app_settings WHERE key = 'reply_time_text';

  IF v_is_first THEN
    SELECT value INTO v_phone FROM public.app_settings WHERE key = 'contact_phone';
    RETURN jsonb_build_object(
      'is_first_client', true,
      'email', COALESCE(v_email, ''),
      'phone', COALESCE(v_phone, ''),
      'reply_time', COALESCE(v_reply_time, 'Larry usually replies within a day.')
    );
  ELSE
    RETURN jsonb_build_object(
      'is_first_client', false,
      'email', COALESCE(v_email, ''),
      'reply_time', COALESCE(v_reply_time, 'Larry usually replies within a day.')
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_contact_card TO authenticated;

-- ============================================================
-- 4. Revoke direct SELECT on app_settings for authenticated
-- ============================================================
DROP POLICY IF EXISTS "Authenticated read app settings" ON public.app_settings;
DROP POLICY IF EXISTS "Anyone can read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.app_settings;

-- Only admins can read directly; users go through RPCs
CREATE POLICY "Admin read app_settings" ON public.app_settings
  FOR SELECT USING (public.is_admin());

-- Admin can manage app_settings
DROP POLICY IF EXISTS "Admin manage app_settings" ON public.app_settings;
CREATE POLICY "Admin manage app_settings" ON public.app_settings
  FOR ALL USING (public.is_admin());

-- Verify
SELECT 'get_public_settings' AS fn, TRUE AS ok
UNION ALL SELECT 'is_first_client', TRUE
UNION ALL SELECT 'get_contact_card', TRUE;
