import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'

const PLACEHOLDER_EVENTS = [
  'dashboard.event1',
  'dashboard.event2',
  'dashboard.event3',
  'dashboard.event4',
  'dashboard.event5',
]

const PLACEHOLDER_ALERTS = [
  'dashboard.alert1',
  'dashboard.alert2',
  'dashboard.alert3',
]

const PLACEHOLDER_NOTIFICATIONS = [
  'dashboard.notification1',
  'dashboard.notification2',
  'dashboard.notification3',
]

const PLACEHOLDER_CHANGE_LOG = [
  'dashboard.change1',
  'dashboard.change2',
  'dashboard.change3',
]

const PLACEHOLDER_AUDIT = [
  'dashboard.audit1',
  'dashboard.audit2',
  'dashboard.audit3',
]

function FeedCard({
  title,
  items,
  t,
}: {
  title: string
  items: string[]
  t: (key: string) => string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="truncate">
              {t(item)}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function ActivityFeed() {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-5">
      <FeedCard title={t('dashboard.activityFeed')} items={PLACEHOLDER_EVENTS} t={t} />
      <FeedCard title={t('dashboard.alerts')} items={PLACEHOLDER_ALERTS} t={t} />
      <FeedCard title={t('dashboard.notifications')} items={PLACEHOLDER_NOTIFICATIONS} t={t} />
      <FeedCard title={t('dashboard.changeLog')} items={PLACEHOLDER_CHANGE_LOG} t={t} />
      <FeedCard title={t('dashboard.auditTrail')} items={PLACEHOLDER_AUDIT} t={t} />
    </div>
  )
}
