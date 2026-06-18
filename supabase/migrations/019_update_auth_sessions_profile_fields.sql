-- Migration 019: update auth profile/session fields for Atualizacao#3

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS middle_name text NOT NULL DEFAULT '';

ALTER TABLE public.active_sessions
  ADD COLUMN IF NOT EXISTS os text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS device text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'password',
  ADD COLUMN IF NOT EXISTS supabase_session_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_active_sessions_supabase_session_id
  ON public.active_sessions(user_id, supabase_session_id)
  WHERE supabase_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_active_sessions_unique_supabase_session
  ON public.active_sessions(user_id, supabase_session_id)
  WHERE supabase_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL AND username <> '';

DROP TRIGGER IF EXISTS touch_active_sessions_updated_at ON public.active_sessions;
CREATE TRIGGER touch_active_sessions_updated_at
  BEFORE UPDATE ON public.active_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata_first text;
  metadata_middle text;
  metadata_last text;
  metadata_name text;
  first_part text;
  last_part text;
  username_base text;
BEGIN
  metadata_first := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '');
  metadata_middle := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'middle_name', '')), '');
  metadata_last := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'last_name', '')), '');
  metadata_name := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');

  first_part := COALESCE(metadata_first, nullif(split_part(COALESCE(metadata_name, ''), ' ', 1), ''), split_part(COALESCE(NEW.email, 'user'), '@', 1), 'User');
  last_part := COALESCE(metadata_last, nullif(trim(replace(COALESCE(metadata_name, ''), COALESCE(first_part, ''), '')), ''), '');
  username_base := lower(regexp_replace(COALESCE(first_part, split_part(COALESCE(NEW.email, 'user'), '@', 1), 'user'), '[^a-zA-Z0-9]+', '-', 'g'));
  username_base := trim(both '-' from username_base);

  INSERT INTO public.profiles (id, first_name, middle_name, last_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(first_part, 'User'),
    COALESCE(metadata_middle, ''),
    COALESCE(last_part, ''),
    COALESCE(nullif(username_base, ''), 'user') || '-' || left(NEW.id::text, 6),
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
    VALUES (NEW.id, NEW.id, COALESCE(NEW.email, ''), 'owner', 'Owner', 'Core', 'active');
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
