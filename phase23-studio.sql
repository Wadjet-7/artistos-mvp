-- ============================================================
-- ArtistOS Phase 23: Studio features
-- Run this in your Supabase SQL Editor
-- ============================================================

-- === 23b: appraisal fields on artworks ===
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS appraised_value INTEGER;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS appraisal_date DATE;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS appraisal_notes TEXT DEFAULT '';

-- === 23d: edition fields on artworks ===
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS is_edition BOOLEAN DEFAULT false;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS edition_size INTEGER;
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS edition_type TEXT DEFAULT 'numbered';

-- === 23e: location fields on artworks ===
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS current_location TEXT DEFAULT 'Studio';
ALTER TABLE public.artworks ADD COLUMN IF NOT EXISTS current_location_type TEXT DEFAULT 'studio';

-- === 23c: provenance events ===
CREATE TABLE IF NOT EXISTS public.artwork_provenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'exhibited',
  event_date DATE NOT NULL,
  party_name TEXT DEFAULT '',
  location TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.artwork_provenance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own provenance" ON public.artwork_provenance;
CREATE POLICY "Users manage own provenance"
  ON public.artwork_provenance FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS provenance_artwork_idx ON public.artwork_provenance(artwork_id, event_date);

-- === 23d: individual edition copies ===
CREATE TABLE IF NOT EXISTS public.artwork_editions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  edition_number INTEGER,
  edition_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  owner_name TEXT DEFAULT '',
  sold_price INTEGER,
  sold_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (artwork_id, edition_label)
);

ALTER TABLE public.artwork_editions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own editions" ON public.artwork_editions;
CREATE POLICY "Users manage own editions"
  ON public.artwork_editions FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);
