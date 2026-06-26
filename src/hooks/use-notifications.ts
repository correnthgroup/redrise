import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  loadNotifications,
  markNotificationRead,
  markNotificationUnread,
  resolveNotification,
} from '@/lib/notifications'
import type { Notification } from '@/types/notification'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setNotifications(await loadNotifications(userId))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const data = await loadNotifications(userId)
      if (!cancelled) {
        setNotifications(data)
        setLoading(false)
      }
    }

    void load()
    const interval = window.setInterval(() => { void load() }, 30_000)
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_user_id=eq.${userId}`,
      }, () => { void load() })
      .subscribe()

    return () => {
      cancelled = true
      window.clearInterval(interval)
      void supabase.removeChannel(channel)
    }
  }, [userId])

  const pendingCount = useMemo(
    () => notifications.filter((notification) => notification.action_status === 'pending').length,
    [notifications],
  )

  const markRead = useCallback(async (id: string) => {
    const ok = await markNotificationRead(id)
    if (ok) await refresh()
    return ok
  }, [refresh])

  const markUnread = useCallback(async (id: string) => {
    const ok = await markNotificationUnread(id)
    if (ok) await refresh()
    return ok
  }, [refresh])

  const resolve = useCallback(async (id: string) => {
    const ok = await resolveNotification(id)
    if (ok) await refresh()
    return ok
  }, [refresh])

  return {
    notifications,
    loading,
    pendingCount,
    refresh,
    markRead,
    markUnread,
    resolve,
  }
}
