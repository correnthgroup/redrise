-- Migration 043: Settings PRD3 management helpers

DROP FUNCTION IF EXISTS public.load_integration_setup_detail(uuid, text);

CREATE OR REPLACE FUNCTION public.load_integration_setup_detail(target_owner_user_id uuid, integration_id text)
RETURNS TABLE (
  id text,
  user_id uuid,
  user_email text,
  user_name text,
  name text,
  provider text,
  category text,
  endpoint text,
  status text,
  last_tested_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  can_manage boolean,
  safe_config jsonb
) AS $$
DECLARE
  requested_owner uuid := COALESCE(target_owner_user_id, auth.uid());
  can_admin boolean := public.is_settings_admin_for(requested_owner);
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.user_id,
    COALESCE(p.email, tm.invite_email, '') AS user_email,
    COALESCE(NULLIF(trim(concat_ws(' ', p.first_name, p.last_name)), ''), p.username, p.email, tm.invite_email, i.user_id::text) AS user_name,
    i.name,
    i.provider,
    i.category,
    i.endpoint,
    i.status,
    i.last_tested_at,
    i.created_at,
    i.updated_at,
    (i.user_id = auth.uid() OR can_admin) AS can_manage,
    jsonb_strip_nulls(jsonb_build_object(
      'secret_present', CASE
        WHEN i.config ? 'token' THEN true
        WHEN lower(COALESCE(i.config->>'secret_present', 'false')) = 'true' THEN true
        ELSE false
      END,
      'paired_at', i.config->>'paired_at',
      'config_keys', COALESCE((SELECT jsonb_agg(config_key.key) FROM jsonb_object_keys(i.config - 'token') AS config_key(key)), '[]'::jsonb)
    )) AS safe_config
  FROM public.integrations i
  LEFT JOIN public.team_members tm
    ON tm.owner_user_id = requested_owner
   AND tm.member_user_id = i.user_id
   AND tm.status = 'active'
  LEFT JOIN public.profiles p
    ON p.id = i.user_id
  WHERE i.id = integration_id
    AND (i.user_id = auth.uid() OR (can_admin AND tm.id IS NOT NULL));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_integration_setup_status(target_owner_user_id uuid, integration_id text, next_status text)
RETURNS boolean AS $$
DECLARE
  requested_owner uuid := COALESCE(target_owner_user_id, auth.uid());
  changed_provider text;
BEGIN
  IF next_status NOT IN ('active', 'inactive', 'error') THEN
    RAISE EXCEPTION 'Invalid integration status';
  END IF;

  UPDATE public.integrations i
  SET status = next_status,
      updated_at = now()
  WHERE i.id = integration_id
    AND (
      i.user_id = auth.uid()
      OR (
        public.is_settings_admin_for(requested_owner)
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.owner_user_id = requested_owner
            AND tm.member_user_id = i.user_id
            AND tm.status = 'active'
        )
      )
    )
  RETURNING i.provider INTO changed_provider;

  IF FOUND THEN
    INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, entity_name, details)
    VALUES ('al' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10), auth.uid(), 'update_status', 'integration', integration_id, changed_provider, jsonb_build_object('status', next_status));
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.delete_integration_setup(target_owner_user_id uuid, integration_id text)
RETURNS boolean AS $$
DECLARE
  requested_owner uuid := COALESCE(target_owner_user_id, auth.uid());
  deleted_provider text;
BEGIN
  DELETE FROM public.integrations i
  WHERE i.id = integration_id
    AND (
      i.user_id = auth.uid()
      OR (
        public.is_settings_admin_for(requested_owner)
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.owner_user_id = requested_owner
            AND tm.member_user_id = i.user_id
            AND tm.status = 'active'
        )
      )
    )
  RETURNING i.provider INTO deleted_provider;

  IF FOUND THEN
    INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, entity_name, details)
    VALUES ('al' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10), auth.uid(), 'delete', 'integration', integration_id, deleted_provider, jsonb_build_object('source', 'settings_integration_management'));
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.rotate_integration_setup_secret(target_owner_user_id uuid, integration_id text, next_token text)
RETURNS boolean AS $$
DECLARE
  requested_owner uuid := COALESCE(target_owner_user_id, auth.uid());
  changed_provider text;
BEGIN
  IF nullif(trim(next_token), '') IS NULL THEN
    RAISE EXCEPTION 'Secret token is required';
  END IF;

  UPDATE public.integrations i
  SET config = jsonb_set(
        jsonb_set(COALESCE(i.config, '{}'::jsonb), '{token}', to_jsonb(next_token), true),
        '{secret_present}', 'true'::jsonb, true
      ) || jsonb_build_object('paired_at', now()::text),
      updated_at = now()
  WHERE i.id = integration_id
    AND (
      i.user_id = auth.uid()
      OR (
        public.is_settings_admin_for(requested_owner)
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.owner_user_id = requested_owner
            AND tm.member_user_id = i.user_id
            AND tm.status = 'active'
        )
      )
    )
  RETURNING i.provider INTO changed_provider;

  IF FOUND THEN
    INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, entity_name, details)
    VALUES ('al' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10), auth.uid(), 'rotate_secret', 'integration', integration_id, changed_provider, jsonb_build_object('secret_present', true));
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.update_integration_setup_status(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_integration_setup(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_integration_setup_secret(uuid, text, text) TO authenticated;
