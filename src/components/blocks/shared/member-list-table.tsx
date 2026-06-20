import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Loader2, Pencil, Search, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaginationFooter } from './pagination-footer'
import { loadTeamMembers, updateTeamMember, type TeamMember } from '@/lib/team-members'
import { useI18n } from '@/hooks/use-i18n'

type CurrentUser = { id: string; name: string; email: string; avatarUrl?: string | null }

const PAGE_SIZE = 7

function initials(name: string) {
  return name.replace(/[[\]]/g, '').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

export function MemberListTable({ user, onAddMember, onBack }: { user: CurrentUser; onAddMember?: () => void; onBack?: () => void }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TeamMember | null>(null)

  const refreshMembers = useCallback(async () => {
    setLoading(true)
    setMembers(await loadTeamMembers(user.id))
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    void Promise.resolve().then(refreshMembers)
    const interval = window.setInterval(refreshMembers, 30_000)
    return () => window.clearInterval(interval)
  }, [refreshMembers])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return members
    return members.filter((member) => member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term) || member.function.toLowerCase().includes(term) || member.team.toLowerCase().includes(term))
  }, [members, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const rows = filtered.slice(start, start + PAGE_SIZE)
  const functionOptions = [
    { value: 'Staff', label: t('settings.memberFunctionStaff') },
    { value: 'Member', label: t('settings.memberFunctionMember') },
    { value: 'Viewer', label: t('settings.memberFunctionViewer') },
  ]

  function roleLabel(role: TeamMember['role']) {
    if (role === 'admin') return t('settings.roleAdmin')
    if (role === 'member') return t('settings.roleMember')
    if (role === 'viewer') return t('settings.roleViewer')
    return role
  }

  function statusLabel(status: TeamMember['status']) {
    if (status === 'Online') return t('settings.statusOnline')
    if (status === 'Offline') return t('settings.statusOffline')
    return t('settings.statusInvited')
  }

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('settings.membersList')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.membersListDesc')}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder={t('settings.searchMembers')} className="pl-8" />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-medium">{t('settings.name')}</th>
              <th className="px-3 py-2 font-medium">{t('settings.function')}</th>
              <th className="px-3 py-2 font-medium">{t('settings.status')}</th>
              <th className="px-3 py-2 font-medium">{t('settings.team')}</th>
              <th className="px-3 py-2 font-medium">{t('settings.joined')}</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />{t('settings.loadingMembers')}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">{t('settings.noMembersFound')}</td></tr>
            ) : rows.map((member) => (
              <tr key={member.id} className="border-b last:border-b-0">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
                      <AvatarFallback>{initials(member.name) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm">{member.function || '-'}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel(member.role)}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge variant="outline" className={member.status === 'Online' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : member.status === 'Invited' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}>
                    {statusLabel(member.status)}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{member.team || '-'}</td>
                <td className="px-3 py-3 text-muted-foreground">{member.joined}</td>
                <td className="px-3 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(member)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <PaginationFooter page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.editMember')}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <Avatar className="h-10 w-10">
                  {editing.avatarUrl ? <AvatarImage src={editing.avatarUrl} alt={editing.name} /> : null}
                  <AvatarFallback>{initials(editing.name) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{editing.name}</p>
                  <p className="text-xs text-muted-foreground">{editing.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-function">{t('settings.function')}</Label>
                <Select value={functionOptions.some((option) => option.value === editing.function) ? editing.function : 'Member'} onValueChange={(value) => setEditing({ ...editing, function: value })}>
                  <SelectTrigger id="member-function"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {functionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-team">{t('settings.team')}</Label>
                <Input id="member-team" value={editing.team} onChange={(event) => setEditing({ ...editing, team: event.target.value })} />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('common.cancel')}</Button>
            <Button onClick={async () => {
              if (editing) await updateTeamMember(editing)
              setEditing(null)
              await refreshMembers()
            }}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-4 flex justify-between border-t pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <Button type="button" size="sm" onClick={onAddMember}>
          <UserPlus className="h-4 w-4" />
          {t('settings.addMember')}
        </Button>
      </div>
    </Card>
  )
}
