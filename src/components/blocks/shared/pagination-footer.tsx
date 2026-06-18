import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'

type PaginationFooterProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PaginationFooter({ page, totalPages, onPageChange, className }: PaginationFooterProps) {
  const { t } = useI18n()

  return (
    <div className={cn('flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground', className)}>
      <span>{t('common.pageOf', { page, total: totalPages })}</span>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          {t('common.previous')}
        </Button>
        <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}
