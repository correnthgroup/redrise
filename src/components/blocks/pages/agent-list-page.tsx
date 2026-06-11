import { useState } from 'react'
import { Search, Pause, Play, RotateCcw, Network, LayoutDashboard, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { Agent } from '@/types/agent'
import { useI18n } from '@/hooks/use-i18n'

type AgentFlow = { flowId: string; flowName: string; workspaceId: string; workspaceName: string; flowStatus: string }

const PLACEHOLDER_AGENT_FLOWS: Record<string, AgentFlow[]> = {
  a0001: [
    { flowId: 'f1a2b', flowName: 'Sales Qualification', workspaceId: 'w3k7m', workspaceName: 'Sales Ops', flowStatus: 'running' },
    { flowId: 'f2b3c', flowName: 'Lead Scoring', workspaceId: 'w3k7m', workspaceName: 'Sales Ops', flowStatus: 'paused' },
  ],
}

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

const FLOW_STATUS_BADGE: Record<string, string> = {
  running: 'border-[#2F4858]/25 bg-[#2F4858]/8 text-[#2F4858]',
  paused: 'border-[#B7791F]/18 bg-[#FFF4DB] text-[#8A6116]',
  error: 'border-primary/18 bg-primary/8 text-primary',
}

export function AgentListPage({
  agents,
  loading,
  onDeleteAgent,
  onOpenAgent,
}: {
  agents: Agent[]
  loading: boolean
  onDeleteAgent?: (id: string) => void
  onOpenAgent?: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedFlowIds, setCheckedFlowIds] = useState<Set<string>>(new Set())
  const { t } = useI18n()

  const filtered = agents.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
  const selectedAgent = agents.find((a) => a.id === selectedId)
  const agentFlows = selectedId ? (PLACEHOLDER_AGENT_FLOWS[selectedId] ?? []) : []

  const allFlowsSelected = agentFlows.length > 0 && agentFlows.every((af) => checkedFlowIds.has(af.flowId))

  function selectAgent(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
    setCheckedFlowIds(new Set())
  }

  function toggleFlowCheck(flowId: string) {
    setCheckedFlowIds((prev) => {
      const next = new Set(prev)
      if (next.has(flowId)) {
        next.delete(flowId)
      } else {
        next.add(flowId)
      }
      return next
    })
  }

  function toggleAllFlows() {
    if (allFlowsSelected) {
      setCheckedFlowIds(new Set())
    } else {
      setCheckedFlowIds(new Set(agentFlows.map((af) => af.flowId)))
    }
  }

  function handleRun() {
    const selectedFlows = agentFlows.filter((af) => checkedFlowIds.has(af.flowId))
    console.log('[AgentList] Run agent', selectedAgent?.name, 'on flows:', selectedFlows.map((f) => f.flowName))
    // TODO: persist agent execution in future sprint
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-6 p-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agents" className="pl-7 h-9" />
          </div>
        </div>

        <Card className="min-h-0 flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Agents</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading agents...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('agents.noAgents')}</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => selectAgent(a.id)}
                      className={`flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition-colors ${
                        selectedId === a.id
                          ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                          : 'bg-card hover:bg-accent/40'
                      }`}
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

      <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Agent Details</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRun} disabled={!selectedAgent || checkedFlowIds.size === 0}><Play className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Pause className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedAgent ? (
            <p className="text-sm text-muted-foreground text-center py-8">Select an agent to view details.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/35 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[selectedAgent.status]}`} aria-hidden />
                  <span className="font-medium">{selectedAgent.name}</span>
                  <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[selectedAgent.status]}`}>{selectedAgent.status}</Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Model: {selectedAgent.model}</div>
                <div className="text-xs text-muted-foreground mt-1">{selectedAgent.brief || 'No description'}</div>
                <div className="text-[10px] text-muted-foreground/60 font-mono mt-1">ID: {selectedAgent.id}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onOpenAgent?.(selectedAgent.id)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDeleteAgent?.(selectedAgent.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Flows / Workspaces</h4>
                  {agentFlows.length > 0 && (
                    <button type="button" onClick={toggleAllFlows} className="text-xs text-muted-foreground hover:text-foreground">
                      {allFlowsSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                {agentFlows.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Not assigned to any flows.</p>
                ) : (
                  <ul className="space-y-2">
                    {agentFlows.map((af) => (
                      <li key={af.flowId} className="flex items-center gap-3 rounded-md border p-2 text-sm">
                        <Checkbox
                          checked={checkedFlowIds.has(af.flowId)}
                          onCheckedChange={() => toggleFlowCheck(af.flowId)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Network className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate">{af.flowName}</span>
                            <Badge variant="outline" className={`text-[10px] uppercase ${FLOW_STATUS_BADGE[af.flowStatus] ?? ''}`}>{af.flowStatus}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <LayoutDashboard className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{af.workspaceName}</span>
                            <span className="text-[10px] text-muted-foreground/60 font-mono">{af.workspaceId}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
