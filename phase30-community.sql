-- ============================================================
-- ArtistOS Phase 30: Founders' Room + Group Shows
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

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
CREATE POLICY "Members read room members" ON public.room_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid())
  OR public.is_admin()
);
DROP POLICY IF EXISTS "Members update own" ON public.room_members;
CREATE POLICY "Members update own" ON public.room_members FOR UPDATE USING (auth.uid() = user_id);
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
CREATE POLICY "Members read visible posts" ON public.room_posts FOR SELECT USING (
  (hidden = false OR public.is_admin()) AND
  EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_posts.room_id AND rm.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Members create posts" ON public.room_posts;
CREATE POLICY "Members create posts" ON public.room_posts FOR INSERT WITH CHECK (
  author_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_posts.room_id AND rm.user_id = auth.uid() AND (rm.muted_until IS NULL OR rm.muted_until < now()))
);
DROP POLICY IF EXISTS "Authors edit own posts" ON public.room_posts;
CREATE POLICY "Authors edit own posts" ON public.room_posts FOR UPDATE USING (
  (author_id = auth.uid() AND created_at > now() - INTERVAL '15 minutes') OR public.is_admin()
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
CREATE POLICY "Members manage reactions" ON public.room_reactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Members read reactions" ON public.room_reactions;
CREATE POLICY "Members read reactions" ON public.room_reactions FOR SELECT USING (auth.uid() IS NOT NULL);

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
CREATE POLICY "Participants read own" ON public.exhibition_participants FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin() OR
  EXISTS (SELECT 1 FROM public.exhibition_participants ep WHERE ep.exhibition_id = exhibition_participants.exhibition_id AND ep.user_id = auth.uid())
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

-- 8. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_reactions;

-- Verify
SELECT 'rooms' AS tbl, count(*) FROM public.rooms
UNION ALL SELECT 'room_members', count(*) FROM public.room_members
UNION ALL SELECT 'room_posts', count(*) FROM public.room_posts
UNION ALL SELECT 'exhibition_participants', count(*) FROM public.exhibition_participants;
