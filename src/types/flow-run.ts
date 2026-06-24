export type FlowRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export type FlowRun = {
  id: string
  flow_id: string
  user_id: string
  status: FlowRunStatus
  started_at: string
  completed_at: string | null
  created_at: string
}

export type FlowRunStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export type FlowRunStep = {
  id: string
  flow_run_id: string
  execution_id: string | null
  card_id: string | null
  task_id: string | null
  step_order: number
  status: FlowRunStepStatus
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export type CreateFlowRunInput = {
  flow_id: string
}

export type CreateFlowRunStepInput = {
  flow_run_id: string
  card_id?: string
  task_id?: string
  step_order: number
}
