export type AgentStatus = 'active' | 'paused' | 'error' | 'idle'

export type Agent = {
  id: string
  user_id: string
  name: string
  brief: string
  status: AgentStatus
  model: string
  provider: string
  provider_connection_id: string | null
  provider_auth_method: string
  provider_connection_status: 'untested' | 'connected' | 'error'
  created_at: string
  updated_at: string
}

export type CreateAgentInput = {
  name: string
  brief: string
  model?: string
  provider?: string
  ownerUserId?: string
  providerConnectionId?: string | null
  providerAuthMethod?: string
  providerConnectionStatus?: 'untested' | 'connected' | 'error'
}
