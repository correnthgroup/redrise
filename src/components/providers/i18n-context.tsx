"use client"

import { createContext, useContext } from "react"

type I18nContextValue = {
  t: (key: string) => string
  locale: string
  setLocale: (locale: string) => void
}

const I18nContext = createContext<I18nContextValue>({
  t: (key) => key,
  locale: "en",
  setLocale: () => {},
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const t = (key: string) => key
  const locale = "en"
  const setLocale = () => {}

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export { I18nContext }
