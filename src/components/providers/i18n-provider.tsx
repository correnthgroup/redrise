import { useState, useEffect, type ReactNode } from 'react'
import { type Locale, t as translate } from '@/lib/i18n'
import { I18nContext } from './i18n-context'

const STORAGE_KEY = 'redrise:locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved === 'en-US' || saved === 'pt-BR') ? saved : 'en-US'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  function setLocale(newLocale: Locale) {
    setLocaleState(newLocale)
  }

  function t(key: string): string {
    return translate(locale, key)
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
