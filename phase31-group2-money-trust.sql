-- ============================================================
-- ArtistOS Phase 31 Group 2: Money & Trust fixes
-- 1. submit_commission_request RPC (replaces anonymous inserts)
-- 2. Drop anonymous INSERT policies
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ============================================================
-- 1. submit_commission_request RPC
-- Called by logged-out visitors from the public artist page.
-- Inserts into commissions + activity_log in a single secure call.
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_commission_request(
  p_artist_id UUID,
  p_client_name TEXT,
  p_client_email TEXT,
  p_title TEXT,
  p_description TEXT,
  p_medium TEXT DEFAULT NULL,
  p_dimensions TEXT DEFAULT NULL,
  p_budget NUMERIC DEFAULT 0,
  p_deadline DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission_id UUID;
BEGIN
  -- Validate required fields
  IF p_artist_id IS NULL OR p_client_name IS NULL OR trim(p_client_name) = ''
     OR p_client_email IS NULL OR trim(p_client_email) = ''
     OR p_title IS NULL OR trim(p_title) = ''
     OR p_description IS NULL OR trim(p_description) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields');
  END IF;

  -- Validate email format (basic check)
  IF p_client_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email address');
  END IF;

  -- Verify artist exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_artist_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Artist not found');
  END IF;

  -- Insert commission
  INSERT INTO public.commissions (
    user_id, client_name, client_email, title, description,
    medium, dimensions, budget, deadline, status, progress, milestone
  ) VALUES (
    p_artist_id, trim(p_client_name), trim(p_client_email), trim(p_title),
    trim(p_description), p_medium, nullif(trim(p_dimensions), ''),
    p_budget, p_deadline, 'pending', 0, ''
  )
  RETURNING id INTO v_commission_id;

  -- Log activity
  INSERT INTO public.activity_log (user_id, activity_type, description, metadata)
  VALUES (
    p_artist_id,
    'commission',
    'New commission request from ' || trim(p_client_name) || ': "' || trim(p_title) || '"',
    jsonb_build_object(
      'client_name', trim(p_client_name),
      'client_email', trim(p_client_email),
      'budget', p_budget,
      'commission_id', v_commission_id
    )
  );

  RETURN jsonb_build_object('success', true, 'commission_id', v_commission_id);
END;
$$;

-- Grant execute to anon so logged-out visitors can call it
GRANT EXECUTE ON FUNCTION public.submit_commission_request TO anon, authenticated;

-- ============================================================
-- 2. Drop anonymous INSERT policies on sensitive tables
-- The RPC handles all inserts now; anonymous users should not
-- be able to insert directly.
-- ============================================================

-- Commissions: drop any anonymous/public INSERT policy
DROP POLICY IF EXISTS "Anyone can insert commissions" ON public.commissions;
DROP POLICY IF EXISTS "Anyone can create commissions" ON public.commissions;
DROP POLICY IF EXISTS "Public can insert commissions" ON public.commissions;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.commissions;

-- Activity log: drop anonymous INSERT
DROP POLICY IF EXISTS "Anyone can insert activity" ON public.activity_log;
DROP POLICY IF EXISTS "Anyone can insert activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.activity_log;

-- Conversations: drop anonymous INSERT (commission form no longer creates these)
DROP POLICY IF EXISTS "Anyone can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.conversations;

-- Messages: drop anonymous INSERT
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.messages;

-- Verify
SELECT 'submit_commission_request' AS fn, TRUE AS ok;
