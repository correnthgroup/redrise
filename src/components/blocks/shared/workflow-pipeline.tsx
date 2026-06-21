import { useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { FlowCard } from '@/types/flow-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useI18n } from '@/hooks/use-i18n'

interface WorkflowPipelineProps {
  cards?: FlowCard[]
  loading?: boolean
}

interface PipelineNode {
  id: string
  name: string
  status: 'ok' | 'warn' | 'error'
  members: string[]
  agents: string[]
}

const PLACEHOLDER_NODES: PipelineNode[] = [
  { id: 'n1', name: 'Node 1', status: 'ok', members: [], agents: [] },
  { id: 'n2', name: 'Node 2', status: 'ok', members: [], agents: [] },
  { id: 'n3', name: 'Node 3', status: 'warn', members: [], agents: [] },
  { id: 'n4', name: 'Node 4', status: 'ok', members: [], agents: [] },
  { id: 'n5', name: 'Node 5', status: 'error', members: [], agents: [] },
]

const STATUS_STYLES: Record<PipelineNode['status'], string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  error: 'bg-rose-500',
}

export function WorkflowPipeline({ cards, loading = false }: WorkflowPipelineProps) {
  const hasSelection = cards !== undefined
  const nodes = hasSelection && cards.length > 0
    ? cards.map((c) => ({ id: c.id, name: c.label, status: 'ok' as const, members: c.members, agents: c.agents }))
    : hasSelection ? [] : PLACEHOLDER_NODES

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const { t } = useI18n()

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const allSelected = nodes.length > 0 && nodes.every((n) => checkedIds.has(n.id))

  function toggleAll() {
    if (allSelected) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(nodes.map((n) => n.id)))
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">{t('pipeline.title')}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"><Play className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pause className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('pipeline.loadingCards')}</p>
        ) : !hasSelection ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('pipeline.selectFlow')}</p>
        ) : nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('pipeline.noCards')}</p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
              />
              <button type="button" onClick={toggleAll} className="text-xs text-muted-foreground hover:text-foreground">
                {allSelected ? t('pipeline.deselectAll') : t('pipeline.selectAll')}
              </button>
            </div>
            <ol className="space-y-2">
              {nodes.map((n) => (
                <li key={n.id} className="flex items-center gap-3 rounded-md border p-2 text-sm">
                  <Checkbox
                    checked={checkedIds.has(n.id)}
                    onCheckedChange={() => toggleCheck(n.id)}
                  />
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[n.status]}`} aria-hidden />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{n.name}</div>
                    {(n.members.length > 0 || n.agents.length > 0) && (
                      <div className="text-xs text-muted-foreground truncate">
                        {n.members.length > 0 && <span>{t('pipeline.members')} {n.members.join(', ')}</span>}
                        {n.members.length > 0 && n.agents.length > 0 && <span> · </span>}
                        {n.agents.length > 0 && <span>{t('pipeline.agents')} {n.agents.join(', ')}</span>}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground/60 font-mono">{t('common.id', { id: n.id })}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase">{n.status}</Badge>
                </li>
              ))}
            </ol>
          </>
        )}
      </CardContent>
    </Card>
  )
}
