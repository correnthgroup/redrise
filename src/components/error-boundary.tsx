import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useI18n } from '@/hooks/use-i18n'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const { t } = useI18n()

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="max-w-md gap-0 p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <AlertTriangle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">{t('errorBoundary.title')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('errorBoundary.desc')}</p>
        {error && <p className="mt-2 font-mono text-xs text-muted-foreground/60">{error.message}</p>}
        <Button type="button" variant="outline" className="mt-4" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('errorBoundary.reload')}
        </Button>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} onReset={() => { this.setState({ hasError: false, error: null }); window.location.reload() }} />
    }

    return this.props.children
  }
}
