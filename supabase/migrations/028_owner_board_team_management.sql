-- Migration 028: Owner and Board can manage teams and view members, but not invite/edit members.

CREATE OR REPLACE FUNCTION public.is_team_manager_for(target_owner_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.owner_user_id = target_owner_user_id
      AND tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.function IN ('Admin', 'Owner', 'Board')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_team_manager_for(uuid) TO authenticated;

DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
CREATE POLICY "Team managers can manage teams"
  ON public.teams FOR ALL
  USING (public.is_team_manager_for(owner_user_id))
  WITH CHECK (public.is_team_manager_for(owner_user_id));

DROP POLICY IF EXISTS "Admins can manage team assignments" ON public.team_assignments;
CREATE POLICY "Team managers can manage team assignments"
  ON public.team_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_assignments.team_id
        AND public.is_team_manager_for(teams.owner_user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_assignments.team_id
        AND public.is_team_manager_for(teams.owner_user_id)
    )
  );

DROP POLICY IF EXISTS "Owners members and admins can view team members" ON public.team_members;
CREATE POLICY "Owners members and team managers can view team members"
  ON public.team_members FOR SELECT
  USING (
    auth.uid() = owner_user_id
    OR auth.uid() = member_user_id
    OR public.is_team_manager_for(owner_user_id)
  );

DROP POLICY IF EXISTS "Users can view own profile or team profiles" ON public.profiles;
CREATE POLICY "Users can view own profile or team profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.owner_user_id = auth.uid()
        AND tm.member_user_id = profiles.id
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.member_user_id = auth.uid()
        AND tm.owner_user_id = profiles.id
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members manager_tm
      JOIN public.team_members member_tm
        ON member_tm.owner_user_id = manager_tm.owner_user_id
      WHERE manager_tm.member_user_id = auth.uid()
        AND manager_tm.status = 'active'
        AND manager_tm.function IN ('Admin', 'Owner', 'Board')
        AND member_tm.member_user_id = profiles.id
    )
  );
