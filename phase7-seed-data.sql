-- ============================================================
-- Phase 7: Demo Seed Data for ArtistOS MVP
-- Run this in your Supabase SQL Editor
-- User: Larry Wade (266aad36-ed30-4946-9539-485d37320f25)
-- Safe to re-run (DELETEs before INSERTs)
-- ============================================================

DO $$
DECLARE
  uid UUID := '266aad36-ed30-4946-9539-485d37320f25';
  conv1_id UUID;
  conv2_id UUID;
  conv3_id UUID;
  conv4_id UUID;
BEGIN

-- ============================================================
-- 0. UPDATE PROFILE
-- ============================================================
UPDATE profiles SET
  bio = 'Contemporary artist working across oil, acrylic, and mixed media. My work explores the tension between natural landscapes and urban form. Represented by Whitfield Gallery, Brooklyn. Open for commissions.',
  website = 'https://larrywade.art',
  medium = 'Oil Painting',
  style = 'Abstract',
  location = 'Brooklyn, NY'
WHERE id = uid;

-- ============================================================
-- 1. ARTWORKS (10 pieces)
-- ============================================================
DELETE FROM artworks WHERE user_id = uid;

INSERT INTO artworks (user_id, title, medium, tag, price, status, dimensions, seed, created_at) VALUES
  (uid, 'Solstice No. 4',         'Oil on Canvas',  'Oil',         4200, 'Available', '36x48"',    142, now() - interval '45 days'),
  (uid, 'Erosion Study III',       'Oil on Canvas',  'Oil',         3800, 'Sold',      '24x36"',    287, now() - interval '60 days'),
  (uid, 'Urban Canopy',            'Acrylic',        'Acrylic',     2400, 'Available', '30x40"',    331, now() - interval '30 days'),
  (uid, 'Copper & Sage',           'Mixed Media',    'Mixed Media', 5500, 'Available', '48x60"',    419, now() - interval '20 days'),
  (uid, 'Tidal Memory',            'Oil on Canvas',  'Oil',         6800, 'Reserved',  '40x52"',    503, now() - interval '14 days'),
  (uid, 'Fragment Series: Dawn',   'Mixed Media',    'Mixed Media', 1800, 'Available', '18x24"',    167, now() - interval '90 days'),
  (uid, 'Stillwater',              'Photography',    'Photography',  950, 'Available', '20x30"',    588, now() - interval '10 days'),
  (uid, 'Patina',                  'Acrylic',        'Acrylic',     3200, 'Sold',      '36x36"',    274, now() - interval '75 days'),
  (uid, 'Threshold',               'Sculpture',      'Sculpture',   8000, 'Available', '24x18x12"', 650, now() - interval '5 days'),
  (uid, 'Morning Haze',            'Oil on Canvas',  'Oil',         2900, 'Available', '24x30"',    712, now() - interval '3 days');

-- ============================================================
-- 2. COMMISSIONS (8 across all statuses)
-- ============================================================
DELETE FROM commissions WHERE user_id = uid;

