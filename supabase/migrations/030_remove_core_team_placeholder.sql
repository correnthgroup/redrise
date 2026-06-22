-- Migration 030: stop using Core as the default self-member team placeholder.

UPDATE public.team_members
SET team = '',
    updated_at = now()
WHERE owner_user_id = member_user_id
  AND lower(coalesce(team, '')) = 'core';

CREATE OR REPLACE FUNCTION public.create_profile_for_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata_first text;
  metadata_middle text;
  metadata_last text;
  metadata_name text;
  metadata_invite_token text;
  metadata_invite_token_hash text;
  accepted_invite public.external_member_invites%ROWTYPE;
  first_part text;
  last_part text;
  full_username text;
BEGIN
  metadata_first := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '');
  metadata_middle := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'middle_name', '')), '');
  metadata_last := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'last_name', '')), '');
  metadata_name := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '');
  metadata_invite_token := nullif(trim(COALESCE(NEW.raw_user_meta_data->>'invite_token', '')), '');

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
    VALUES (NEW.id, NEW.id, COALESCE(NEW.email, ''), 'admin', 'Admin', '', 'active');
  END IF;

  IF metadata_invite_token IS NOT NULL THEN
    metadata_invite_token_hash := encode(extensions.digest(metadata_invite_token, 'sha256'), 'hex');

    SELECT * INTO accepted_invite
    FROM public.external_member_invites
    WHERE token_hash = metadata_invite_token_hash
      AND lower(invite_email) = lower(COALESCE(NEW.email, ''))
      AND status = 'pending'
      AND expires_at > now()
    LIMIT 1;

    IF accepted_invite.id IS NOT NULL THEN
      UPDATE public.team_members
      SET member_user_id = NEW.id,
          status = 'active',
          joined_at = now(),
          updated_at = now()
      WHERE id = accepted_invite.team_member_id
        AND lower(invite_email) = lower(COALESCE(NEW.email, ''));

      UPDATE public.external_member_invites
      SET status = 'accepted',
          accepted_user_id = NEW.id,
          accepted_at = now(),
          updated_at = now()
      WHERE id = accepted_invite.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
