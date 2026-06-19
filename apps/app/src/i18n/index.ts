import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Locale } from 'shared/types'

const LOCALE_KEY = 'app_locale'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let messages: Record<string, any> = {}
let currentLocale: Locale = 'zh-CN'

export async function loadLocale(locale?: Locale): Promise<void> {
  const stored = await AsyncStorage.getItem(LOCALE_KEY)
  const localeToLoad: Locale = locale || (stored as Locale) || 'zh-CN'

  currentLocale = localeToLoad

  try {
    if (localeToLoad === 'en') {
      messages = require('shared/messages/en.json')
    } else {
      messages = require('shared/messages/zh-CN.json')
    }
  } catch {
    // Fallback to empty messages if JSON loading fails
    messages = {}
  }
}

export async function setLocale(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_KEY, locale)
  await loadLocale(locale)
}

export async function getLocale(): Promise<Locale> {
  const stored = await AsyncStorage.getItem(LOCALE_KEY)
  return (stored as Locale) || 'zh-CN'
}

/**
 * Translate a dot-notation key like "common.generate" or "home.title".
 * Falls back to the key itself if not found.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const parts = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = messages
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return key
    }
  }

  if (typeof value !== 'string') return key

  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, p: string) =>
      params[p] !== undefined ? String(params[p]) : `{${p}}`
    )
  }

  return value
}

export { currentLocale as locale }