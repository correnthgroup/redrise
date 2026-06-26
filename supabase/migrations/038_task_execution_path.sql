-- Migration 038: deterministic task execution path foundation

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS execution_path text NOT NULL DEFAULT 'api_gateway'
    CHECK (execution_path IN (
      'api_gateway',
      'integration_gateway',
      'rise_insider_terminal',
      'rise_insider_filesystem',
      'browser_automation',
      'ui_control',
      'mock_integration',
      'manual_step'
    ));

ALTER TABLE task_executions
  ADD COLUMN IF NOT EXISTS execution_path text,
  ADD COLUMN IF NOT EXISTS failure_reason text
    CHECK (failure_reason IN (
      'runtime_offline',
      'runtime_not_paired',
      'default_device_missing',
      'integration_unavailable',
      'workdir_not_authorized',
      'capability_missing',
      'permission_blocked',
      'credential_required',
      'ui_control_unavailable',
      'execution_path_not_configured',
      'execution_path_unavailable'
    ));

CREATE INDEX IF NOT EXISTS idx_tasks_execution_path
  ON tasks(user_id, execution_path);

CREATE INDEX IF NOT EXISTS idx_task_executions_failure_reason
  ON task_executions(failure_reason)
  WHERE failure_reason IS NOT NULL;
