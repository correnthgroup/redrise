import { useState } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Task = { id: string; title: string; status: 'backlog' | 'in-progress' | 'in-review' | 'done' }
type Status = Task['status']

const PLACEHOLDER_TASKS: Task[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  title: `Task ${i + 1}`,
  status: (['backlog', 'in-progress', 'in-review', 'done'] as Status[])[i % 4],
}))

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In progress' },
  { id: 'in-review', title: 'In review' },
  { id: 'done', title: 'Done' },
]

const STATUS_TONE: Record<Status, string> = {
  backlog: 'border-[#2F4858]/20 bg-[#2F4858]/6',
  'in-progress': 'border-primary/18 bg-primary/6',
  'in-review': 'border-[#B7791F]/18 bg-[#FFF4DB]',
  done: 'border-emerald-200 bg-emerald-50',
}

export function TaskBoardPage({
  onCreateTask,
  onOpenTask,
}: {
  onCreateTask?: () => void
  onOpenTask?: (id: string) => void
}) {
  const [tasks, setTasks] = useState(PLACEHOLDER_TASKS)
  const [dragging, setDragging] = useState<string | null>(null)

  function move(id: string, status: Status) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 animate-app-rise">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Task Board</h2>
          <p className="text-xs text-muted-foreground">Operational board with workspace-aware states and a colder SaaS visual rhythm.</p>
        </div>
        <Button onClick={onCreateTask}><Plus className="h-4 w-4" /> New Task</Button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.id)
          return (
            <Card
              key={col.id}
              className={cn('flex min-h-0 flex-col rounded-xl border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.05)]', dragging && 'ring-1 ring-primary/40')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging) {
                  move(dragging, col.id)
                  setDragging(null)
                }
              }}
            >
              <CardHeader className={cn('flex-row items-center justify-between border-b py-2', STATUS_TONE[col.id])}>
                <CardTitle className="text-xs font-semibold uppercase tracking-wide">{col.title}</CardTitle>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {items.map((t) => (
                  <article
                    key={t.id}
                    draggable
                    onDragStart={() => setDragging(t.id)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => onOpenTask?.(t.id)}
                    className="cursor-grab rounded-lg border bg-card p-3 text-left text-sm shadow-sm transition-colors hover:bg-accent/40 active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-foreground">{t.title}</span>
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Workspace context ready for review and handoff.</div>
                  </article>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
