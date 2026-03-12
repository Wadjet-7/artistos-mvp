-- ============================================================
-- Phase 15: Demo Seed Data for Investor Presentations
-- ============================================================
-- Run against your Supabase project to populate a rich dataset.
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID before running.
--
-- To find your user ID:
--   SELECT id, name, email FROM profiles;
-- ============================================================

-- Set your user ID variable (replace the UUID below)
-- Example: 266aad36-ed30-4946-9539-485d37320f25

DO $$
DECLARE
  uid UUID := '266aad36-ed30-4946-9539-485d37320f25';
BEGIN

-- ============================================================
-- ARTWORKS (12 diverse pieces)
-- ============================================================
INSERT INTO artworks (user_id, title, medium, tag, price, status, dimensions, description, seed, created_at) VALUES
(uid, 'Solstice No. 4',        'Oil on Canvas', 'Oil',          4800, 'Available', '48x60"',  'Bold gestural strokes in ochre and midnight blue evoke the stillness of winter light.', 101, NOW() - INTERVAL '5 months'),
(uid, 'Untitled (Meridian)',    'Oil on Canvas', 'Oil',          6200, 'Sold',      '36x48"',  'Layered glazes of burnt sienna and cadmium create depth and atmospheric perspective.', 102, NOW() - INTERVAL '4 months'),
(uid, 'Study in Vermillion',   'Acrylic',       'Acrylic',      2400, 'Available', '24x30"',  'A vibrant exploration of warm tones, where crimson meets gold in rhythmic patterns.', 103, NOW() - INTERVAL '4 months'),
(uid, 'Harbor Light',          'Oil on Canvas', 'Oil',          5500, 'Available', '40x50"',  'Morning light over still water, rendered in luminous layers of cerulean and pearl.', 104, NOW() - INTERVAL '3 months'),
(uid, 'Convergence II',        'Mixed Media',   'Mixed Media',  3800, 'Reserved',  '30x40"',  'Collaged newsprint and acrylic on panel exploring urban decay and renewal.', 105, NOW() - INTERVAL '3 months'),
(uid, 'After the Storm',       'Oil on Canvas', 'Oil',          7200, 'Sold',      '48x72"',  'A monumental landscape where turbulent skies give way to golden fields below.', 106, NOW() - INTERVAL '2 months'),
(uid, 'Whisper Series I',      'Photography',   'Photography',  1800, 'Available', '16x20"',  'Long-exposure coastal scene where waves dissolve into ethereal mist.', 107, NOW() - INTERVAL '2 months'),
(uid, 'Whisper Series II',     'Photography',   'Photography',  1800, 'Available', '16x20"',  'Companion piece capturing the same coastline at twilight, with deepened shadows.', 108, NOW() - INTERVAL '6 weeks'),
(uid, 'Terracotta Dream',      'Sculpture',     'Sculpture',    4200, 'Available', '12x8x10"','Hand-formed terracotta vessel with copper patina finish. Edition of 5.', 109, NOW() - INTERVAL '5 weeks'),
(uid, 'Nocturne',              'Acrylic',       'Acrylic',      3200, 'Sold',      '36x36"',  'Deep indigos and midnight blacks punctuated by flashes of metallic gold.', 110, NOW() - INTERVAL '4 weeks'),
(uid, 'Threshold',             'Mixed Media',   'Mixed Media',  4500, 'Available', '40x50"',  'Encaustic and oil on wood panel, exploring liminality and spatial tension.', 111, NOW() - INTERVAL '2 weeks'),
(uid, 'Morning Passage',       'Oil on Canvas', 'Oil',          5800, 'Available', '44x56"',  'Light pouring through architectural forms, a meditation on transition and hope.', 112, NOW() - INTERVAL '1 week');

-- ============================================================
-- INVOICES (8 invoices across months — mix of statuses)
-- ============================================================
INSERT INTO invoices (user_id, client_name, description, amount, status, due_date, paid_date, created_at) VALUES
(uid, 'Sarah Mitchell',    'Untitled (Meridian) — Commission',           6200,  'paid',    (NOW() - INTERVAL '3 months')::date, (NOW() - INTERVAL '85 days')::date, NOW() - INTERVAL '4 months'),
(uid, 'Artisan Gallery',   'Group show placement fee',                    800,  'paid',    (NOW() - INTERVAL '2 months')::date, (NOW() - INTERVAL '55 days')::date, NOW() - INTERVAL '3 months'),
(uid, 'David Chen',        'After the Storm — Direct sale',              7200,  'paid',    (NOW() - INTERVAL '6 weeks')::date,  (NOW() - INTERVAL '40 days')::date, NOW() - INTERVAL '2 months'),
(uid, 'Gallery Moderne',   'Nocturne — Consignment sale (70%)',          2240,  'paid',    (NOW() - INTERVAL '3 weeks')::date,  (NOW() - INTERVAL '18 days')::date, NOW() - INTERVAL '4 weeks'),
(uid, 'Elena Rodriguez',   'Convergence II — Deposit (50%)',             1900,  'paid',    (NOW() - INTERVAL '2 weeks')::date,  (NOW() - INTERVAL '12 days')::date, NOW() - INTERVAL '3 weeks'),
(uid, 'Elena Rodriguez',   'Convergence II — Remaining balance',         1900,  'pending', (NOW() + INTERVAL '2 weeks')::date,  NULL, NOW() - INTERVAL '1 week'),
(uid, 'Marcus Wright',     'Portrait commission — Phase 1',              3500,  'pending', (NOW() + INTERVAL '1 month')::date,  NULL, NOW() - INTERVAL '5 days'),
(uid, 'Thompson Estate',   'Solstice No. 4 — Shipping & framing',        450,  'overdue', (NOW() - INTERVAL '5 days')::date,   NULL, NOW() - INTERVAL '3 weeks');

