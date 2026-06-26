export type NotificationReadStatus = 'unread' | 'read'
export type NotificationActionStatus = 'pending' | 'resolved' | 'archived'

export type NotificationType =
  | 'flow_approval_requested'
  | 'flow_ai_published_pending_approval'
  | 'flow_official_invalidated'
  | 'flow_execution_blocked'
  | 'task_execution_failed'
  | 'runtime_offline'
  | 'integration_unavailable'
  | 'workdir_not_authorized'
  | 'redrise_support_changes'
  | 'execution_stopped'
  | 'general'

export type Notification = {
  id: string
  owner_user_id: string
  workspace_id: string | null
  flow_id: string | null
  task_id: string | null
  execution_id: string | null
  recipient_user_id: string
  type: NotificationType | string
  title: string
  summary: string
  details_json: Record<string, unknown>
  read_status: NotificationReadStatus
  action_status: NotificationActionStatus
  primary_action_type: string | null
  primary_action_payload: Record<string, unknown> | null
  created_at: string
  read_at: string | null
  resolved_at: string | null
}

export type CreateNotificationInput = {
  owner_user_id: string
  workspace_id?: string | null
  flow_id?: string | null
  task_id?: string | null
  execution_id?: string | null
  recipient_user_id: string
  type: NotificationType | string
  title: string
  summary?: string
  details_json?: Record<string, unknown>
  primary_action_type?: string | null
  primary_action_payload?: Record<string, unknown> | null
}
