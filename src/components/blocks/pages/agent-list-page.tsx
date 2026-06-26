import { useState } from 'react'
import { Search, Pause, Play, RotateCcw, Network, LayoutDashboard, Trash2, Plus, Eye, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Agent } from '@/types/agent'
import { useI18n } from '@/hooks/use-i18n'
import { DROPDOWN_TRIGGER_CLASSES } from '@/lib/styles'

type AgentFlow = { flowId: string; flowName: string; workspaceId: string; workspaceName: string; flowStatus: string }

const PLACEHOLDER_AGENT_FLOWS: Record<string, AgentFlow[]> = {
  a0001: [
    { flowId: 'f1a2b', flowName: 'Sales Qualification', workspaceId: 'w3k7m', workspaceName: 'Sales Ops', flowStatus: 'running' },
    { flowId: 'f2b3c', flowName: 'Lead Scoring', workspaceId: 'w3k7m', workspaceName: 'Sales Ops', flowStatus: 'paused' },
  ],
}

const STATUS_COLOR: Record<Agent['status'], string> = {
  active: 'bg-[#2F5D5A]',
  paused: 'bg-amber-500',
  error: 'bg-[#A04D1F]',
  idle: 'bg-slate-400',
}

const STATUS_BADGE: Record<Agent['status'], string> = {
  active: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  paused: 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]',
  error: 'border-primary/18 bg-primary/8 text-primary',
  idle: 'border-slate-200 bg-slate-50 text-slate-600',
}

const FLOW_STATUS_BADGE: Record<string, string> = {
  running: 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]',
  paused: 'border-[#B7791F]/18 bg-[#FFF8E1] text-[#7A3E14]',
  error: 'border-primary/18 bg-primary/8 text-primary',
}

export function AgentListPage({
  agents,
  loading,
  canManageAgents = false,
  canUseAgents = true,
  onDeleteAgent,
  onRenameAgent,
  onOpenAgent,
}: {
  agents: Agent[]
  loading: boolean
  canManageAgents?: boolean
  canUseAgents?: boolean
  onDeleteAgent?: (id: string) => void | Promise<void>
  onRenameAgent?: (id: string, name: string) => Promise<Agent | null>
  onOpenAgent?: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkedFlowIds, setCheckedFlowIds] = useState<Set<string>>(new Set())
  const [renameAgent, setRenameAgent] = useState<Agent | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [processing, setProcessing] = useState(false)
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
    if (!canUseAgents) return
    const selectedFlows = agentFlows.filter((af) => checkedFlowIds.has(af.flowId))
    console.log('[AgentList] Run agent', selectedAgent?.name, 'on flows:', selectedFlows.map((f) => f.flowName))
    // TODO: persist agent execution in future sprint
  }

  function openRename(agent: Agent) {
    setRenameAgent(agent)
    setRenameValue(agent.name)
  }

  async function handleRename() {
    if (!renameAgent || !renameValue.trim() || processing) return
    setProcessing(true)
    try {
      const updated = await onRenameAgent?.(renameAgent.id, renameValue.trim())
      if (updated) setRenameAgent(null)
    } finally {
      setProcessing(false)
    }
  }

  async function handleDelete() {
    if (!deleteAgent || deleteConfirmation !== 'DELETE' || processing) return
    setProcessing(true)
    try {
      await onDeleteAgent?.(deleteAgent.id)
      if (selectedId === deleteAgent.id) setSelectedId(null)
      setDeleteAgent(null)
      setDeleteConfirmation('')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <div data-testid="agent-list-page" className="grid h-full min-h-0 grid-cols-1 gap-6 p-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('agents.searchAgents')} className="pl-7 h-9" />
          </div>
        </div>

        <Card className="min-h-0 flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('agents.title')}</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('agents.loadingAgents')}</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('agents.noAgents')}</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((a) => (
                  <li key={a.id}>
                    <div
                      className={`flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition-colors ${
                        selectedId === a.id
                          ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                          : 'bg-card hover:bg-accent/40'
                      }`}
                    >
                      <button type="button" onClick={() => selectAgent(a.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[a.status]}`} aria-hidden />
                        <span className="flex-1 truncate font-medium">{a.name}</span>
                        <span className="hidden text-xs text-muted-foreground sm:inline">{a.model}</span>
                        <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[a.status]}`}>{a.status}</Badge>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label={t('agents.actionsFor', { name: a.name })} className={`${DROPDOWN_TRIGGER_CLASSES} h-8 w-8 shrink-0 justify-center rounded-full p-0`}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onOpenAgent?.(a.id)}><Eye className="h-3.5 w-3.5" />{t('agents.viewDetails')}</DropdownMenuItem>
                          {canManageAgents ? <DropdownMenuItem onClick={() => openRename(a)}><Pencil className="h-3.5 w-3.5" />{t('agents.rename')}</DropdownMenuItem> : null}
                          {canManageAgents ? <DropdownMenuSeparator /> : null}
                          {canManageAgents ? <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteAgent(a)}><Trash2 className="h-3.5 w-3.5" />{t('common.delete')}</DropdownMenuItem> : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">{t('agents.agentDetails')}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRun} disabled={!canUseAgents || !selectedAgent || checkedFlowIds.size === 0}><Play className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Pause className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedAgent ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t('agents.selectAgent')}</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/35 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[selectedAgent.status]}`} aria-hidden />
                  <span className="font-medium">{selectedAgent.name}</span>
                  <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_BADGE[selectedAgent.status]}`}>{selectedAgent.status}</Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{t('agents.model', { model: selectedAgent.model })}</div>
                <div className="text-xs text-muted-foreground mt-1">{selectedAgent.brief || t('agents.noDescription')}</div>
                <div className="text-[10px] text-muted-foreground/60 font-mono mt-1">{t('common.id', { id: selectedAgent.id })}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onOpenAgent?.(selectedAgent.id)}
                >
                  {t('agents.viewDetails')}
                </Button>
                {canManageAgents ? <Button variant="outline" size="sm" onClick={() => openRename(selectedAgent)}>{t('agents.rename')}</Button> : null}
                {canManageAgents ? <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteAgent(selectedAgent)}><Trash2 className="h-3.5 w-3.5" /></Button> : null}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">{t('agents.flowsWorkspaces')}</h4>
                  {agentFlows.length > 0 && (
                    <button type="button" onClick={toggleAllFlows} className="text-xs text-muted-foreground hover:text-foreground">
                      {allFlowsSelected ? t('agents.deselectAll') : t('agents.selectAll')}
                    </button>
                  )}
                </div>
                {agentFlows.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('agents.notAssigned')}</p>
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
      <Dialog open={!!renameAgent} onOpenChange={(open) => { if (!open) setRenameAgent(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('agents.rename')}</DialogTitle>
            <DialogDescription>{t('agents.renameDesc')}</DialogDescription>
          </DialogHeader>
          <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} placeholder={t('agents.renamePlaceholder')} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameAgent(null)}>{t('common.cancel')}</Button>
            <Button onClick={handleRename} disabled={processing || !renameValue.trim()}>{processing ? <><Loader2 className="h-4 w-4 animate-spin" />{t('common.updating')}</> : t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteAgent} onOpenChange={(open) => { if (!open) { setDeleteAgent(null); setDeleteConfirmation('') } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('agents.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('agents.deleteDesc', { name: deleteAgent?.name ?? '' })}</AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder="DELETE" autoComplete="off" />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); void handleDelete() }} disabled={processing || deleteConfirmation !== 'DELETE'} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {processing ? <><Loader2 className="h-4 w-4 animate-spin" />{t('common.updating')}</> : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
