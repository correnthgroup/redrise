import { Bell, CheckCircle2, Mail, MailOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/hooks/use-i18n'
import type { Notification } from '@/types/notification'

type NotificationDetailDialogProps = {
  notification: Notification | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkUnread?: (id: string) => Promise<boolean>
  onResolve?: (id: string) => Promise<boolean>
}

function statusClass(status: string) {
  return status === 'pending'
    ? 'border-[#B7791F]/20 bg-[#FFF8E1] text-[#7A3E14]'
    : 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]'
}

export function NotificationDetailDialog({
  notification,
  open,
  onOpenChange,
  onMarkUnread,
  onResolve,
}: NotificationDetailDialogProps) {
  const { t, locale } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#A04D1F]" />
            {notification?.title ?? t('notifications.details')}
          </DialogTitle>
          <DialogDescription>{notification?.summary}</DialogDescription>
        </DialogHeader>
        {notification ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`text-[10px] uppercase ${statusClass(notification.action_status)}`}>
                {t(`notifications.status.${notification.action_status}`)}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase">
                {t(`notifications.read.${notification.read_status}`)}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase">
                {notification.type.replaceAll('_', ' ')}
              </Badge>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('notifications.impact')}</div>
              <p className="mt-1 text-sm">{notification.summary || t('notifications.noSummary')}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <div>
                <span className="font-medium text-foreground">{t('notifications.created')}:</span>{' '}
                {new Date(notification.created_at).toLocaleString(locale)}
              </div>
              <div>
                <span className="font-medium text-foreground">{t('notifications.subject')}:</span>{' '}
                {notification.flow_id ?? notification.task_id ?? notification.workspace_id ?? notification.execution_id ?? notification.id}
              </div>
            </div>
            {notification.primary_action_type ? (
              <div className="rounded-lg border border-[#2F5D5A]/20 bg-[#2F5D5A]/5 p-3 text-xs text-[#2F5D5A]">
                {t('notifications.primaryAction')}: {notification.primary_action_type}
              </div>
            ) : null}
          </div>
        ) : null}
        <DialogFooter>
          {notification?.read_status === 'read' && onMarkUnread ? (
            <Button variant="outline" onClick={() => { void onMarkUnread(notification.id) }}>
              <Mail className="mr-2 h-4 w-4" />
              {t('notifications.markUnread')}
            </Button>
          ) : null}
          {notification?.read_status === 'unread' ? (
            <Button variant="outline" disabled>
              <MailOpen className="mr-2 h-4 w-4" />
              {t('notifications.openedMarksRead')}
            </Button>
          ) : null}
          {notification?.action_status === 'pending' && onResolve ? (
            <Button onClick={() => { void onResolve(notification.id) }}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t('notifications.resolve')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