INSERT INTO commissions (user_id, client_name, client_email, title, description, medium, dimensions, budget, deadline, status, progress, milestone, created_at) VALUES
  -- 2 completed
  (uid, 'Sarah Mitchell',   'sarah.mitchell@gmail.com',   'Family Portrait - Oil',    'Oil portrait of the Mitchell family, four members, warm earth tones',                'Oil on Canvas', '30x40"',    4500,  (now() - interval '30 days')::date, 'completed', 100, 'Delivered and approved',        now() - interval '90 days'),
  (uid, 'David Chen',       'david.chen@outlook.com',     'Office Triptych',          'Three-panel abstract series for corporate lobby, blues and greens',                  'Acrylic',       '3x 24x36"', 7200,  (now() - interval '15 days')::date, 'completed', 100, 'Final payment received',        now() - interval '120 days'),
  -- 2 active
  (uid, 'Elena Vasquez',    'elena.v@artcollectors.com',  'Garden Series No. 2',      'Second piece in botanical garden series, focus on wisteria',                         'Oil on Canvas', '36x48"',    5200,  (now() + interval '21 days')::date, 'active',    60,  'Underpainting complete',        now() - interval '28 days'),
  (uid, 'James Thornton',   'j.thornton@gmail.com',       'Landscape Commission',     'Panoramic landscape of Hudson Valley for dining room',                              'Oil on Canvas', '48x24"',    3800,  (now() + interval '35 days')::date, 'active',    35,  'Composition approved',          now() - interval '14 days'),
  -- 1 review
  (uid, 'Amara Okonkwo',    'amara.art@icloud.com',       'Mixed Media Diptych',      'Two complementary mixed media pieces, incorporating gold leaf',                     'Mixed Media',   '2x 24x30"', 6500,  (now() + interval '10 days')::date, 'review',    85,  'Final review pending',          now() - interval '45 days'),
  -- 1 quoted
  (uid, 'Marcus Webb',      'marcus.webb@proton.me',      'Abstract for Home Office', 'Large-scale abstract in earth tones for home office feature wall',                  'Acrylic',       '60x48"',    4000,  (now() + interval '60 days')::date, 'quoted',    0,   'Quote sent, awaiting response', now() - interval '5 days'),
  -- 2 pending
  (uid, 'Claire Dumont',    'claire.dumont@yahoo.com',    'Pet Portrait',             'Oil portrait of two golden retrievers in garden setting',                           'Oil on Canvas', '24x30"',    2200,  (now() + interval '45 days')::date, 'pending',   0,   '',                              now() - interval '2 days'),
  (uid, 'Robert Nakamura',  'r.nakamura@gmail.com',       'Sculpture Commission',     'Bronze-finished mixed media sculpture for garden installation',                     'Sculpture',     '36x24x24"', 15000, (now() + interval '90 days')::date, 'pending',   0,   '',                              now() - interval '1 day');

-- ============================================================
-- 3. INVOICES (12 invoices, paid spread for chart)
-- ============================================================
DELETE FROM invoices WHERE user_id = uid;

INSERT INTO invoices (user_id, client_name, description, amount, status, due_date, paid_date, created_at) VALUES
  -- 5 paid (spread across 6 months for revenue chart curve)
  (uid, 'David Chen',       'Office Triptych (Milestone 1)',         2400, 'paid', (now() - interval '100 days')::date, (now() - interval '95 days')::date,  now() - interval '120 days'),
  (uid, 'Sarah Mitchell',   'Family Portrait - Oil (Deposit)',       2250, 'paid', (now() - interval '80 days')::date,  (now() - interval '78 days')::date,  now() - interval '92 days'),
  (uid, 'David Chen',       'Office Triptych (Milestone 2)',         2400, 'paid', (now() - interval '60 days')::date,  (now() - interval '55 days')::date,  now() - interval '70 days'),
  (uid, 'Sarah Mitchell',   'Family Portrait - Oil (Final payment)', 2250, 'paid', (now() - interval '35 days')::date,  (now() - interval '32 days')::date,  now() - interval '90 days'),
  (uid, 'David Chen',       'Office Triptych (Final)',               2400, 'paid', (now() - interval '20 days')::date,  (now() - interval '18 days')::date,  now() - interval '25 days'),
  -- 3 pending
  (uid, 'Elena Vasquez',    'Garden Series No. 2 (Deposit 50%)',     2600, 'pending', (now() + interval '7 days')::date,  NULL, now() - interval '28 days'),
  (uid, 'James Thornton',   'Landscape Commission (Deposit 50%)',    1900, 'pending', (now() + interval '14 days')::date, NULL, now() - interval '14 days'),
  (uid, 'Marcus Webb',      'Abstract for Home Office (Quote)',      4000, 'pending', (now() + interval '30 days')::date, NULL, now() - interval '5 days'),
  -- 2 overdue
  (uid, 'Amara Okonkwo',    'Mixed Media Diptych (Final balance)',   3250, 'overdue', (now() - interval '7 days')::date,  NULL, now() - interval '45 days'),
  (uid, 'Elena Vasquez',    'Garden Series No. 2 (Progress)',        1300, 'overdue', (now() - interval '3 days')::date,  NULL, now() - interval '15 days'),
  -- 2 draft
  (uid, 'Claire Dumont',    'Pet Portrait (Estimate)',               2200, 'draft', NULL, NULL, now() - interval '2 days'),
  (uid, 'Robert Nakamura',  'Sculpture Commission (Preliminary)',   15000, 'draft', NULL, NULL, now() - interval '1 day');

-- ============================================================
-- 4. CONTRACTS (5 contracts)
-- ============================================================
DELETE FROM contracts WHERE user_id = uid;

