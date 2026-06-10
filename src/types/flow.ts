export type FlowStatus = 'running' | 'paused' | 'error'

export type Flow = {
  id: string
  user_id: string
  workspace_id: string
  name: string
  status: FlowStatus
  members: string[]
  created_at: string
  updated_at: string
}

export type CreateFlowInput = {
  name: string
  workspace_id: string
  members: string[]
}
