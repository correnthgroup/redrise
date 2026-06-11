import { supabase } from './supabase'
import { logAuditEvent } from './audit-logs'

export type IntegrationStatus = 'active' | 'inactive' | 'error'

export type Integration = {
  id: string
  user_id: string
  workspace_id: string | null
  name: string
  provider: string
  category: string
  endpoint: string | null
  config: Record<string, unknown>
  status: IntegrationStatus
  last_tested_at: string | null
  created_at: string
  updated_at: string
}

export type CreateIntegrationInput = {
  name: string
  provider: string
  category: string
  endpoint?: string
  config?: Record<string, unknown>
  workspace_id?: string
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'ig'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function loadIntegrations(): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createIntegration(input: CreateIntegrationInput): Promise<Integration> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = generateShortId()

  const { data, error } = await supabase
    .from('integrations')
    .insert({
      id,
      user_id: user.id,
      workspace_id: input.workspace_id || null,
      name: input.name,
      provider: input.provider,
      category: input.category,
      endpoint: input.endpoint || null,
      config: input.config || {},
      status: 'inactive',
    })
    .select()
    .single()

  if (error) throw error

  await logAuditEvent({
    action: 'create',
    entityType: 'integration',
    entityId: id,
    entityName: input.name,
    workspaceId: input.workspace_id,
    details: { provider: input.provider, category: input.category },
  })

  return data
}

export async function updateIntegration(
  id: string,
  updates: Partial<Pick<Integration, 'name' | 'endpoint' | 'config' | 'status' | 'last_tested_at'>>,
): Promise<Integration> {
  const { data, error } = await supabase
    .from('integrations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteIntegration(id: string): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', id)

  if (error) throw error

  await logAuditEvent({
    action: 'delete',
    entityType: 'integration',
    entityId: id,
  })
}
