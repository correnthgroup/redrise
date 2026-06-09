export type WorkspaceStatus = 'healthy' | 'maintenance' | 'pending'

export type Workspace = {
  id: string
  user_id: string
  name: string
  mission: string
  status: WorkspaceStatus
  flows: number
  created_at: string
  updated_at: string
}

export type CreateWorkspaceInput = {
  name: string
  mission: string
}
