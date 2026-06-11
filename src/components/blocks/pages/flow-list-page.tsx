import { useState } from 'react'
import { Search, ExternalLink, Pencil, Users, Check, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkflowPipeline } from '../shared/workflow-pipeline'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import type { Flow } from '@/types/flow'
import { useI18n } from '@/hooks/use-i18n'

const PLACEHOLDER_MEMBERS = ['Alice Silva', 'Bob Santos', 'Carol Oliveira', 'David Costa', 'Eva Lima']

interface FlowCard {
  name: string
  members: string[]
  agents: string[]
}

const PLACEHOLDER_FLOW_CARDS: Record<string, FlowCard[]> = {
  f1: [
    { name: 'Qualify Lead', members: ['Alice Silva'], agents: ['Agent 1'] },
    { name: 'Score Deal', members: ['Bob Santos'], agents: ['Agent 2'] },
    { name: 'Assign Rep', members: [], agents: [] },
  ],
  f2: [
    { name: 'Send Welcome', members: ['Carol Oliveira'], agents: [] },
    { name: 'Create Account', members: [], agents: ['Agent 3'] },
    { name: 'Schedule Kickoff', members: ['David Costa', 'Eva Lima'], agents: [] },
  ],
  f3: [
    { name: 'Detect Issue', members: [], agents: ['Agent 4'] },
    { name: 'Route Team', members: ['Alice Silva'], agents: [] },
    { name: 'Notify Client', members: [], agents: [] },
  ],
  f4: [
    { name: 'Prepare Handoff', members: ['Bob Santos'], agents: ['Agent 5'] },
    { name: 'Transfer Docs', members: [], agents: [] },
    { name: 'Confirm Delivery', members: ['Eva Lima'], agents: [] },
  ],
}

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

export function FlowListPage({
  flows,
  onDelete,
  onOpen,
  onCreate,
}: {
  flows: Flow[]
  onDelete?: (id: string, workspaceId: string) => Promise<boolean>
  onOpen?: (id: string) => void
  onCreate?: () => void
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const { t } = useI18n()

  const filtered = flows.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))

  function startRename(flow: Flow) {
    setEditingId(flow.id)
    setEditingName(flow.name)
  }

  function confirmRename(id: string) {
    // TODO: persist rename in Sprint 7
    setEditingId(null)
  }

  function cancelRename() {
    setEditingId(null)
  }

  function selectFlow(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const selectedCards = selectedId ? (PLACEHOLDER_FLOW_CARDS[selectedId] ?? []) : undefined

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-6 p-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search flows" className="pl-7 h-9" />
          </div>
        </div>

        <Card className="min-h-0 flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Flows</CardTitle></CardHeader>
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
                          ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
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
                                if (e.key === 'Enter') confirmRename(f.id)
                                if (e.key === 'Escape') cancelRename()
                              }}
                              autoFocus
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); confirmRename(f.id) }} disabled={!editingName.trim()}>
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); cancelRename() }}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="font-medium truncate">{f.name}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground truncate">Members: {f.members?.join(', ') || 'None'}</div>
                            <div className="mt-0.5 text-[10px] text-muted-foreground/60 font-mono">ID: {f.id}</div>
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
                            <DropdownMenuLabel>Select members</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {PLACEHOLDER_MEMBERS.map((member) => (
                              <DropdownMenuCheckboxItem
                                key={member}
                                checked={f.members?.includes(member) ?? false}
                                onCheckedChange={() => {
                                  // TODO: persist member change in Sprint 7
                                }}
                              >
                                {member}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onDelete?.(f.id, f.workspace_id)}
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

      <WorkflowPipeline cards={selectedCards} />
    </div>
  )
}
