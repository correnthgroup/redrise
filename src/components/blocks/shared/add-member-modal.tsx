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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addTeamMember, checkEmailExists, type TeamMemberRole } from '@/lib/team-members'
import { useI18n } from '@/hooks/use-i18n'

type InviteRoleOption = 'owner' | 'board' | 'member' | 'viewer'

const ROLE_MAP: Record<InviteRoleOption, TeamMemberRole> = {
  owner: 'owner',
  board: 'admin',
  member: 'member',
  viewer: 'viewer',
}

const FUNCTION_MAP: Record<InviteRoleOption, string> = {
  owner: 'Owner',
  board: 'Board',
  member: 'Member',
  viewer: 'Viewer',
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
  const [perm, setPerm] = useState<InviteRoleOption>('owner')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'registered' | 'not_registered'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

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
    const resolvedRole = ROLE_MAP[perm]
    const memberFunction = FUNCTION_MAP[perm]
    const created = await addTeamMember(ownerUserId, email, resolvedRole, memberFunction)
    setSubmitting(false)
    if (!created) {
      setError(t('settings.inviteError'))
      return
    }
    setEmail('')
    setPerm('owner')
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem] sm:items-end">
            <div className="space-y-1">
            <Label htmlFor="new-email">{t('settings.inviteEmail')}</Label>
              <Input id="new-email" type="email" value={email} onChange={handleEmailChange} />
              {emailStatus === 'registered' ? (
                <p className="text-xs text-[#2F5D5A]">{t('settings.emailAlreadyRegistered')}</p>
              ) : emailStatus === 'not_registered' ? (
                <p className="text-xs text-muted-foreground">{t('settings.emailNotRegistered')}</p>
              ) : null}
            </div>
            <Select value={perm} onValueChange={(value) => setPerm(value as InviteRoleOption)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">{t('settings.roleOwner')}</SelectItem>
                <SelectItem value="board">{t('settings.roleBoard')}</SelectItem>
                <SelectItem value="member">{t('settings.roleMember')}</SelectItem>
                <SelectItem value="viewer">{t('settings.roleViewer')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>{t('common.cancel')}</Button>
          <Button onClick={handleInvite} disabled={submitting || !email.trim()}>{t('settings.sendInvites')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