INSERT INTO contracts (user_id, client_name, client_email, project_title, contract_type, end_date, value, status, payment_terms, terms_text, created_at) VALUES
  (uid, 'Sarah Mitchell',   'sarah.mitchell@gmail.com',  'Family Portrait - Oil',    'Commission Agreement',   (now() - interval '30 days')::date,  4500, 'completed', '50% deposit, 50% on completion', 'Standard commission agreement for portrait work. Artist retains reproduction rights.', now() - interval '90 days'),
  (uid, 'David Chen',       'david.chen@outlook.com',    'Office Triptych',          'Commission Agreement',   (now() - interval '15 days')::date,  7200, 'signed',    '3 equal installments',           'Commission agreement for triptych series. Three milestone payments upon completion of each panel.', now() - interval '120 days'),
  (uid, 'Elena Vasquez',    'elena.v@artcollectors.com', 'Garden Series No. 2',      'Commission Agreement',   (now() + interval '21 days')::date,  5200, 'active',    '50% deposit, 50% on completion', 'Commission agreement for botanical garden series continuation. Includes one round of revisions.', now() - interval '28 days'),
  (uid, 'Whitfield Gallery', 'info@whitfieldgallery.com', 'Gallery Consignment 2026', 'Consignment Agreement',  (now() + interval '180 days')::date, NULL, 'active',    'Net 30 upon sale, 60/40 split',  'Consignment agreement with Whitfield Gallery Brooklyn. 60% artist / 40% gallery split on all sales.', now() - interval '60 days'),
  (uid, 'Marcus Webb',      'marcus.webb@proton.me',     'Abstract for Home Office', 'Commission Agreement',   (now() + interval '60 days')::date,  4000, 'draft',     '50% deposit, 50% on completion', 'Draft commission agreement for large-scale abstract work. Pending client approval.', now() - interval '5 days');

-- ============================================================
-- 5. SCHEDULED POSTS (8 posts)
-- ============================================================
DELETE FROM scheduled_posts WHERE user_id = uid;

INSERT INTO scheduled_posts (user_id, platform, content, artwork_title, scheduled_date, status, created_at) VALUES
  (uid, 'Instagram',  'New piece just completed: "Threshold" - a mixed media sculpture exploring the boundaries between inside and outside.',                                  'Threshold',        now() + interval '1 day'  + interval '11 hours', 'scheduled', now() - interval '1 day'),
  (uid, 'Instagram',  'Studio morning light hitting "Morning Haze" just right. Oil on canvas, 24x30. Available through my profile link.',                                       'Morning Haze',     now() + interval '3 days' + interval '10 hours', 'scheduled', now() - interval '12 hours'),
  (uid, 'Twitter/X',  'Excited to share that "Solstice No. 4" is now available. 36x48, oil on canvas. DMs open for inquiries.',                                                 'Solstice No. 4',   now() + interval '2 days' + interval '14 hours', 'scheduled', now() - interval '6 hours'),
  (uid, 'LinkedIn',   'Reflecting on this quarter: 3 commissions completed, 2 new gallery relationships, and a 23% increase in average commission value.',                      'Quarterly Recap',  now() + interval '5 days' + interval '9 hours',  'draft',     now()),
  (uid, 'Instagram',  'Behind the scenes: Gold leaf application on the diptych commission. This technique requires patience and steady hands.',                                  'Mixed Media Diptych', now() + interval '7 days' + interval '15 hours', 'scheduled', now()),
  (uid, 'Twitter/X',  'What is your biggest challenge as an artist running a business? For me it used to be pricing until I started benchmarking against market data.',          'Pricing Thread',   now() + interval '4 days' + interval '12 hours', 'draft',     now()),
  (uid, 'Instagram',  'Copper and Sage (48x60, mixed media) - exploring the intersection of industrial textures and organic form. Available.',                                   'Copper & Sage',    now() - interval '3 days' + interval '10 hours', 'published', now() - interval '5 days'),
  (uid, 'LinkedIn',   'Honored to have "Erosion Study III" acquired for a private collection in Manhattan. Thank you to everyone who supported this series.',                    'Erosion Study III', now() - interval '10 days' + interval '9 hours', 'published', now() - interval '12 days');

