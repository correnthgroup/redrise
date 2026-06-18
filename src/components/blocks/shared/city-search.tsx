import { useState, useRef, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchCities, type CityData } from '@/lib/cities'
import { useI18n } from '@/hooks/use-i18n'

export function CitySearch({
  value,
  onSelect,
}: {
  value: string
  onSelect: (city: CityData) => void
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

  const results = query.length >= 2 ? searchCities(query) : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('citySearch.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true)
          }}
          className="pl-7"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="max-h-60 overflow-y-auto p-1">
            {results.map((city, i) => (
              <button
                key={`${city.city}-${city.country}-${i}`}
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left"
                onClick={() => {
                  setQuery(`${city.city}, ${city.country}`)
                  setOpen(false)
                  onSelect(city)
                }}
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{city.city}</div>
                  <div className="text-xs text-muted-foreground">{city.country} · {city.utcOffset}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
