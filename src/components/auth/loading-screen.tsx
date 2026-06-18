import { Bot, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type LoadingScreenProps = {
  message: string
  state?: 'loading' | 'error'
  onRetry?: () => void
  onGoToSignIn?: () => void
}

export function LoadingScreen({ message, state = 'loading', onRetry, onGoToSignIn }: LoadingScreenProps) {
  const isError = state === 'error'

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center bg-background px-6 text-foreground">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Bot className="h-5 w-5" />
          </span>
          {!isError ? <Loader2 className="h-5 w-5 animate-spin text-secondary" /> : null}
        </div>
        <p className="loading-message text-sm font-medium text-muted-foreground">{message}</p>
        {isError ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              This can happen because of network instability or a temporary service outage.
            </p>
            <div className="flex flex-col justify-center gap-2 sm:flex-row">
              <Button type="button" onClick={onRetry}>Try again</Button>
              <Button type="button" variant="outline" onClick={onGoToSignIn}>Go to sign in</Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
