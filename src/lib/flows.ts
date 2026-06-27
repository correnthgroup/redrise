import { supabase } from './supabase'
import type { Flow, CreateFlowInput } from '@/types/flow'
import { logAuditEvent } from './audit-logs'
import { createNotification } from './notifications'

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'f'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

async function isIdUnique(id: string): Promise<boolean> {
  const { count } = await supabase
    .from('flows')
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

export async function loadFlows(): Promise<Flow[]> {
  const { data, error } = await supabase
    .from('flows')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[loadFlows] Error:', error.message, error.details, error.hint)
    return []
  }



  return (data ?? []) as Flow[]
}

export async function loadFlowsByWorkspace(workspaceId: string): Promise<Flow[]> {
  const { data, error } = await supabase
    .from('flows')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[loadFlowsByWorkspace] Error:', error.message, error.details, error.hint)
    return []
  }

  return (data ?? []) as Flow[]
}

export async function createFlow(input: CreateFlowInput): Promise<Flow | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.error('[createFlow] Auth error:', authError.message)
    return null
  }
  if (!user) {
    console.error('[createFlow] No authenticated user')
    return null
  }

  const id = await generateUniqueId()
  const now = new Date().toISOString()




  const { data, error } = await supabase
    .from('flows')
    .insert({
      id,
      user_id: user.id,
      workspace_id: input.workspace_id,
      name: input.name || 'New Flow',
      status: 'paused',
      created_by_user_id: user.id,
      primary_responsible_user_id: user.id,
      source_type: 'user',
      members: input.members ?? [],
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) {
    console.error('[createFlow] Insert error:', error.message, error.details, error.hint)
    return null
  }

  // Increment workspace flows count
  try {
    await supabase.rpc('increment_workspace_flows', { ws_id: input.workspace_id })
  } catch {
    // Fallback: manual update if RPC not created
    const { data: ws } = await supabase.from('workspaces').select('flows').eq('id', input.workspace_id).single()
    if (ws) {
      await supabase.from('workspaces').update({ flows: (ws.flows ?? 0) + 1 }).eq('id', input.workspace_id)
    }
  }


  await logAuditEvent({
    action: 'create',
    entityType: 'flow',
    entityId: id,
    entityName: input.name,
    workspaceId: input.workspace_id,
  })

  return data as Flow
}

async function loadFlowById(id: string): Promise<Flow | null> {
  const { data, error } = await supabase
    .from('flows')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[loadFlowById] Error:', error.message, error.details, error.hint)
    return null
  }

  return data as Flow | null
}

async function notifyFlowOwner(flow: Flow, type: string, title: string, summary: string) {
  await createNotification({
    owner_user_id: flow.user_id,
    workspace_id: flow.workspace_id,
    flow_id: flow.id,
    recipient_user_id: flow.user_id,
    type,
    title,
    summary,
    primary_action_type: 'open_flow',
    primary_action_payload: { flowId: flow.id, workspaceId: flow.workspace_id },
  })
}

export async function updateFlow(id: string, updates: Partial<Pick<Flow, 'name' | 'members'>>): Promise<Flow | null> {
  const { data, error } = await supabase
    .from('flows')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updateFlow] Error:', error.message, error.details, error.hint)
    return null
  }

  await logAuditEvent({
    action: 'update',
    entityType: 'flow',
    entityId: id,
    entityName: data.name,
    workspaceId: data.workspace_id,
    details: { fields: Object.keys(updates) },
  })

  return data as Flow
}

export async function requestFlowApproval(id: string): Promise<Flow | null> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('flows')
    .update({
      approval_status: 'approval_requested',
      published_at: now,
      is_official: false,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[requestFlowApproval] Error:', error.message, error.details, error.hint)
    return null
  }

  const flow = data as Flow
  await logAuditEvent({
    action: 'request_approval',
    entityType: 'flow',
    entityId: id,
    entityName: flow.name,
    workspaceId: flow.workspace_id,
  })
  await notifyFlowOwner(flow, 'flow_approval_requested', 'Flow awaiting approval', `${flow.name} was submitted for approval.`)

  return flow
}

