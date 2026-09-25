-- ============================================================
-- ArtistOS Phase 29: Team inbox, announcements, contact settings
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- 1. Support threads (artist ↔ Larry)
CREATE TABLE IF NOT EXISTS public.support_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','waiting_on_user','closed')),
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user','admin','ai_handoff')),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_for_user INTEGER NOT NULL DEFAULT 0,
  unread_for_admin INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.support_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own threads" ON public.support_threads;
CREATE POLICY "Users read own threads" ON public.support_threads FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users create threads" ON public.support_threads;
CREATE POLICY "Users create threads" ON public.support_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own threads" ON public.support_threads;
CREATE POLICY "Users update own threads" ON public.support_threads FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admin delete threads" ON public.support_threads;
CREATE POLICY "Admin delete threads" ON public.support_threads FOR DELETE USING (public.is_admin());

-- 2. Support messages
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES public.support_threads(id) ON DELETE CASCADE NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user','admin','ai')),
  sender_id UUID REFERENCES public.profiles(id),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own thread messages" ON public.support_messages;
CREATE POLICY "Users read own thread messages" ON public.support_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.support_threads t WHERE t.id = thread_id AND (t.user_id = auth.uid() OR public.is_admin())));
DROP POLICY IF EXISTS "Users send messages" ON public.support_messages;
CREATE POLICY "Users send messages" ON public.support_messages FOR INSERT
  WITH CHECK (sender_role = 'user' AND sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.support_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admin send messages" ON public.support_messages;
CREATE POLICY "Admin send messages" ON public.support_messages FOR INSERT
  WITH CHECK (sender_role = 'admin' AND public.is_admin());

-- 3. Auto-update thread on new message
CREATE OR REPLACE FUNCTION public.support_message_notify() RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.support_threads SET
    last_message_at = now(),
    unread_for_user = CASE WHEN NEW.sender_role IN ('admin','ai') THEN unread_for_user + 1 ELSE unread_for_user END,
    unread_for_admin = CASE WHEN NEW.sender_role = 'user' THEN unread_for_admin + 1 ELSE unread_for_admin END,
    status = CASE WHEN NEW.sender_role = 'user' AND status = 'closed' THEN 'open' ELSE status END
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS support_message_notify_trigger ON public.support_messages;
CREATE TRIGGER support_message_notify_trigger AFTER INSERT ON public.support_messages
  FOR EACH ROW EXECUTE PROCEDURE public.support_message_notify();

-- 4. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_label TEXT DEFAULT '',
  cta_url TEXT DEFAULT '',
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all','starter','pro','studio','founders')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read published" ON public.announcements;
CREATE POLICY "Authenticated read published" ON public.announcements FOR SELECT USING (auth.uid() IS NOT NULL AND published_at IS NOT NULL AND published_at <= now());
DROP POLICY IF EXISTS "Admin manage announcements" ON public.announcements;
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.announcement_reads (
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own reads" ON public.announcement_reads;
CREATE POLICY "Users manage own reads" ON public.announcement_reads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. App settings (for Contact Larry card)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage settings" ON public.app_settings;
CREATE POLICY "Admins manage settings" ON public.app_settings FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Authenticated read settings" ON public.app_settings;
CREATE POLICY "Authenticated read settings" ON public.app_settings FOR SELECT USING (auth.uid() IS NOT NULL);

-- Default settings
INSERT INTO public.app_settings (key, value) VALUES
  ('contact_email', 'larry@synergysourceadvisors.com'),
  ('reply_time_text', 'Larry usually replies within a day.'),
  ('contact_phone_audience', 'founders')
ON CONFLICT (key) DO NOTHING;

-- 6. VIP flag for first clients
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip BOOLEAN DEFAULT false;

-- 7. Enable realtime for support
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_threads;

-- Verify
SELECT 'support_threads' AS tbl, count(*) FROM public.support_threads
UNION ALL SELECT 'support_messages', count(*) FROM public.support_messages
UNION ALL SELECT 'announcements', count(*) FROM public.announcements
UNION ALL SELECT 'app_settings', count(*) FROM public.app_settings;
