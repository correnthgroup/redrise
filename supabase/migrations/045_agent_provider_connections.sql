-- Migration 045: Agent provider connections and organization-scoped usage

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS provider_connection_id text,
  ADD COLUMN IF NOT EXISTS provider_auth_method text NOT NULL DEFAULT 'api',
  ADD COLUMN IF NOT EXISTS provider_connection_status text NOT NULL DEFAULT 'untested'
    CHECK (provider_connection_status IN ('untested', 'connected', 'error'));

CREATE INDEX IF NOT EXISTS idx_agents_provider_connection_id ON public.agents(provider_connection_id);
CREATE INDEX IF NOT EXISTS idx_agents_provider_auth_method ON public.agents(provider_auth_method);
CREATE INDEX IF NOT EXISTS idx_integrations_agent_provider ON public.integrations(user_id, category) WHERE category = 'agent_provider';

CREATE OR REPLACE FUNCTION public.can_use_org_agents(target_owner_user_id uuid)
RETURNS boolean AS $$
BEGIN
  IF target_owner_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF auth.uid() = target_owner_user_id THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.owner_user_id = target_owner_user_id
      AND tm.member_user_id = auth.uid()
      AND tm.status = 'active'
      AND COALESCE(tm.function, '') <> 'Viewer'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.can_use_org_agents(uuid) TO authenticated;

DROP POLICY IF EXISTS "Role scoped users can view agents" ON public.agents;
CREATE POLICY "Org non viewer users can view agents"
  ON public.agents FOR SELECT
  USING (public.can_use_org_agents(user_id));

DROP POLICY IF EXISTS "Role scoped users can insert agents" ON public.agents;
CREATE POLICY "Admins can insert org agents"
  ON public.agents FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Role scoped users can update agents" ON public.agents;
CREATE POLICY "Admins can update org agents"
  ON public.agents FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Role scoped users can delete agents" ON public.agents;
CREATE POLICY "Admins can delete org agents"
  ON public.agents FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Admins can view org agent provider integrations" ON public.integrations;
CREATE POLICY "Admins can view org agent provider integrations"
  ON public.integrations FOR SELECT
  USING (category = 'agent_provider' AND public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Admins can insert org agent provider integrations" ON public.integrations;
CREATE POLICY "Admins can insert org agent provider integrations"
  ON public.integrations FOR INSERT
  WITH CHECK (category = 'agent_provider' AND public.can_manage_user_scoped_data(user_id));
