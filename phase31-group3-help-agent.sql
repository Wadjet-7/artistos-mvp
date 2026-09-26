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

-- No client INSERT — logging is done by the edge function (service role)
DROP POLICY IF EXISTS "Users insert own help" ON public.help_conversations;

-- No direct UPDATE — feedback goes through the RPC
DROP POLICY IF EXISTS "Users update own help feedback" ON public.help_conversations;

-- 2. Feedback RPC (only changes the feedback column)
CREATE OR REPLACE FUNCTION public.rate_help_conversation(p_id UUID, p_feedback TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_feedback NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid feedback value';
  END IF;
  UPDATE public.help_conversations
  SET feedback = p_feedback
  WHERE id = p_id AND user_id = auth.uid() AND feedback IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rate_help_conversation(UUID, TEXT) TO authenticated;

-- Verify
SELECT 'help_conversations' AS tbl, TRUE AS ok;
