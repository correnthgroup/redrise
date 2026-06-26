export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'rejected' | 'failed'
export type FailureReason =
  | 'runtime_offline'
  | 'runtime_not_paired'
  | 'default_device_missing'
  | 'integration_unavailable'
  | 'workdir_not_authorized'
  | 'capability_missing'
  | 'permission_blocked'
  | 'credential_required'
  | 'ui_control_unavailable'
  | 'execution_path_not_configured'
  | 'execution_path_unavailable'

export type TaskExecution = {
  id: string
  task_id: string
  user_id: string
  agent_id: string | null
  prompt_sent: string
  response_received: string | null
  status: ExecutionStatus
  approved_by: string | null
  approved_at: string | null
  error: string | null
  execution_path: string | null
  failure_reason: FailureReason | null
  tokens_used: number | null
  model: string
  created_at: string
  updated_at: string
}

export type MessageRole = 'system' | 'user' | 'assistant' | 'context' | 'artifact'
export type MessageKind = 'prompt' | 'response' | 'context' | 'artifact' | 'system'

export type TaskExecutionMessage = {
  id: string
  execution_id: string
  user_id: string
  sequence: number
  role: MessageRole
  kind: MessageKind
  content: string
  created_at: string
}

export type OutputType = 'text' | 'json' | 'summary' | 'decision' | 'report'

export type TaskExecutionOutput = {
  id: string
  execution_id: string
  user_id: string
  output_type: OutputType
  content_text: string | null
  content_json: Record<string, unknown> | null
  raw_output: string | null
  version: number
  approved: boolean
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export type StructuredOutput = {
  final_answer: string
  decision_summary: string
  steps_summary: string[]
  evidence_used: string[]
  open_questions: string[]
  confidence: number
  handoff_notes: string
}
