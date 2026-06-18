import type { ReactNode } from 'react'
import { type Locale, t as translate } from '@/lib/i18n'
import { I18nContext } from './i18n-context'

export function I18nProvider({ children, locale: profileLocale = 'en-US' }: { children: ReactNode; locale?: Locale }) {
  const locale = profileLocale

  function setLocale(newLocale: Locale) {
    void newLocale
  }

  function t(key: string, params?: Record<string, string | number>): string {
    return translate(locale, key, params)
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
