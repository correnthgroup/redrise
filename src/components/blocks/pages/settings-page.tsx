import { useState, type ReactNode } from 'react'
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

type SettingsUser = { id: string; name: string; firstName: string; email: string; avatarUrl?: string | null }

type SettingKey =
  | 'personal-info'
  | 'change-password'
  | 'active-sessions'
  | 'api-keys'
  | 'integrations'
  | 'team-members'
  | 'team-list'
  | 'plans'
  | 'audit-log'

type SettingShortcut = {
  key: SettingKey
  titleKey: string
  descKey: string
  icon: ReactNode
  disabled?: boolean
}

function TeamMembersView({ user, onBack }: { user: SettingsUser; onBack: () => void }) {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <MemberListTable key={refreshKey} user={user} onAddMember={() => setOpen(true)} onBack={onBack} />
      <AddMemberModal ownerUserId={user.id} open={open} onOpenChange={setOpen} onMemberAdded={() => setRefreshKey((value) => value + 1)} />
    </>
  )
}

export function SettingsPage({ user }: { user: SettingsUser }) {
  const [active, setActive] = useState<SettingKey | null>(null)
  const { t } = useI18n()
  const plansEnabled = import.meta.env.DEV

  const SETTINGS_SHORTCUTS: SettingShortcut[] = [
    {
      key: 'personal-info',
      titleKey: 'settings.personalInfo',
      descKey: 'settings.personalInfoDesc',
      icon: <User className="h-5 w-5" />,
    },
    {
      key: 'change-password',
      titleKey: 'settings.changePassword',
      descKey: 'settings.changePasswordDesc',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      key: 'active-sessions',
      titleKey: 'settings.activeSessions',
      descKey: 'settings.activeSessionsDesc',
      icon: <Users className="h-5 w-5" />,
    },
    {
      key: 'api-keys',
      titleKey: 'settings.apiKeys',
      descKey: 'settings.apiKeysDesc',
      icon: <KeyRound className="h-5 w-5" />,
    },
    {
      key: 'integrations',
      titleKey: 'settings.integrations',
      descKey: 'settings.integrationsDesc',
      icon: <PlugZap className="h-5 w-5" />,
    },
    {
      key: 'team-members',
      titleKey: 'settings.teamMembers',
      descKey: 'settings.teamMembersDesc',
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      key: 'team-list',
      titleKey: 'settings.teamList',
      descKey: 'settings.teamListDesc',
      icon: <UsersRound className="h-5 w-5" />,
    },
    {
      key: 'plans',
      titleKey: 'settings.plans',
      descKey: 'settings.plansDesc',
      icon: <CreditCard className="h-5 w-5" />,
      disabled: !plansEnabled,
    },
    {
      key: 'audit-log',
      titleKey: 'settings.auditLog',
      descKey: 'settings.auditLogDesc',
      icon: <Shield className="h-5 w-5" />,
    },
  ]

  const goBack = () => setActive(null)

  let detail: ReactNode = null
  if (active === 'personal-info') detail = <AccountBasicInfoPage user={user} onBack={goBack} onSave={goBack} onOpenPlans={() => { if (plansEnabled) setActive('plans') }} />
  else if (active === 'change-password') detail = <ChangePassword onBack={goBack} />
  else if (active === 'active-sessions') detail = <SessionsList userId={user.id} onBack={goBack} />
  else if (active === 'api-keys') detail = <ApiKeysManager onBack={goBack} />
  else if (active === 'integrations') detail = <IntegrationSetupWizard onBack={goBack} />
  else if (active === 'team-members') detail = <TeamMembersView user={user} onBack={goBack} />
  else if (active === 'team-list') detail = <TeamListTable user={user} onBack={goBack} />
  else if (active === 'plans') detail = <PlansPage onBack={goBack} />
  else if (active === 'audit-log') detail = <AuditLogCard onBack={goBack} />

  if (active) {
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
                    <p className="text-xs leading-snug text-muted-foreground">{shortcut.disabled ? t('settings.underConstruction') : t(shortcut.descKey)}</p>
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
