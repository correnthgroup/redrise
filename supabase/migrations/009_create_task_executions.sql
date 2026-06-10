-- Migration 009: task_executions table for HITL audit log

CREATE TABLE IF NOT EXISTS task_executions (
  id text PRIMARY KEY,
  task_id text NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id text REFERENCES agents(id) ON DELETE SET NULL,
  prompt_sent text NOT NULL,
  response_received text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'rejected', 'failed')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  error text,
  tokens_used integer,
  model text NOT NULL DEFAULT 'openai/gpt-oss-120b:free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own executions"
  ON task_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own executions"
  ON task_executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own executions"
  ON task_executions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own executions"
  ON task_executions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_executions_task_id ON task_executions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_user_id ON task_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_status ON task_executions(status);
