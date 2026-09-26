-- Phase 31 Section 4: Welcome thread on signup
-- Safe to re-run (idempotent)

-- 1. Default welcome templates
INSERT INTO public.app_settings (key, value) VALUES
  ('welcome_thread_subject', 'Welcome to ArtistOS!'),
  ('welcome_thread_body', 'Hey {name}! Welcome to ArtistOS. I''m Larry, the founder. I built this for artists like you, and I''m here if you need anything.\n\nA few quick tips:\n1. Add your first artworks in Portfolio\n2. Set up your profile in Settings\n3. Connect Stripe in Settings → Billing to accept payments\n\nHit reply any time — I read every message.')
ON CONFLICT (key) DO NOTHING;

-- 2. Function: create_welcome_thread
CREATE OR REPLACE FUNCTION public.create_welcome_thread(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_first_name text;
  v_subject text;
  v_body text;
  v_thread_id uuid;
  v_admin_id uuid := '426b2398-339b-428a-8dd6-5422f1354b64';
BEGIN
  -- Get user name from profiles
  SELECT name INTO v_name
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_name IS NULL THEN
    v_name := 'there';
  END IF;

  -- Use first name only
  v_first_name := split_part(v_name, ' ', 1);

  -- Read templates from app_settings
  SELECT value INTO v_subject
  FROM public.app_settings
  WHERE key = 'welcome_thread_subject';

  SELECT value INTO v_body
  FROM public.app_settings
  WHERE key = 'welcome_thread_body';

  IF v_subject IS NULL THEN
    v_subject := 'Welcome to ArtistOS!';
  END IF;

  IF v_body IS NULL THEN
    v_body := 'Hey {name}! Welcome to ArtistOS.';
  END IF;

  -- Replace {name} placeholder
  v_subject := replace(v_subject, '{name}', v_first_name);
  v_body := replace(v_body, '{name}', v_first_name);

  -- Create support thread (idempotent: skip if welcome thread already exists)
  INSERT INTO public.support_threads (user_id, subject, source)
  SELECT p_user_id, v_subject, 'system'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.support_threads
    WHERE user_id = p_user_id AND source = 'system' AND subject LIKE 'Welcome%'
  )
  RETURNING id INTO v_thread_id;

  -- Only create message if thread was created
  IF v_thread_id IS NOT NULL THEN
    INSERT INTO public.support_messages (thread_id, sender_role, sender_id, body)
    VALUES (v_thread_id, 'admin', v_admin_id, v_body)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- 3. Trigger function: welcome on lifetime_plan or vip becoming true
CREATE OR REPLACE FUNCTION public.trg_welcome_first_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Fire when lifetime_plan or vip becomes true
  IF (NEW.lifetime_plan = true AND (OLD.lifetime_plan IS DISTINCT FROM true))
     OR (NEW.vip = true AND (OLD.vip IS DISTINCT FROM true))
  THEN
    PERFORM public.create_welcome_thread(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS welcome_first_client ON public.profiles;
CREATE TRIGGER welcome_first_client
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_welcome_first_client();

-- 4. Trigger function: welcome on INSERT for first N signups
CREATE OR REPLACE FUNCTION public.trg_welcome_first_n_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_n int;
  v_current_count int;
BEGIN
  -- Read threshold from app_settings (default 50)
  SELECT COALESCE(value::int, 50) INTO v_first_n
  FROM public.app_settings
  WHERE key = 'vip_first_n';

  IF v_first_n IS NULL THEN
    v_first_n := 50;
  END IF;

  -- Count existing profiles (including the new one)
  SELECT count(*) INTO v_current_count FROM public.profiles;

  IF v_current_count <= v_first_n THEN
    PERFORM public.create_welcome_thread(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS welcome_first_n_signup ON public.profiles;
CREATE TRIGGER welcome_first_n_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_welcome_first_n_signup();
