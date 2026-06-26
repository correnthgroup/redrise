-- Migration 042: backend/RLS permission enforcement for user-scoped operational data

CREATE OR REPLACE FUNCTION public.can_view_user_scoped_data(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.team_members manager_tm
    JOIN public.team_members target_tm
      ON target_tm.owner_user_id = manager_tm.owner_user_id
    WHERE manager_tm.member_user_id = auth.uid()
      AND manager_tm.status = 'active'
      AND manager_tm.function IN ('Admin', 'Owner', 'Board')
      AND target_tm.status = 'active'
      AND target_tm.member_user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_manage_user_scoped_data(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  IF auth.uid() = target_user_id THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.team_members admin_tm
    JOIN public.team_members target_tm
      ON target_tm.owner_user_id = admin_tm.owner_user_id
    WHERE admin_tm.member_user_id = auth.uid()
      AND admin_tm.status = 'active'
      AND admin_tm.function = 'Admin'
      AND target_tm.status = 'active'
      AND target_tm.member_user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.can_view_user_scoped_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_user_scoped_data(uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can read own workspaces" ON public.workspaces;
CREATE POLICY "Role scoped users can read workspaces"
  ON public.workspaces FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own workspaces" ON public.workspaces;
CREATE POLICY "Role scoped users can insert workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can update own workspaces" ON public.workspaces;
CREATE POLICY "Role scoped users can update workspaces"
  ON public.workspaces FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can delete own workspaces" ON public.workspaces;
CREATE POLICY "Role scoped users can delete workspaces"
  ON public.workspaces FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can read own flows" ON public.flows;
CREATE POLICY "Role scoped users can read flows"
  ON public.flows FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own flows" ON public.flows;
CREATE POLICY "Role scoped users can insert flows"
  ON public.flows FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can update own flows" ON public.flows;
CREATE POLICY "Role scoped users can update flows"
  ON public.flows FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can delete own flows" ON public.flows;
CREATE POLICY "Role scoped users can delete flows"
  ON public.flows FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can read own tasks" ON public.tasks;
CREATE POLICY "Role scoped users can read tasks"
  ON public.tasks FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Role scoped users can insert tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Role scoped users can update tasks"
  ON public.tasks FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Role scoped users can delete tasks"
  ON public.tasks FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can view own agents" ON public.agents;
CREATE POLICY "Role scoped users can view agents"
  ON public.agents FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own agents" ON public.agents;
CREATE POLICY "Role scoped users can insert agents"
  ON public.agents FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can update own agents" ON public.agents;
CREATE POLICY "Role scoped users can update agents"
  ON public.agents FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can delete own agents" ON public.agents;
CREATE POLICY "Role scoped users can delete agents"
  ON public.agents FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can read own flow_cards" ON public.flow_cards;
CREATE POLICY "Role scoped users can read flow_cards"
  ON public.flow_cards FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_view_user_scoped_data(f.user_id)));

DROP POLICY IF EXISTS "Users can insert own flow_cards" ON public.flow_cards;
CREATE POLICY "Role scoped users can insert flow_cards"
  ON public.flow_cards FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_manage_user_scoped_data(f.user_id)));

DROP POLICY IF EXISTS "Users can update own flow_cards" ON public.flow_cards;
CREATE POLICY "Role scoped users can update flow_cards"
  ON public.flow_cards FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_manage_user_scoped_data(f.user_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_manage_user_scoped_data(f.user_id)));

DROP POLICY IF EXISTS "Users can delete own flow_cards" ON public.flow_cards;
CREATE POLICY "Role scoped users can delete flow_cards"
  ON public.flow_cards FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_manage_user_scoped_data(f.user_id)));

DROP POLICY IF EXISTS "Users can read own flow_edges" ON public.flow_edges;
CREATE POLICY "Role scoped users can read flow_edges"
  ON public.flow_edges FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_view_user_scoped_data(f.user_id)));

DROP POLICY IF EXISTS "Users can insert own flow_edges" ON public.flow_edges;
CREATE POLICY "Role scoped users can insert flow_edges"
  ON public.flow_edges FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_manage_user_scoped_data(f.user_id)));

DROP POLICY IF EXISTS "Users can update own flow_edges" ON public.flow_edges;
CREATE POLICY "Role scoped users can update flow_edges"
  ON public.flow_edges FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_manage_user_scoped_data(f.user_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_manage_user_scoped_data(f.user_id)));

