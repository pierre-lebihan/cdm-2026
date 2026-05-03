-- ================================================================
-- Fix: handle_new_profile() ran SECURITY DEFINER with no search_path,
-- so when triggered during a new auth.users insert (which sets the
-- search path to auth, pg_temp), unqualified references to
-- `competition_profiles` and `competitions` failed with
-- `relation "competition_profiles" does not exist`. This blocked
-- every brand-new signup (magic link / Google OAuth alike).
--
-- Schema-qualify the references and pin search_path = public.
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.competition_profiles (competition_id, user_id, score)
  SELECT c.id, NEW.id, 0
  FROM public.competitions c
  WHERE c.active = true
  ON CONFLICT (competition_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
