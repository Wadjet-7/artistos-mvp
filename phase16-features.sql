-- ============================================================
-- ArtistOS Phase 16: Invoice email + contract templates table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add client_email to invoices (for payment reminders)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_email TEXT DEFAULT '';

-- 2. Contract Templates table (for user-uploaded custom templates)
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  description TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON public.contract_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates"
  ON public.contract_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates"
  ON public.contract_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates"
  ON public.contract_templates FOR DELETE USING (auth.uid() = user_id);
