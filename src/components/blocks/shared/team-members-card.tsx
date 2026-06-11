import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, Shield, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { loadWorkspaceMembers, addWorkspaceMember, removeWorkspaceMember, type WorkspaceMember, type MemberRole } from '@/lib/workspace-members'

const ROLE_BADGE: Record<MemberRole, string> = {
  owner: 'border-[#8c1f28]/20 bg-[#8c1f28]/8 text-[#8c1f28]',
  admin: 'border-[#2F4858]/20 bg-[#2F4858]/8 text-[#2F4858]',
  member: 'border-slate-200 bg-slate-50 text-slate-600',
}

type TeamMembersCardProps = {
  workspaceId?: string
}

export function TeamMembersCard({ workspaceId }: TeamMembersCardProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(!workspaceId)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('member')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    loadWorkspaceMembers(workspaceId).then(setMembers).finally(() => setLoading(false))
  }, [workspaceId])

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault()
    if (!workspaceId || !inviteEmail.trim()) return
    setSaving(true)
    try {
      const member = await addWorkspaceMember(workspaceId, inviteEmail.trim(), inviteRole)
      if (member) {
        setMembers((prev) => [...prev, member])
        setInviteEmail('')
        setInviteRole('member')
        setShowInvite(false)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(memberId: string) {
    const success = await removeWorkspaceMember(memberId)
    if (success) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    }
  }

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">Manage who has access to this workspace and their roles.</p>
        </div>
        {workspaceId && (
          <Button type="button" size="sm" onClick={() => setShowInvite((value) => !value)}>
            <Plus className="h-4 w-4" />
            Invite
          </Button>
        )}
      </div>

      {showInvite && workspaceId ? (
        <form className="mt-4 space-y-4 rounded-lg border bg-muted/30 p-4" onSubmit={handleInvite}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input id="inviteEmail" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="colleague@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex gap-2">
                {(['admin', 'member'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setInviteRole(role)}
                    className={inviteRole === role ? 'rounded-md border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors' : 'rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40'}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button type="submit" disabled={!inviteEmail.trim() || saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inviting...</> : 'Send Invite'}
            </Button>
          </div>
        </form>
      ) : null}

      <Separator className="my-4" />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !workspaceId ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Select a workspace to manage team members.</p>
      ) : members.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No team members yet.</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{member.email || member.user_id}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {member.role === 'owner' ? 'Owner' : member.role.charAt(0).toUpperCase() + member.role.slice(1)} · Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${ROLE_BADGE[member.role]}`}>
                  <Shield className="mr-1 h-3 w-3" />
                  {member.role}
                </Badge>
                {member.role !== 'owner' && (
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemove(member.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
