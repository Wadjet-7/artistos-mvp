-- ============================================================
-- Phase 7: RLS Policies for Public Access
-- Run this in your Supabase SQL Editor AFTER the seed data
-- Enables: public artist profile viewing + commission requests
-- ============================================================

-- 1. Allow anyone to read profiles (for public artist profile page)
-- If this errors, a SELECT policy may already exist — that's fine
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Allow anyone to read artworks (for public artist profile page)
DO $$ BEGIN
  CREATE POLICY "Available artworks are viewable by everyone"
    ON artworks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Allow anonymous commission request submissions
DO $$ BEGIN
  CREATE POLICY "Anyone can submit a commission request"
    ON commissions FOR INSERT
    WITH CHECK (
      status = 'pending'
      AND user_id IS NOT NULL
      AND client_name IS NOT NULL
      AND client_email IS NOT NULL
      AND title IS NOT NULL
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Allow anonymous conversation creation (auto-created with commission)
DO $$ BEGIN
  CREATE POLICY "Anyone can create a conversation for commission requests"
    ON conversations FOR INSERT
    WITH CHECK (
      user_id IS NOT NULL
      AND participant_name IS NOT NULL
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. Allow anonymous initial message (auto-created with commission)
DO $$ BEGIN
  CREATE POLICY "Anyone can send an initial message"
    ON messages FOR INSERT
    WITH CHECK (
      conversation_id IS NOT NULL
      AND content IS NOT NULL
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Allow anonymous activity log entries
DO $$ BEGIN
  CREATE POLICY "Anyone can create activity log entries"
    ON activity_log FOR INSERT
    WITH CHECK (
      user_id IS NOT NULL
      AND activity_type IS NOT NULL
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