-- ============================================================
-- EXPENSES (10 business expenses across categories)
-- ============================================================
INSERT INTO expenses (user_id, description, amount, date, category, notes, created_at) VALUES
(uid, 'Winsor & Newton oil paints — cadmium set',      189.50, (NOW() - INTERVAL '4 months')::date, 'materials', 'Annual restock of cadmium colors', NOW() - INTERVAL '4 months'),
(uid, 'Studio rent — March',                           850.00, (NOW() - INTERVAL '3 months')::date, 'studio',    'Monthly studio lease', NOW() - INTERVAL '3 months'),
(uid, 'Studio rent — April',                           850.00, (NOW() - INTERVAL '2 months')::date, 'studio',    'Monthly studio lease', NOW() - INTERVAL '2 months'),
(uid, 'Stretched canvas — 6 pack (48x60")',            224.00, (NOW() - INTERVAL '2 months')::date, 'materials', 'Blick Art Materials order', NOW() - INTERVAL '2 months'),
(uid, 'UPS shipping — Untitled (Meridian)',            185.00, (NOW() - INTERVAL '85 days')::date,  'shipping',  'Insured fine art shipping to collector', NOW() - INTERVAL '85 days'),
(uid, 'Website hosting — annual renewal',              144.00, (NOW() - INTERVAL '6 weeks')::date,  'marketing', 'Squarespace portfolio site', NOW() - INTERVAL '6 weeks'),
(uid, 'Studio rent — May',                             850.00, (NOW() - INTERVAL '1 month')::date,  'studio',    'Monthly studio lease', NOW() - INTERVAL '1 month'),
(uid, 'Instagram promoted post — exhibition',           75.00, (NOW() - INTERVAL '3 weeks')::date,  'marketing', '5-day promotion for gallery opening', NOW() - INTERVAL '3 weeks'),
(uid, 'Gamsol & linseed oil',                           42.00, (NOW() - INTERVAL '2 weeks')::date,  'materials', 'Solvents and mediums', NOW() - INTERVAL '2 weeks'),
(uid, 'Professional liability insurance — quarterly',  320.00, (NOW() - INTERVAL '1 week')::date,   'insurance', 'Artwork transit & studio coverage', NOW() - INTERVAL '1 week');

