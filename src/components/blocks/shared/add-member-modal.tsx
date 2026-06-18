import { useState, type ReactNode } from 'react'
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
import { addTeamMember, type TeamMemberRole } from '@/lib/team-members'
import { useI18n } from '@/hooks/use-i18n'

type InviteRoleOption = 'staff' | TeamMemberRole

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
  const [perm, setPerm] = useState<InviteRoleOption>('staff')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  async function handleInvite() {
    setError(null)
    setSubmitting(true)
    const resolvedRole: TeamMemberRole = perm === 'staff' ? 'admin' : perm
    const memberFunction = perm === 'staff'
      ? 'Staff'
      : perm === 'member'
        ? 'Member'
        : perm === 'viewer'
          ? 'Viewer'
          : 'Admin'
    const created = await addTeamMember(ownerUserId, email, resolvedRole, memberFunction)
    setSubmitting(false)
    if (!created) {
      setError(t('settings.inviteError'))
      return
    }
    setEmail('')
    setPerm('staff')
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
              <Input id="new-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Select value={perm} onValueChange={(value) => setPerm(value as InviteRoleOption)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">{t('settings.roleStaff')}</SelectItem>
                <SelectItem value="admin">{t('settings.roleAdmin')}</SelectItem>
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
