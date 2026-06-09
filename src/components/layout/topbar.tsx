import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type TopbarProps = {
  title?: ReactNode
  subtitle?: ReactNode
  back?: { label: string; onClick: () => void }
  actions?: ReactNode
}

export function Topbar({ title, subtitle, back, actions }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="flex min-w-0 items-center gap-3">
        {back && (
          <>
            <Button variant="ghost" size="sm" onClick={back.onClick}>
              {back.label}
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        {title && (
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight text-foreground">{title}</h1>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
