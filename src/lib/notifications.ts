import { supabase } from './supabase'
import type { CreateNotificationInput, Notification } from '@/types/notification'

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'n'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function loadNotifications(recipientUserId: string, limit = 100): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_user_id', recipientUserId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[loadNotifications] Error:', error.message)
    return []
  }

  return (data ?? []) as Notification[]
}

export async function createNotification(input: CreateNotificationInput): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      id: generateShortId(),
      owner_user_id: input.owner_user_id,
      workspace_id: input.workspace_id ?? null,
      flow_id: input.flow_id ?? null,
      task_id: input.task_id ?? null,
      execution_id: input.execution_id ?? null,
      recipient_user_id: input.recipient_user_id,
      type: input.type,
      title: input.title,
      summary: input.summary ?? '',
      details_json: input.details_json ?? {},
      primary_action_type: input.primary_action_type ?? null,
      primary_action_payload: input.primary_action_payload ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[createNotification] Error:', error.message)
    return null
  }

  return data as Notification
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_status: 'read', read_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[markNotificationRead] Error:', error.message)
    return false
  }
  return true
}

export async function markNotificationUnread(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_status: 'unread', read_at: null })
    .eq('id', id)

  if (error) {
    console.error('[markNotificationUnread] Error:', error.message)
    return false
  }
  return true
}

export async function resolveNotification(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ action_status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[resolveNotification] Error:', error.message)
    return false
  }
  return true
}
