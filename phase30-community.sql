-- ============================================================
-- ArtistOS Phase 30: Founders' Room + Group Shows
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- 0. SECURITY DEFINER helper to break RLS recursion
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

CREATE OR REPLACE FUNCTION public.is_exhibition_participant(p_exhibition_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.exhibition_participants
    WHERE exhibition_id = p_exhibition_id AND user_id = auth.uid()
  );
$$;

-- 1. Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  access TEXT NOT NULL DEFAULT 'first_clients' CHECK (access IN ('first_clients','plan_pro_plus','all','invite')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read rooms" ON public.rooms;
CREATE POLICY "Authenticated read rooms" ON public.rooms FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admin manage rooms" ON public.rooms;
CREATE POLICY "Admin manage rooms" ON public.rooms FOR ALL USING (public.is_admin());

-- 2. Room members
CREATE TABLE IF NOT EXISTS public.room_members (
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','moderator')),
  muted_until TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members read room members" ON public.room_members;
CREATE POLICY "Members read room members" ON public.room_members
  FOR SELECT USING (public.is_room_member(room_id) OR public.is_admin());
DROP POLICY IF EXISTS "Members update own" ON public.room_members;
DROP POLICY IF EXISTS "Members update own last_read" ON public.room_members;
CREATE POLICY "Members update own last_read" ON public.room_members
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT rm.role FROM public.room_members rm WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid())
    AND (muted_until IS NOT DISTINCT FROM (SELECT rm.muted_until FROM public.room_members rm WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid()))
  );
DROP POLICY IF EXISTS "Admin manage members" ON public.room_members;
CREATE POLICY "Admin manage members" ON public.room_members FOR ALL USING (public.is_admin());

-- 3. Room posts
CREATE TABLE IF NOT EXISTS public.room_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.room_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  tag TEXT CHECK (tag IN ('looking_for','show_and_tell','question','win','prompt')),
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE SET NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  hidden BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS room_posts_room_idx ON public.room_posts (room_id, parent_id, created_at DESC);
ALTER TABLE public.room_posts ENABLE ROW LEVEL SECURITY;
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
      AND parent_id IS NOT DISTINCT FROM (SELECT rp.parent_id FROM public.room_posts rp WHERE rp.id = room_posts.id)
      AND tag IS NOT DISTINCT FROM (SELECT rp.tag FROM public.room_posts rp WHERE rp.id = room_posts.id)
      AND artwork_id IS NOT DISTINCT FROM (SELECT rp.artwork_id FROM public.room_posts rp WHERE rp.id = room_posts.id)
      AND created_at = (SELECT rp.created_at FROM public.room_posts rp WHERE rp.id = room_posts.id)
    )
  );
DROP POLICY IF EXISTS "Authors delete own posts" ON public.room_posts;
CREATE POLICY "Authors delete own posts" ON public.room_posts FOR DELETE USING (author_id = auth.uid() OR public.is_admin());

-- 4. Room reactions
CREATE TABLE IF NOT EXISTS public.room_reactions (
  post_id UUID REFERENCES public.room_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👏','❤️','🔥','💡')),
  PRIMARY KEY (post_id, user_id, emoji)
);
ALTER TABLE public.room_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members manage reactions" ON public.room_reactions;
DROP POLICY IF EXISTS "Members read reactions" ON public.room_reactions;
DROP POLICY IF EXISTS "Members insert reactions" ON public.room_reactions;
DROP POLICY IF EXISTS "Members delete own reactions" ON public.room_reactions;

CREATE POLICY "Members read reactions" ON public.room_reactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.room_posts rp WHERE rp.id = room_reactions.post_id AND public.is_room_member(rp.room_id))
  );
CREATE POLICY "Members insert reactions" ON public.room_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.room_posts rp WHERE rp.id = room_reactions.post_id AND public.is_room_member(rp.room_id))
  );
CREATE POLICY "Members delete own reactions" ON public.room_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Group shows
CREATE TABLE IF NOT EXISTS public.exhibition_participants (
  exhibition_id UUID REFERENCES public.exhibitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'artist' CHECK (role IN ('organizer','artist')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','accepted','declined','removed','requested')),
  invited_by UUID REFERENCES public.profiles(id),
  artwork_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (exhibition_id, user_id)
);
ALTER TABLE public.exhibition_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants read own" ON public.exhibition_participants;
CREATE POLICY "Participants read own" ON public.exhibition_participants
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin() OR
    public.is_exhibition_participant(exhibition_id)
  );
DROP POLICY IF EXISTS "Admin manage participants" ON public.exhibition_participants;
CREATE POLICY "Admin manage participants" ON public.exhibition_participants FOR ALL USING (public.is_admin());

ALTER TABLE public.exhibitions ADD COLUMN IF NOT EXISTS is_group BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.exhibitions ADD COLUMN IF NOT EXISTS viewing_room_id UUID;
ALTER TABLE public.viewing_rooms ADD COLUMN IF NOT EXISTS exhibition_id UUID;

-- 6. Artwork collaborators (data groundwork, no UI)
CREATE TABLE IF NOT EXISTS public.artwork_collaborators (
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'co-artist',
  revenue_share_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (revenue_share_pct BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (artwork_id, user_id)
);
ALTER TABLE public.artwork_collaborators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Collaborators read own" ON public.artwork_collaborators;
CREATE POLICY "Collaborators read own" ON public.artwork_collaborators FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- 7. Create the Founders' Room
INSERT INTO public.rooms (slug, name, description, access)
VALUES ('founders', 'Founders'' Room', 'A private room for ArtistOS Founding Artists and Larry.', 'first_clients')
ON CONFLICT (slug) DO NOTHING;

-- 8. join_room RPC
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

  IF EXISTS (SELECT 1 FROM public.room_members WHERE room_id = v_room_id AND user_id = v_uid) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already a member');
  END IF;

  SELECT lifetime_plan, vip, plan INTO v_profile
  FROM public.profiles WHERE id = v_uid;

  IF v_access = 'first_clients' THEN
    IF NOT (COALESCE(v_profile.lifetime_plan, false) OR COALESCE(v_profile.vip, false)) THEN
      RETURN jsonb_build_object('success', false, 'error', 'This room is for Founding Artists only');
    END IF;
  ELSIF v_access = 'plan_pro_plus' THEN
    IF COALESCE(v_profile.plan, 'starter') NOT IN ('pro', 'studio') AND NOT COALESCE(v_profile.lifetime_plan, false) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Pro or Studio plan required');
    END IF;
  ELSIF v_access = 'invite' THEN
    RETURN jsonb_build_object('success', false, 'error', 'This room is invite-only');
  END IF;

  INSERT INTO public.room_members (room_id, user_id, role)
  VALUES (v_room_id, v_uid, 'member');

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.join_room(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_room(TEXT) TO authenticated;

-- 9. Auto-join founders trigger
CREATE OR REPLACE FUNCTION public.auto_join_founders_room()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
BEGIN
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

-- 10. Realtime (idempotent)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_posts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_reactions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Verify
SELECT 'rooms' AS tbl, count(*) FROM public.rooms
UNION ALL SELECT 'room_members', count(*) FROM public.room_members
UNION ALL SELECT 'room_posts', count(*) FROM public.room_posts
UNION ALL SELECT 'exhibition_participants', count(*) FROM public.exhibition_participants;
