-- Migration 024: in-app notifications for existing-user team invites

CREATE TABLE IF NOT EXISTS team_invite_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE team_invite_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipients can view team invite notifications" ON team_invite_notifications;
CREATE POLICY "Recipients can view team invite notifications"
  ON team_invite_notifications FOR SELECT
  USING (auth.uid() = recipient_user_id);

DROP POLICY IF EXISTS "Recipients can update team invite notifications" ON team_invite_notifications;
CREATE POLICY "Recipients can update team invite notifications"
  ON team_invite_notifications FOR UPDATE
  USING (auth.uid() = recipient_user_id)
  WITH CHECK (auth.uid() = recipient_user_id);

DROP TRIGGER IF EXISTS touch_team_invite_notifications_updated_at ON team_invite_notifications;
CREATE TRIGGER touch_team_invite_notifications_updated_at
  BEFORE UPDATE ON team_invite_notifications
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_team_invite_notifications_recipient_status
  ON team_invite_notifications(recipient_user_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_invite_notifications_pending_member
  ON team_invite_notifications(team_member_id)
  WHERE status = 'pending';

CREATE OR REPLACE FUNCTION respond_to_team_invite(notification_id uuid, invite_response text)
RETURNS boolean AS $$
DECLARE
  invite_row team_invite_notifications%ROWTYPE;
BEGIN
  SELECT * INTO invite_row
  FROM team_invite_notifications
  WHERE id = notification_id
    AND recipient_user_id = auth.uid()
    AND status = 'pending';

  IF invite_row.id IS NULL THEN
    RETURN false;
  END IF;

  IF invite_response = 'accepted' THEN
    UPDATE team_invite_notifications
    SET status = 'accepted', updated_at = now()
    WHERE id = invite_row.id;

    UPDATE team_members
    SET status = 'active', updated_at = now()
    WHERE id = invite_row.team_member_id
      AND member_user_id = invite_row.recipient_user_id;

    RETURN true;
  END IF;

  IF invite_response = 'declined' THEN
    UPDATE team_invite_notifications
    SET status = 'declined', updated_at = now()
    WHERE id = invite_row.id;

    DELETE FROM team_members
    WHERE id = invite_row.team_member_id
      AND member_user_id = invite_row.recipient_user_id;

    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION respond_to_team_invite(uuid, text) TO authenticated;
