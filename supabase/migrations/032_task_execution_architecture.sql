-- Migration 032: Task Execution Architecture
-- Adds: run_order, execution_policy, task_execution_messages, task_execution_outputs,
--        flow_runs, flow_run_steps, security helper function, triggers

-- ============================================================================
-- 1. Add run_order to tasks and flow_cards
-- ============================================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS run_order integer DEFAULT 10;
CREATE INDEX IF NOT EXISTS idx_tasks_flow_run_order ON tasks(flow_id, run_order)
  WHERE flow_id IS NOT NULL;

ALTER TABLE flow_cards ADD COLUMN IF NOT EXISTS run_order integer DEFAULT 10;
ALTER TABLE flow_cards ADD COLUMN IF NOT EXISTS execution_policy text
  CHECK (execution_policy IN ('sequential', 'parallel')) DEFAULT 'sequential';
CREATE INDEX IF NOT EXISTS idx_flow_cards_run_order ON flow_cards(flow_id, run_order);

-- ============================================================================
-- 2. flow_runs — corrida de um flow (must exist before security helper)
-- ============================================================================

CREATE TABLE IF NOT EXISTS flow_runs (
  id text PRIMARY KEY,
  flow_id text NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE flow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flow_runs"
  ON flow_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flow_runs"
  ON flow_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flow_runs"
  ON flow_runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flow_runs"
  ON flow_runs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_flow_runs_flow_id ON flow_runs(flow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flow_runs_user_id ON flow_runs(user_id);

-- ============================================================================
-- 3. Security helper function: can_access_flow_run
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS security;

CREATE OR REPLACE FUNCTION security.can_access_flow_run(p_flow_run_id text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM flow_runs
    WHERE id = p_flow_run_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 4. flow_run_steps — etapas dentro de uma corrida
-- ============================================================================

CREATE TABLE IF NOT EXISTS flow_run_steps (
  id text PRIMARY KEY,
  flow_run_id text NOT NULL REFERENCES flow_runs(id) ON DELETE CASCADE,
  execution_id text REFERENCES task_executions(id) ON DELETE SET NULL,
  card_id text REFERENCES flow_cards(id) ON DELETE SET NULL,
  task_id text REFERENCES tasks(id) ON DELETE SET NULL,
  step_order integer NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE flow_run_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flow_run_steps"
  ON flow_run_steps FOR SELECT
  USING (security.can_access_flow_run(flow_run_id));

CREATE POLICY "Users can insert own flow_run_steps"
  ON flow_run_steps FOR INSERT
  WITH CHECK (security.can_access_flow_run(flow_run_id));

CREATE POLICY "Users can update own flow_run_steps"
  ON flow_run_steps FOR UPDATE
  USING (security.can_access_flow_run(flow_run_id));

CREATE INDEX IF NOT EXISTS idx_flow_run_steps_run ON flow_run_steps(flow_run_id, step_order);
CREATE INDEX IF NOT EXISTS idx_flow_run_steps_execution ON flow_run_steps(execution_id);

-- ============================================================================
-- 5. task_execution_messages — mensagens trocadas em cada run
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_execution_messages (
  id text PRIMARY KEY,
  execution_id text NOT NULL REFERENCES task_executions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'context', 'artifact')),
  kind text NOT NULL CHECK (kind IN ('prompt', 'response', 'context', 'artifact', 'system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE task_execution_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own execution messages"
  ON task_execution_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own execution messages"
  ON task_execution_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own execution messages"
  ON task_execution_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own execution messages"
  ON task_execution_messages FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_execution_messages_exec ON task_execution_messages(execution_id, sequence);
CREATE INDEX IF NOT EXISTS idx_execution_messages_user ON task_execution_messages(user_id);

-- Trigger: auto-populate user_id from task_executions on INSERT
CREATE OR REPLACE FUNCTION set_execution_message_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT user_id INTO NEW.user_id
    FROM task_executions
    WHERE id = NEW.execution_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_execution_message_user_id
  BEFORE INSERT ON task_execution_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_execution_message_user_id();

-- ============================================================================
-- 6. task_execution_outputs — artefatos estruturados
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_execution_outputs (
  id text PRIMARY KEY,
  execution_id text NOT NULL REFERENCES task_executions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  output_type text NOT NULL CHECK (output_type IN ('text', 'json', 'summary', 'decision', 'report')),
  content_text text,
  content_json jsonb,
  raw_output text,
  version integer NOT NULL DEFAULT 1,
  approved boolean DEFAULT false,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE task_execution_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own execution outputs"
  ON task_execution_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own execution outputs"
  ON task_execution_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own execution outputs"
  ON task_execution_outputs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own execution outputs"
  ON task_execution_outputs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_execution_outputs_exec ON task_execution_outputs(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_outputs_user ON task_execution_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_execution_outputs_approved ON task_execution_outputs(execution_id, approved)
  WHERE approved = true;

-- Trigger: auto-populate user_id from task_executions on INSERT
CREATE OR REPLACE FUNCTION set_execution_output_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT user_id INTO NEW.user_id
    FROM task_executions
    WHERE id = NEW.execution_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_execution_output_user_id
  BEFORE INSERT ON task_execution_outputs
  FOR EACH ROW
  EXECUTE FUNCTION set_execution_output_user_id();

-- ============================================================================
-- 7. Additional indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_task_executions_agent_id ON task_executions(agent_id)
  WHERE agent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_flow_run_steps_task ON flow_run_steps(task_id)
  WHERE task_id IS NOT NULL;
