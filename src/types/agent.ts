export type AgentStatus = 'active' | 'paused' | 'error' | 'idle'

export type Agent = {
  id: string
  user_id: string
  name: string
  brief: string
  status: AgentStatus
  model: string
  provider: string
  created_at: string
  updated_at: string
}

export type CreateAgentInput = {
  name: string
  brief: string
  model?: string
  provider?: string
}
