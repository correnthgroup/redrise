import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/hooks/use-i18n'

export type PaletteItem = {
  id: string
  group: 'navigation' | 'actions' | 'settings' | 'search'
  label: string
  hint?: string
  onSelect: () => void
}

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: PaletteItem[]
}

export function CommandPalette({ open, onOpenChange, items }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const { t } = useI18n()

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setQuery('')
    onOpenChange(nextOpen)
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return items
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q),
    )
  }, [items, query])

  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>()
    for (const item of filtered) {
      const list = map.get(item.group) ?? []
      list.push(item)
      map.set(item.group, list)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="border-b px-3 py-2">
          <DialogTitle className="sr-only">{t('commandPalette.title')}</DialogTitle>
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('commandPalette.placeholder')}
            className="h-9 border-0 shadow-none focus-visible:ring-0"
          />
        </DialogHeader>
        <ScrollArea className="max-h-80">
          <div className="p-2">
            {grouped.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">{t('commandPalette.noResults')}</div>
            )}
            {grouped.map(([group, list]) => (
              <div key={group} className="mb-2">
                <div className="px-2 py-1 text-[11px] font-medium uppercase text-muted-foreground">{group}</div>
                <ul>
                  {list.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          item.onSelect()
                          onOpenChange(false)
                        }}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                      >
                        <span className="truncate">{item.label}</span>
                        {item.hint && (
                          <span className="ml-2 truncate text-xs text-muted-foreground">{item.hint}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
