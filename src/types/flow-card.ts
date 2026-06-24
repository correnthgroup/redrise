export type ExecutionPolicy = 'sequential' | 'parallel'

export type FlowCard = {
  id: string
  flow_id: string
  node_id: string
  label: string
  instructions: string
  members: string[]
  agents: string[]
  approvers: string[]
  run_order: number
  execution_policy: ExecutionPolicy
  position_x: number
  position_y: number
  created_at: string
  updated_at: string
}

export type FlowEdge = {
  id: string
  flow_id: string
  edge_id: string
  source: string
  target: string
  animated: boolean
  created_at: string
}

export type CreateFlowCardInput = {
  flow_id: string
  node_id: string
  label: string
  instructions?: string
  members?: string[]
  agents?: string[]
  approvers?: string[]
  position_x: number
  position_y: number
}

export type CreateFlowEdgeInput = {
  flow_id: string
  edge_id: string
  source: string
  target: string
  animated?: boolean
}
