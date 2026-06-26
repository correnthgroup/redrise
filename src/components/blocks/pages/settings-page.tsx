import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  KeyRound,
  CreditCard,
  PlugZap,
  Shield,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AccountBasicInfoPage } from './account-basic-info-page'
import { IntegrationSetupWizard } from '../shared/integration-setup-wizard'
import { ChangePassword } from '../shared/change-password'
import { SessionsList } from '../shared/sessions-list'
import { ApiKeysManager } from '../shared/api-keys-manager'
import { MemberListTable } from '../shared/member-list-table'
import { TeamListTable } from '../shared/team-list-table'
import { AddMemberModal } from '../shared/add-member-modal'
import { AuditLogCard } from '../shared/audit-log-card'
import { PlansPage } from './plans-page'
import { useI18n } from '@/hooks/use-i18n'
import { loadSettingsAdminContext, type SettingsAdminContext } from '@/lib/team-members'
import { SETTING_TITLE_KEYS, type SettingKey } from '@/lib/settings-keys'

type SettingsUser = { id: string; name: string; firstName: string; email: string; avatarUrl?: string | null }

type SettingShortcut = {
  key: SettingKey
  titleKey: string
  descKey: string
  icon: ReactNode
  disabled?: boolean
}

const ADMIN_ONLY_SETTINGS = new Set<SettingKey>(['api-keys', 'team-members', 'team-list'])

function TeamMembersView({ user, ownerUserId, canManageMembers, onBack }: { user: SettingsUser; ownerUserId: string; canManageMembers: boolean; onBack: () => void }) {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const ownerUser = useMemo(() => ({ ...user, id: ownerUserId }), [ownerUserId, user])

  return (
    <>
      <MemberListTable key={refreshKey} user={ownerUser} onAddMember={() => setOpen(true)} onBack={onBack} canAddMember={canManageMembers} canEditRoles={canManageMembers} />
      {canManageMembers ? <AddMemberModal ownerUserId={ownerUserId} open={open} onOpenChange={setOpen} onMemberAdded={() => setRefreshKey((value) => value + 1)} /> : null}
    </>
  )
}

