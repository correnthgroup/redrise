-- Migration 014: real profile, active session, and team member persistence

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  username text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  gender text NOT NULL DEFAULT '',
  birth_date date,
  language text NOT NULL DEFAULT 'en-US' CHECK (language IN ('en-US', 'pt-BR')),
  location text NOT NULL DEFAULT '',
  timezone text NOT NULL DEFAULT 'UTC',
  phone text NOT NULL DEFAULT '',
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  browser text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT 'Current location',
  ip text NOT NULL DEFAULT 'Current IP',
  remembered boolean NOT NULL DEFAULT true,
  current boolean NOT NULL DEFAULT true,
  last_active_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own active sessions" ON active_sessions;
CREATE POLICY "Users can manage own active sessions"
  ON active_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_active_at ON active_sessions(last_active_at DESC);

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  function text NOT NULL DEFAULT '',
  team text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners and members can view team members" ON team_members;
CREATE POLICY "Owners and members can view team members"
  ON team_members FOR SELECT
  USING (auth.uid() = owner_user_id OR auth.uid() = member_user_id);

DROP POLICY IF EXISTS "Owners can insert team members" ON team_members;
CREATE POLICY "Owners can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Owners can update team members" ON team_members;
CREATE POLICY "Owners can update team members"
  ON team_members FOR UPDATE
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Owners can delete team members" ON team_members;
CREATE POLICY "Owners can delete team members"
  ON team_members FOR DELETE
  USING (auth.uid() = owner_user_id);

CREATE INDEX IF NOT EXISTS idx_team_members_owner_user_id ON team_members(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member_user_id ON team_members(member_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique_member_user
  ON team_members(owner_user_id, member_user_id)
  WHERE member_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique_invite_email
  ON team_members(owner_user_id, lower(invite_email))
  WHERE member_user_id IS NULL;

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS touch_profiles_updated_at ON profiles;
CREATE TRIGGER touch_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS touch_team_members_updated_at ON team_members;
CREATE TRIGGER touch_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE OR REPLACE FUNCTION create_profile_for_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata_name text;
  first_part text;
BEGIN
  metadata_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User');
  first_part := split_part(metadata_name, ' ', 1);

  INSERT INTO profiles (id, first_name, last_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(first_part, 'User'),
    trim(replace(metadata_name, COALESCE(first_part, ''), '')),
    lower(regexp_replace(COALESCE(first_part, split_part(NEW.email, '@', 1), 'user'), '[^a-zA-Z0-9.]', '', 'g')),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO team_members (owner_user_id, member_user_id, invite_email, role, function, team, status)
  VALUES (NEW.id, NEW.id, COALESCE(NEW.email, ''), 'owner', 'Owner', 'Core', 'active')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_auth_user();
