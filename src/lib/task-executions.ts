import { supabase } from './supabase'
import type { TaskExecution, TaskExecutionMessage, TaskExecutionOutput, MessageRole, MessageKind, OutputType } from '@/types/task-execution'

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

export async function loadExecutionsByAgent(agentId: string): Promise<TaskExecution[]> {
  const { data, error } = await supabase
    .from('task_executions')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

export async function approveExecution(executionId: string): Promise<TaskExecution> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('task_executions')
    .update({
      status: 'completed',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', executionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// --- Messages ---

function generateMessageId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'msg'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function addMessage(
  executionId: string,
  sequence: number,
  role: MessageRole,
  kind: MessageKind,
  content: string,
): Promise<TaskExecutionMessage> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = generateMessageId()

  const { data, error } = await supabase
    .from('task_execution_messages')
    .insert({
      id,
      execution_id: executionId,
      user_id: user.id,
      sequence,
      role,
      kind,
      content,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function loadMessages(executionId: string): Promise<TaskExecutionMessage[]> {
  const { data, error } = await supabase
    .from('task_execution_messages')
    .select('*')
    .eq('execution_id', executionId)
    .order('sequence', { ascending: true })

  if (error) throw error
  return data ?? []
}

// --- Outputs ---

function generateOutputId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'out'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function addOutput(
  executionId: string,
  outputType: OutputType,
  contentText: string | null,
  contentJson: Record<string, unknown> | null,
  rawOutput: string,
): Promise<TaskExecutionOutput> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = generateOutputId()

  const { data, error } = await supabase
    .from('task_execution_outputs')
    .insert({
      id,
      execution_id: executionId,
      user_id: user.id,
      output_type: outputType,
      content_text: contentText,
      content_json: contentJson,
      raw_output: rawOutput,
      version: 1,
      approved: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function loadOutputs(executionId: string): Promise<TaskExecutionOutput[]> {
  const { data, error } = await supabase
    .from('task_execution_outputs')
    .select('*')
    .eq('execution_id', executionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function approveOutput(outputId: string): Promise<TaskExecutionOutput> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('task_execution_outputs')
    .update({
      approved: true,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', outputId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function loadLatestApprovedOutput(
  upstreamTaskId: string,
): Promise<TaskExecutionOutput | null> {
  // Step 1: get the latest execution for this task
  const { data: execs, error: execErr } = await supabase
    .from('task_executions')
    .select('id')
    .eq('task_id', upstreamTaskId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (execErr) throw execErr
  if (!execs || execs.length === 0) return null

  // Step 2: get the latest approved output for that execution
  const { data, error } = await supabase
    .from('task_execution_outputs')
    .select('*')
    .eq('execution_id', execs[0].id)
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function resolveUpstreamContext(taskId: string): Promise<string | null> {
  // Step 1: get the task to find its flow_id and run_order
  const { data: task, error: taskErr } = await supabase
    .from('tasks')
    .select('flow_id, run_order')
    .eq('id', taskId)
    .single()

  if (taskErr || !task || !task.flow_id) return null

  // Step 2: find upstream tasks (same flow, lower run_order)
  const { data: upstreamTasks, error: upErr } = await supabase
    .from('tasks')
    .select('id')
    .eq('flow_id', task.flow_id)
    .lt('run_order', task.run_order)
    .order('run_order', { ascending: false })

  if (upErr || !upstreamTasks || upstreamTasks.length === 0) return null

  // Step 3: get the most recent approved output from each upstream task
  const contextParts: string[] = []

  for (const upstream of upstreamTasks) {
    const output = await loadLatestApprovedOutput(upstream.id)
    if (output) {
      const label = output.output_type === 'json'
        ? JSON.stringify(output.content_json, null, 2)
        : output.content_text || output.raw_output || ''
      contextParts.push(`[Upstream Task ${upstream.id} — ${output.output_type}]\n${label}`)
    }
  }

  if (contextParts.length === 0) return null
  return contextParts.join('\n\n---\n\n')
}
