export type TaskStatus = 'pending' | 'running' | 'done' | 'error' | 'backlog' | 'in-progress' | 'in-review'

export type TaskPriority = 'low' | 'medium' | 'high'

export type RecurrenceType = 'occasionally' | 'daily' | 'weekly' | 'monthly'
export type ExecutionPath =
  | 'api_gateway'
  | 'integration_gateway'
  | 'rise_insider_terminal'
  | 'rise_insider_filesystem'
  | 'browser_automation'
  | 'ui_control'
  | 'mock_integration'
  | 'manual_step'

export type Task = {
  id: string
  user_id: string
  workspace_id: string | null
  flow_id: string | null
  flow_card_id: string | null
  queue_position: number | null
  title: string
  brief: string
  objective: string
  prompt: string
  documents: string[]
  team_members: string[]
  agent_id: string | null
  priority: TaskPriority
  status: TaskStatus
  execution_path: ExecutionPath
  run_order: number
  schedule_start: string | null
  schedule_end: string | null
  schedule_time: string | null
  recurrence: RecurrenceType
  recurrence_days: number[]
  recurrence_monthly_days: number[]
  created_at: string
  updated_at: string
}

export type CreateTaskInput = {
  title: string
  brief: string
  objective: string
  prompt: string
  documents: string[]
  team_members: string[]
  agent_id: string | null
  priority: TaskPriority
  status: TaskStatus
  execution_path: ExecutionPath
  run_order?: number
  schedule_start: string | null
  schedule_end: string | null
  schedule_time: string | null
  recurrence: RecurrenceType
  recurrence_days: number[]
  recurrence_monthly_days: number[]
  workspace_id?: string
  flow_id?: string | null
  flow_card_id?: string | null
  queue_position?: number | null
}

export type TaskFlow = {
  id: string
  task_id: string
  flow_id: string
  card_id: string
  status: TaskStatus
  next_run_at: string | null
  last_run_at: string | null
  created_at: string
  updated_at: string
}
