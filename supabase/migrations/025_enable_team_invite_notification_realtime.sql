-- Migration 025: realtime delivery for in-app team invite notifications

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'team_invite_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.team_invite_notifications;
  END IF;
END;
$$;
