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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PLACEHOLDER_ROWS = [
  { name: 'Pending invite 1', email: 'invite1@example.com' },
  { name: 'Pending invite 2', email: 'invite2@example.com' },
  { name: 'Pending invite 3', email: 'invite3@example.com' },
]

function initials(name: string) {
  return name.replace(/[[\]]/g, '').slice(0, 2).toUpperCase()
}

export function AddMemberModal({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [perm, setPerm] = useState('member')
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team members</DialogTitle>
          <DialogDescription>Invite people and assign their default permission.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {PLACEHOLDER_ROWS.map((r) => (
            <div key={r.email} className="flex items-center gap-2">
              <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px]">{initials(r.name)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{r.name}</div>
                <div className="truncate text-xs text-muted-foreground">{r.email}</div>
              </div>
              <Select value={perm} onValueChange={setPerm}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="space-y-1">
            <Label htmlFor="new-email">Invite a new email</Label>
            <Input id="new-email" placeholder="email@domain.com" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Send invites</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