export function SettingsPage({
  user,
  activeSetting,
  onActiveSettingChange,
}: {
  user: SettingsUser
  activeSetting?: SettingKey | null
  onActiveSettingChange?: (setting: SettingKey | null) => void
}) {
  const [internalActive, setInternalActive] = useState<SettingKey | null>(null)
  const [adminContext, setAdminContext] = useState<SettingsAdminContext | null>(null)
  const { t } = useI18n()
  const active = activeSetting !== undefined ? activeSetting : internalActive

  function setActive(setting: SettingKey | null) {
    if (activeSetting === undefined) setInternalActive(setting)
    onActiveSettingChange?.(setting)
  }

  useEffect(() => {
    let cancelled = false
    void loadSettingsAdminContext(user.id).then((context) => {
      if (!cancelled) setAdminContext(context)
    })
    return () => { cancelled = true }
  }, [user.id])

  const canOpenAdminSettings = !!adminContext?.isAdmin
  const canOpenTeamManagerSettings = !!adminContext?.isTeamManager
  const settingsOwnerId = adminContext?.ownerUserId ?? user.id

  const SETTINGS_SHORTCUTS: SettingShortcut[] = [
    {
      key: 'personal-info',
      titleKey: SETTING_TITLE_KEYS['personal-info'],
      descKey: 'settings.personalInfoDesc',
      icon: <User className="h-5 w-5" />,
    },
    {
      key: 'change-password',
      titleKey: SETTING_TITLE_KEYS['change-password'],
      descKey: 'settings.changePasswordDesc',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      key: 'active-sessions',
      titleKey: SETTING_TITLE_KEYS['active-sessions'],
      descKey: 'settings.activeSessionsDesc',
      icon: <Users className="h-5 w-5" />,
    },
    {
      key: 'api-keys',
      titleKey: SETTING_TITLE_KEYS['api-keys'],
      descKey: 'settings.apiKeysDesc',
      icon: <KeyRound className="h-5 w-5" />,
      disabled: !canOpenAdminSettings,
    },
    {
      key: 'integrations',
      titleKey: SETTING_TITLE_KEYS.integrations,
      descKey: 'settings.integrationsDesc',
      icon: <PlugZap className="h-5 w-5" />,
    },
    {
      key: 'team-members',
      titleKey: SETTING_TITLE_KEYS['team-members'],
      descKey: 'settings.teamMembersDesc',
      icon: <UserPlus className="h-5 w-5" />,
      disabled: !canOpenTeamManagerSettings,
    },
    {
      key: 'team-list',
      titleKey: SETTING_TITLE_KEYS['team-list'],
      descKey: 'settings.teamListDesc',
      icon: <UsersRound className="h-5 w-5" />,
      disabled: !canOpenTeamManagerSettings,
    },
    {
      key: 'plans',
      titleKey: SETTING_TITLE_KEYS.plans,
      descKey: 'settings.plansDesc',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      key: 'audit-log',
      titleKey: SETTING_TITLE_KEYS['audit-log'],
      descKey: 'settings.auditLogDesc',
      icon: <Shield className="h-5 w-5" />,
    },
  ]

  const goBack = () => setActive(null)

  const safeActive = active && (active === 'api-keys' ? canOpenAdminSettings : !ADMIN_ONLY_SETTINGS.has(active) || canOpenTeamManagerSettings) ? active : null

  let detail: ReactNode = null
  if (safeActive === 'personal-info') detail = <AccountBasicInfoPage user={user} onBack={goBack} onSave={goBack} onOpenPlans={() => setActive('plans')} />
  else if (safeActive === 'change-password') detail = <ChangePassword onBack={goBack} />
  else if (safeActive === 'active-sessions') detail = <SessionsList userId={user.id} onBack={goBack} />
  else if (safeActive === 'api-keys') detail = <ApiKeysManager onBack={goBack} ownerUserId={settingsOwnerId} />
  else if (safeActive === 'integrations') detail = <IntegrationSetupWizard onBack={goBack} ownerUserId={settingsOwnerId} currentFunction={adminContext?.function ?? ''} />
  else if (safeActive === 'team-members') detail = <TeamMembersView user={user} ownerUserId={settingsOwnerId} canManageMembers={canOpenAdminSettings} onBack={goBack} />
  else if (safeActive === 'team-list') detail = <TeamListTable user={{ ...user, id: settingsOwnerId }} onBack={goBack} />
  else if (safeActive === 'plans') detail = <PlansPage ownerUserId={settingsOwnerId} canManageBilling={canOpenAdminSettings} onBack={goBack} />
  else if (safeActive === 'audit-log') detail = <AuditLogCard onBack={goBack} />

  if (safeActive) {
    return (
      <div className="flex h-full flex-col overflow-hidden animate-app-rise">
        <div className="min-h-0 flex-1 overflow-auto bg-muted/20">
          <div className="flex min-h-full w-full items-center justify-center p-6">
            <div className="w-full max-w-3xl">{detail}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="settings-page" className="flex h-full flex-col overflow-hidden animate-app-rise">
      <div className="min-h-0 flex-1 overflow-auto bg-muted/20">
        <div className="flex min-h-full w-full items-center justify-center p-6">
          <Card className="w-full max-w-3xl gap-0 rounded-xl border-border/80 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
            <h2 className="text-base font-semibold">{t('settings.shortcuts')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('settings.shortcutsDesc')}
            </p>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SETTINGS_SHORTCUTS.map((shortcut) => (
                <button
                  key={shortcut.key}
                  type="button"
                  data-testid={`settings-shortcut-${shortcut.key}`}
                  disabled={shortcut.disabled}
                  onClick={() => { if (!shortcut.disabled) setActive(shortcut.key) }}
                  className="group flex items-start gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:border-[#2F5D5A]/45 hover:bg-[#2F5D5A]/4 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:hover:bg-background"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-[#2F5D5A] group-hover:text-white">
                    {shortcut.icon}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold">{t(shortcut.titleKey)}</p>
                    <p className="text-xs leading-snug text-muted-foreground">{shortcut.disabled ? (ADMIN_ONLY_SETTINGS.has(shortcut.key) ? t('settings.adminOnly') : t('settings.underConstruction')) : t(shortcut.descKey)}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
