import { useState } from 'react'
import type { Workspace } from '@/types/workspace'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Bell, Trash2 } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'
import { NotificationDetailDialog } from '@/components/blocks/shared/notification-detail-dialog'
import type { Notification } from '@/types/notification'

function statusBadgeClass(status: string) {
  switch (status) {
    case 'healthy':
      return 'border-emerald-500/20 bg-emerald-50 text-emerald-700'
    case 'maintenance':
      return 'border-amber-500/20 bg-amber-50 text-amber-700'
    default:
      return 'border-primary/20 bg-primary/8 text-primary'
  }
}

export function ReviewWorkspacePage({
  onBack,
  onDelete,
  notifications = [],
  onMarkNotificationRead,
  onMarkNotificationUnread,
  onResolveNotification,
  workspace,
}: {
  onBack?: () => void
  onDelete?: () => void
  notifications?: Notification[]
  onMarkNotificationRead?: (id: string) => Promise<boolean>
  onMarkNotificationUnread?: (id: string) => Promise<boolean>
  onResolveNotification?: (id: string) => Promise<boolean>
  workspace?: Workspace
}) {
  const { t, locale } = useI18n()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE' || !workspace?.id) return
    setIsDeleting(true)
    await onDelete?.()
    setIsDeleting(false)
    setShowDeleteDialog(false)
    setDeleteConfirm('')
  }

  async function openNotification(notification: Notification) {
    setSelectedNotification(notification)
    if (notification.read_status === 'unread') {
      const ok = await onMarkNotificationRead?.(notification.id)
      if (ok) setSelectedNotification({ ...notification, read_status: 'read', read_at: new Date().toISOString() })
    }
  }

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-6 animate-app-rise">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('workspace.review')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          {onBack && <BackButton onClick={onBack} />}
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('workspace.identity')}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-mono text-xs text-muted-foreground">{t('common.id', { id: workspace?.id ?? 'N/A' })}</div>
            <div><strong>{t('workspace.name')}:</strong> {workspace?.name ?? 'N/A'}</div>
            <div className="flex items-center gap-2">
              <strong>{t('workspace.status')}:</strong>
              <Badge variant="outline" className={`text-[10px] uppercase ${statusBadgeClass(workspace?.status ?? 'pending')}`}>
                {workspace?.status ?? 'pending'}
              </Badge>
            </div>
            <div><strong>{t('workspace.created')}:</strong> {workspace?.created_at ? new Date(workspace.created_at).toLocaleDateString(locale) : 'N/A'}</div>
            {workspace?.updated_at && workspace.updated_at !== workspace.created_at && (
              <div><strong>{t('workspace.updated')}:</strong> {new Date(workspace.updated_at).toLocaleDateString(locale)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('workspace.mission')}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{workspace?.mission || t('workspace.noMission')}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('workspace.health')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('workspace.status')}</span>
              <Badge variant="outline" className={`text-[10px] uppercase ${statusBadgeClass(workspace?.status ?? 'pending')}`}>
                {workspace?.status ?? 'pending'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('workspace.flows')}</span>
              <span className="font-medium">{workspace?.flows ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('workspace.flows')}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t('workspace.configuredFlows', { count: workspace?.flows ?? 0 })}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)] sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="h-4 w-4 text-[#A04D1F]" />
              {t('notifications.pendingWorkspace')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('notifications.noWorkspacePending')}</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => { void openNotification(notification) }}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border bg-card p-3 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{notification.title}</span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">{notification.summary || t('notifications.noSummary')}</span>
                    </span>
                    {notification.read_status === 'unread' ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" /> : null}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('workspace.delete')}</DialogTitle>
            <DialogDescription>
              {t('workspace.deleteDesc')}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={t('flow.typeDelete')}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowDeleteDialog(false); setDeleteConfirm('') }}>{t('common.cancel')}</Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== 'DELETE' || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? t('common.delete') : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NotificationDetailDialog
        notification={selectedNotification}
        open={Boolean(selectedNotification)}
        onOpenChange={(open) => { if (!open) setSelectedNotification(null) }}
        onMarkUnread={async (id) => {
          const ok = await onMarkNotificationUnread?.(id) ?? false
          if (ok && selectedNotification) setSelectedNotification({ ...selectedNotification, read_status: 'unread', read_at: null })
          return ok
        }}
        onResolve={async (id) => {
          const ok = await onResolveNotification?.(id) ?? false
          if (ok) setSelectedNotification(null)
          return ok
        }}
      />
    </div>
  )
}
