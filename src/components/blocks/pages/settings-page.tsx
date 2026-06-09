import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  KeyRound,
  PlugZap,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AccountBasicInfoPage } from './account-basic-info-page'
import { IntegrationSetupWizard } from '../shared/integration-setup-wizard'
import { ChangePassword } from '../shared/change-password'
import { SessionsList } from '../shared/sessions-list'
import { ApiKeysManager } from '../shared/api-keys-manager'
import { MemberListTable } from '../shared/member-list-table'
import { AddMemberModal } from '../shared/add-member-modal'

type SettingKey =
  | 'personal-info'
  | 'change-password'
  | 'active-sessions'
  | 'api-keys'
  | 'integrations'
  | 'team-members'

type SettingShortcut = {
  key: SettingKey
  title: string
  description: string
  icon: ReactNode
}

const SETTINGS_SHORTCUTS: SettingShortcut[] = [
  {
    key: 'personal-info',
    title: 'Personal Information',
    description: 'Avatar, name, email, phone, address and other personal details.',
    icon: <User className="h-5 w-5" />,
  },
  {
    key: 'change-password',
    title: 'Change Password',
    description: 'Update the password used to sign in to the workspace.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    key: 'active-sessions',
    title: 'Active Sessions',
    description: 'Review and revoke devices signed in to your workspace.',
    icon: <Users className="h-5 w-5" />,
  },
  {
    key: 'api-keys',
    title: 'API Keys',
    description: 'Create, label and revoke programmatic access keys.',
    icon: <KeyRound className="h-5 w-5" />,
  },
  {
    key: 'integrations',
    title: 'Integration Setup',
    description: 'Connect the workspace to Slack, GitHub, Postgres and more.',
    icon: <PlugZap className="h-5 w-5" />,
  },
  {
    key: 'team-members',
    title: 'Team Members',
    description: 'See information about all members and invite new ones.',
    icon: <UserPlus className="h-5 w-5" />,
  },
]

function TeamMembersView() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <MemberListTable onAddMember={() => setOpen(true)} />
      <AddMemberModal open={open} onOpenChange={setOpen} />
    </>
  )
}

export function SettingsPage() {
  const [active, setActive] = useState<SettingKey | null>(null)

  let detail: ReactNode = null
  if (active === 'personal-info') detail = <AccountBasicInfoPage />
  else if (active === 'change-password') detail = <ChangePassword />
  else if (active === 'active-sessions') detail = <SessionsList />
  else if (active === 'api-keys') detail = <ApiKeysManager />
  else if (active === 'integrations') detail = <IntegrationSetupWizard />
  else if (active === 'team-members') detail = <TeamMembersView />

  if (active) {
    return (
      <div className="flex h-full flex-col overflow-hidden animate-app-rise">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActive(null)}
            aria-label="Back to settings shortcuts"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-muted/20">
          <div className="flex min-h-full w-full items-center justify-center p-6">
            <div className="w-full max-w-3xl">{detail}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden animate-app-rise">
      <div className="min-h-0 flex-1 overflow-auto bg-muted/20">
        <div className="flex min-h-full w-full items-center justify-center p-6">
          <Card className="w-full max-w-3xl gap-0 rounded-xl border-border/80 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
            <h2 className="text-base font-semibold">Account Shortcuts</h2>
            <p className="text-sm text-muted-foreground">
              Jump into the most common account and integration tasks.
            </p>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SETTINGS_SHORTCUTS.map((shortcut) => (
                <button
                  key={shortcut.key}
                  type="button"
                  onClick={() => setActive(shortcut.key)}
                  className="group flex items-start gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:border-[#2F4858]/45 hover:bg-[#2F4858]/4"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-[#2F4858] group-hover:text-white">
                    {shortcut.icon}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold">{shortcut.title}</p>
                    <p className="text-xs leading-snug text-muted-foreground">{shortcut.description}</p>
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
