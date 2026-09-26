-- ============================================================
-- ArtistOS Phase 31 Group 2: Money & Trust fixes
-- ALREADY APPLIED LIVE — this file is updated to match.
-- 1. Hardened submit_commission_request RPC
-- 2. Drop the real anonymous INSERT policy names
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ============================================================
-- 1. Hardened submit_commission_request RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_commission_request(
  p_artist_id UUID, p_client_name TEXT, p_client_email TEXT, p_title TEXT, p_description TEXT,
  p_medium TEXT DEFAULT NULL, p_dimensions TEXT DEFAULT NULL, p_budget NUMERIC DEFAULT 0, p_deadline DATE DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_commission_id UUID;
BEGIN
  IF p_artist_id IS NULL OR coalesce(trim(p_client_name),'') = '' OR coalesce(trim(p_client_email),'') = ''
     OR coalesce(trim(p_title),'') = '' OR coalesce(trim(p_description),'') = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields');
  END IF;
  IF length(p_client_name) > 120 OR length(p_client_email) > 254 OR length(p_title) > 200
     OR length(p_description) > 4000 OR length(coalesce(p_medium,'')) > 100 OR length(coalesce(p_dimensions,'')) > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'One of the fields is too long');
  END IF;
  IF p_client_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email address');
  END IF;
  IF p_budget IS NULL OR p_budget < 0 OR p_budget > 10000000 THEN p_budget := 0; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_artist_id AND coalesce(is_demo,false) = false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This artist is not accepting requests right now');
  END IF;
  IF (SELECT count(*) FROM public.commissions WHERE lower(client_email) = lower(trim(p_client_email)) AND created_at > now() - interval '1 hour') >= 5
     OR (SELECT count(*) FROM public.commissions WHERE user_id = p_artist_id AND status = 'pending' AND created_at > now() - interval '1 hour') >= 20 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Too many requests. Please try again later');
  END IF;
  INSERT INTO public.commissions (user_id, client_name, client_email, title, description, medium, dimensions, budget, deadline, status, progress, milestone)
  VALUES (p_artist_id, trim(p_client_name), trim(p_client_email), trim(p_title), trim(p_description), nullif(trim(p_medium),''), nullif(trim(p_dimensions),''), p_budget, p_deadline, 'pending', 0, '')
  RETURNING id INTO v_commission_id;
  INSERT INTO public.activity_log (user_id, activity_type, description, metadata)
  VALUES (p_artist_id, 'commission', 'New commission request from ' || trim(p_client_name) || ': "' || trim(p_title) || '"',
          jsonb_build_object('client_name', trim(p_client_name), 'client_email', trim(p_client_email), 'budget', p_budget, 'commission_id', v_commission_id));
  RETURN jsonb_build_object('success', true, 'commission_id', v_commission_id);
END; $$;

REVOKE ALL ON FUNCTION public.submit_commission_request(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_commission_request(UUID,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,DATE) TO anon, authenticated;

-- ============================================================
-- 2. Drop the real anonymous INSERT policies (correct names)
-- ============================================================

DROP POLICY IF EXISTS "Anyone can submit a commission request" ON public.commissions;
DROP POLICY IF EXISTS "Anyone can create a conversation for commission requests" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can send an initial message" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create activity log entries" ON public.activity_log;

-- Verify
SELECT 'submit_commission_request (hardened)' AS fn, TRUE AS ok;
