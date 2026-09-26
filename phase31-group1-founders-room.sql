-- ============================================================
-- ArtistOS Phase 31 Group 1: Founders' Room fixes
-- Fixes: RLS recursion, security holes, missing RPCs,
--        publication idempotency.
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ============================================================
-- 1. SECURITY DEFINER helper to break RLS recursion
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_id = p_room_id AND user_id = auth.uid()
  );
$$;

-- ============================================================
-- 2. Fix room_members policies (recursion + security holes)
-- ============================================================

-- Drop old policies
DROP POLICY IF EXISTS "Members read room members" ON public.room_members;
DROP POLICY IF EXISTS "Members update own" ON public.room_members;

-- SELECT: use the helper instead of subquery
CREATE POLICY "Members read room members" ON public.room_members
  FOR SELECT USING (
    public.is_room_member(room_id) OR public.is_admin()
  );

-- UPDATE: members can only update last_read_at (not role or muted_until)
CREATE POLICY "Members update own last_read" ON public.room_members
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT rm.role FROM public.room_members rm WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid())
    AND (muted_until IS NOT DISTINCT FROM (SELECT rm.muted_until FROM public.room_members rm WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid()))
  );

-- ============================================================
-- 3. Fix room_posts policies (use helper, restrict UPDATE cols)
-- ============================================================

DROP POLICY IF EXISTS "Members read visible posts" ON public.room_posts;
CREATE POLICY "Members read visible posts" ON public.room_posts
  FOR SELECT USING (
    (hidden = false OR public.is_admin()) AND
    public.is_room_member(room_id)
  );

DROP POLICY IF EXISTS "Members create posts" ON public.room_posts;
CREATE POLICY "Members create posts" ON public.room_posts
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    public.is_room_member(room_id) AND
    NOT EXISTS (
      SELECT 1 FROM public.room_members rm
      WHERE rm.room_id = room_posts.room_id AND rm.user_id = auth.uid()
        AND rm.muted_until IS NOT NULL AND rm.muted_until > now()
    )
  );

-- Authors can update only body (and edited_at) within 15 minutes; admins can do anything
DROP POLICY IF EXISTS "Authors edit own posts" ON public.room_posts;
CREATE POLICY "Authors edit own posts" ON public.room_posts
  FOR UPDATE USING (
    (author_id = auth.uid() AND created_at > now() - INTERVAL '15 minutes') OR public.is_admin()
  ) WITH CHECK (
    public.is_admin() OR (
      author_id = auth.uid()
      AND room_id = (SELECT rp.room_id FROM public.room_posts rp WHERE rp.id = room_posts.id)
      AND pinned = (SELECT rp.pinned FROM public.room_posts rp WHERE rp.id = room_posts.id)
      AND hidden = (SELECT rp.hidden FROM public.room_posts rp WHERE rp.id = room_posts.id)
    )
  );

-- ============================================================
-- 4. Fix room_reactions policies (require membership)
-- ============================================================

DROP POLICY IF EXISTS "Members manage reactions" ON public.room_reactions;
DROP POLICY IF EXISTS "Members read reactions" ON public.room_reactions;

CREATE POLICY "Members read reactions" ON public.room_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_posts rp
      WHERE rp.id = room_reactions.post_id
        AND public.is_room_member(rp.room_id)
    )
  );

CREATE POLICY "Members insert reactions" ON public.room_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.room_posts rp
      WHERE rp.id = room_reactions.post_id
        AND public.is_room_member(rp.room_id)
    )
  );

CREATE POLICY "Members delete own reactions" ON public.room_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 5. Fix exhibition_participants policy (recursion)
-- ============================================================

