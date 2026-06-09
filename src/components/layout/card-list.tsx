import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type CardListProps = {
  title?: ReactNode
  description?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  footer?: ReactNode
}

export function CardList({
  title,
  description,
  toolbar,
  children,
  className,
  contentClassName,
  footer,
}: CardListProps) {
  const hasHeader = Boolean(title || description || toolbar)

  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden', className)}>
      {hasHeader && (
        <CardHeader className="flex-row items-center justify-between gap-2 border-b">
          <div className="min-w-0">
            {title && <div className="text-sm font-semibold leading-tight">{title}</div>}
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
          {toolbar && <div className="flex shrink-0 items-center gap-2">{toolbar}</div>}
        </CardHeader>
      )}
      <CardContent className={cn('min-h-0 flex-1 p-0', contentClassName)}>
        <ScrollArea className="h-full">
          <div className="p-4">{children}</div>
        </ScrollArea>
      </CardContent>
      {footer && (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">{footer}</div>
      )}
    </Card>
  )
}
