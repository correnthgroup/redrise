import { supabase } from './supabase'
import type { FlowRun, FlowRunStep, CreateFlowRunInput } from '@/types/flow-run'

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'fr'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

function generateStepId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'fs'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function createFlowRun(input: CreateFlowRunInput): Promise<FlowRun> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = generateShortId()

  const { data, error } = await supabase
    .from('flow_runs')
    .insert({
      id,
      flow_id: input.flow_id,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function startFlowRun(flowRunId: string): Promise<FlowRun> {
  const { data, error } = await supabase
    .from('flow_runs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', flowRunId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeFlowRun(flowRunId: string): Promise<FlowRun> {
  const { data, error } = await supabase
    .from('flow_runs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', flowRunId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function failFlowRun(flowRunId: string): Promise<FlowRun> {
  const { data, error } = await supabase
    .from('flow_runs')
    .update({ status: 'failed', completed_at: new Date().toISOString() })
    .eq('id', flowRunId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function loadFlowRuns(flowId: string): Promise<FlowRun[]> {
  const { data, error } = await supabase
    .from('flow_runs')
    .select('*')
    .eq('flow_id', flowId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}

export async function loadAllFlowRuns(): Promise<FlowRun[]> {
  const { data, error } = await supabase
    .from('flow_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

// --- Steps ---

export async function addFlowRunStep(
  flowRunId: string,
  stepOrder: number,
  cardId?: string,
  taskId?: string,
): Promise<FlowRunStep> {
  const id = generateStepId()

  const { data, error } = await supabase
    .from('flow_run_steps')
    .insert({
      id,
      flow_run_id: flowRunId,
      card_id: cardId ?? null,
      task_id: taskId ?? null,
      step_order: stepOrder,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function startFlowRunStep(stepId: string): Promise<FlowRunStep> {
  const { data, error } = await supabase
    .from('flow_run_steps')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', stepId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeFlowRunStep(
  stepId: string,
  executionId: string,
): Promise<FlowRunStep> {
  const { data, error } = await supabase
    .from('flow_run_steps')
    .update({
      status: 'completed',
      execution_id: executionId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', stepId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function failFlowRunStep(stepId: string): Promise<FlowRunStep> {
  const { data, error } = await supabase
    .from('flow_run_steps')
    .update({ status: 'failed', completed_at: new Date().toISOString() })
    .eq('id', stepId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function loadFlowRunSteps(flowRunId: string): Promise<FlowRunStep[]> {
  const { data, error } = await supabase
    .from('flow_run_steps')
    .select('*')
    .eq('flow_run_id', flowRunId)
    .order('step_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function loadFlowRunStepsByTask(taskId: string): Promise<FlowRunStep[]> {
  const { data, error } = await supabase
    .from('flow_run_steps')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}
