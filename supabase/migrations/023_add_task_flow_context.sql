-- Migration 023: Link tasks to flows in addition to workspaces.

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS flow_id text REFERENCES public.flows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tasks_flow_id_idx ON public.tasks(flow_id);
