import { supabase } from './supabase'
import type { Agent, CreateAgentInput } from '@/types/agent'
import { logAuditEvent } from './audit-logs'

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'a'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

async function isIdUnique(id: string): Promise<boolean> {
  const { count } = await supabase
    .from('agents')
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

export async function loadAgents(ownerUserId?: string): Promise<Agent[]> {
  let query = supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })

  if (ownerUserId) query = query.eq('user_id', ownerUserId)

  const { data, error } = await query

  if (error) {
    console.error('[loadAgents] Error:', error.message, error.details, error.hint)
    return []
  }



  return (data ?? []) as Agent[]
}

export async function loadAgent(id: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[loadAgent] Error:', error.message, error.details, error.hint)
    return null
  }

  return data as Agent
}

export async function createAgent(input: CreateAgentInput): Promise<Agent | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.error('[createAgent] Auth error:', authError.message)
    return null
  }
  if (!user) {
    console.error('[createAgent] No authenticated user')
    return null
  }

  const id = await generateUniqueId()
  const now = new Date().toISOString()




  const { data, error } = await supabase
    .from('agents')
    .insert({
      id,
      user_id: input.ownerUserId || user.id,
      name: input.name || 'New Agent',
      brief: input.brief || '',
      status: 'idle',
      model: input.model || 'openai/gpt-oss-120b:free',
      provider: input.provider || 'openrouter',
      provider_connection_id: input.providerConnectionId || null,
      provider_auth_method: input.providerAuthMethod || 'api',
      provider_connection_status: input.providerConnectionStatus || 'untested',
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) {
    console.error('[createAgent] Insert error:', error.message, error.details, error.hint)
    return null
  }


  await logAuditEvent({
    action: 'create',
    entityType: 'agent',
    entityId: id,
    entityName: input.name,
    details: { model: input.model, provider: input.provider },
  })

  return data as Agent
}

export async function updateAgent(id: string, updates: Partial<Pick<Agent, 'name' | 'brief' | 'status' | 'model' | 'provider_connection_status'>>): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updateAgent] Error:', error.message, error.details, error.hint)
    return null
  }

  return data as Agent
}

export async function deleteAgent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteAgent] Error:', error.message, error.details, error.hint)
    return false
  }

  await logAuditEvent({
    action: 'delete',
    entityType: 'agent',
    entityId: id,
  })

  return true
}
