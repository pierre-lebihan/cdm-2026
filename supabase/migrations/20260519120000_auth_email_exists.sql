CREATE OR REPLACE FUNCTION public.auth_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT CASE
    WHEN NULLIF(LOWER(TRIM(p_email)), '') IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM auth.users
      WHERE LOWER(email) = LOWER(TRIM(p_email))
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.auth_email_exists(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_email_exists(TEXT) TO anon, authenticated;
