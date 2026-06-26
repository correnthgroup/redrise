-- Migration 041: safe integration setup visibility by Settings role

CREATE OR REPLACE FUNCTION public.load_integration_setup_overview(target_owner_user_id uuid DEFAULT NULL)
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
  can_view_details boolean
) AS $$
DECLARE
  requested_owner uuid := COALESCE(target_owner_user_id, auth.uid());
  can_view_org boolean := public.is_team_manager_for(requested_owner);
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
    (i.user_id = auth.uid() OR can_admin) AS can_view_details
  FROM public.integrations i
  LEFT JOIN public.team_members tm
    ON tm.owner_user_id = requested_owner
   AND tm.member_user_id = i.user_id
   AND tm.status = 'active'
  LEFT JOIN public.profiles p
    ON p.id = i.user_id
  WHERE i.user_id = auth.uid()
     OR (can_view_org AND tm.id IS NOT NULL)
  ORDER BY i.status = 'active' DESC, i.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

GRANT EXECUTE ON FUNCTION public.load_integration_setup_overview(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.load_integration_setup_detail(uuid, text) TO authenticated;
