import { ArrowRight, Sparkles } from 'lucide-react'
import type { Workspace, WorkspaceStatus } from '@/types/workspace'
import { Card, CardContent } from '@/components/ui/card'

const COLUMN_ORDER: WorkspaceStatus[] = ['healthy', 'maintenance', 'pending']

const COLUMN_META: Record<WorkspaceStatus, { title: string; description: string }> = {
  healthy: {
    title: 'Healthy Workspaces',
    description: 'Stable workspaces currently operating within target.',
  },
  maintenance: {
    title: 'Maintenance Workspaces',
    description: 'Workspaces requiring tuning, review or configuration changes.',
  },
  pending: {
    title: 'Pending Workspaces',
    description: 'New or incomplete workspaces waiting for the next setup step.',
  },
}

export function OnboardingEmpty({
  onOpenWorkspace,
  workspaces,
}: {
  onOpenWorkspace?: (id: string) => void
  workspaces: Workspace[]
}) {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-left">
            <div className="text-base font-semibold">Welcome to your workspace</div>
            <div className="text-sm text-muted-foreground">
              Review created workspaces, monitor status lanes and open a workspace to continue setup.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {COLUMN_ORDER.map((status) => {
            const columnItems = workspaces.filter((workspace) => workspace.status === status)
            const meta = COLUMN_META[status]

            return (
              <section key={status} className="rounded-xl border bg-muted/20 p-4 text-left">
                <div className="mb-3 space-y-1">
                  <div className="text-sm font-semibold">{meta.title}</div>
                  <div className="text-xs text-muted-foreground">{meta.description}</div>
                </div>

                <div className="space-y-3">
                  {columnItems.map((workspace) => (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => onOpenWorkspace?.(workspace.id)}
                      className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{workspace.name}</div>
                          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{workspace.mission}</div>
                        </div>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{new Date(workspace.created_at).toLocaleDateString()}</span>
                        <span>{workspace.flows} flows</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
