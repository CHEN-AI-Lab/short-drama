import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Locale } from 'shared'

// Dynamically import messages — we load both at startup
import en from 'shared/messages/en.json'
import zhCN from 'shared/messages/zh-CN.json'

type Messages = Record<string, Record<string, string>>

const messageMap: Record<Locale, Messages> = {
  en: en as Messages,
  'zh-CN': zhCN as Messages,
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
})

const STORAGE_KEY = 'short_drama_locale'

function detectLocale(): Locale {
  // Try localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored === 'en' || stored === 'zh-CN') return stored

    // Try Electron system locale
    if (window.electronAPI) {
      // We'll resolve this asynchronously in the provider
    }
  }
  // Default to English
  return 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale())

  useEffect(() => {
    // If we have electronAPI, try to get system locale
    if (window.electronAPI) {
      window.electronAPI.getLocale().then((sysLocale: string) => {
        const mapped: Locale = sysLocale.startsWith('zh') ? 'zh-CN' : 'en'
        setLocaleState(mapped)
      }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch { /* ignore */ }
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const parts = key.split('.')
      const section = parts[0]
      const msgKey = parts.slice(1).join('.')
      const msg = messageMap[locale]?.[section]?.[msgKey] || key

      if (vars) {
        return Object.entries(vars).reduce(
          (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
          msg
        )
      }
      return msg
    },
    [locale]
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}