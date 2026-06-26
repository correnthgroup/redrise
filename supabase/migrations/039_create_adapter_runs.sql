-- Migration 039: adapter execution observability

CREATE TABLE IF NOT EXISTS adapter_runs (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id text REFERENCES tasks(id) ON DELETE SET NULL,
  execution_id text REFERENCES task_executions(id) ON DELETE SET NULL,
  integration_id text REFERENCES integrations(id) ON DELETE SET NULL,
  execution_path text NOT NULL,
  provider text NOT NULL,
  endpoint_label text,
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  status_code integer,
  latency_ms integer,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE adapter_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own adapter runs" ON adapter_runs;
CREATE POLICY "Users can view own adapter runs"
  ON adapter_runs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own adapter runs" ON adapter_runs;
CREATE POLICY "Users can insert own adapter runs"
  ON adapter_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_adapter_runs_user_created
  ON adapter_runs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_adapter_runs_execution_path
  ON adapter_runs(user_id, execution_path, created_at DESC);
