import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkflowPipeline } from '../shared/workflow-pipeline'
import { Badge } from '@/components/ui/badge'

const PLACEHOLDER_FLOWS = [
  { id: 'f1', name: 'Sales Qualification', status: 'running', owner: 'Owner A' },
  { id: 'f2', name: 'Client Onboarding', status: 'paused', owner: 'Owner B' },
  { id: 'f3', name: 'Escalation Routing', status: 'error', owner: 'Owner C' },
  { id: 'f4', name: 'Delivery Handoff', status: 'running', owner: 'Owner D' },
]

function badgeClassName(status: string) {
  switch (status) {
    case 'running':
      return 'border-[#2F4858]/25 bg-[#2F4858]/8 text-[#2F4858]'
    case 'paused':
      return 'border-[#B7791F]/20 bg-[#FFF4DB] text-[#8A6116]'
    default:
      return 'border-primary/20 bg-primary/8 text-primary'
  }
}

export function FlowListPage({ onOpen, onCreate }: { onOpen?: (id: string) => void; onCreate?: () => void }) {
  const [query, setQuery] = useState('')
  const filtered = PLACEHOLDER_FLOWS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-6 p-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search flows" className="pl-7 h-9" />
          </div>
          <Button onClick={onCreate}><Plus className="h-4 w-4" /> New Flow</Button>
        </div>

        <Card className="min-h-0 flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Flows</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {filtered.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => onOpen?.(f.id)}
                    className="flex w-full items-center justify-between rounded-md border bg-card p-3 text-left text-sm hover:bg-accent/60"
                  >
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">Owner: {f.owner}</div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase ${badgeClassName(f.status)}`}>{f.status}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <WorkflowPipeline />
    </div>
  )
}
