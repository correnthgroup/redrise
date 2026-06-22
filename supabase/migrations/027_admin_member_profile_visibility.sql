-- Migration 027: allow organization Admin users to view member rows and linked profiles.

DROP POLICY IF EXISTS "Owners and members can view team members" ON public.team_members;
CREATE POLICY "Owners members and admins can view team members"
  ON public.team_members FOR SELECT
  USING (
    auth.uid() = owner_user_id
    OR auth.uid() = member_user_id
    OR public.is_settings_admin_for(owner_user_id)
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
      SELECT 1 FROM public.team_members admin_tm
      JOIN public.team_members member_tm
        ON member_tm.owner_user_id = admin_tm.owner_user_id
      WHERE admin_tm.member_user_id = auth.uid()
        AND admin_tm.status = 'active'
        AND admin_tm.function = 'Admin'
        AND member_tm.member_user_id = profiles.id
    )
  );
