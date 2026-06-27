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
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  return 'ak' + Array.from(bytes).map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 5)
}

function generateApiKeySecret(): string {
  const bytes = new Uint8Array(48)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 48)
}

async function sha256Hex(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function loadApiKeys(ownerUserId?: string): Promise<ApiKey[]> {
  let query = supabase
    .from('api_keys')
    .select('*')
    .eq('revoked', false)
    .order('created_at', { ascending: false })

  if (ownerUserId) query = query.eq('user_id', ownerUserId)

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function createApiKey(input: CreateApiKeyInput, ownerUserId?: string): Promise<{ key: ApiKey; secret: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = generateShortId()
  const secret = generateApiKeySecret()
  const prefix = `rr_${secret.slice(0, 8)}`
  const secretHash = await sha256Hex(secret)

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      id,
      user_id: ownerUserId ?? user.id,
      name: input.name,
      prefix,
      secret_hash: secretHash,
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
