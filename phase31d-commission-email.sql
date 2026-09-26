-- Phase 31d: Email artist on new commission request
-- Uses pg_net to call the send-email edge function server-side.
-- Run in Supabase SQL Editor. Safe to re-run.

CREATE OR REPLACE FUNCTION public.notify_artist_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_artist_email TEXT;
  v_artist_name TEXT;
  v_supabase_url TEXT;
  v_service_key TEXT;
BEGIN
  IF NEW.status <> 'pending' THEN RETURN NEW; END IF;

  SELECT email, name INTO v_artist_email, v_artist_name
  FROM public.profiles WHERE id = NEW.user_id;

  IF v_artist_email IS NULL THEN RETURN NEW; END IF;

  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_key := current_setting('app.settings.service_role_key', true);

  IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    BEGIN
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/send-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body := jsonb_build_object(
          'to', v_artist_email,
          'type', 'commission_received',
          'data', jsonb_build_object(
            'clientName', NEW.client_name,
            'clientEmail', NEW.client_email,
            'budget', NEW.budget::text,
            'description', left(NEW.description, 200)
          )
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Commission email failed: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_artist_commission ON public.commissions;
CREATE TRIGGER notify_artist_commission
  AFTER INSERT ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_artist_commission();

SELECT 'Commission email trigger' AS status, TRUE AS ok;
