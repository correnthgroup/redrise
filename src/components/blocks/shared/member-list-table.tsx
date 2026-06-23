import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Search, Trash2, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PaginationFooter } from './pagination-footer'
import { loadTeamMembers, removeTeamMember, updateTeamMember, type TeamMember, type TeamMemberRole } from '@/lib/team-members'
import { MEMBER_FUNCTIONS, getMemberFunctionLabelKey, normalizeMemberFunction, type MemberFunction } from '@/lib/member-functions'
import { useI18n } from '@/hooks/use-i18n'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DROPDOWN_TRIGGER_CLASSES } from '@/lib/styles'

type CurrentUser = { id: string; name: string; email: string; avatarUrl?: string | null }

const PAGE_SIZE = 7

const ROLE_MAP: Record<MemberFunction, TeamMemberRole> = {
  Admin: 'admin',
  Owner: 'owner',
  Board: 'admin',
  Staff: 'admin',
  Member: 'member',
  Viewer: 'viewer',
}

function initials(name: string) {
  return name.replace(/[[\]]/g, '').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

export function MemberListTable({ user, onAddMember, onBack, canAddMember = true, canEditRoles = true }: { user: CurrentUser; onAddMember?: () => void; onBack?: () => void; canAddMember?: boolean; canEditRoles?: boolean }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

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
  async function handleFunctionChange(member: TeamMember, value: string) {
    const nextFunction = normalizeMemberFunction(value)
    setSavingMemberId(member.id)
    const nextMember = { ...member, function: nextFunction, role: ROLE_MAP[nextFunction] }
    const saved = await updateTeamMember(nextMember)
    if (saved) {
      setMembers((current) => current.map((item) => item.id === member.id ? nextMember : item))
    }
    setSavingMemberId(null)
  }

  async function handleRemoveInvite(member: TeamMember) {
    if (member.status !== 'Invited') return
    setRemovingMemberId(member.id)
    const removed = await removeTeamMember(member.id)
    if (removed) {
      setMembers((current) => current.filter((item) => item.id !== member.id))
    }
    setRemovingMemberId(null)
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
              {canAddMember ? <th className="px-3 py-2 text-right font-medium">{t('common.actions')}</th> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={canAddMember ? 6 : 5} className="px-3 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />{t('settings.loadingMembers')}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={canAddMember ? 6 : 5} className="px-3 py-8 text-center text-muted-foreground">{t('settings.noMembersFound')}</td></tr>
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
                  <Select value={member.function || 'Member'} onValueChange={(value) => { void handleFunctionChange(member, value) }} disabled={!canEditRoles || savingMemberId === member.id}>
                    <SelectTrigger className={DROPDOWN_TRIGGER_CLASSES} aria-label={t('settings.function')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_FUNCTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{t(getMemberFunctionLabelKey(option))}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-3">
                  <Badge variant="outline" className={member.status === 'Online' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : member.status === 'Invited' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}>
                    {statusLabel(member.status)}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{member.team || '-'}</td>
                <td className="px-3 py-3 text-muted-foreground">{member.joined}</td>
                {canAddMember ? (
                  <td className="px-3 py-3 text-right">
                    {member.status === 'Invited' ? (
                      <Button type="button" variant="ghost" size="icon" onClick={() => { void handleRemoveInvite(member) }} disabled={removingMemberId === member.id} aria-label={t('settings.removeInvite')}>
                        {removingMemberId === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <PaginationFooter page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <div className="mt-4 flex justify-between border-t pt-4">
        <BackButton onClick={onBack} />
        {canAddMember ? (
          <Button type="button" size="sm" onClick={onAddMember}>
            <UserPlus className="h-4 w-4" />
            {t('settings.addMember')}
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
