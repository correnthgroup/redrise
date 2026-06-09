import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MemberListTable } from '../shared/member-list-table'
import { AddMemberModal } from '../shared/add-member-modal'

type Agent = { id: string; name: string; status: 'active' | 'paused' | 'error' | 'idle'; model: string }
const PLACEHOLDER_AGENTS: Agent[] = Array.from({ length: 10 }, (_, i) => ({
  id: `a${i + 1}`,
  name: `Agent ${i + 1}`,
  status: (['active', 'paused', 'error', 'idle'] as const)[i % 4],
  model: ['Model A', 'Model B', 'Model C'][i % 3],
}))

const STATUS_COLOR: Record<Agent['status'], string> = {
  active: 'bg-[#2F4858]',
  paused: 'bg-amber-500',
  error: 'bg-[#8c1f28]',
  idle: 'bg-slate-400',
}

const STATUS_BADGE: Record<Agent['status'], string> = {
  active: 'border-[#2F4858]/25 bg-[#2F4858]/8 text-[#2F4858]',
  paused: 'border-[#B7791F]/18 bg-[#FFF4DB] text-[#8A6116]',
  error: 'border-primary/18 bg-primary/8 text-primary',
  idle: 'border-slate-200 bg-slate-50 text-slate-600',
}

export function AgentListPage({
  onCreateAgent,
  onOpenAgent,
}: {
  onCreateAgent?: () => void
  onOpenAgent?: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = PLACEHOLDER_AGENTS.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 animate-app-rise">
      <header className="flex items-center justify-between gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agents" className="pl-7 h-9" />
        </div>
        <div className="flex gap-2">
          <AddMemberModal trigger={<Button variant="outline">Invite</Button>} />
          <Button onClick={onCreateAgent}><Plus className="h-4 w-4" /> New Agent</Button>
        </div>
      </header>

      <section className="rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <header className="flex items-center justify-between border-b p-3 text-sm font-semibold">
          <div>
            <span>Agents</span>
            <p className="mt-1 text-xs font-normal text-muted-foreground">AI fleet with human control and workspace context.</p>
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} of {PLACEHOLDER_AGENTS.length}</span>
        </header>
        <ul className="divide-y">
          {filtered.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onOpenAgent?.(a.id)}
                className="flex w-full items-center gap-3 p-3 text-left text-sm transition-colors hover:bg-accent/40"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[a.status]}`} aria-hidden />
                <span className="flex-1 truncate">{a.name}</span>
                <span className="text-xs text-muted-foreground">{a.model}</span>
                <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[a.status]}`}>{a.status}</Badge>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <MemberListTable />
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Operational summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="font-medium text-foreground">Active agents</p>
              <p className="mt-1">Track approval rate, latency and context quality before enabling broader autonomy.</p>
            </div>
            <div className="rounded-lg border bg-[#2F4858]/6 p-3">
              <p className="font-medium text-foreground">Context policy</p>
              <p className="mt-1">Workspace, flow and task context should stay explicit in every assisted execution.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
