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

export type IntegrationSetupSummary = Omit<Integration, 'config' | 'user_id'> & {
  user_id: string
  user_email: string
  user_name: string
  can_view_details: boolean
}

export type IntegrationSetupDetail = IntegrationSetupSummary & {
  can_manage: boolean
  safe_config: {
    secret_present?: boolean
    paired_at?: string
    config_keys?: string[]
  }
}

export type CreateIntegrationInput = {
  name: string
  provider: string
  category: string
  endpoint?: string
  config?: Record<string, unknown>
  status?: IntegrationStatus
  workspace_id?: string
  ownerUserId?: string
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
    .select('id,user_id,workspace_id,name,provider,category,endpoint,status,last_tested_at,created_at,updated_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((integration) => ({ ...integration, config: {} }))
}

export async function loadIntegrationSetupOverview(ownerUserId: string): Promise<IntegrationSetupSummary[]> {
  const { data, error } = await supabase.rpc('load_integration_setup_overview', { target_owner_user_id: ownerUserId })
  if (error) throw error
  return (data ?? []) as IntegrationSetupSummary[]
}

export async function loadIntegrationSetupDetail(ownerUserId: string, integrationId: string): Promise<IntegrationSetupDetail | null> {
  const { data, error } = await supabase.rpc('load_integration_setup_detail', { target_owner_user_id: ownerUserId, integration_id: integrationId })
  if (error) throw error
  return ((data ?? []) as IntegrationSetupDetail[])[0] ?? null
}

export async function updateIntegrationSetupStatus(ownerUserId: string, integrationId: string, status: IntegrationStatus): Promise<boolean> {
  const { data, error } = await supabase.rpc('update_integration_setup_status', { target_owner_user_id: ownerUserId, integration_id: integrationId, next_status: status })
  if (error) throw error
  return Boolean(data)
}

export async function deleteIntegrationSetup(ownerUserId: string, integrationId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('delete_integration_setup', { target_owner_user_id: ownerUserId, integration_id: integrationId })
  if (error) throw error
  return Boolean(data)
}

export async function rotateIntegrationSetupSecret(ownerUserId: string, integrationId: string, token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('rotate_integration_setup_secret', { target_owner_user_id: ownerUserId, integration_id: integrationId, next_token: token })
  if (error) throw error
  return Boolean(data)
}

export async function createIntegration(input: CreateIntegrationInput): Promise<Integration> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = generateShortId()

  const { data, error } = await supabase
    .from('integrations')
    .insert({
      id,
      user_id: input.ownerUserId || user.id,
      workspace_id: input.workspace_id || null,
      name: input.name,
      provider: input.provider,
      category: input.category,
      endpoint: input.endpoint || null,
      config: input.config || {},
      status: input.status ?? 'inactive',
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
