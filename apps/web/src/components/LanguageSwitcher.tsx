'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function LanguageSwitcher() {
  const params = useParams()
  const currentLocale = (params.locale as string) || 'zh-CN'
  const t = useTranslations('common')

  const toggleLocale = () => {
    const next = currentLocale === 'zh-CN' ? 'en' : 'zh-CN'
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={t('switchLanguage')}
    >
      {currentLocale === 'zh-CN' ? 'EN' : '中文'}
    </button>
  )
}