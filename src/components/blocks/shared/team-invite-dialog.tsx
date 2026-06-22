import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { loadPendingTeamInvites, respondToTeamInvite, type TeamInviteNotification } from '@/lib/team-invites'
import { getMemberFunctionLabelKey } from '@/lib/member-functions'
import { useI18n } from '@/hooks/use-i18n'
import { supabase } from '@/lib/supabase'

export function TeamInviteDialog({ userId }: { userId: string }) {
  const { t } = useI18n()
  const [invites, setInvites] = useState<TeamInviteNotification[]>([])
  const [submitting, setSubmitting] = useState(false)
  const invite = invites[0] ?? null

  const refreshInvites = useCallback(async () => {
    setInvites(await loadPendingTeamInvites(userId))
  }, [userId])

  useEffect(() => {
    void Promise.resolve().then(refreshInvites)
    const interval = window.setInterval(refreshInvites, 30_000)
    const channel = supabase
      .channel(`team-invite-notifications:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_invite_notifications',
        filter: `recipient_user_id=eq.${userId}`,
      }, () => { void refreshInvites() })
      .subscribe()

    return () => {
      window.clearInterval(interval)
      void supabase.removeChannel(channel)
    }
  }, [refreshInvites, userId])

  async function respond(response: 'accepted' | 'declined') {
    if (!invite) return
    setSubmitting(true)
    const ok = await respondToTeamInvite(invite, response)
    if (ok) setInvites((current) => current.filter((item) => item.id !== invite.id))
    setSubmitting(false)
  }

  return (
    <Dialog open={!!invite} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('invites.teamInviteTitle')}</DialogTitle>
          <DialogDescription>
            {invite ? t('invites.teamInviteDesc', { owner: invite.ownerName }) : ''}
          </DialogDescription>
        </DialogHeader>
        {invite ? (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p><span className="font-medium">{t('settings.function')}:</span> {t(getMemberFunctionLabelKey(invite.function))}</p>
            <p><span className="font-medium">{t('settings.team')}:</span> {invite.team || t('settings.unassignedTeam')}</p>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => { void respond('declined') }} disabled={submitting}>{t('invites.decline')}</Button>
          <Button onClick={() => { void respond('accepted') }} disabled={submitting}>{t('invites.accept')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
