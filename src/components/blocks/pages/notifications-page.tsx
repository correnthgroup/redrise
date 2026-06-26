import { useState } from 'react'
import { Bell, CheckCircle2, Inbox, Mail, MailOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationDetailDialog } from '@/components/blocks/shared/notification-detail-dialog'
import { useI18n } from '@/hooks/use-i18n'
import type { Notification } from '@/types/notification'

type NotificationsPageProps = {
  notifications: Notification[]
  loading?: boolean
  onMarkRead: (id: string) => Promise<boolean>
  onMarkUnread: (id: string) => Promise<boolean>
  onResolve: (id: string) => Promise<boolean>
}

function tone(status: string) {
  return status === 'pending'
    ? 'border-[#B7791F]/20 bg-[#FFF8E1] text-[#7A3E14]'
    : 'border-[#2F5D5A]/25 bg-[#2F5D5A]/8 text-[#2F5D5A]'
}

export function NotificationsPage({ notifications, loading, onMarkRead, onMarkUnread, onResolve }: NotificationsPageProps) {
  const { t, locale } = useI18n()
  const [selected, setSelected] = useState<Notification | null>(null)
  const pending = notifications.filter((notification) => notification.action_status === 'pending')
  const resolved = notifications.filter((notification) => notification.action_status === 'resolved')

  async function openNotification(notification: Notification) {
    setSelected(notification)
    if (notification.read_status === 'unread') {
      const ok = await onMarkRead(notification.id)
      if (ok) setSelected({ ...notification, read_status: 'read', read_at: new Date().toISOString() })
    }
  }

  async function markSelectedUnread(id: string) {
    const ok = await onMarkUnread(id)
    if (ok && selected) setSelected({ ...selected, read_status: 'unread', read_at: null })
    return ok
  }

  async function resolveSelected(id: string) {
    const ok = await onResolve(id)
    if (ok) setSelected(null)
    return ok
  }

  function renderList(items: Notification[], emptyLabel: string) {
    if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">{t('common.loading')}</p>
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
          <Inbox className="h-8 w-8" />
          {emptyLabel}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {items.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => { void openNotification(notification) }}
            className="flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {notification.read_status === 'unread' ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium">{notification.title}</span>
                <Badge variant="outline" className={`text-[10px] uppercase ${tone(notification.action_status)}`}>
                  {t(`notifications.status.${notification.action_status}`)}
                </Badge>
              </span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">{notification.summary || t('notifications.noSummary')}</span>
              <span className="mt-1 block text-[10px] text-muted-foreground/70">
                {new Date(notification.created_at).toLocaleString(locale)}
              </span>
            </span>
            {notification.action_status === 'pending' ? <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" /> : null}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div data-testid="notifications-page" className="h-full overflow-y-auto p-6 animate-app-rise">
      <Card className="mx-auto max-w-4xl border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-[#A04D1F]" />
              {t('notifications.title')}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t('notifications.subtitle')}</p>
          </div>
          <Badge variant="outline" className="border-primary/20 bg-primary/8 text-primary">
            {t('notifications.pendingCount', { count: pending.length })}
          </Badge>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">{t('notifications.pending')}</TabsTrigger>
              <TabsTrigger value="resolved">{t('notifications.resolved')}</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              {renderList(pending, t('notifications.noPending'))}
            </TabsContent>
            <TabsContent value="resolved" className="mt-4">
              {renderList(resolved, t('notifications.noResolved'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <NotificationDetailDialog
        notification={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
        onMarkUnread={markSelectedUnread}
        onResolve={resolveSelected}
      />
    </div>
  )
}
