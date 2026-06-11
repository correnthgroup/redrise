import type { Workspace } from '@/types/workspace'
import { FolderOpen, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { KpiCards } from '../shared/kpi-cards'
import { ChartTabs } from '../shared/chart-tabs'
import { ActivityFeed } from '../shared/activity-feed'
import { OperationsGrid } from '../shared/operations-grid'
import { OnboardingEmpty } from '../shared/onboarding-empty'
import { useI18n } from '@/hooks/use-i18n'

export function DashboardPage({
  onOpenWorkspace,
  onCreateWorkspace,
  workspaces,
}: {
  onOpenWorkspace?: (id: string) => void
  onCreateWorkspace?: () => void
  workspaces: Workspace[]
}) {
  const hasWorkspaces = workspaces.length > 0
  const { t } = useI18n()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex flex-col gap-6">
        {hasWorkspaces ? (
          <OnboardingEmpty
            workspaces={workspaces}
            onOpenWorkspace={onOpenWorkspace}
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-semibold">Welcome to Redrise</div>
                <div className="text-sm text-muted-foreground">
                  {t('dashboard.noWorkspaces')}
                </div>
              </div>
              {onCreateWorkspace && (
                <Button onClick={onCreateWorkspace} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('dashboard.newWorkspace')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {hasWorkspaces && (
          <>
            <KpiCards count={7} className="xl:grid-cols-7" />
            <ChartTabs />
            <OperationsGrid />
            <ActivityFeed />
          </>
        )}

        {!hasWorkspaces && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {t('dashboard.noWorkspaces')}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
