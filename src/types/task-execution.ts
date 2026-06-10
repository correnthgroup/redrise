export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'rejected' | 'failed'

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
  tokens_used: number | null
  model: string
  created_at: string
  updated_at: string
}
