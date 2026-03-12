-- Phase 11: Consignment Tracker, Expense Tracking, Exhibition Planner
-- Run in Supabase SQL Editor

-- ============================================================
-- 1. Consignments table
-- ============================================================
CREATE TABLE IF NOT EXISTS consignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  artwork_id UUID REFERENCES artworks(id) ON DELETE SET NULL,
  gallery_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  start_date DATE,
  end_date DATE,
  commission_rate NUMERIC DEFAULT 0,
  terms TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consignments" ON consignments
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 2. Expenses table
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE,
  category TEXT DEFAULT 'other',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 3. Exhibitions table
-- ============================================================
CREATE TABLE IF NOT EXISTS exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  venue TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  artwork_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'planning',
  checklist JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own exhibitions" ON exhibitions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 4. Seed data for Larry Wade (user_id: 266aad36-ed30-4946-9539-485d37320f25)
-- ============================================================

-- Get some artwork IDs for consignments
-- We'll use the first few artworks
DO $$
DECLARE
  uid UUID := '266aad36-ed30-4946-9539-485d37320f25';
  art1 UUID;
  art2 UUID;
  art3 UUID;
BEGIN
  SELECT id INTO art1 FROM artworks WHERE user_id = uid ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO art2 FROM artworks WHERE user_id = uid ORDER BY created_at ASC OFFSET 1 LIMIT 1;
  SELECT id INTO art3 FROM artworks WHERE user_id = uid ORDER BY created_at ASC OFFSET 2 LIMIT 1;

  -- Consignments
  INSERT INTO consignments (user_id, artwork_id, gallery_name, contact_name, contact_email, start_date, end_date, commission_rate, terms, status, notes) VALUES
    (uid, art1, 'Whitfield Gallery', 'Sarah Whitfield', 'sarah@whitfieldgallery.com', '2026-01-15', '2026-07-15', 40, '40% gallery commission. Artist retains all reproduction rights.', 'active', 'Spring/Summer show placement'),
    (uid, art2, 'BRIC Arts Media', 'James Chen', 'jchen@bricartsmedia.org', '2026-02-01', '2026-04-30', 30, '30% commission on sales during exhibition period.', 'active', 'Group exhibition — Brooklyn Open 2026'),
    (uid, art3, 'Rachel Uffner Gallery', 'Rachel Uffner', 'info@racheluffnergallery.com', '2025-09-01', '2025-12-31', 50, 'Standard 50% commission. Gallery handles framing and shipping.', 'returned', 'Fall show completed — all works returned Dec 28');

  -- Expenses
  INSERT INTO expenses (user_id, description, amount, date, category, notes) VALUES
    (uid, 'Winsor & Newton oil paints — cadmium set', 189.50, '2026-03-01', 'materials', 'Restocking studio supplies'),
    (uid, 'Studio rent — March 2026', 1200.00, '2026-03-01', 'studio', 'Monthly rent for Bushwick studio'),
    (uid, 'Canvas stretchers — 4 large frames', 340.00, '2026-02-20', 'materials', 'Custom frames from Utrecht Art'),
    (uid, 'Shipping to Whitfield Gallery', 275.00, '2026-01-14', 'shipping', 'FedEx Art — insured for $5,000'),
    (uid, 'Photography — portfolio shoot', 450.00, '2026-02-10', 'marketing', 'Professional photos of 8 new works'),
    (uid, 'Art Basel Miami — flights + hotel', 1850.00, '2025-12-01', 'travel', 'Networking trip — Art Basel 2025'),
    (uid, 'New easel — Mabef M/02', 520.00, '2026-01-05', 'equipment', 'Large studio easel upgrade'),
    (uid, 'Business cards + postcards', 180.00, '2026-02-15', 'marketing', '500 cards from Moo');

  -- Exhibitions
  INSERT INTO exhibitions (user_id, title, venue, location, start_date, end_date, description, artwork_ids, status, checklist, notes) VALUES
    (uid, 'Urban Landscapes', 'Whitfield Gallery', 'Brooklyn, NY', '2026-04-10', '2026-06-15',
     'Solo exhibition exploring the tension between natural landscapes and urban architecture. Featuring 8 new oil paintings and mixed media works.',
     ARRAY[art1, art2]::UUID[], 'planning',
     '[{"text":"Finalize artwork selection","done":true},{"text":"Ship artworks to gallery","done":false},{"text":"Write artist statement","done":true},{"text":"Design invitation cards","done":false},{"text":"Plan opening reception","done":false},{"text":"Coordinate press release","done":false}]'::jsonb,
     'Opening reception April 10, 6-9pm'),
    (uid, 'New Abstractions', 'MoMA PS1', 'Queens, NY', '2026-09-01', '2026-12-20',
     'Group exhibition featuring emerging abstract artists working in oil and mixed media.',
     ARRAY[art3]::UUID[], 'confirmed',
     '[{"text":"Confirm participation","done":true},{"text":"Select works for submission","done":true},{"text":"Submit high-res images","done":false},{"text":"Write 200-word bio","done":true}]'::jsonb,
     'Curator: Elena Vasquez — 3 works selected');
END $$;
