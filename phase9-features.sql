-- ═══════════════════════════════════════════════════════════════════
-- Phase 9: Viewing Rooms, Contacts CRM, Artist CV
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 1. VIEWING ROOMS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS viewing_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recipient_name TEXT,
  recipient_email TEXT,
  artwork_ids UUID[] DEFAULT '{}',
  slug TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE viewing_rooms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage own viewing rooms"
    ON viewing_rooms FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public can view published rooms"
    ON viewing_rooms FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────
-- 2. CONTACTS TABLE (CRM)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  contact_type TEXT DEFAULT 'collector',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  last_contacted DATE,
  next_followup DATE,
  total_purchases NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage own contacts"
    ON contacts FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────
-- 3. ARTIST CV TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artist_cv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  education JSONB DEFAULT '[]',
  solo_exhibitions JSONB DEFAULT '[]',
  group_exhibitions JSONB DEFAULT '[]',
  collections JSONB DEFAULT '[]',
  awards JSONB DEFAULT '[]',
  residencies JSONB DEFAULT '[]',
  publications JSONB DEFAULT '[]',
  artist_statement TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE artist_cv ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage own cv"
    ON artist_cv FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────
-- 4. SEED DATA (Larry Wade)
-- ─────────────────────────────────────────
DO $$
DECLARE
  uid UUID := '266aad36-ed30-4946-9539-485d37320f25';
  art_ids UUID[];
BEGIN

  -- Get Larry's artwork IDs for viewing rooms
  SELECT array_agg(id ORDER BY created_at DESC) INTO art_ids
  FROM artworks WHERE user_id = uid LIMIT 6;

  -- Clean previous seed data
  DELETE FROM viewing_rooms WHERE user_id = uid;
  DELETE FROM contacts WHERE user_id = uid;
  DELETE FROM artist_cv WHERE user_id = uid;

  -- Viewing Rooms
  INSERT INTO viewing_rooms (user_id, title, description, recipient_name, recipient_email, artwork_ids, slug, is_published) VALUES
    (uid, 'Spring Collection 2026',
     'A curated selection of recent works exploring natural landscapes and urban form. These pieces represent my latest explorations in oil and mixed media.',
     'Elena Vasquez', 'elena.vasquez@gmail.com',
     art_ids[1:4], 'spring-2026', true),
    (uid, 'Private Selection for Whitfield Gallery',
     'Selected works for the upcoming group exhibition consideration.',
     'James Whitfield', 'james@whitfieldgallery.com',
     art_ids[1:6], 'whitfield-preview', true);

  -- Contacts (CRM)
  INSERT INTO contacts (user_id, name, email, phone, company, contact_type, notes, tags, last_contacted, next_followup, total_purchases, status) VALUES
    (uid, 'Elena Vasquez', 'elena.vasquez@gmail.com', '(212) 555-0147', NULL, 'collector',
     'Long-time collector. Interested in large-scale oil works. Purchased "Tidal Memory" in 2025. Prefers earth tones.',
     ARRAY['VIP', 'oil painting', 'returning'], CURRENT_DATE - 3, CURRENT_DATE + 14, 4200, 'active'),
    (uid, 'James Whitfield', 'james@whitfieldgallery.com', '(718) 555-0231', 'Whitfield Gallery',  'gallery',
     'Primary gallery representation in Brooklyn. Spring group show planned. Discussing solo show for fall 2026.',
     ARRAY['gallery rep', 'Brooklyn'], CURRENT_DATE - 1, CURRENT_DATE + 7, 0, 'active'),
    (uid, 'Claire Dumont', 'claire.dumont@outlook.com', '(415) 555-0892', 'Dumont Advisory', 'collector',
     'Art advisor based in SF. Looking for two pieces for a client residential project. Budget $8-15K.',
     ARRAY['advisor', 'high budget', 'residential'], CURRENT_DATE - 7, CURRENT_DATE + 3, 0, 'active'),
    (uid, 'Robert Nakamura', 'robert.nakamura@gmail.com', '(310) 555-0463', NULL, 'collector',
     'Collector from LA. Interested in sculpture work. Wants a garden installation piece.',
     ARRAY['sculpture', 'installation', 'LA'], CURRENT_DATE - 12, NULL, 7500, 'active'),
    (uid, 'Sarah Mitchell', 'sarah.mitchell@gmail.com', '(917) 555-0721', NULL, 'collector',
     'Commissioned family portrait (completed). Very happy with result. May refer other clients.',
     ARRAY['portrait', 'commission', 'referral source'], CURRENT_DATE - 30, NULL, 4500, 'active');

  -- Artist CV
  INSERT INTO artist_cv (user_id, education, solo_exhibitions, group_exhibitions, collections, awards, residencies, publications, artist_statement) VALUES
    (uid,
     '[{"title":"MFA Painting","venue":"Rhode Island School of Design","location":"Providence, RI","year":"2018"},{"title":"BFA Fine Arts","venue":"Cooper Union","location":"New York, NY","year":"2016"}]',
     '[{"title":"Urban Landscapes","venue":"Whitfield Gallery","location":"Brooklyn, NY","year":"2025"},{"title":"Threshold","venue":"BRIC Arts","location":"Brooklyn, NY","year":"2024"},{"title":"Material Memory","venue":"Field Projects","location":"New York, NY","year":"2023"}]',
     '[{"title":"New Abstractions","venue":"MoMA PS1","location":"Queens, NY","year":"2025"},{"title":"Emerging Voices","venue":"The Hole","location":"New York, NY","year":"2024"},{"title":"Brooklyn Open","venue":"BAM Fisher","location":"Brooklyn, NY","year":"2024"},{"title":"Matter & Form","venue":"Rachel Uffner Gallery","location":"New York, NY","year":"2023"}]',
     '[{"title":"Permanent Collection","venue":"Brooklyn Museum","location":"Brooklyn, NY","year":"2025"},{"title":"Corporate Collection","venue":"WeWork HQ","location":"New York, NY","year":"2024"}]',
     '[{"title":"Pollock-Krasner Foundation Grant","venue":"","location":"","year":"2024"},{"title":"NYFA Fellowship in Painting","venue":"New York Foundation for the Arts","location":"New York, NY","year":"2023"},{"title":"Emerging Artist Award","venue":"Brooklyn Arts Council","location":"Brooklyn, NY","year":"2022"}]',
     '[{"title":"Artist-in-Residence","venue":"Skowhegan School of Painting & Sculpture","location":"Skowhegan, ME","year":"2023"},{"title":"Summer Residency","venue":"Vermont Studio Center","location":"Johnson, VT","year":"2022"}]',
     '[{"title":"\"The New Brooklyn Painters\"","venue":"ArtForum","location":"","year":"2025"},{"title":"\"Emerging Voices in Abstract Oil\"","venue":"Hyperallergic","location":"","year":"2024"},{"title":"Studio Visit Feature","venue":"New American Paintings","location":"","year":"2023"}]',
     'My work explores the tension between natural landscapes and the built environment. Working primarily in oil and mixed media, I seek to capture the liminal spaces where nature reclaims urban form. Each piece begins as a direct observation — a crumbling wall overtaken by moss, morning light filtering through scaffolding — and evolves through layers of abstraction into something more elemental. I am interested in the idea that beauty persists in decay, and that growth and erosion are part of the same cycle.');

END $$;
