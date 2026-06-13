import { useCallback, useEffect, useState } from 'react'
import { Laptop, Loader2, LogOut, MapPin, Monitor, Smartphone, Tablet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { loadRememberedSessions, revokeOtherRememberedSessions, revokeRememberedSession, type RememberedSession } from '@/lib/user-profile'

function deviceLabel(browser: string) {
  if (/iphone/i.test(browser)) return 'iPhone'
  if (/ipad/i.test(browser)) return 'iPad'
  if (/windows/i.test(browser)) return 'Windows Desktop'
  if (/mac/i.test(browser)) return 'Mac'
  if (/linux/i.test(browser)) return 'Linux'
  return 'Current Device'
}

function deviceIcon(browser: string) {
  const device = deviceLabel(browser)
  switch (device) {
    case 'iPhone':
      return <Smartphone className="h-4 w-4" />
    case 'iPad':
      return <Tablet className="h-4 w-4" />
    case 'Linux':
      return <Monitor className="h-4 w-4" />
    default:
      return <Laptop className="h-4 w-4" />
  }
}

function formatLastActive(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function SessionsList({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<RememberedSession[]>([])
  const [loading, setLoading] = useState(true)

  const refreshSessions = useCallback(async () => {
    setLoading(true)
    setSessions(await loadRememberedSessions(userId))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void Promise.resolve().then(refreshSessions)
  }, [refreshSessions])

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Active Sessions</h3>
          <p className="text-sm text-muted-foreground">Devices and browsers signed in with Remember Me.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={async () => { await revokeOtherRememberedSessions(userId); await refreshSessions() }} disabled={sessions.length <= 1 || loading}>
          <LogOut className="h-4 w-4" />
          Sign Out Others
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading active sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No remembered sessions yet. Sign in with Remember Me selected to register this device.
          </div>
        ) : sessions.map((session) => (
          <div key={session.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {deviceIcon(session.browser)}
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{deviceLabel(session.browser)}</p>
                  {session.current ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">This Device</Badge> : null}
                </div>
                <p className="max-w-lg truncate text-xs text-muted-foreground">{session.browser}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</span>
                  <span className="font-mono">{session.ip}</span>
                  <span>{formatLastActive(session.lastActive)}</span>
                </div>
              </div>
            </div>
            {session.current ? null : (
              <Button type="button" variant="outline" size="sm" onClick={async () => { await revokeRememberedSession(session.id); await refreshSessions() }}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
