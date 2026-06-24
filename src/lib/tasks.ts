import { supabase } from './supabase'
import type { Task, CreateTaskInput, TaskStatus } from '@/types/task'
import { logAuditEvent } from './audit-logs'

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 't'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

async function isIdUnique(id: string): Promise<boolean> {
  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('id', id)
  return count === 0
}

async function generateUniqueId(): Promise<string> {
  let id = generateShortId()
  let attempts = 0
  while (attempts < 10) {
    const unique = await isIdUnique(id)
    if (unique) return id
    id = generateShortId()
    attempts++
  }
  return id
}

export async function loadTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[loadTasks] Error:', error.message, error.details, error.hint)
    return []
  }

  console.log('[loadTasks] Loaded:', data?.length ?? 0, 'tasks')
  return (data ?? []) as Task[]
}

export async function createTask(input: CreateTaskInput): Promise<Task | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.error('[createTask] Auth error:', authError.message)
    return null
  }
  if (!user) {
    console.error('[createTask] No authenticated user')
    return null
  }

  const id = await generateUniqueId()
  const now = new Date().toISOString()

  console.log('[createTask] Inserting:', { id, user_id: user.id, title: input.title })

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      id,
      user_id: user.id,
      workspace_id: input.workspace_id ?? null,
      flow_id: input.flow_id ?? null,
      flow_card_id: input.flow_card_id ?? null,
      queue_position: input.queue_position ?? null,
      title: input.title || 'New Task',
      brief: input.brief || '',
      objective: input.objective || '',
      prompt: input.prompt || '',
      documents: input.documents ?? [],
      team_members: input.team_members ?? [],
      agent_id: input.agent_id ?? null,
      priority: input.priority ?? 'medium',
      status: input.status ?? 'backlog',
      schedule_start: input.schedule_start ?? null,
      schedule_end: input.schedule_end ?? null,
      schedule_time: input.schedule_time ?? null,
      recurrence: input.recurrence ?? 'occasionally',
      recurrence_days: input.recurrence_days ?? [],
      recurrence_monthly_days: input.recurrence_monthly_days ?? [],
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) {
    console.error('[createTask] Insert error:', error.message, error.details, error.hint)
    return null
  }

  console.log('[createTask] Success:', data)

  await logAuditEvent({
    action: 'create',
    entityType: 'task',
    entityId: id,
    entityName: input.title,
    workspaceId: input.workspace_id,
    details: { priority: input.priority, agent_id: input.agent_id, flow_id: input.flow_id ?? null },
  })

  return data as Task
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<boolean> {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('tasks')
    .update({ status, updated_at: now })
    .eq('id', id)

  if (error) {
    console.error('[updateTaskStatus] Error:', error.message, error.details, error.hint)
    return false
  }

  return true
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteTask] Error:', error.message, error.details, error.hint)
    return false
  }

  await logAuditEvent({
    action: 'delete',
    entityType: 'task',
    entityId: id,
  })

  return true
}

export async function loadTasksByFlow(flowId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('flow_id', flowId)
    .order('run_order', { ascending: true })

  if (error) {
    console.error('[loadTasksByFlow] Error:', error.message)
    return []
  }
  return (data ?? []) as Task[]
}

export async function loadTasksByCard(flowId: string, cardNodeId: string): Promise<Task[]> {
  const { data: cards, error: cardErr } = await supabase
    .from('flow_cards')
    .select('id')
    .eq('flow_id', flowId)
    .eq('node_id', cardNodeId)
    .limit(1)

  if (cardErr || !cards || cards.length === 0) return []

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('flow_id', flowId)
    .eq('flow_card_id', cards[0].id)
    .order('run_order', { ascending: true })

  if (error) {
    console.error('[loadTasksByCard] Error:', error.message)
    return []
  }

  return (data ?? []) as Task[]
}
