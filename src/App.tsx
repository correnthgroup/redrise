import { useEffect, useState } from 'react'
import { AppFrame } from '@/components/layout/app-frame'
import { AuthFlow } from '@/components/auth/auth-flow'
import { AppShell } from '@/components/layout/app-shell'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { loadUserProfile, PROFILE_UPDATED_EVENT, touchPresence, type UserProfile } from '@/lib/user-profile'
import { FlowBuilderPage } from '@/components/blocks/pages/flow-builder-page'
import { AgentCreatePage } from '@/components/blocks/pages/agent-create-page'
import { AgentDetailPage } from '@/components/blocks/pages/agent-detail-page'
import { AccountBasicInfoPage } from '@/components/blocks/pages/account-basic-info-page'
import { CreateTaskPage } from '@/components/blocks/pages/create-task-page'
import { CreateWorkspacePage } from '@/components/blocks/pages/create-workspace-page'
import { ReviewTaskPage } from '@/components/blocks/pages/review-task-page'
import { ReviewWorkspacePage } from '@/components/blocks/pages/review-workspace-page'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function syncSessionUser(sessionUser: User | null) {
      setUser(sessionUser)
      if (!sessionUser) {
        setProfile(null)
        return
      }

      const nextProfile = await loadUserProfile({
        id: sessionUser.id,
        name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
        email: sessionUser.email || '',
      })
      setProfile(nextProfile)
      await touchPresence(sessionUser.id)
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncSessionUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncSessionUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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

  if (loading) {
    return (
      <AppFrame>
        <div className="flex h-full items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </AppFrame>
    )
  }

  if (!user) {
    return (
      <AppFrame>
        <AuthFlow />
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
        <I18nProvider>
          <AppShell
            user={userProfile}
            onSignOut={() => supabase.auth.signOut()}
          />
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
