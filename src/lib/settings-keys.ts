export type SettingKey =
  | 'personal-info'
  | 'change-password'
  | 'active-sessions'
  | 'api-keys'
  | 'integrations'
  | 'team-members'
  | 'team-list'
  | 'plans'
  | 'audit-log'

export const SETTING_TITLE_KEYS: Record<SettingKey, string> = {
  'personal-info': 'settings.personalInfo',
  'change-password': 'settings.changePassword',
  'active-sessions': 'settings.activeSessions',
  'api-keys': 'settings.apiKeys',
  integrations: 'settings.integrations',
  'team-members': 'settings.teamMembers',
  'team-list': 'settings.teamList',
  plans: 'settings.plans',
  'audit-log': 'settings.auditLog',
}
