import { supabase } from './supabase'
import { logAuditEvent } from './audit-logs'

export type ApiKey = {
  id: string
  user_id: string
  name: string
  prefix: string
  secret_hash: string
  scopes: string[]
  last_used_at: string | null
  expires_at: string | null
  revoked: boolean
  created_at: string
  updated_at: string
}

export type CreateApiKeyInput = {
  name: string
  scopes: string[]
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'ak'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

function generateApiKeySecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let secret = ''
  for (let i = 0; i < 48; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)]
  }
  return secret
}

export async function loadApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('revoked', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createApiKey(input: CreateApiKeyInput): Promise<{ key: ApiKey; secret: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = generateShortId()
  const secret = generateApiKeySecret()
  const prefix = `rr_${secret.slice(0, 8)}`

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      id,
      user_id: user.id,
      name: input.name,
      prefix,
      secret_hash: secret,
      scopes: input.scopes,
      revoked: false,
    })
    .select()
    .single()

  if (error) throw error

  await logAuditEvent({
    action: 'create',
    entityType: 'api_key',
    entityId: id,
    entityName: input.name,
    details: { scopes: input.scopes },
  })

  return { key: data, secret }
}

export async function revokeApiKey(id: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  await logAuditEvent({
    action: 'revoke',
    entityType: 'api_key',
    entityId: id,
  })
}

export async function deleteApiKey(id: string): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)

  if (error) throw error

  await logAuditEvent({
    action: 'delete',
    entityType: 'api_key',
    entityId: id,
  })
}
