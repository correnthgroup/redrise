import { useCallback, useEffect, useRef, useState } from 'react'
import { AppFrame } from '@/components/layout/app-frame'
import { AuthFlow } from '@/components/auth/auth-flow'
import { LoadingScreen } from '@/components/auth/loading-screen'
import { AppShell } from '@/components/layout/app-shell'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { loadUserProfile, PROFILE_UPDATED_EVENT, registerActiveSession, revokeCurrentActiveSession, touchCurrentActiveSession, touchPresence, type UserProfile } from '@/lib/user-profile'
import { FlowBuilderPage } from '@/components/blocks/pages/flow-builder-page'
import { AgentCreatePage } from '@/components/blocks/pages/agent-create-page'
import { AgentDetailPage } from '@/components/blocks/pages/agent-detail-page'
import { AccountBasicInfoPage } from '@/components/blocks/pages/account-basic-info-page'
import { CreateTaskPage } from '@/components/blocks/pages/create-task-page'
import { CreateWorkspacePage } from '@/components/blocks/pages/create-workspace-page'
import { ReviewTaskPage } from '@/components/blocks/pages/review-task-page'
import { ReviewWorkspacePage } from '@/components/blocks/pages/review-workspace-page'
import { TeamInviteDialog } from '@/components/blocks/shared/team-invite-dialog'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [authCheckError, setAuthCheckError] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Verifying your session...')
  const suppressNextAuthSessionRef = useRef(false)

  const syncSessionUser = useCallback(async (session: Session | null) => {
    const sessionUser = session?.user ?? null
    if (sessionUser && suppressNextAuthSessionRef.current) {
      suppressNextAuthSessionRef.current = false
      setUser(null)
      setProfile(null)
      await supabase.auth.signOut()
      return
    }

    setUser(sessionUser)
    if (!sessionUser) {
      setProfile(null)
      return
    }

    setLoadingMessage('Loading your profile...')
    const nextProfile = await loadUserProfile({
      id: sessionUser.id,
      name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
      email: sessionUser.email || '',
    })
    setProfile(nextProfile)
    setLoadingMessage('Preparing your workspace...')
    await registerActiveSession({ user: sessionUser, session, remembered: false, source: 'password' })
    await Promise.all([touchPresence(sessionUser.id), touchCurrentActiveSession()])
  }, [])

  const checkSession = useCallback(async () => {
    setLoading(true)
    setAuthCheckError(false)
    setLoadingMessage('Verifying your session...')
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    await syncSessionUser(session)
    setLoading(false)
  }, [syncSessionUser])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoading(true), 200)

    Promise.resolve().then(checkSession)
      .catch(() => {
        setAuthCheckError(true)
        setLoadingMessage('Unable to verify your session.')
        setLoading(false)
      })
      .finally(() => window.clearTimeout(timer))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        await syncSessionUser(session)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      window.clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [checkSession, syncSessionUser])

  useEffect(() => {
    if (!user) return

    const interval = window.setInterval(() => {
      touchPresence(user.id)
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (!user) return
    const currentUserId = user.id

    function handleProfileUpdated(event: Event) {
      const nextProfile = (event as CustomEvent<UserProfile>).detail
      if (nextProfile?.userId === currentUserId) setProfile(nextProfile)
    }

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated)
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated)
  }, [user])

  if (authCheckError) {
    return (
      <LoadingScreen
        message="Unable to verify your session."
        state="error"
        onRetry={() => {
          setShowLoading(true)
          void checkSession().catch(() => {
            setAuthCheckError(true)
            setLoading(false)
          })
        }}
        onGoToSignIn={() => { setAuthCheckError(false); setUser(null); setProfile(null); setLoading(false) }}
      />
    )
  }

  if (loading && showLoading) {
    return <LoadingScreen message={loadingMessage} />
  }

  if (!user) {
    return (
      <AppFrame>
        <AuthFlow onAccountCreationStart={() => { suppressNextAuthSessionRef.current = true }} />
      </AppFrame>
    )
  }

  const userProfile = {
    id: user.id,
    name: profile?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    firstName: profile?.firstName || user.user_metadata?.full_name?.split(/\s+/)[0] || user.email?.split('@')[0] || 'User',
    email: profile?.email || user.email || '',
    avatarUrl: profile?.avatarUrl ?? null,
  }

  return (
    <ErrorBoundary>
      <AppFrame>
        <I18nProvider locale={profile?.language ?? 'en-US'}>
          <AppShell
            user={userProfile}
            onSignOut={async () => {
              await revokeCurrentActiveSession()
              await supabase.auth.signOut()
            }}
          />
          <TeamInviteDialog userId={user.id} />
        </I18nProvider>
      </AppFrame>
    </ErrorBoundary>
  )
}

// Sub-page exports (used by future router / route shims)
export {
  FlowBuilderPage,
  AgentCreatePage,
  AgentDetailPage,
  AccountBasicInfoPage,
  CreateTaskPage,
  CreateWorkspacePage,
  ReviewTaskPage,
  ReviewWorkspacePage,
}
