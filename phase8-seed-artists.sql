-- ═══════════════════════════════════════════════════════════════════
-- Phase 8b: Seed Realistic Demo Artists + Clean Up Test Accounts
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_test_ids uuid[];
  v_priya  uuid := 'a1b2c3d4-e5f6-4890-abcd-111111111111';
  v_carlos uuid := 'a1b2c3d4-e5f6-4890-abcd-222222222222';
  v_sophie uuid := 'a1b2c3d4-e5f6-4890-abcd-333333333333';
BEGIN

  -- ─────────────────────────────────────────
  -- STEP 1: Remove empty test accounts
  -- (Larry Artist, larry jones, Larry Test)
  -- ─────────────────────────────────────────
  SELECT array_agg(id) INTO v_test_ids
  FROM profiles
  WHERE name IN ('Larry Artist', 'larry jones', 'Larry Test')
    AND id != '266aad36-ed30-4946-9539-485d37320f25';

  IF v_test_ids IS NOT NULL THEN
    DELETE FROM activity_log    WHERE user_id = ANY(v_test_ids);
    DELETE FROM scheduled_posts  WHERE user_id = ANY(v_test_ids);
    DELETE FROM invoices         WHERE user_id = ANY(v_test_ids);
    DELETE FROM contracts        WHERE user_id = ANY(v_test_ids);
    DELETE FROM messages         WHERE conversation_id IN (
      SELECT id FROM conversations WHERE user_id = ANY(v_test_ids)
    );
    DELETE FROM conversations    WHERE user_id = ANY(v_test_ids);
    DELETE FROM commissions      WHERE user_id = ANY(v_test_ids);
    DELETE FROM artworks         WHERE user_id = ANY(v_test_ids);
    DELETE FROM profiles         WHERE id = ANY(v_test_ids);
    DELETE FROM auth.identities  WHERE user_id = ANY(v_test_ids);
    DELETE FROM auth.users       WHERE id = ANY(v_test_ids);
  END IF;

  -- ─────────────────────────────────────────
  -- STEP 2: Clean up previous demo data (idempotent)
  -- ─────────────────────────────────────────
  DELETE FROM artworks         WHERE user_id IN (v_priya, v_carlos, v_sophie);
  DELETE FROM activity_log     WHERE user_id IN (v_priya, v_carlos, v_sophie);
  DELETE FROM profiles         WHERE id IN (v_priya, v_carlos, v_sophie);
  DELETE FROM auth.identities  WHERE user_id IN (v_priya, v_carlos, v_sophie);
  DELETE FROM auth.users       WHERE id IN (v_priya, v_carlos, v_sophie);

  -- ─────────────────────────────────────────
  -- STEP 3: Create auth users for demo artists
  -- ─────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES
    (v_priya,
     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'priya.nair.demo@artistos.app',
     crypt('DemoArtist2026!', gen_salt('bf')),
     now() - interval '45 days', now() - interval '45 days', now(),
     '{"provider":"email","providers":["email"]}', '{}'),

    (v_carlos,
     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'carlos.mendes.demo@artistos.app',
     crypt('DemoArtist2026!', gen_salt('bf')),
     now() - interval '30 days', now() - interval '30 days', now(),
     '{"provider":"email","providers":["email"]}', '{}'),

    (v_sophie,
     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'sophie.laurent.demo@artistos.app',
     crypt('DemoArtist2026!', gen_salt('bf')),
     now() - interval '60 days', now() - interval '60 days', now(),
     '{"provider":"email","providers":["email"]}', '{}');

  -- ─────────────────────────────────────────
  -- STEP 4: Create profiles
  -- ─────────────────────────────────────────
  INSERT INTO profiles (id, name, initials, bio, medium, style, location, website)
  VALUES
    (v_priya, 'Priya Nair', 'PN',
     'Illustrator and surface designer blending traditional Indian motifs with contemporary patterns. Featured in Design Sponge and Print Magazine. Commissioned by Anthropologie and West Elm.',
     'Watercolor', 'Illustration',
     'Brooklyn, NY', 'https://priyanair.design'),

    (v_carlos, 'Carlos Mendes', 'CM',
     'Fine artist exploring themes of memory, migration, and the urban landscape through oil and acrylic. Gallery represented in Miami and São Paulo. Collections include PAMM and Instituto Tomie Ohtake.',
     'Oil & Acrylic', 'Contemporary',
     'Miami, FL', 'https://carlosmendes.art'),

    (v_sophie, 'Sophie Laurent', 'SL',
     'Digital artist and muralist creating large-scale immersive works bridging street art and fine art. Recent projects include murals for Google, Spotify HQ, and the LA Arts District.',
     'Digital & Mural', 'Street Art',
     'Los Angeles, CA', 'https://sophielaurent.com')
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, initials = EXCLUDED.initials, bio = EXCLUDED.bio,
    medium = EXCLUDED.medium, style = EXCLUDED.style, location = EXCLUDED.location,
    website = EXCLUDED.website;

  -- ─────────────────────────────────────────
  -- STEP 5: Create artworks
  -- ─────────────────────────────────────────

  -- ── Priya Nair (6 pieces, $850–$3,500) ──
  INSERT INTO artworks (user_id, title, medium, dimensions, price, status, created_at) VALUES
    (v_priya, 'Monsoon Garden',       'Watercolor on Paper',      '18x24"', 1200, 'Available', now() - interval '40 days'),
    (v_priya, 'Jaipur Blue',          'Watercolor on Paper',      '12x16"',  850, 'Available', now() - interval '35 days'),
    (v_priya, 'Textile Study No. 7',  'Watercolor & Gouache',     '24x30"', 2200, 'Available', now() - interval '28 days'),
    (v_priya, 'Lotus Repeat',         'Watercolor on Paper',      '16x20"',  950, 'Available', now() - interval '20 days'),
    (v_priya, 'Spice Market',         'Watercolor & Ink',         '20x28"', 1800, 'Sold',      now() - interval '15 days'),
    (v_priya, 'Heritage Bloom',       'Watercolor & Gold Leaf',   '30x40"', 3500, 'Available', now() - interval '5 days');

  -- ── Carlos Mendes (7 pieces, $2,800–$8,500) ──
  INSERT INTO artworks (user_id, title, medium, dimensions, price, status, created_at) VALUES
    (v_carlos, 'Biscayne Sunset',     'Oil on Canvas',            '36x48"', 4800, 'Available', now() - interval '25 days'),
    (v_carlos, 'Favela Rising',       'Acrylic on Canvas',        '48x60"', 6200, 'Available', now() - interval '22 days'),
    (v_carlos, 'Migration No. 3',     'Oil on Canvas',            '30x40"', 3500, 'Available', now() - interval '18 days'),
    (v_carlos, 'Concrete Garden',     'Acrylic & Mixed Media',    '40x52"', 5100, 'Sold',      now() - interval '14 days'),
    (v_carlos, 'Wynwood Nocturne',    'Oil on Canvas',            '24x36"', 2800, 'Available', now() - interval '10 days'),
    (v_carlos, 'Memory Palace',       'Oil on Linen',             '52x68"', 8500, 'Available', now() - interval '7 days'),
    (v_carlos, 'São Paulo Dusk',      'Acrylic on Canvas',        '36x36"', 3200, 'Sold',      now() - interval '3 days');

  -- ── Sophie Laurent (6 pieces, $1,800–$15,000) ──
  INSERT INTO artworks (user_id, title, medium, dimensions, price, status, created_at) VALUES
    (v_sophie, 'Neon Bloom',          'Digital Print on Aluminum', '40x60"',  3200, 'Available', now() - interval '50 days'),
    (v_sophie, 'Urban Jungle Mural',  'Acrylic & Spray Paint',    '12x8 ft', 15000, 'Sold',     now() - interval '42 days'),
    (v_sophie, 'Pixel Garden',        'Digital Print on Canvas',   '30x40"',  2400, 'Available', now() - interval '30 days'),
    (v_sophie, 'Chrome Butterfly',    'Digital Print on Aluminum', '24x36"',  1800, 'Available', now() - interval '20 days'),
    (v_sophie, 'DTLA Dreamscape',     'Acrylic & Spray Paint',    '8x6 ft',  9500, 'Available', now() - interval '12 days'),
    (v_sophie, 'Signal / Noise',      'Digital Mixed Media',       '36x48"',  2800, 'Available', now() - interval '4 days');

END $$;
