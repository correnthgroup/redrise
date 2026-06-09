import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PaginationFooterProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function PaginationFooter({ page, totalPages, onPageChange, className }: PaginationFooterProps) {
  return (
    <div className={cn('flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground', className)}>
      <span>Page {page} of {totalPages}</span>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