-- ============================================================
-- 6. CONVERSATIONS + MESSAGES (4 conversations)
-- ============================================================
DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = uid);
DELETE FROM conversations WHERE user_id = uid;

-- Conversation 1: Elena Vasquez
INSERT INTO conversations (user_id, participant_name, participant_initial, participant_gradient, last_message, last_message_at, participant_online, unread_count)
VALUES (uid, 'Elena Vasquez', 'E', 'linear-gradient(135deg, #B5651D, #C9A84C)', 'The wisteria reference photos look beautiful. I will start the underpainting next week.', now() - interval '2 hours', true, 1)
RETURNING id INTO conv1_id;

INSERT INTO messages (conversation_id, sender, content, created_at) VALUES
  (conv1_id, 'them', 'Hi Larry! I have been thinking about the second piece for the garden series. Can we discuss the color palette?', now() - interval '2 days'),
  (conv1_id, 'me',   'Of course, Elena. I was thinking we stay with the warm earth tones from the first piece but introduce some violet undertones for the wisteria.', now() - interval '2 days' + interval '30 minutes'),
  (conv1_id, 'them', 'That sounds gorgeous. Could you send over some reference swatches when you have a chance?', now() - interval '1 day' + interval '4 hours'),
  (conv1_id, 'me',   'Absolutely. I will put together a mood board this afternoon with the reference photos you sent earlier.', now() - interval '1 day' + interval '5 hours'),
  (conv1_id, 'them', 'Perfect! Also, I wanted to share these photos from the garden - the wisteria is in full bloom right now.', now() - interval '3 hours'),
  (conv1_id, 'me',   'The wisteria reference photos look beautiful. I will start the underpainting next week.', now() - interval '2 hours');

-- Conversation 2: Claire Dumont
INSERT INTO conversations (user_id, participant_name, participant_initial, participant_gradient, last_message, last_message_at, participant_online, unread_count)
VALUES (uid, 'Claire Dumont', 'C', 'linear-gradient(135deg, #C4705A, #B5651D)', 'Thank you for the quick response! The golden retrievers are Luna and Max.', now() - interval '1 day', false, 2)
RETURNING id INTO conv2_id;

INSERT INTO messages (conversation_id, sender, content, created_at) VALUES
  (conv2_id, 'them', 'Hello! I saw your portrait work on Instagram and I am interested in commissioning a painting of my two dogs.', now() - interval '2 days'),
  (conv2_id, 'me',   'Thank you, Claire! I would love to hear more. What breed are they, and do you have a specific setting in mind?', now() - interval '2 days' + interval '1 hour'),
  (conv2_id, 'them', 'They are golden retrievers - Luna and Max. I was thinking a garden setting, something natural and warm.', now() - interval '1 day' + interval '6 hours'),
  (conv2_id, 'them', 'Thank you for the quick response! The golden retrievers are Luna and Max.', now() - interval '1 day');

-- Conversation 3: Whitfield Gallery
INSERT INTO conversations (user_id, participant_name, participant_initial, participant_gradient, last_message, last_message_at, participant_online, unread_count)
VALUES (uid, 'Whitfield Gallery', 'W', 'linear-gradient(135deg, #2D4A35, #4A7A57)', 'We would love to feature your new sculpture series in our spring showcase.', now() - interval '3 days', false, 0)
RETURNING id INTO conv3_id;

INSERT INTO messages (conversation_id, sender, content, created_at) VALUES
  (conv3_id, 'them', 'Larry, congratulations on the Erosion Study series. The collectors have been very responsive.', now() - interval '5 days'),
  (conv3_id, 'me',   'Thank you! The series has been a real labor of love. I am glad it is resonating.', now() - interval '5 days' + interval '2 hours'),
  (conv3_id, 'them', 'We would love to feature your new sculpture series in our spring showcase. Can we set up a call?', now() - interval '3 days');

-- Conversation 4: Robert Nakamura
INSERT INTO conversations (user_id, participant_name, participant_initial, participant_gradient, last_message, last_message_at, participant_online, unread_count)
VALUES (uid, 'Robert Nakamura', 'R', 'linear-gradient(135deg, #C9A84C, #D4854A)', 'I have attached some photos of the garden space for the sculpture installation.', now() - interval '12 hours', true, 1)
RETURNING id INTO conv4_id;

