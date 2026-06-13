-- Migration 016: connect invited team member rows when invited users sign up

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

  UPDATE team_members
  SET member_user_id = NEW.id,
      status = 'active',
      joined_at = now(),
      updated_at = now()
  WHERE lower(invite_email) = lower(COALESCE(NEW.email, ''))
    AND member_user_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
