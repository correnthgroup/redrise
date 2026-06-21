-- Migration 021: keep workspace operational status in sync with related flows and tasks.

CREATE OR REPLACE FUNCTION public.recompute_workspace_operational_state(ws_id text)
RETURNS void AS $$
DECLARE
  flow_count integer;
  has_error boolean;
  has_work boolean;
BEGIN
  IF ws_id IS NULL THEN
    RETURN;
  END IF;

  SELECT count(*) INTO flow_count
  FROM public.flows
  WHERE workspace_id = ws_id;

  SELECT EXISTS (
    SELECT 1 FROM public.flows WHERE workspace_id = ws_id AND status = 'error'
    UNION ALL
    SELECT 1 FROM public.tasks WHERE workspace_id = ws_id AND status = 'error'
  ) INTO has_error;

  SELECT EXISTS (
    SELECT 1 FROM public.flows WHERE workspace_id = ws_id
    UNION ALL
    SELECT 1 FROM public.tasks WHERE workspace_id = ws_id
  ) INTO has_work;

  UPDATE public.workspaces
  SET flows = flow_count,
      status = CASE
        WHEN has_error THEN 'maintenance'
        WHEN has_work THEN 'healthy'
        ELSE 'pending'
      END,
      updated_at = now()
  WHERE id = ws_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.recompute_workspace_from_flow_trigger()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_workspace_operational_state(OLD.workspace_id);
    RETURN OLD;
  END IF;

  PERFORM public.recompute_workspace_operational_state(NEW.workspace_id);
  IF TG_OP = 'UPDATE' AND OLD.workspace_id IS DISTINCT FROM NEW.workspace_id THEN
    PERFORM public.recompute_workspace_operational_state(OLD.workspace_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.recompute_workspace_from_task_trigger()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_workspace_operational_state(OLD.workspace_id);
    RETURN OLD;
  END IF;

  PERFORM public.recompute_workspace_operational_state(NEW.workspace_id);
  IF TG_OP = 'UPDATE' AND OLD.workspace_id IS DISTINCT FROM NEW.workspace_id THEN
    PERFORM public.recompute_workspace_operational_state(OLD.workspace_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS recompute_workspace_from_flows ON public.flows;
CREATE TRIGGER recompute_workspace_from_flows
  AFTER INSERT OR UPDATE OR DELETE ON public.flows
  FOR EACH ROW EXECUTE FUNCTION public.recompute_workspace_from_flow_trigger();

DROP TRIGGER IF EXISTS recompute_workspace_from_tasks ON public.tasks;
CREATE TRIGGER recompute_workspace_from_tasks
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.recompute_workspace_from_task_trigger();

CREATE OR REPLACE FUNCTION public.increment_workspace_flows(ws_id text)
RETURNS void AS $$
BEGIN
  PERFORM public.recompute_workspace_operational_state(ws_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
