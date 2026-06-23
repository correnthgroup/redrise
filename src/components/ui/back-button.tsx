import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

type BackButtonProps = {
  onClick?: () => void
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  className?: string
  label?: string
}

export function BackButton({ onClick, size = 'sm', disabled, className, label }: BackButtonProps) {
  const { t } = useI18n()
  return (
    <Button type="button" variant="outline" size={size} onClick={onClick} disabled={disabled} className={className}>
      <ArrowLeft className="h-4 w-4" />
      {label ?? t('common.back')}
    </Button>
  )
}