DROP POLICY IF EXISTS "Users can delete own flow_edges" ON public.flow_edges;
CREATE POLICY "Role scoped users can delete flow_edges"
  ON public.flow_edges FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.flows f WHERE f.id = flow_id AND public.can_manage_user_scoped_data(f.user_id)));

DROP POLICY IF EXISTS "Users can view own executions" ON public.task_executions;
CREATE POLICY "Role scoped users can view task executions"
  ON public.task_executions FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own executions" ON public.task_executions;
CREATE POLICY "Role scoped users can insert task executions"
  ON public.task_executions FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can update own executions" ON public.task_executions;
CREATE POLICY "Role scoped users can update task executions"
  ON public.task_executions FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can delete own executions" ON public.task_executions;
CREATE POLICY "Role scoped users can delete task executions"
  ON public.task_executions FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can view own execution messages" ON public.task_execution_messages;
CREATE POLICY "Role scoped users can view execution messages"
  ON public.task_execution_messages FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own execution messages" ON public.task_execution_messages;
CREATE POLICY "Role scoped users can insert execution messages"
  ON public.task_execution_messages FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can update own execution messages" ON public.task_execution_messages;
CREATE POLICY "Role scoped users can update execution messages"
  ON public.task_execution_messages FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can delete own execution messages" ON public.task_execution_messages;
CREATE POLICY "Role scoped users can delete execution messages"
  ON public.task_execution_messages FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can view own execution outputs" ON public.task_execution_outputs;
CREATE POLICY "Role scoped users can view execution outputs"
  ON public.task_execution_outputs FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own execution outputs" ON public.task_execution_outputs;
CREATE POLICY "Role scoped users can insert execution outputs"
  ON public.task_execution_outputs FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can update own execution outputs" ON public.task_execution_outputs;
CREATE POLICY "Role scoped users can update execution outputs"
  ON public.task_execution_outputs FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can delete own execution outputs" ON public.task_execution_outputs;
CREATE POLICY "Role scoped users can delete execution outputs"
  ON public.task_execution_outputs FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can view own flow_runs" ON public.flow_runs;
CREATE POLICY "Role scoped users can view flow_runs"
  ON public.flow_runs FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own flow_runs" ON public.flow_runs;
CREATE POLICY "Role scoped users can insert flow_runs"
  ON public.flow_runs FOR INSERT
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can update own flow_runs" ON public.flow_runs;
CREATE POLICY "Role scoped users can update flow_runs"
  ON public.flow_runs FOR UPDATE
  USING (public.can_manage_user_scoped_data(user_id))
  WITH CHECK (public.can_manage_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can delete own flow_runs" ON public.flow_runs;
CREATE POLICY "Role scoped users can delete flow_runs"
  ON public.flow_runs FOR DELETE
  USING (public.can_manage_user_scoped_data(user_id));

CREATE OR REPLACE FUNCTION security.can_access_flow_run(p_flow_run_id text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.flow_runs
    WHERE id = p_flow_run_id AND public.can_view_user_scoped_data(user_id)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, security;

CREATE OR REPLACE FUNCTION security.can_manage_flow_run(p_flow_run_id text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.flow_runs
    WHERE id = p_flow_run_id AND public.can_manage_user_scoped_data(user_id)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, security;

DROP POLICY IF EXISTS "Users can view own flow_run_steps" ON public.flow_run_steps;
CREATE POLICY "Role scoped users can view flow_run_steps"
  ON public.flow_run_steps FOR SELECT
  USING (security.can_access_flow_run(flow_run_id));

DROP POLICY IF EXISTS "Users can insert own flow_run_steps" ON public.flow_run_steps;
CREATE POLICY "Role scoped users can insert flow_run_steps"
  ON public.flow_run_steps FOR INSERT
  WITH CHECK (security.can_manage_flow_run(flow_run_id));

DROP POLICY IF EXISTS "Users can update own flow_run_steps" ON public.flow_run_steps;
CREATE POLICY "Role scoped users can update flow_run_steps"
  ON public.flow_run_steps FOR UPDATE
  USING (security.can_manage_flow_run(flow_run_id))
  WITH CHECK (security.can_manage_flow_run(flow_run_id));

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Role scoped users can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Role scoped users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own adapter runs" ON public.adapter_runs;
CREATE POLICY "Role scoped users can view adapter runs"
  ON public.adapter_runs FOR SELECT
  USING (public.can_view_user_scoped_data(user_id));

DROP POLICY IF EXISTS "Users can insert own adapter runs" ON public.adapter_runs;
CREATE POLICY "Role scoped users can insert adapter runs"
  ON public.adapter_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
