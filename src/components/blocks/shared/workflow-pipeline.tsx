import { Pause, Play, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const PLACEHOLDER_NODES = [
  { id: 'n1', name: 'Node 1', status: 'ok' as const },
  { id: 'n2', name: 'Node 2', status: 'ok' as const },
  { id: 'n3', name: 'Node 3', status: 'warn' as const },
  { id: 'n4', name: 'Node 4', status: 'ok' as const },
  { id: 'n5', name: 'Node 5', status: 'error' as const },
]

const STATUS_STYLES: Record<typeof PLACEHOLDER_NODES[number]['status'], string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  error: 'bg-rose-500',
}

export function WorkflowPipeline() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Workflow Pipeline</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7"><Play className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pause className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7"><RotateCcw className="h-3.5 w-3.5" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {PLACEHOLDER_NODES.map((n) => (
            <li key={n.id} className="flex items-center gap-3 rounded-md border p-2 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[n.status]}`} aria-hidden />
              <span className="flex-1 truncate">{n.name}</span>
              <Badge variant="outline" className="text-[10px] uppercase">{n.status}</Badge>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
