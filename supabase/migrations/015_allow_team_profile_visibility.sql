-- Migration 015: allow team owners/members to read profiles linked by team_members

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile or team profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.owner_user_id = auth.uid()
      AND tm.member_user_id = profiles.id
    )
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.member_user_id = auth.uid()
      AND tm.owner_user_id = profiles.id
    )
  );
