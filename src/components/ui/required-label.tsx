import type { ComponentProps } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type RequiredLabelProps = ComponentProps<typeof Label>

export function RequiredLabel({ className, children, ...props }: RequiredLabelProps) {
  return (
    <Label className={cn('text-[#A04D1F]', className)} {...props}>
      {children}<span className="text-[#A04D1F]">*</span>
    </Label>
  )
}
