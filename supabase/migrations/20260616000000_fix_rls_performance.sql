-- ================================================================
-- Fix RLS performance issues:
-- 1. Wrap auth.uid() / is_admin() in (select ...) to prevent
--    per-row re-evaluation (initplan optimization)
-- 2. Eliminate duplicate permissive policies by merging admin_all
--    into individual policies (avoids evaluating 2 policies per query)
-- ================================================================

BEGIN;

-- ================================================================
-- Fix is_admin() to use initplan internally
-- ================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (select auth.uid()) AND role = 'admin'
  );
$$;

-- ================================================================
-- PROFILES
-- Drop admin_all (was overlapping with select/insert/update policies)
-- Merge admin access into individual policies with (select ...) wrapper
-- ================================================================
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE TO authenticated
  USING ((select is_admin()));

-- ================================================================
-- BETS
-- Drop admin_all, merge admin into insert/update
-- ================================================================
DROP POLICY IF EXISTS "bets_admin_all" ON bets;
DROP POLICY IF EXISTS "bets_insert_own" ON bets;
DROP POLICY IF EXISTS "bets_update_own" ON bets;

CREATE POLICY "bets_insert_own" ON bets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "bets_update_own" ON bets
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "bets_delete_admin" ON bets
  FOR DELETE TO authenticated
  USING ((select is_admin()));

-- ================================================================
-- COMPETITION_PROFILES
-- Drop admin_all, merge admin into insert/update
-- ================================================================
DROP POLICY IF EXISTS "competition_profiles_admin_all" ON competition_profiles;
DROP POLICY IF EXISTS "competition_profiles_insert_own" ON competition_profiles;
DROP POLICY IF EXISTS "competition_profiles_update_own" ON competition_profiles;

CREATE POLICY "competition_profiles_insert_own" ON competition_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "competition_profiles_update_own" ON competition_profiles
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "competition_profiles_delete_admin" ON competition_profiles
  FOR DELETE TO authenticated
  USING ((select is_admin()));

-- ================================================================
-- GROUPS
-- No admin_all existed, just fix initplan on existing policies
-- ================================================================
DROP POLICY IF EXISTS "groups_insert_own" ON groups;
DROP POLICY IF EXISTS "groups_update_creator_or_admin" ON groups;
DROP POLICY IF EXISTS "groups_delete_creator_or_admin" ON groups;

CREATE POLICY "groups_insert_own" ON groups
  FOR INSERT TO authenticated
  WITH CHECK (created_by = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "groups_update_creator_or_admin" ON groups
  FOR UPDATE TO authenticated
  USING (created_by = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "groups_delete_creator_or_admin" ON groups
  FOR DELETE TO authenticated
  USING (created_by = (select auth.uid()) OR (select is_admin()));

-- ================================================================
-- GROUP_APPLY
-- Drop admin_all, merge admin into insert/update
-- ================================================================
DROP POLICY IF EXISTS "group_apply_admin_all" ON group_apply;
DROP POLICY IF EXISTS "group_apply_insert_own" ON group_apply;
DROP POLICY IF EXISTS "group_apply_update_own" ON group_apply;

CREATE POLICY "group_apply_insert_own" ON group_apply
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "group_apply_update_own" ON group_apply
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR (select is_admin()));

CREATE POLICY "group_apply_delete_admin" ON group_apply
  FOR DELETE TO authenticated
  USING ((select is_admin()));

-- ================================================================
-- TEAMS (reference table)
-- Replace FOR ALL with separate write policies to eliminate SELECT overlap
-- ================================================================
DROP POLICY IF EXISTS "teams_admin_all" ON teams;

CREATE POLICY "teams_insert_admin" ON teams
  FOR INSERT TO authenticated
  WITH CHECK ((select is_admin()));

CREATE POLICY "teams_update_admin" ON teams
  FOR UPDATE TO authenticated
  USING ((select is_admin()));

CREATE POLICY "teams_delete_admin" ON teams
  FOR DELETE TO authenticated
  USING ((select is_admin()));

-- ================================================================
-- COMPETITIONS (reference table)
-- Replace FOR ALL with separate write policies
-- ================================================================
DROP POLICY IF EXISTS "competitions_admin_all" ON competitions;

CREATE POLICY "competitions_insert_admin" ON competitions
  FOR INSERT TO authenticated
  WITH CHECK ((select is_admin()));

CREATE POLICY "competitions_update_admin" ON competitions
  FOR UPDATE TO authenticated
  USING ((select is_admin()));

CREATE POLICY "competitions_delete_admin" ON competitions
  FOR DELETE TO authenticated
  USING ((select is_admin()));

-- ================================================================
-- MATCHES
-- Replace FOR ALL with separate write policies
-- Fix matches_select_visible_or_admin to use initplan
-- ================================================================
DROP POLICY IF EXISTS "matches_admin_all" ON matches;
DROP POLICY IF EXISTS "matches_select_visible_or_admin" ON matches;

CREATE POLICY "matches_select_visible_or_admin" ON matches
  FOR SELECT TO anon, authenticated
  USING (COALESCE(visible_to_users, true) OR (select is_admin()));

CREATE POLICY "matches_insert_admin" ON matches
  FOR INSERT TO authenticated
  WITH CHECK ((select is_admin()));

CREATE POLICY "matches_update_admin" ON matches
  FOR UPDATE TO authenticated
  USING ((select is_admin()));

CREATE POLICY "matches_delete_admin" ON matches
  FOR DELETE TO authenticated
  USING ((select is_admin()));

COMMIT;
