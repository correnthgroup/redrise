import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type WizardShellProps = {
  title: string
  step: number
  totalSteps: number
  stepLabel: string
  progressLabel: string
  children: ReactNode
  footer: ReactNode
  className?: string
  contentClassName?: string
  testId?: string
}

export function WizardShell({ title, step, totalSteps, stepLabel, progressLabel, children, footer, className, contentClassName, testId }: WizardShellProps) {
  return (
    <div data-testid={testId} className={cn('mx-auto flex h-full max-w-3xl flex-col gap-4 p-6 animate-app-rise', className)}>
      <header>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{progressLabel}</p>
      </header>
      <Progress value={(step / totalSteps) * 100} />

      <Card className="flex-1 border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
        <CardHeader><CardTitle className="text-sm font-semibold">{stepLabel}</CardTitle></CardHeader>
        <CardContent className={cn('space-y-4', contentClassName)}>{children}</CardContent>
      </Card>

      <footer className="flex justify-between gap-2">
        {footer}
      </footer>
    </div>
  )
}