export async function approveFlow(id: string): Promise<Flow | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('flows')
    .update({
      approval_status: 'approved',
      published_at: now,
      approved_at: now,
      approved_by_user_id: user.id,
      is_official: true,
      official_invalidated_at: null,
      official_invalidated_reason: null,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[approveFlow] Error:', error.message, error.details, error.hint)
    return null
  }

  const flow = data as Flow
  await logAuditEvent({
    action: 'approve',
    entityType: 'flow',
    entityId: id,
    entityName: flow.name,
    workspaceId: flow.workspace_id,
  })
  await notifyFlowOwner(flow, 'general', 'Flow approved', `${flow.name} is now official.`)

  return flow
}

export async function requestFlowAdjustments(id: string): Promise<Flow | null> {
  const { data, error } = await supabase
    .from('flows')
    .update({
      approval_status: 'adjustments_requested',
      is_official: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[requestFlowAdjustments] Error:', error.message, error.details, error.hint)
    return null
  }

  const flow = data as Flow
  await logAuditEvent({
    action: 'request_adjustments',
    entityType: 'flow',
    entityId: id,
    entityName: flow.name,
    workspaceId: flow.workspace_id,
  })
  await notifyFlowOwner(flow, 'general', 'Flow adjustments requested', `${flow.name} needs adjustments before approval.`)

  return flow
}

export async function markFlowExternalLlm(id: string, sourceLabel: string): Promise<Flow | null> {
  const label = sourceLabel.trim() || 'External LLM'
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('flows')
    .update({
      source_type: 'external_llm',
      source_label: label,
      approval_status: 'approval_requested',
      published_at: now,
      is_official: false,
      approved_at: null,
      approved_by_user_id: null,
      official_invalidated_at: null,
      official_invalidated_reason: null,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[markFlowExternalLlm] Error:', error.message, error.details, error.hint)
    return null
  }

  const flow = data as Flow
  await logAuditEvent({
    action: 'import_external_llm',
    entityType: 'flow',
    entityId: id,
    entityName: flow.name,
    workspaceId: flow.workspace_id,
    details: { source_label: label },
  })
  await notifyFlowOwner(flow, 'flow_approval_requested', 'External LLM Flow awaiting approval', `${flow.name} was imported from ${label} and needs approval.`)

  return flow
}

export async function markFlowRedriseSupport(id: string): Promise<Flow | null> {
  const now = new Date().toISOString()
  const sourceLabel = 'Redrise Support'
  const { data, error } = await supabase
    .from('flows')
    .update({
      source_type: 'redrise_support',
      source_label: sourceLabel,
      approval_status: 'approval_requested',
      published_at: now,
      is_official: false,
      approved_at: null,
      approved_by_user_id: null,
      official_invalidated_at: null,
      official_invalidated_reason: null,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[markFlowRedriseSupport] Error:', error.message, error.details, error.hint)
    return null
  }

  const flow = data as Flow
  await logAuditEvent({
    action: 'update',
    entityType: 'flow',
    entityId: id,
    entityName: flow.name,
    workspaceId: flow.workspace_id,
    details: { source_type: 'redrise_support', source_label: sourceLabel },
  })
  await notifyFlowOwner(flow, 'flow_approval_requested', 'Redrise Support Flow awaiting approval', `${flow.name} was marked as Redrise Support and needs approval.`)

  return flow
}

export async function invalidateFlowOfficialStatus(id: string, reason = 'Flow structure changed after approval'): Promise<Flow | null> {
  const current = await loadFlowById(id)
  if (!current?.is_official) return current

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('flows')
    .update({
      approval_status: 'approval_requested',
      is_official: false,
      official_invalidated_at: now,
      official_invalidated_reason: reason,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[invalidateFlowOfficialStatus] Error:', error.message, error.details, error.hint)
    return null
  }

  const flow = data as Flow
  await logAuditEvent({
    action: 'invalidate',
    entityType: 'flow',
    entityId: id,
    entityName: flow.name,
    workspaceId: flow.workspace_id,
    details: { reason },
  })
  await notifyFlowOwner(flow, 'flow_official_invalidated', 'Official Flow changed', `${flow.name} was changed and needs approval again.`)

  return flow
}

export async function deleteFlow(id: string, workspaceId: string): Promise<boolean> {
  const { error } = await supabase
    .from('flows')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteFlow] Error:', error.message, error.details, error.hint)
    return false
  }

  await logAuditEvent({
    action: 'delete',
    entityType: 'flow',
    entityId: id,
    workspaceId,
  })

  return true
}
