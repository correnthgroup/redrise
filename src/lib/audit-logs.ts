import { supabase } from './supabase'

export type AuditAction = 'create' | 'update' | 'delete' | 'execute' | 'login' | 'logout' | 'invite' | 'revoke' | 'request_approval' | 'approve' | 'request_adjustments' | 'invalidate' | 'import_external_llm'

export type AuditEntityType = 'workspace' | 'flow' | 'task' | 'agent' | 'integration' | 'api_key' | 'member' | 'execution' | 'user'

export type AuditLog = {
  id: string
  user_id: string
  workspace_id: string | null
  action: AuditAction
  entity_type: AuditEntityType
  entity_id: string | null
  entity_name: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

type LogInput = {
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string
  entityName?: string
  workspaceId?: string
  details?: Record<string, unknown>
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'al'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function logAuditEvent(input: LogInput): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const id = generateShortId()

  await supabase
    .from('audit_logs')
    .insert({
      id,
      user_id: user.id,
      workspace_id: input.workspaceId || null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId || null,
      entity_name: input.entityName || null,
      details: input.details || {},
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
}

export async function loadAuditLogs(limit = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function loadAuditLogsByWorkspace(workspaceId: string, limit = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
