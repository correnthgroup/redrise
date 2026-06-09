import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PLACEHOLDER_EVENTS = [
  'event 1 · agent name · 2m ago',
  'event 2 · agent name · 5m ago',
  'event 3 · agent name · 11m ago',
  'event 4 · agent name · 24m ago',
  'event 5 · agent name · 1h ago',
]

const PLACEHOLDER_ALERTS = [
  'alert 1 · system · 3m ago',
  'alert 2 · agent · 14m ago',
  'alert 3 · workspace · 36m ago',
]

const PLACEHOLDER_NOTIFICATIONS = [
  'notification 1 · member · 4m ago',
  'notification 2 · review · 18m ago',
  'notification 3 · task · 52m ago',
]

const PLACEHOLDER_CHANGE_LOG = [
  'change 1 · policy updated · 6m ago',
  'change 2 · flow edited · 27m ago',
  'change 3 · integration changed · 1h ago',
]

const PLACEHOLDER_AUDIT = [
  'audit 1 · sign-in · 9m ago',
  'audit 2 · permission change · 41m ago',
  'audit 3 · export requested · 2h ago',
]

function FeedCard({
  title,
  items,
}: {
  title: string
  items: string[]
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
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function ActivityFeed() {
  return (
    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-5">
      <FeedCard title="Activity Feed" items={PLACEHOLDER_EVENTS} />
      <FeedCard title="Alerts" items={PLACEHOLDER_ALERTS} />
      <FeedCard title="Notifications" items={PLACEHOLDER_NOTIFICATIONS} />
      <FeedCard title="Change Log" items={PLACEHOLDER_CHANGE_LOG} />
      <FeedCard title="Audit Trail" items={PLACEHOLDER_AUDIT} />
    </div>
  )
}
