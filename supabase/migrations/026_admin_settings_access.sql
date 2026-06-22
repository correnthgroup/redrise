-- Migration 026: Admin-only settings access for B2B team administration.

CREATE OR REPLACE FUNCTION public.is_settings_admin_for(target_owner_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.owner_user_id = target_owner_user_id
      AND tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.function = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_settings_admin_for(uuid) TO authenticated;

UPDATE public.team_members
SET role = 'admin',
    function = 'Admin',
    updated_at = now()
WHERE owner_user_id = member_user_id
  AND status = 'active'
  AND function = 'Owner';

CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata_first text;
  metadata_middle text;
  metadata_last text;
  metadata_name text;
  first_part text;
  last_part text;
  full_username text;
BEGIN
  metadata_first := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '');
  metadata_middle := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'middle_name', '')), '');
  metadata_last := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'last_name', '')), '');
  metadata_name := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');

  first_part := COALESCE(metadata_first, nullif(split_part(COALESCE(metadata_name, ''), ' ', 1), ''), split_part(COALESCE(NEW.email, 'user'), '@', 1), 'User');
  last_part := COALESCE(metadata_last, nullif(trim(replace(COALESCE(metadata_name, ''), COALESCE(first_part, ''), '')), ''), '');
  full_username := nullif(trim(concat_ws(' ', first_part, metadata_middle, last_part)), '');

  INSERT INTO public.profiles (id, first_name, middle_name, last_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(first_part, 'User'),
    COALESCE(metadata_middle, ''),
    COALESCE(last_part, ''),
    COALESCE(full_username, split_part(COALESCE(NEW.email, 'user'), '@', 1), 'User'),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET first_name = EXCLUDED.first_name,
      middle_name = COALESCE(nullif(public.profiles.middle_name, ''), EXCLUDED.middle_name),
      last_name = COALESCE(nullif(public.profiles.last_name, ''), EXCLUDED.last_name),
      username = COALESCE(nullif(public.profiles.username, ''), EXCLUDED.username),
      email = EXCLUDED.email;

  IF NOT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE owner_user_id = NEW.id
      AND member_user_id = NEW.id
  ) THEN
    INSERT INTO public.team_members (owner_user_id, member_user_id, invite_email, role, function, team, status)
    VALUES (NEW.id, NEW.id, COALESCE(NEW.email, ''), 'admin', 'Admin', 'Core', 'active');
  END IF;

  UPDATE public.team_members
  SET member_user_id = NEW.id,
      status = 'active',
      joined_at = now(),
      updated_at = now()
  WHERE lower(invite_email) = lower(COALESCE(NEW.email, ''))
    AND member_user_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Owners can insert team members" ON public.team_members;
CREATE POLICY "Admins can insert team members"
  ON public.team_members FOR INSERT
  WITH CHECK (public.is_settings_admin_for(owner_user_id));

DROP POLICY IF EXISTS "Owners can update team members" ON public.team_members;
CREATE POLICY "Admins can update team members"
  ON public.team_members FOR UPDATE
  USING (public.is_settings_admin_for(owner_user_id))
  WITH CHECK (public.is_settings_admin_for(owner_user_id));

DROP POLICY IF EXISTS "Owners can delete team members" ON public.team_members;
CREATE POLICY "Admins can delete team members"
  ON public.team_members FOR DELETE
  USING (public.is_settings_admin_for(owner_user_id));

DROP POLICY IF EXISTS "Owners can manage teams" ON public.teams;
CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  USING (public.is_settings_admin_for(owner_user_id))
  WITH CHECK (public.is_settings_admin_for(owner_user_id));

DROP POLICY IF EXISTS "Owners can manage team assignments" ON public.team_assignments;
CREATE POLICY "Admins can manage team assignments"
  ON public.team_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_assignments.team_id
        AND public.is_settings_admin_for(teams.owner_user_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_assignments.team_id
        AND public.is_settings_admin_for(teams.owner_user_id)
    )
  );

DROP POLICY IF EXISTS "Users can view own api keys" ON public.api_keys;
CREATE POLICY "Admins can view api keys"
  ON public.api_keys FOR SELECT
  USING (public.is_settings_admin_for(user_id));

DROP POLICY IF EXISTS "Users can insert own api keys" ON public.api_keys;
CREATE POLICY "Admins can insert api keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (public.is_settings_admin_for(user_id));

DROP POLICY IF EXISTS "Users can update own api keys" ON public.api_keys;
CREATE POLICY "Admins can update api keys"
  ON public.api_keys FOR UPDATE
  USING (public.is_settings_admin_for(user_id))
  WITH CHECK (public.is_settings_admin_for(user_id));

DROP POLICY IF EXISTS "Users can delete own api keys" ON public.api_keys;
CREATE POLICY "Admins can delete api keys"
  ON public.api_keys FOR DELETE
  USING (public.is_settings_admin_for(user_id));
