import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DROPDOWN_TRIGGER_CLASSES } from '@/lib/styles'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type MultiSelectOption = {
  value: string
  label: string
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder,
  selectedLabel,
  selectAllLabel,
  loading = false,
  loadingLabel,
  emptyLabel,
  disabled = false,
  contentClassName = 'w-72',
}: {
  options: MultiSelectOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder: string
  selectedLabel: (count: number) => string
  selectAllLabel: string
  loadingLabel: string
  emptyLabel: string
  loading?: boolean
  disabled?: boolean
  contentClassName?: string
}) {
  const allSelected = options.length > 0 && selectedValues.length === options.length

  function toggleValue(value: string) {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((current) => current !== value))
      return
    }
    onChange([...selectedValues, value])
  }

  function toggleAll() {
    if (allSelected) {
      onChange([])
      return
    }
    onChange(options.map((option) => option.value))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className={DROPDOWN_TRIGGER_CLASSES} disabled={disabled}>
          <span className="truncate">
            {selectedValues.length > 0 ? selectedLabel(selectedValues.length) : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={contentClassName}>
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={toggleAll}
        >
          {selectAllLabel}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {loading ? <div className="px-2 py-1.5 text-sm text-muted-foreground">{loadingLabel}</div> : null}
        {!loading && options.length === 0 ? <div className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</div> : null}
        {!loading
          ? options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selectedValues.includes(option.value)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => toggleValue(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))
          : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
