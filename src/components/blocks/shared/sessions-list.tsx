import { useCallback, useEffect, useMemo, useState } from 'react'
import { Laptop, Loader2, LogOut, MapPin, Monitor, RefreshCcw, Smartphone, Tablet } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { loadRememberedSessions, revokeRememberedSession, type RememberedSession } from '@/lib/user-profile'
import { useI18n } from '@/hooks/use-i18n'

const PAGE_SIZE = 7

function deviceIcon(session: RememberedSession) {
  switch (session.device) {
    case 'Phone':
      return <Smartphone className="h-4 w-4" />
    case 'Tablet':
      return <Tablet className="h-4 w-4" />
    case 'Desktop':
      return <Laptop className="h-4 w-4" />
    default:
      return <Monitor className="h-4 w-4" />
  }
}

function formatLastActive(value: string, t: (key: string, params?: Record<string, string | number>) => string) {
  const date = new Date(value)
  const delta = Date.now() - date.getTime()
  if (Number.isNaN(date.getTime())) return t('sessions.lastActiveUnknown')
  const minutes = Math.max(0, Math.floor(delta / 60_000))
  if (minutes < 1) return t('sessions.lastActiveNow')
  if (minutes < 60) return t('sessions.lastActiveMinutes', { count: minutes, plural: minutes === 1 ? '' : 's' })
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    return t('sessions.lastActiveHours', { count: hours, plural: hours === 1 ? '' : 's' })
  }
  return t('sessions.lastActiveDate', { date: new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date) })
}

export function SessionsList({ userId, onBack }: { userId: string; onBack?: () => void }) {
  const { t } = useI18n()
  const [sessions, setSessions] = useState<RememberedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const refreshSessions = useCallback(async () => {
    setLoading(true)
    const nextSessions = await loadRememberedSessions(userId)
    setSessions(nextSessions)
    setPage(1)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void Promise.resolve().then(refreshSessions)
  }, [refreshSessions])

  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE))
  const visibleSessions = useMemo(() => sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [page, sessions])
  const remoteSessions = sessions.filter((session) => !session.current)

  return (
    <Card className="gap-0 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">{t('sessions.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('sessions.desc')}</p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('sessions.loading')}
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{t('sessions.none')}</div>
        ) : (
          visibleSessions.map((session) => (
            <div key={session.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {deviceIcon(session)}
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{t('sessions.browserOnOs', { browser: session.browser, os: session.os })}</p>
                    {session.current ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{t('sessions.currentDevice')}</Badge> : null}
                    {session.remembered ? <Badge variant="outline">{t('sessions.remembered')}</Badge> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.country}</span>
                    <span className="font-mono">{session.ip}</span>
                    <span>{formatLastActive(session.lastActive, t)}</span>
                  </div>
                </div>
              </div>
              {session.current ? null : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <LogOut className="h-4 w-4" />
                      {t('sessions.revoke')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('sessions.revokeTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('sessions.revokeDesc', { browser: session.browser, os: session.os })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => { await revokeRememberedSession(session.id); await refreshSessions() }}>
                        {t('sessions.revoke')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))
        )}
      </div>

      {!loading && remoteSessions.length === 0 && sessions.length > 0 ? (
        <p className="mt-4 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">{t('sessions.none')}</p>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('common.pageOf', { page, total: totalPages })}</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>{t('common.previous')}</Button>
            <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>{t('common.next')}</Button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex justify-between border-t pt-4">
        <BackButton onClick={onBack} />
        <Button type="button" variant="outline" size="sm" onClick={refreshSessions} disabled={loading}>
          <RefreshCcw className="h-4 w-4" />
          {t('sessions.refresh')}
        </Button>
      </div>
    </Card>
  )
}