-- ============================================================
-- CONTACTS (8 collectors, galleries, and collaborators)
-- ============================================================
INSERT INTO contacts (user_id, name, email, phone, company, contact_type, notes, tags, total_purchases, last_contacted, next_followup, created_at) VALUES
(uid, 'Sarah Mitchell',    'sarah.m@gmail.com',      '(212) 555-0134', NULL,               'collector',     'Passionate contemporary art collector. Owns two pieces already.', ARRAY['VIP','Contemporary','NYC'], 6200,  (NOW() - INTERVAL '3 months')::date, (NOW() + INTERVAL '2 weeks')::date, NOW() - INTERVAL '5 months'),
(uid, 'David Chen',        'david.chen@outlook.com', '(415) 555-0199', 'Chen Holdings',    'collector',     'Tech executive. Interested in large-format landscapes.',          ARRAY['Landscape','Large-format','SF'], 7200, (NOW() - INTERVAL '2 months')::date, (NOW() + INTERVAL '1 month')::date, NOW() - INTERVAL '4 months'),
(uid, 'Elena Rodriguez',   'elena.r@artmail.com',    '(305) 555-0177', NULL,               'collector',     'Interior designer sourcing art for residential projects.',        ARRAY['Interior','Mixed Media','Miami'], 1900, (NOW() - INTERVAL '3 weeks')::date, (NOW() + INTERVAL '5 days')::date, NOW() - INTERVAL '3 months'),
(uid, 'Artisan Gallery',   'info@artisangallery.co', '(323) 555-0222', 'Artisan Gallery',  'gallery',       'Mid-tier gallery in Arts District. Annual group show in Sept.',    ARRAY['LA','Group Show','September'], 0, (NOW() - INTERVAL '2 months')::date, (NOW() + INTERVAL '3 months')::date, NOW() - INTERVAL '6 months'),
(uid, 'Gallery Moderne',   'contact@galmoderne.com', '(212) 555-0388', 'Gallery Moderne',  'gallery',       'Chelsea gallery. Consignment terms: 60/40 artist-favored.',       ARRAY['Chelsea','Consignment','NYC'], 0, (NOW() - INTERVAL '1 month')::date,  NULL, NOW() - INTERVAL '4 months'),
(uid, 'Marcus Wright',     'marcusw@email.com',      '(617) 555-0155', NULL,               'collector',     'New collector. Interested in commissioning a portrait.',           ARRAY['Portrait','New Collector','Boston'], 0, (NOW() - INTERVAL '5 days')::date, (NOW() + INTERVAL '10 days')::date, NOW() - INTERVAL '2 weeks'),
(uid, 'Amara Johnson',     'amara.j@press.com',      '(646) 555-0244', 'ArtForum Digital', 'press',         'Freelance art critic. Writing a piece on emerging abstract artists.', ARRAY['Press','Abstract','Feature'], 0, (NOW() - INTERVAL '1 month')::date, (NOW() + INTERVAL '1 week')::date, NOW() - INTERVAL '2 months'),
(uid, 'Kenji Nakamura',    'kenji@studiocollabs.jp', '(03) 5555-0177', 'Studio Collabs',   'collaborator',  'Tokyo-based printmaker. Discussing collaborative edition.',        ARRAY['Tokyo','Print','Collaboration'], 0, (NOW() - INTERVAL '3 weeks')::date, (NOW() + INTERVAL '3 weeks')::date, NOW() - INTERVAL '2 months');

-- ============================================================
-- COMMISSIONS (4 commissions in various stages)
-- ============================================================
INSERT INTO commissions (user_id, client_name, title, description, budget, status, deadline, medium, dimensions, created_at) VALUES
(uid, 'Marcus Wright',     'Family Portrait',     'Large-scale portrait of family of four, oil on canvas, photorealistic style.',           3500, 'active',    (NOW() + INTERVAL '6 weeks')::date,  'Oil on Canvas', '36x48"', NOW() - INTERVAL '2 weeks'),
(uid, 'Elena Rodriguez',   'Lobby Triptych',      'Three-panel abstract piece for residential lobby. Earth tones, mixed media on panel.',   8500, 'quoted',    (NOW() + INTERVAL '3 months')::date, 'Mixed Media',   '3x 30x40"', NOW() - INTERVAL '1 week'),
(uid, 'Sarah Mitchell',    'Garden Study',        'Intimate landscape of her Connecticut garden. Impressionistic oil study.',               4200, 'review',    (NOW() + INTERVAL '2 weeks')::date,  'Oil on Canvas', '24x30"', NOW() - INTERVAL '5 weeks'),
(uid, 'Thompson Estate',   'Memorial Piece',      'Abstract memorial artwork for estate entry. Muted palette, contemplative mood.',        12000, 'pending',   (NOW() + INTERVAL '4 months')::date, 'Oil on Canvas', '60x72"', NOW() - INTERVAL '3 days');

-- ============================================================
-- ACTIVITY LOG (recent actions for dashboard & notifications)
-- ============================================================
INSERT INTO activity_log (user_id, activity_type, description, created_at) VALUES
(uid, 'artwork',    'Added "Morning Passage" to portfolio',                NOW() - INTERVAL '1 week'),
(uid, 'commission', 'New commission request from Thompson Estate',          NOW() - INTERVAL '3 days'),
(uid, 'invoice',    'Invoice for Elena Rodriguez — deposit paid',           NOW() - INTERVAL '12 days'),
(uid, 'invoice',    'Created invoice for Marcus Wright — Phase 1',          NOW() - INTERVAL '5 days'),
(uid, 'commission', 'Updated "Garden Study" commission to review stage',    NOW() - INTERVAL '2 days'),
(uid, 'artwork',    'Added "Threshold" to portfolio',                       NOW() - INTERVAL '2 weeks'),
(uid, 'invoice',    'Invoice for Thompson Estate is now overdue',           NOW() - INTERVAL '1 day'),
(uid, 'commission', 'Sent quote for "Lobby Triptych" to Elena Rodriguez',   NOW() - INTERVAL '1 week'),
(uid, 'artwork',    'Updated price for "Harbor Light"',                     NOW() - INTERVAL '10 days'),
(uid, 'social',     'Scheduled Instagram post for gallery opening',         NOW() - INTERVAL '3 weeks');

END $$;
