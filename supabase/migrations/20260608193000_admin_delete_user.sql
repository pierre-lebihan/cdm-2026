CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_target_profile public.profiles%ROWTYPE;
  v_profile_found BOOLEAN := false;
  v_auth_user_deleted INTEGER := 0;
  v_bets_deleted INTEGER := 0;
  v_competition_profiles_deleted INTEGER := 0;
  v_group_apply_deleted INTEGER := 0;
  v_group_members_deleted INTEGER := 0;
  v_groups_unowned INTEGER := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;

  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'User must be an admin';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Impossible de supprimer votre propre compte depuis l''admin';
  END IF;

  SELECT *
  INTO v_target_profile
  FROM public.profiles
  WHERE id = p_user_id;

  v_profile_found := FOUND;

  IF NOT v_profile_found AND NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;

  IF v_profile_found
     AND v_target_profile.role = 'admin'
     AND NOT EXISTS (
       SELECT 1
       FROM public.profiles
       WHERE role = 'admin'
         AND id <> p_user_id
     ) THEN
    RAISE EXCEPTION 'Impossible de supprimer le dernier admin';
  END IF;

  DELETE FROM public.group_apply
  WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_group_apply_deleted = ROW_COUNT;

  DELETE FROM public.group_members
  WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_group_members_deleted = ROW_COUNT;

  UPDATE public.groups
  SET created_by = NULL
  WHERE created_by = p_user_id;
  GET DIAGNOSTICS v_groups_unowned = ROW_COUNT;

  DELETE FROM public.bets
  WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_bets_deleted = ROW_COUNT;

  DELETE FROM public.competition_profiles
  WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_competition_profiles_deleted = ROW_COUNT;

  DELETE FROM public.profiles
  WHERE id = p_user_id;

  DELETE FROM auth.users
  WHERE id = p_user_id;
  GET DIAGNOSTICS v_auth_user_deleted = ROW_COUNT;

  RETURN json_build_object(
    'user_id', p_user_id,
    'display_name', v_target_profile.display_name,
    'email', v_target_profile.email,
    'auth_user_deleted', v_auth_user_deleted,
    'bets_deleted', v_bets_deleted,
    'competition_profiles_deleted', v_competition_profiles_deleted,
    'group_apply_deleted', v_group_apply_deleted,
    'group_members_deleted', v_group_members_deleted,
    'groups_unowned', v_groups_unowned
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
