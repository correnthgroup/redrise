import { useMemo, useState } from 'react'
import { Pencil, Search, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PaginationFooter } from './pagination-footer'

type Member = {
  id: string
  name: string
  email: string
  function: string
  department: string
  status: 'Online' | 'Offline'
  employed: string
}

const INITIAL_MEMBERS: Member[] = Array.from({ length: 12 }, (_, index) => ({
  id: `m-${index + 1}`,
  name: `Member ${index + 1}`,
  email: `member${index + 1}@example.com`,
  function: ['Manager', 'Executive', 'Designer', 'Engineer'][index % 4],
  department: ['Organization', 'Projects', 'Developer'][index % 3],
  status: index % 2 === 0 ? 'Online' : 'Offline',
  employed: '23/04/18',
}))

const PAGE_SIZE = 7

function initials(name: string) {
  return name.replace(/[[\]]/g, '').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

export function MemberListTable({ onAddMember }: { onAddMember?: () => void }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return INITIAL_MEMBERS
    return INITIAL_MEMBERS.filter((member) => member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term) || member.function.toLowerCase().includes(term) || member.department.toLowerCase().includes(term))
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const rows = filtered.slice(start, start + PAGE_SIZE)

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Members List</h2>
          <p className="text-sm text-muted-foreground">See information about all members.</p>
        </div>
        <Button type="button" onClick={onAddMember}>
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search members" className="pl-8" />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Function</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Employed</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((member) => (
              <tr key={member.id} className="border-b last:border-b-0">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback>{initials(member.name)}</AvatarFallback></Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm">{member.function}</p>
                    <p className="text-xs text-muted-foreground">{member.department}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge variant="outline" className={member.status === 'Online' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}>
                    {member.status}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{member.employed}</td>
                <td className="px-3 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
    </Card>
  )
}
