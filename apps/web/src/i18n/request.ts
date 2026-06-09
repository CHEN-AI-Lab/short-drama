import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import zhCN from 'shared/messages/zh-CN.json'
import en from 'shared/messages/en.json'

const messageMap: Record<string, Record<string, unknown>> = {
  'zh-CN': zhCN as Record<string, unknown>,
  'en': en as Record<string, unknown>,
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(['zh-CN', 'en'], requested) ? requested : 'zh-CN'
  return {
    locale,
    messages: messageMap[locale] ?? messageMap['zh-CN'],
    onError(err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Missing translation:', err.message)
      }
    },
    getMessageFallback({ key }) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Missing translation: ${key}`)
        return key
      }
      return key
    }
  }
})