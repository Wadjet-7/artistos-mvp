-- ============================================================
-- ArtistOS Phase 31 Group 7: Group Shows RPCs
-- Run in Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- 1. Backfill: insert organizer row for every existing exhibition
INSERT INTO public.exhibition_participants (exhibition_id, user_id, role, status, invited_by)
SELECT e.id, e.user_id, 'organizer', 'accepted', e.user_id
FROM public.exhibitions e
WHERE NOT EXISTS (
  SELECT 1 FROM public.exhibition_participants ep
  WHERE ep.exhibition_id = e.id AND ep.user_id = e.user_id
)
ON CONFLICT (exhibition_id, user_id) DO NOTHING;

-- 2. Exhibition SELECT: owner or participant can read
DROP POLICY IF EXISTS "Users read own exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Owner or participant reads exhibitions" ON public.exhibitions;
CREATE POLICY "Owner or participant reads exhibitions" ON public.exhibitions
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin() OR
    public.is_exhibition_participant(id)
  );

-- 3. invite_to_exhibition RPC
CREATE OR REPLACE FUNCTION public.invite_to_exhibition(p_exhibition_id UUID, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_ex RECORD;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT id, user_id, is_group, title INTO v_ex FROM public.exhibitions WHERE id = p_exhibition_id;
  IF v_ex.id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Exhibition not found'); END IF;
  IF v_ex.user_id <> v_uid THEN RETURN jsonb_build_object('success', false, 'error', 'Only the organizer can invite'); END IF;
  IF NOT COALESCE(v_ex.is_group, false) THEN RETURN jsonb_build_object('success', false, 'error', 'Not a group show'); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN RETURN jsonb_build_object('success', false, 'error', 'User not found'); END IF;

  INSERT INTO public.exhibition_participants (exhibition_id, user_id, role, status, invited_by)
  VALUES (p_exhibition_id, p_user_id, 'artist', 'invited', v_uid)
  ON CONFLICT (exhibition_id, user_id) DO NOTHING;

  INSERT INTO public.activity_log (user_id, activity_type, description, metadata)
  VALUES (p_user_id, 'exhibition', 'You were invited to "' || v_ex.title || '"',
    jsonb_build_object('exhibition_id', p_exhibition_id, 'invited_by', v_uid));

  RETURN jsonb_build_object('success', true);
END; $$;

REVOKE ALL ON FUNCTION public.invite_to_exhibition(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invite_to_exhibition(UUID, UUID) TO authenticated;

-- 4. respond_to_exhibition RPC
CREATE OR REPLACE FUNCTION public.respond_to_exhibition(p_exhibition_id UUID, p_accept BOOLEAN)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_status TEXT;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT status INTO v_status FROM public.exhibition_participants
  WHERE exhibition_id = p_exhibition_id AND user_id = v_uid;

  IF v_status IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not invited'); END IF;
  IF v_status NOT IN ('invited', 'requested') THEN RETURN jsonb_build_object('success', false, 'error', 'Already responded'); END IF;

  UPDATE public.exhibition_participants
  SET status = CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END
  WHERE exhibition_id = p_exhibition_id AND user_id = v_uid;

  RETURN jsonb_build_object('success', true);
END; $$;

REVOKE ALL ON FUNCTION public.respond_to_exhibition(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_to_exhibition(UUID, BOOLEAN) TO authenticated;

-- 5. set_my_exhibition_artworks RPC
CREATE OR REPLACE FUNCTION public.set_my_exhibition_artworks(p_exhibition_id UUID, p_artwork_ids UUID[])
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_status TEXT;
  v_valid_count INT;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT status INTO v_status FROM public.exhibition_participants
  WHERE exhibition_id = p_exhibition_id AND user_id = v_uid;

  IF v_status IS NULL OR v_status <> 'accepted' THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must be an accepted participant');
  END IF;

  SELECT count(*) INTO v_valid_count FROM public.artworks
  WHERE id = ANY(p_artwork_ids) AND user_id = v_uid;

  IF v_valid_count <> array_length(p_artwork_ids, 1) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only attach your own artworks');
  END IF;

  UPDATE public.exhibition_participants SET artwork_ids = p_artwork_ids
  WHERE exhibition_id = p_exhibition_id AND user_id = v_uid;

  RETURN jsonb_build_object('success', true);
END; $$;

REVOKE ALL ON FUNCTION public.set_my_exhibition_artworks(UUID, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_exhibition_artworks(UUID, UUID[]) TO authenticated;

-- 6. remove_from_exhibition RPC
CREATE OR REPLACE FUNCTION public.remove_from_exhibition(p_exhibition_id UUID, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_owner UUID;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT user_id INTO v_owner FROM public.exhibitions WHERE id = p_exhibition_id;
  IF v_owner <> v_uid THEN RETURN jsonb_build_object('success', false, 'error', 'Only the organizer can remove'); END IF;
  IF p_user_id = v_uid THEN RETURN jsonb_build_object('success', false, 'error', 'Cannot remove yourself'); END IF;

  UPDATE public.exhibition_participants SET status = 'removed'
  WHERE exhibition_id = p_exhibition_id AND user_id = p_user_id;

  RETURN jsonb_build_object('success', true);
END; $$;

REVOKE ALL ON FUNCTION public.remove_from_exhibition(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_from_exhibition(UUID, UUID) TO authenticated;

-- 7. publish_group_viewing_room RPC
CREATE OR REPLACE FUNCTION public.publish_group_viewing_room(p_exhibition_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_ex RECORD;
  v_all_artworks UUID[];
  v_room_id UUID;
  v_slug TEXT;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT id, user_id, title, venue, location, viewing_room_id, is_group INTO v_ex
  FROM public.exhibitions WHERE id = p_exhibition_id;

  IF v_ex.id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Exhibition not found'); END IF;
  IF v_ex.user_id <> v_uid THEN RETURN jsonb_build_object('success', false, 'error', 'Only the organizer can publish'); END IF;

  SELECT array_agg(unnest) INTO v_all_artworks FROM (
    SELECT unnest(ep.artwork_ids) FROM public.exhibition_participants ep
    WHERE ep.exhibition_id = p_exhibition_id AND ep.status = 'accepted' AND ep.artwork_ids <> '{}'
  ) sub;

  IF v_all_artworks IS NULL OR array_length(v_all_artworks, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No artworks selected by participants');
  END IF;

  IF v_ex.viewing_room_id IS NOT NULL THEN
    UPDATE public.viewing_rooms SET
      artwork_ids = v_all_artworks,
      title = v_ex.title,
      published = true
    WHERE id = v_ex.viewing_room_id;
    v_room_id := v_ex.viewing_room_id;
  ELSE
    v_slug := 'group-' || replace(gen_random_uuid()::text, '-', '');
    INSERT INTO public.viewing_rooms (user_id, title, description, slug, artwork_ids, published, exhibition_id)
    VALUES (v_uid, v_ex.title, COALESCE(v_ex.venue, '') || ' — Group Show', v_slug, v_all_artworks, true, p_exhibition_id)
    RETURNING id INTO v_room_id;

    UPDATE public.exhibitions SET viewing_room_id = v_room_id WHERE id = p_exhibition_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'viewing_room_id', v_room_id);
END; $$;

REVOKE ALL ON FUNCTION public.publish_group_viewing_room(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_group_viewing_room(UUID) TO authenticated;

-- Verify
SELECT 'Group Shows RPCs' AS status, TRUE AS ok;
