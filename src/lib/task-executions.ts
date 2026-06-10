import { supabase } from './supabase'
import type { TaskExecution } from '@/types/task-execution'

function generateShortExecId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'x'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function createExecution(
  taskId: string,
  agentId: string | null,
  prompt: string,
  model: string,
): Promise<TaskExecution> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = generateShortExecId()

  const { data, error } = await supabase
    .from('task_executions')
    .insert({
      id,
      task_id: taskId,
      user_id: user.id,
      agent_id: agentId,
      prompt_sent: prompt,
      status: 'running',
      model,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeExecution(
  executionId: string,
  response: string,
  tokensUsed: number,
): Promise<TaskExecution> {
  const { data, error } = await supabase
    .from('task_executions')
    .update({
      response_received: response,
      status: 'completed',
      tokens_used: tokensUsed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', executionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function rejectExecution(executionId: string): Promise<TaskExecution> {
  const { data, error } = await supabase
    .from('task_executions')
    .update({
      status: 'rejected',
      approved_by: null,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', executionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function failExecution(
  executionId: string,
  errorMsg: string,
): Promise<TaskExecution> {
  const { data, error } = await supabase
    .from('task_executions')
    .update({
      status: 'failed',
      error: errorMsg,
      updated_at: new Date().toISOString(),
    })
    .eq('id', executionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function loadExecutions(taskId: string): Promise<TaskExecution[]> {
  const { data, error } = await supabase
    .from('task_executions')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function loadAllExecutions(): Promise<TaskExecution[]> {
  const { data, error } = await supabase
    .from('task_executions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}
