export type TaskStatus = 'backlog' | 'in-progress' | 'in-review' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  user_id: string
  workspace_id: string | null
  title: string
  brief: string
  objective: string
  prompt: string
  documents: string[]
  team_members: string[]
  agent_id: string | null
  priority: TaskPriority
  status: TaskStatus
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
  workspace_id?: string
}