INSERT INTO messages (conversation_id, sender, content, created_at) VALUES
  (conv4_id, 'them', 'Hello Larry, I am interested in commissioning a sculpture for my garden. I saw your work on the marketplace.', now() - interval '1 day'),
  (conv4_id, 'me',   'Robert, great to hear from you! Tell me more about your garden space and what you have in mind.', now() - interval '1 day' + interval '2 hours'),
  (conv4_id, 'them', 'I have attached some photos of the garden space for the sculpture installation. It is about 8x6 feet.', now() - interval '12 hours');

-- ============================================================
-- 7. ACTIVITY LOG (20 entries across last 7+ days)
-- ============================================================
DELETE FROM activity_log WHERE user_id = uid;

INSERT INTO activity_log (user_id, activity_type, description, metadata, created_at) VALUES
  -- Today (4 entries)
  (uid, 'artwork',    'Added new artwork "Morning Haze" to portfolio',                   '{"title":"Morning Haze","price":2900}',              now() - interval '1 hour'),
  (uid, 'social',     'Scheduled Instagram post for "Threshold"',                        '{"platform":"Instagram"}',                           now() - interval '3 hours'),
  (uid, 'commission', 'Received commission request from Robert Nakamura',                '{"client":"Robert Nakamura","budget":15000}',        now() - interval '5 hours'),
  (uid, 'invoice',    'Created draft invoice for Robert Nakamura',                       '{"amount":15000}',                                   now() - interval '6 hours'),
  -- Yesterday (4 entries)
  (uid, 'commission', 'Received commission request from Claire Dumont - Pet Portrait',   '{"client":"Claire Dumont","budget":2200}',           now() - interval '1 day' - interval '2 hours'),
  (uid, 'artwork',    'Added new artwork "Threshold" to portfolio',                      '{"title":"Threshold","price":8000}',                 now() - interval '1 day' - interval '4 hours'),
  (uid, 'invoice',    'Created draft invoice for Claire Dumont',                         '{"amount":2200}',                                    now() - interval '1 day' - interval '5 hours'),
  (uid, 'social',     'Scheduled Twitter/X post for "Solstice No. 4"',                   '{"platform":"Twitter/X"}',                           now() - interval '1 day' - interval '8 hours'),
  -- This Week (8 entries)
  (uid, 'commission', 'Sent quote to Marcus Webb for Abstract for Home Office',          '{"client":"Marcus Webb","budget":4000}',             now() - interval '3 days'),
  (uid, 'contract',   'Created Commission Agreement for Marcus Webb',                    '{"type":"Commission Agreement"}',                    now() - interval '3 days' - interval '1 hour'),
  (uid, 'invoice',    'Marked David Chen invoice as paid ($2,400)',                      '{"amount":2400,"status":"paid"}',                    now() - interval '4 days'),
  (uid, 'commission', 'Updated progress on Mixed Media Diptych for Amara Okonkwo (85%)', '{"client":"Amara Okonkwo","progress":85}',          now() - interval '4 days' - interval '3 hours'),
  (uid, 'social',     'Published Instagram post for "Copper & Sage"',                    '{"platform":"Instagram","status":"published"}',      now() - interval '5 days'),
  (uid, 'artwork',    'Updated "Stillwater" pricing to $950',                            '{"title":"Stillwater","price":950}',                 now() - interval '5 days' - interval '2 hours'),
  (uid, 'invoice',    'Sent payment reminder to Amara Okonkwo',                          '{"client":"Amara Okonkwo"}',                         now() - interval '6 days'),
  (uid, 'commission', 'Updated progress on Garden Series for Elena Vasquez (60%)',       '{"client":"Elena Vasquez","progress":60}',           now() - interval '6 days' - interval '4 hours'),
  -- Earlier (4 entries)
  (uid, 'social',     'Published LinkedIn post about "Erosion Study III" acquisition',   '{"platform":"LinkedIn"}',                            now() - interval '10 days'),
  (uid, 'invoice',    'Received payment of $2,400 from David Chen',                     '{"amount":2400}',                                    now() - interval '18 days'),
  (uid, 'commission', 'Completed commission "Office Triptych" for David Chen',           '{"client":"David Chen"}',                            now() - interval '15 days'),
  (uid, 'contract',   'Created Consignment Agreement with Whitfield Gallery',            '{"type":"Consignment Agreement"}',                   now() - interval '60 days');

END $$;
