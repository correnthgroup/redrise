import { useState } from 'react'
import { Laptop, LogOut, MapPin, Monitor, Smartphone, Tablet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Session = {
  id: string
  device: 'MacBook Pro' | 'Windows Desktop' | 'iPhone 15' | 'iPad Air' | 'Linux Server'
  browser: string
  location: string
  ip: string
  lastActive: string
  current: boolean
}

const INITIAL_SESSIONS: Session[] = [
  { id: 's-001', device: 'MacBook Pro', browser: 'Chrome 124 · macOS', location: 'Sao Paulo, BR', ip: '187.45.12.103', lastActive: 'Active now', current: true },
  { id: 's-002', device: 'iPhone 15', browser: 'Safari Mobile · iOS 17', location: 'Sao Paulo, BR', ip: '187.45.12.103', lastActive: '2 hours ago', current: false },
  { id: 's-003', device: 'Windows Desktop', browser: 'Edge 124 · Windows 11', location: 'Rio de Janeiro, BR', ip: '201.20.55.21', lastActive: 'Yesterday at 18:42', current: false },
  { id: 's-004', device: 'iPad Air', browser: 'Safari · iPadOS 17', location: 'Curitiba, BR', ip: '177.92.10.4', lastActive: '3 days ago', current: false },
  { id: 's-005', device: 'Linux Server', browser: 'Headless · CLI 1.4', location: 'AWS Sao Paulo', ip: '18.230.12.7', lastActive: '5 days ago', current: false },
]

function deviceIcon(device: Session['device']) {
  switch (device) {
    case 'iPhone 15':
      return <Smartphone className="h-4 w-4" />
    case 'iPad Air':
      return <Tablet className="h-4 w-4" />
    case 'Linux Server':
      return <Monitor className="h-4 w-4" />
    default:
      return <Laptop className="h-4 w-4" />
  }
}

export function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS)

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Active Sessions</h3>
          <p className="text-sm text-muted-foreground">Devices and browsers currently signed in to your workspace.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setSessions((current) => current.filter((session) => session.current))} disabled={sessions.length <= 1}>
          <LogOut className="h-4 w-4" />
          Sign Out Others
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {deviceIcon(session.device)}
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{session.device}</p>
                  {session.current ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">This Device</Badge> : null}
                </div>
                <p className="text-xs text-muted-foreground">{session.browser}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</span>
                  <span className="font-mono">{session.ip}</span>
                  <span>{session.lastActive}</span>
                </div>
              </div>
            </div>
            {session.current ? null : (
              <Button type="button" variant="outline" size="sm" onClick={() => setSessions((current) => current.filter((item) => item.id !== session.id))}>
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
