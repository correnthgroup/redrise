import { useEffect, useState, type ComponentType } from 'react'
import { Search, ExternalLink, Pencil, Users, Check, X, Plus, Trash2, CirclePause, CirclePlay, AlertTriangle, CheckCircle2, Clock3, Sparkles, LifeBuoy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WorkflowPipeline } from '../shared/workflow-pipeline'
import { Checkbox } from '@/components/ui/checkbox'
import type { Flow, FlowStatus } from '@/types/flow'
import type { FlowCard } from '@/types/flow-card'
import { loadFlowCards } from '@/lib/flow-cards'
import { useI18n } from '@/hooks/use-i18n'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'

function flowStatusMeta(status: FlowStatus) {
  switch (status) {
    case 'running':
      return { icon: CirclePlay, labelKey: 'flow.status.running', className: 'text-[#2F5D5A]' }
    case 'paused':
      return { icon: CirclePause, labelKey: 'flow.status.paused', className: 'text-[#7A3E14]' }
    default:
      return { icon: AlertTriangle, labelKey: 'flow.status.error', className: 'text-primary' }
  }
}

function StatusLine({ icon: Icon, label, className }: { icon: ComponentType<{ className?: string }>; label: string; className: string }) {
  return (
    <div className={`flex max-w-48 items-center gap-1.5 text-xs leading-tight ${className}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  )
}

export function FlowListPage({
  flows,
  onUpdate,
  onDelete,
  onRequestApproval,
  onApprove,
  onRequestAdjustments,
  onMarkRedriseSupport,
  onOpen,
}: {
  flows: Flow[]
  onUpdate?: (id: string, updates: Partial<Pick<Flow, 'name' | 'members'>>) => Promise<Flow | null>
  onDelete?: (id: string, workspaceId: string) => Promise<boolean>
  onRequestApproval?: (id: string) => Promise<Flow | null>
  onApprove?: (id: string) => Promise<Flow | null>
  onRequestAdjustments?: (id: string) => Promise<Flow | null>
  onMarkRedriseSupport?: (id: string) => Promise<Flow | null>
  onOpen?: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Flow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [approvalLoadingId, setApprovalLoadingId] = useState<string | null>(null)
  const [actionsOpenId, setActionsOpenId] = useState<string | null>(null)
  const [responsibleOpenId, setResponsibleOpenId] = useState<string | null>(null)
  const [selectedCards, setSelectedCards] = useState<FlowCard[] | undefined>(undefined)
  const [loadingCards, setLoadingCards] = useState(false)
  const { t } = useI18n()
  const { members: teamMembers, loading: loadingMembers } = useTeamMemberOptions()

  const filtered = flows.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
  const selectedFlowExists = selectedId ? flows.some((flow) => flow.id === selectedId) : false

  function startRename(flow: Flow) {
    setEditingId(flow.id)
    setEditingName(flow.name)
    setActionsOpenId(null)
    setResponsibleOpenId(null)
  }

  async function confirmRename() {
    if (!editingId || !editingName.trim()) return
    await onUpdate?.(editingId, { name: editingName.trim() })
    setEditingId(null)
  }

  async function toggleMember(flow: Flow, memberName: string) {
    const current = flow.members ?? []
    const next = current.includes(memberName)
      ? current.filter((name) => name !== memberName)
      : [...current, memberName]
    await onUpdate?.(flow.id, { members: next })
  }

  async function runApprovalAction(flowId: string, action?: (id: string) => Promise<Flow | null>) {
    if (!action) return
    setApprovalLoadingId(flowId)
    await action(flowId)
    setActionsOpenId(null)
    setResponsibleOpenId(null)
    setApprovalLoadingId(null)
  }

  function approvalBadge(flow: Flow) {
    if (flow.is_official) return { icon: CheckCircle2, label: t('flow.officialApproved'), className: 'text-[#2F5D5A]' }
    if (flow.official_invalidated_at) return { icon: AlertTriangle, label: t('flow.changedAfterApproval'), className: 'text-[#7A3E14]' }
    if (flow.source_type === 'redrise_support') return { icon: LifeBuoy, label: t('flow.redriseSupportPendingApproval'), className: 'text-[#2F5D5A]' }
    if (flow.source_type === 'external_llm' && flow.published_at) return { icon: Sparkles, label: t('flow.aiPublishedPendingApproval'), className: 'text-[#7A3E14]' }
    if (flow.approval_status === 'approval_requested') return { icon: Clock3, label: t('flow.approvalRequested'), className: 'text-[#7A3E14]' }
    if (flow.approval_status === 'adjustments_requested') return { icon: AlertTriangle, label: t('flow.adjustmentsRequested'), className: 'text-primary' }
    return { icon: Clock3, label: t('flow.notOfficial'), className: 'text-muted-foreground' }
  }

  function cancelRename() {
    setEditingId(null)
  }

  function selectFlow(id: string) {
    const next = selectedId === id ? null : id
    setSelectedId(next)
    setLoadingCards(Boolean(next))
    if (!next) setSelectedCards(undefined)
  }

  function approvalAction(flow: Flow) {
    if (flow.approval_status === 'approval_requested') {
      return { label: t('flow.approve'), action: onApprove }
    }
    if (flow.is_official) return null
    return { label: t('flow.requestApproval'), action: onRequestApproval }
  }

  useEffect(() => {
    let cancelled = false
    if (!selectedId) return

    loadFlowCards(selectedId).then((cards) => {
      if (!cancelled) setSelectedCards(cards)
    }).finally(() => {
      if (!cancelled) setLoadingCards(false)
    })

    return () => { cancelled = true }
  }, [selectedId])

  useEffect(() => {
    if (!actionsOpenId) return

    function handlePointerDown(event: MouseEvent) {
      if (event.target instanceof HTMLElement && event.target.closest('[data-flow-action-menu]')) return
      setActionsOpenId(null)
      setResponsibleOpenId(null)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [actionsOpenId])

  return (
    <div data-testid="flow-list-page" className="grid h-full min-h-0 grid-cols-1 gap-6 p-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('flow.searchFlows')} className="pl-7 h-9" />
          </div>
        </div>

        <Card className="min-h-0 flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('flow.flows')}</CardTitle></CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('flow.noFlows')}</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((f) => (
                  <li key={f.id}>
                      <div
                        onClick={() => selectFlow(f.id)}
                      className={`relative flex w-full items-center justify-between rounded-md border bg-card p-3 text-left text-sm cursor-pointer transition-colors ${
                        selectedId === f.id
                          ? 'border-[#8F1D1D] bg-primary/5 ring-1 ring-[#8F1D1D]/35'
                          : 'hover:bg-accent/60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        {editingId === f.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-7 text-sm"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmRename()
                                if (e.key === 'Escape') cancelRename()
                              }}
                              autoFocus
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); confirmRename() }} disabled={!editingName.trim()}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); cancelRename() }}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="font-medium truncate">{f.name}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground truncate">{t('flow.members', { members: f.members?.join(', ') || t('flow.none') })}</div>
                            <div className="mt-0.5 text-[10px] text-muted-foreground/60 font-mono">{t('common.id', { id: f.id })}</div>
                          </>
                        )}
                      </div>

                      <div className="relative ml-3 flex shrink-0 items-center gap-2" data-flow-action-menu onClick={(e) => e.stopPropagation()}>
                        <div className="flex max-w-48 flex-col items-start gap-1 text-left">
                          <StatusLine {...flowStatusMeta(f.status)} label={t(flowStatusMeta(f.status).labelKey)} />
                          <StatusLine {...approvalBadge(f)} />
                        </div>
                        <button
                          type="button"
                          aria-label={t('flow.actions')}
                          onClick={() => {
                            setActionsOpenId((current) => current === f.id ? null : f.id)
                            setResponsibleOpenId(null)
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F5D5A] text-white shadow-sm transition-all duration-200 hover:bg-[#2F5D5A]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ transform: actionsOpenId === f.id ? 'rotate(45deg)' : 'rotate(0deg)' }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <div
                          className="absolute right-0 top-10 z-20 flex min-w-56 flex-col gap-2 rounded-lg border bg-card p-2 shadow-lg transition-all duration-200 ease-out"
                          style={{
                            opacity: actionsOpenId === f.id ? 1 : 0,
                            transform: actionsOpenId === f.id ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.96)',
                            pointerEvents: actionsOpenId === f.id ? 'auto' : 'none',
                          }}
                        >
                          <button type="button" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => { onOpen?.(f.id); setActionsOpenId(null) }}>
                            <ExternalLink className="h-4 w-4" />
                            {t('flow.open')}
                          </button>
                          <button type="button" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => startRename(f)}>
                            <Pencil className="h-4 w-4" />
                            {t('flow.rename')}
                          </button>
                          <button type="button" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setResponsibleOpenId((current) => current === f.id ? null : f.id)}>
                            <Users className="h-4 w-4" />
                            {t('flow.responsible')}
                          </button>
                          {responsibleOpenId === f.id && (
                            <div className="max-h-44 overflow-y-auto rounded-md border bg-muted/20 p-2">
                              {loadingMembers ? <div className="px-1 py-1.5 text-xs text-muted-foreground">{t('flow.loadingMembers')}</div> : null}
                              {!loadingMembers && teamMembers.length === 0 ? <div className="px-1 py-1.5 text-xs text-muted-foreground">{t('flow.noMembersAvailable')}</div> : null}
                              {teamMembers.map((member) => (
                                <label key={member.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-xs hover:bg-background">
                                  <Checkbox
                                    checked={f.members?.includes(member.name) ?? false}
                                    onCheckedChange={() => { void toggleMember(f, member.name) }}
                                  />
                                  <span className="truncate">{member.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {approvalAction(f) ? (
                            <button type="button" disabled={approvalLoadingId === f.id} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60" onClick={() => { const item = approvalAction(f); void runApprovalAction(f.id, item?.action) }}>
                              <Check className="h-4 w-4" />
                              {approvalAction(f)?.label}
                            </button>
                          ) : null}
                          {f.approval_status === 'approval_requested' ? (
                            <button type="button" disabled={approvalLoadingId === f.id} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60" onClick={() => { void runApprovalAction(f.id, onRequestAdjustments) }}>
                              <X className="h-4 w-4" />
                              {t('flow.requestAdjustments')}
                            </button>
                          ) : null}
                          {f.source_type !== 'redrise_support' ? (
                            <button type="button" disabled={approvalLoadingId === f.id} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60" onClick={() => { void runApprovalAction(f.id, onMarkRedriseSupport) }}>
                              <LifeBuoy className="h-4 w-4" />
                              {t('flow.markRedriseSupport')}
                            </button>
                          ) : null}
                          <div className="border-t border-border/70 pt-2">
                            <button type="button" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10" onClick={() => { setDeleteTarget(f); setActionsOpenId(null); setResponsibleOpenId(null) }}>
                              <Trash2 className="h-4 w-4" />
                              {t('flow.deleteFlow')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <WorkflowPipeline cards={selectedFlowExists ? (selectedCards ?? []) : undefined} loading={selectedFlowExists ? loadingCards : false} />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirm('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('flow.deleteFlow')}</DialogTitle>
            <DialogDescription>
              {t('flow.deleteFlowDesc')}
            </DialogDescription>
          </DialogHeader>
          <Input value={deleteConfirm} onChange={(event) => setDeleteConfirm(event.target.value)} placeholder={t('flow.typeDelete')} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteConfirm('') }}>{t('common.cancel')}</Button>
            <Button
              variant="destructive"
                disabled={deleteConfirm !== 'DELETE' || !deleteTarget}
                onClick={async () => {
                  if (deleteTarget) {
                    const deletedId = deleteTarget.id
                    const deleted = await onDelete?.(deleteTarget.id, deleteTarget.workspace_id)
                    if (deleted !== false && selectedId === deletedId) {
                      setSelectedId(null)
                      setSelectedCards(undefined)
                      setLoadingCards(false)
                    }
                  }
                  setDeleteTarget(null)
                  setDeleteConfirm('')
                }}
            >
              {t('flow.deleteFlow')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
