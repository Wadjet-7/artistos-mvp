-- ============================================================
-- ArtistOS Phase 24: Grant & opportunity engine
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Opportunities — a GLOBAL, admin-curated table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  opportunity_type TEXT NOT NULL DEFAULT 'grant',
  description TEXT DEFAULT '',
  amount_min INTEGER,
  amount_max INTEGER,
  deadline DATE,
  url TEXT NOT NULL DEFAULT '',
  eligibility_notes TEXT DEFAULT '',
  mediums TEXT[] DEFAULT '{}',
  location_scope TEXT DEFAULT 'national',
  location_detail TEXT DEFAULT '',
  career_stage TEXT DEFAULT 'any',
  application_fee INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active opportunities" ON public.opportunities;
CREATE POLICY "Authenticated users can view active opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() IS NOT NULL AND (is_active = true OR public.is_admin()));

DROP POLICY IF EXISTS "Admins can manage opportunities" ON public.opportunities;
CREATE POLICY "Admins can manage opportunities"
  ON public.opportunities FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS opportunities_deadline_idx ON public.opportunities(deadline) WHERE is_active = true;

-- 2. Per-artist matches
CREATE TABLE IF NOT EXISTS public.opportunity_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0,
  match_reason TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

ALTER TABLE public.opportunity_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own matches" ON public.opportunity_matches;
CREATE POLICY "Users manage own matches"
  ON public.opportunity_matches FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- 3. Application drafts
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'drafting',
  draft_content JSONB DEFAULT '{}'::jsonb,
  selected_artwork_ids UUID[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own applications" ON public.opportunity_applications;
CREATE POLICY "Users manage own applications"
  ON public.opportunity_applications FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- 4. updated_at triggers
DROP TRIGGER IF EXISTS opportunities_updated_at ON public.opportunities;
CREATE TRIGGER opportunities_updated_at BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

DROP TRIGGER IF EXISTS opportunity_applications_updated_at ON public.opportunity_applications;
CREATE TRIGGER opportunity_applications_updated_at BEFORE UPDATE ON public.opportunity_applications
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- ============================================================
-- SAMPLE DATA (uncomment to test — replace with real opportunities before production)
-- ============================================================
-- INSERT INTO public.opportunities (title, organization, opportunity_type, description, amount_min, amount_max, deadline, url, eligibility_notes, mediums, location_scope, location_detail, career_stage) VALUES
-- ('Emerging Artist Grant', 'Joan Mitchell Foundation', 'grant', 'Supports painters and sculptors creating new work. Unrestricted funding for living and working expenses.', 25000, 25000, '2027-03-15', 'https://www.joanmitchellfoundation.org/artist-programs', 'US-based painters and sculptors only', '{painting,sculpture}', 'national', '', 'emerging'),
-- ('Artist Residency Program', 'Yaddo', 'residency', 'Live and work at the historic Yaddo estate in Saratoga Springs, NY. Room, board, and studio provided.', 0, 0, '2027-01-15', 'https://www.yaddo.org/apply', 'Open to all visual artists, writers, and composers', '{painting,photography,sculpture,mixed_media,digital}', 'international', 'Saratoga Springs, NY', 'any'),
-- ('Pollock-Krasner Foundation Grant', 'Pollock-Krasner Foundation', 'grant', 'Grants for individual working artists of established ability. Based on artistic merit and financial need.', 5000, 30000, '2027-06-01', 'https://www.pkf.org/grant.html', 'Professional artists with 5+ years of practice', '{painting,sculpture,mixed_media}', 'international', '', 'mid_career'),
-- ('NYFA Fellowship', 'New York Foundation for the Arts', 'fellowship', 'Unrestricted cash grants of $7,000 to artists living and working in New York State.', 7000, 7000, '2027-02-28', 'https://www.nyfa.org/awards-grants/artist-fellowships', 'Must reside in New York State', '{painting,photography,sculpture,digital,mixed_media}', 'state', 'New York', 'any'),
-- ('Artadia Award', 'Artadia', 'award', 'Unrestricted awards to visual artists based in specific US cities. Merit-based, no application fee.', 3000, 15000, '2027-04-01', 'https://www.artadia.org/apply', 'Must reside in an Artadia partner city', '{painting,photography,sculpture,mixed_media,digital}', 'local', 'Atlanta, Boston, Chicago, Houston, LA, SF', 'any'),
-- ('Creative Capital Award', 'Creative Capital', 'grant', 'Project-based funding up to $50,000 for innovative projects across artistic disciplines.', 10000, 50000, '2027-05-15', 'https://creative-capital.org/award/', 'US-based artists with a specific project proposal', '{painting,photography,sculpture,mixed_media,digital}', 'national', '', 'mid_career'),
-- ('Guggenheim Fellowship', 'John Simon Guggenheim Memorial Foundation', 'fellowship', 'Fellowships for advanced professionals in all fields including fine arts. Highly competitive.', 25000, 50000, '2027-09-15', 'https://www.gf.org/applicants/the-application/', 'US and Canadian citizens only, distinguished achievement required', '{painting,photography,sculpture,mixed_media}', 'national', '', 'established'),
-- ('Smack Mellon Studio Program', 'Smack Mellon', 'residency', 'Free studio space for 12 months in DUMBO, Brooklyn. Open to emerging and mid-career artists in the NYC area.', 0, 0, '2027-03-01', 'https://smackmellon.org/artist-programs/studio-program/', 'Must live or work in the NYC metro area', '{painting,sculpture,mixed_media}', 'local', 'New York City', 'emerging'),
-- ('Harpo Foundation Visual Artist Grant', 'Harpo Foundation', 'grant', 'Grants for visual artists whose work is under-recognized. Focus on risk-taking and experimentation.', 5000, 10000, '2027-04-30', 'https://www.hfrarts.org/grants', 'US-based, under-recognized visual artists', '{painting,photography,sculpture,mixed_media,digital}', 'national', '', 'any'),
-- ('MacDowell Fellowship', 'MacDowell', 'residency', 'Room, board, and a private studio at MacDowell in Peterborough, NH. Sessions range from 2-8 weeks.', 0, 0, '2027-01-15', 'https://www.macdowell.org/apply', 'Open to artists of all nationalities and career stages', '{painting,photography,sculpture,mixed_media,digital}', 'international', 'Peterborough, NH', 'any');
