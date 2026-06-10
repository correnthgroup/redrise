import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="grid h-full min-h-0 grid-cols-1 gap-6 p-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agents" className="pl-7 h-9" />
          </div>
          <Button onClick={onCreateAgent}><Plus className="h-4 w-4" /> New Agent</Button>
        </div>

        <Card className="min-h-0 flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Agents</CardTitle></CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No agents found.</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onOpenAgent?.(a.id)}
                      className="flex w-full items-center gap-3 rounded-md border bg-card p-3 text-left text-sm transition-colors hover:bg-accent/40"
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[a.status]}`} aria-hidden />
                      <span className="flex-1 truncate font-medium">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{a.model}</span>
                      <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[a.status]}`}>{a.status}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Agent Details</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">Select an agent to view details.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
