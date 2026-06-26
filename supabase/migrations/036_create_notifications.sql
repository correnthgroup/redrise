-- Migration 036: operational notifications foundation
-- Uses owner_user_id as the current organization context until a dedicated
-- organizations table is introduced.

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id text REFERENCES workspaces(id) ON DELETE SET NULL,
  flow_id text REFERENCES flows(id) ON DELETE SET NULL,
  task_id text REFERENCES tasks(id) ON DELETE SET NULL,
  execution_id text REFERENCES task_executions(id) ON DELETE SET NULL,
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  details_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_status text NOT NULL DEFAULT 'unread'
    CHECK (read_status IN ('unread', 'read')),
  action_status text NOT NULL DEFAULT 'pending'
    CHECK (action_status IN ('pending', 'resolved', 'archived')),
  primary_action_type text,
  primary_action_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  resolved_at timestamptz
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipients can view notifications" ON notifications;
CREATE POLICY "Recipients can view notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_user_id);

DROP POLICY IF EXISTS "Recipients can update notifications" ON notifications;
CREATE POLICY "Recipients can update notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_user_id)
  WITH CHECK (auth.uid() = recipient_user_id);

DROP POLICY IF EXISTS "Users can create own notifications" ON notifications;
CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = recipient_user_id OR auth.uid() = owner_user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status
  ON notifications(recipient_user_id, action_status, read_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_workspace_pending
  ON notifications(workspace_id, action_status, created_at DESC)
  WHERE workspace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_owner_created
  ON notifications(owner_user_id, created_at DESC);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
