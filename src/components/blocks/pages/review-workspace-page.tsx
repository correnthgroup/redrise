import type { Workspace } from '@/types/workspace'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ReviewWorkspacePage({
  onBack,
  workspace,
}: {
  onBack?: () => void
  workspace?: Workspace
}) {
  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-6 animate-app-rise">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Review Workspace</h1>
        {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>}
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Identity</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div><strong>Name:</strong> {workspace?.name ?? 'placeholder name'}</div>
            <div><strong>Status:</strong> {workspace?.status ?? 'pending'}</div>
            <div><strong>Created:</strong> {workspace?.created_at ? new Date(workspace.created_at).toLocaleDateString() : 'just now'}</div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Mission</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{workspace?.mission ?? 'placeholder mission'}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Health</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">placeholder health metrics for {workspace?.name ?? 'workspace'}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Flows</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{workspace?.flows ?? 0} configured flows</CardContent>
        </Card>
      </div>
    </div>
  )
}