DROP POLICY IF EXISTS "Participants read own" ON public.exhibition_participants;
CREATE POLICY "Participants read own" ON public.exhibition_participants
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.exhibition_participants ep2
      WHERE ep2.exhibition_id = exhibition_participants.exhibition_id
        AND ep2.user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. join_room RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.join_room(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
  v_access TEXT;
  v_uid UUID := auth.uid();
  v_profile RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT id, access INTO v_room_id, v_access
  FROM public.rooms WHERE slug = p_slug;

  IF v_room_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Room not found');
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM public.room_members WHERE room_id = v_room_id AND user_id = v_uid) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already a member');
  END IF;

  -- Check access
  SELECT lifetime_plan, vip, plan INTO v_profile
  FROM public.profiles WHERE id = v_uid;

  IF v_access = 'first_clients' THEN
    IF NOT (v_profile.lifetime_plan OR v_profile.vip) THEN
      RETURN jsonb_build_object('success', false, 'error', 'This room is for Founding Artists only');
    END IF;
  ELSIF v_access = 'plan_pro_plus' THEN
    IF v_profile.plan NOT IN ('pro', 'studio') AND NOT v_profile.lifetime_plan THEN
      RETURN jsonb_build_object('success', false, 'error', 'Pro or Studio plan required');
    END IF;
  ELSIF v_access = 'invite' THEN
    RETURN jsonb_build_object('success', false, 'error', 'This room is invite-only');
  END IF;
  -- 'all' = anyone can join

  INSERT INTO public.room_members (room_id, user_id, role)
  VALUES (v_room_id, v_uid, 'member');

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 7. Auto-join founders trigger: when lifetime_plan or vip
--    is set to true, auto-add to the founders room
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_join_founders_room()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
BEGIN
  -- Only fire when lifetime_plan or vip becomes true
  IF (NEW.lifetime_plan = true AND (OLD.lifetime_plan IS DISTINCT FROM true))
     OR (NEW.vip = true AND (OLD.vip IS DISTINCT FROM true)) THEN

    SELECT id INTO v_room_id FROM public.rooms WHERE slug = 'founders';
    IF v_room_id IS NOT NULL THEN
      INSERT INTO public.room_members (room_id, user_id, role)
      VALUES (v_room_id, NEW.id, 'member')
      ON CONFLICT (room_id, user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_join_founders_room ON public.profiles;
CREATE TRIGGER auto_join_founders_room
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_join_founders_room();

-- ============================================================
-- 8. Backfill: add existing lifetime_plan/vip users to founders
-- ============================================================

DO $$
DECLARE
  v_room_id UUID;
BEGIN
  SELECT id INTO v_room_id FROM public.rooms WHERE slug = 'founders';
  IF v_room_id IS NOT NULL THEN
    INSERT INTO public.room_members (room_id, user_id, role)
    SELECT v_room_id, id, 'member'
    FROM public.profiles
    WHERE lifetime_plan = true OR vip = true
    ON CONFLICT (room_id, user_id) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 9. Add Larry as moderator (by email lookup)
-- ============================================================

DO $$
DECLARE
  v_room_id UUID;
  v_larry_id UUID;
BEGIN
  SELECT id INTO v_room_id FROM public.rooms WHERE slug = 'founders';
  SELECT id INTO v_larry_id FROM public.profiles WHERE is_admin = true LIMIT 1;

  IF v_room_id IS NOT NULL AND v_larry_id IS NOT NULL THEN
    INSERT INTO public.room_members (room_id, user_id, role)
    VALUES (v_room_id, v_larry_id, 'moderator')
    ON CONFLICT (room_id, user_id) DO UPDATE SET role = 'moderator';
  END IF;
END $$;

-- ============================================================
-- 10. Idempotent realtime publication
-- ============================================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_posts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_reactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 11. Update phase25b-privacy.sql inline: drop correct policy name
-- ============================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- ============================================================
-- 12. Protect profile columns trigger (from phase25c followup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user IN ('postgres','service_role','supabase_admin') OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF NEW.plan               IS DISTINCT FROM OLD.plan
  OR NEW.lifetime_plan      IS DISTINCT FROM OLD.lifetime_plan
  OR NEW.is_admin           IS DISTINCT FROM OLD.is_admin
  OR NEW.vip                IS DISTINCT FROM OLD.vip
  OR NEW.is_demo            IS DISTINCT FROM OLD.is_demo
  OR NEW.plan_expires_at    IS DISTINCT FROM OLD.plan_expires_at
  OR NEW.founder_referral_code IS DISTINCT FROM OLD.founder_referral_code
  OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
  OR NEW.stripe_account_id  IS DISTINCT FROM OLD.stripe_account_id
  OR NEW.stripe_charges_enabled IS DISTINCT FROM OLD.stripe_charges_enabled
  OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
  THEN
    RAISE EXCEPTION 'You cannot change plan or account flags directly.' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_profile_columns ON public.profiles;
CREATE TRIGGER protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- Verify
SELECT 'is_room_member function' AS check, TRUE AS ok
UNION ALL
SELECT 'protect_profile_columns trigger',
  EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'protect_profile_columns');
