import { createContext } from 'react'
import type { Locale } from '@/lib/i18n'

export type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextType>({
  locale: 'en-US',
  setLocale: () => {},
  t: (key: string) => key,
})
