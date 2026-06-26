export type FlowStatus = 'running' | 'paused' | 'error'
export type FlowApprovalStatus = 'not_requested' | 'approval_requested' | 'adjustments_requested' | 'approved'
export type FlowSourceType = 'user' | 'external_llm' | 'redrise_support' | 'system'

export type Flow = {
  id: string
  user_id: string
  workspace_id: string
  name: string
  status: FlowStatus
  approval_status: FlowApprovalStatus
  published_at: string | null
  approved_at: string | null
  approved_by_user_id: string | null
  is_official: boolean
  official_invalidated_at: string | null
  official_invalidated_reason: string | null
  created_by_user_id: string | null
  primary_responsible_user_id: string | null
  source_type: FlowSourceType
  source_label: string | null
  members: string[]
  created_at: string
  updated_at: string
}

export type CreateFlowInput = {
  name: string
  workspace_id: string
  members: string[]
}
