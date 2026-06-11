import { useEffect, useState } from 'react'
import { AppFrame } from '@/components/layout/app-frame'
import { AuthFlow } from '@/components/auth/auth-flow'
import { AppShell } from '@/components/layout/app-shell'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { ErrorBoundary } from '@/components/error-boundary'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
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
