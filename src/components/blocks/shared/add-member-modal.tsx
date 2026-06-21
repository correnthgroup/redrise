import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addTeamMember, checkEmailExists, type TeamMemberRole } from '@/lib/team-members'
import { MEMBER_FUNCTIONS, getMemberFunctionLabelKey, normalizeMemberFunction, type MemberFunction } from '@/lib/member-functions'
import { loadTeams, type Team } from '@/lib/teams'
import { DROPDOWN_TRIGGER_CLASSES } from '@/lib/styles'
import { useI18n } from '@/hooks/use-i18n'

const ROLE_MAP: Record<MemberFunction, TeamMemberRole> = {
  Owner: 'owner',
  Board: 'admin',
  Staff: 'admin',
  Member: 'member',
  Viewer: 'viewer',
}

export function AddMemberModal({
  trigger,
  open: controlledOpen,
  onOpenChange,
  ownerUserId,
  onMemberAdded,
}: {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  ownerUserId: string
  onMemberAdded?: () => void
}) {
  const { t } = useI18n()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [role, setRole] = useState<MemberFunction | ''>('')
  const [teamId, setTeamId] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'registered' | 'not_registered'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  useEffect(() => {
    if (!open) return
    void loadTeams(ownerUserId).then(setTeams)
  }, [open, ownerUserId])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) return
    debounceRef.current = setTimeout(async () => {
      const exists = await checkEmailExists(cleanEmail)
      setEmailStatus(exists ? 'registered' : 'not_registered')
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [email])

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value)
    setEmailStatus('idle')
  }

  async function handleInvite() {
    setError(null)
    setSubmitting(true)
    if (!role) {
      setSubmitting(false)
      setError(t('settings.roleRequired'))
      return
    }
    const selectedTeam = teams.find((team) => team.id === teamId)
    const created = await addTeamMember(ownerUserId, email, ROLE_MAP[role], role, selectedTeam?.name ?? '')
    setSubmitting(false)
    if (!created) {
      setError(t('settings.inviteError'))
      return
    }
    setEmail('')
    setRole('')
    setTeamId('')
    setEmailStatus('idle')
    onMemberAdded?.()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings.addTeamMembers')}</DialogTitle>
          <DialogDescription>{t('settings.invitePeople')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_12rem] sm:items-end">
            <div className="space-y-1">
              <RequiredLabel htmlFor="new-email">{t('settings.inviteEmail')}</RequiredLabel>
              <Input id="new-email" type="email" value={email} onChange={handleEmailChange} />
              {emailStatus === 'registered' ? (
                <p className="text-xs text-[#2F5D5A]">{t('settings.emailAlreadyRegistered')}</p>
              ) : emailStatus === 'not_registered' ? (
                <p className="text-xs text-muted-foreground">{t('settings.emailNotRegistered')}</p>
              ) : null}
            </div>
            <div className="space-y-1">
              <RequiredLabel htmlFor="new-role">{t('settings.function')}</RequiredLabel>
              <Select value={role} onValueChange={(value) => setRole(normalizeMemberFunction(value))}>
                <SelectTrigger id="new-role" className={DROPDOWN_TRIGGER_CLASSES}><SelectValue placeholder={t('settings.select')} /></SelectTrigger>
                <SelectContent>
                  {MEMBER_FUNCTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{t(getMemberFunctionLabelKey(option))}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-team">{t('settings.team')}</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger id="new-team" className={DROPDOWN_TRIGGER_CLASSES}><SelectValue placeholder={t('settings.select')} /></SelectTrigger>
              <SelectContent>
                {teams.length === 0 ? <SelectItem value="__empty" disabled>{t('settings.noTeams')}</SelectItem> : teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>{t('common.cancel')}</Button>
          <Button onClick={handleInvite} disabled={submitting || !email.trim() || !role}>{t('settings.sendInvites')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
