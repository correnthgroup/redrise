import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

export function DropdownFilterByPriority() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['medium', 'high']))

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
          Filter priority ({selected.size}) <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {PRIORITIES.map((p) => (
          <DropdownMenuCheckboxItem
            key={p}
            checked={selected.has(p)}
            onCheckedChange={() => toggle(p)}
          >
            {p}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
