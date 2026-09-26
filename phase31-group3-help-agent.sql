-- ============================================================
-- ArtistOS Phase 31 Group 3: Help agent tables
-- Tracks AI help conversations, usage limits, and feedback.
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- 1. Help conversations log
CREATE TABLE IF NOT EXISTS public.help_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  actions JSONB DEFAULT '[]',
  current_path TEXT DEFAULT '',
  feedback TEXT CHECK (feedback IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS help_conversations_user_idx ON public.help_conversations (user_id, created_at DESC);
ALTER TABLE public.help_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own help" ON public.help_conversations;
CREATE POLICY "Users read own help" ON public.help_conversations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own help" ON public.help_conversations;
CREATE POLICY "Users insert own help" ON public.help_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own help feedback" ON public.help_conversations;
CREATE POLICY "Users update own help feedback" ON public.help_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Daily usage view for rate limiting
CREATE OR REPLACE VIEW public.help_usage_today AS
SELECT user_id, count(*) AS question_count
FROM public.help_conversations
WHERE created_at >= CURRENT_DATE
GROUP BY user_id;

GRANT SELECT ON public.help_usage_today TO authenticated;

-- Verify
SELECT 'help_conversations' AS tbl, TRUE AS ok;
