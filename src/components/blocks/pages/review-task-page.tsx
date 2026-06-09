import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ReviewTaskPage({ onBack }: { onBack?: () => void }) {
  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-6 animate-app-rise">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Review Task</h1>
        {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>}
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Identity</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div><strong>Title:</strong> placeholder title</div>
            <div><strong>Status:</strong> pending</div>
            <div><strong>Owner:</strong> placeholder owner</div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Briefing</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">placeholder briefing</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Team</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">placeholder assignees</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Reviewers</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">placeholder reviewers</CardContent>
        </Card>
      </div>
    </div>
  )
}
