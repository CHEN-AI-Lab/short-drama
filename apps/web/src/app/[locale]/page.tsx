'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DramaGenerator from '../../components/DramaGenerator'

export default function HomePage() {
  const params = useParams()
  const locale = (params.locale as string) || 'zh-CN'
  const t = useTranslations('home')
  const ct = useTranslations('common')

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="relative text-center space-y-6 pt-8 pb-6 md:pt-16 md:pb-8">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          AI {locale === 'zh-CN' ? '短剧助手' : 'Drama Assistant'}
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </section>

      {/* How it works */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          { step: '1', icon: '🎯', titleKey: 'step1' },
          { step: '2', icon: '⚙️', titleKey: 'step2' },
          { step: '3', icon: '✨', titleKey: 'step3' },
        ].map((item) => (
          <div
            key={item.step}
            className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-lg">
                {item.icon}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                {locale === 'zh-CN' ? `步骤 ${item.step}` : `Step ${item.step}`}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              {t(item.titleKey)}
            </p>
          </div>
        ))}
      </section>

      {/* Drama Generator */}
      <DramaGenerator />
    </div>
  )
}