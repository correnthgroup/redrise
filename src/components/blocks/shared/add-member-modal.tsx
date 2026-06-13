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
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [perm, setPerm] = useState<TeamMemberRole>('member')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  async function handleInvite() {
    setError(null)
    setSubmitting(true)
    const created = await addTeamMember(ownerUserId, email, perm)
    setSubmitting(false)
    if (!created) {
      setError('Could not send the invite. Check the email and try again.')
      return
    }
    setEmail('')
    setPerm('member')
    onMemberAdded?.()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team members</DialogTitle>
          <DialogDescription>Invite people and assign their default permission.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_8rem] sm:items-end">
            <div className="space-y-1">
            <Label htmlFor="new-email">Invite a new email</Label>
              <Input id="new-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <Select value={perm} onValueChange={(value) => setPerm(value as TeamMemberRole)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleInvite} disabled={submitting || !email.trim()}>Send invites</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
