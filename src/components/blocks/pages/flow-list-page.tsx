import { useEffect, useState } from 'react'
import { Search, ExternalLink, Pencil, Users, Check, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WorkflowPipeline } from '../shared/workflow-pipeline'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import type { Flow } from '@/types/flow'
import type { FlowCard } from '@/types/flow-card'
import { loadFlowCards } from '@/lib/flow-cards'
import { useI18n } from '@/hooks/use-i18n'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'

function badgeClassName(status: string) {
  switch (status) {
    case 'running':
      return 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]'
    case 'paused':
      return 'border-[#B7791F]/20 bg-[#FFF8E1] text-[#7A3E14]'
    default:
      return 'border-primary/20 bg-primary/8 text-primary'
  }
}

export function FlowListPage({
  flows,
  onUpdate,
  onDelete,
  onOpen,
}: {
  flows: Flow[]
  onUpdate?: (id: string, updates: Partial<Pick<Flow, 'name' | 'members'>>) => Promise<Flow | null>
  onDelete?: (id: string, workspaceId: string) => Promise<boolean>
  onOpen?: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Flow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [selectedCards, setSelectedCards] = useState<FlowCard[] | undefined>(undefined)
  const [loadingCards, setLoadingCards] = useState(false)
  const { t } = useI18n()
  const { members: teamMembers, loading: loadingMembers } = useTeamMemberOptions()

  const filtered = flows.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))

  function startRename(flow: Flow) {
    setEditingId(flow.id)
    setEditingName(flow.name)
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

  function cancelRename() {
    setEditingId(null)
  }

  function selectFlow(id: string) {
    const next = selectedId === id ? null : id
    setSelectedId(next)
    setLoadingCards(Boolean(next))
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
                      className={`flex w-full items-center justify-between rounded-md border bg-card p-3 text-left text-sm cursor-pointer transition-colors ${
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

                      <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                        <Badge variant="outline" className={`text-[10px] uppercase ${badgeClassName(f.status)}`}>{f.status}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpen?.(f.id)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startRename(f)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Users className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>{t('flow.selectMembers')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {loadingMembers ? <div className="px-2 py-1.5 text-sm text-muted-foreground">{t('flow.loadingMembers')}</div> : null}
                            {!loadingMembers && teamMembers.length === 0 ? <div className="px-2 py-1.5 text-sm text-muted-foreground">{t('flow.noMembersAvailable')}</div> : null}
                            {teamMembers.map((member) => (
                              <DropdownMenuCheckboxItem
                                key={member.id}
                                checked={f.members?.includes(member.name) ?? false}
                                onCheckedChange={() => {
                                  void toggleMember(f, member.name)
                                }}
                              >
                                {member.name}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(f)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <WorkflowPipeline cards={selectedId ? (selectedCards ?? []) : undefined} loading={loadingCards} />

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
                if (deleteTarget) await onDelete?.(deleteTarget.id, deleteTarget.workspace_id)
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
