import Taro from '@tarojs/taro'
import zhCN from 'shared/messages/zh-CN.json'
import en from 'shared/messages/en.json'

type Messages = Record<string, any>

const messages: Record<string, Messages> = {
  'zh-CN': zhCN as Messages,
  en: en as Messages,
}

export function getLocale(): string {
  try {
    return Taro.getStorageSync('locale') || 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

export function setLocale(locale: string) {
  try {
    Taro.setStorageSync('locale', locale)
  } catch {}
}

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = getLocale()
  const msg = messages[locale] || messages['zh-CN']
  const parts = key.split('.')
  let value: any = msg
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return key
    }
  }
  if (typeof value !== 'string') return key
  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      value
    )
  }
  return value
}

export function isChinese(): boolean {
  return getLocale() === 'zh-CN'
}
