import { supabase } from './supabase'
import type { Flow, CreateFlowInput } from '@/types/flow'
import { logAuditEvent } from './audit-logs'

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

  console.log('[loadFlows] Loaded:', data?.length ?? 0, 'flows')
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

  console.log('[createFlow] Inserting:', { id, user_id: user.id, name: input.name, workspace_id: input.workspace_id })

  const { data, error } = await supabase
    .from('flows')
    .insert({
      id,
      user_id: user.id,
      workspace_id: input.workspace_id,
      name: input.name || 'New Flow',
      status: 'paused',
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

  console.log('[createFlow] Success:', data)

  await logAuditEvent({
    action: 'create',
    entityType: 'flow',
    entityId: id,
    entityName: input.name,
    workspaceId: input.workspace_id,
  })

  return data as Flow
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

export async function deleteFlow(id: string, workspaceId: string): Promise<boolean> {
  const { error } = await supabase
    .from('flows')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteFlow] Error:', error.message, error.details, error.hint)
    return false
  }

  // Decrement workspace flows count
  await supabase.from('workspaces').select('flows').eq('id', workspaceId).single().then(({ data: ws }) => {
    if (ws && ws.flows > 0) {
      supabase.from('workspaces').update({ flows: ws.flows - 1 }).eq('id', workspaceId)
    }
  })

  await logAuditEvent({
    action: 'delete',
    entityType: 'flow',
    entityId: id,
    workspaceId,
  })

  return true
}
