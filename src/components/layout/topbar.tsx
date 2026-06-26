import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'

export type TopbarBreadcrumbItem = {
  label: ReactNode
  onClick?: () => void
}

type TopbarProps = {
  title?: ReactNode
  subtitle?: ReactNode
  back?: { label: string; onClick: () => void }
  breadcrumbs?: TopbarBreadcrumbItem[]
  actions?: ReactNode
}

export function Topbar({ title, subtitle, back, breadcrumbs = [], actions }: TopbarProps) {
  const { t } = useI18n()

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
        {title && breadcrumbs.length > 0 && <Separator orientation="vertical" className="h-7" />}
        {breadcrumbs.length > 0 && (
          <nav aria-label={t('common.breadcrumb')} className="flex min-w-0 items-center gap-1 text-[11px] leading-tight text-muted-foreground">
            {breadcrumbs.map((item, index) => {
              const isCurrent = index === breadcrumbs.length - 1

              return (
                <span key={index} className="flex min-w-0 items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/70" />}
                  {item.onClick && !isCurrent ? (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className={cn('min-w-0 truncate rounded-sm text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span aria-current={isCurrent ? 'page' : undefined} className="min-w-0 truncate rounded-sm text-left text-foreground/80">
                      {item.label}
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
