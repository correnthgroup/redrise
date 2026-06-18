import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
const PRIORITY_KEYS: Record<string, string> = { low: 'priority.low', medium: 'priority.medium', high: 'priority.high', critical: 'priority.critical' }

export function DropdownFilterByPriority() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['medium', 'high']))
  const { t } = useI18n()

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {t('priority.filter', { count: selected.size })} <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {PRIORITIES.map((p) => (
          <DropdownMenuCheckboxItem
            key={p}
            checked={selected.has(p)}
            onCheckedChange={() => toggle(p)}
          >
            {t(PRIORITY_KEYS[p])}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
