'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DramaGenerator from '../../components/DramaGenerator'
import ErrorBoundary from '../../components/ErrorBoundary'

export default function HomePage() {
  const params = useParams()
  const locale = (params.locale as string) || 'zh-CN'
  const t = useTranslations('home')
  const ct = useTranslations('common')

  const steps = [
    { icon: '🎯', key: 'step1' },
    { icon: '⚙️', key: 'step2' },
    { icon: '✨', key: 'step3' },
  ]

  return (
    <div className="space-y-16">
      {/* ── Hero ── */}
      <section className="relative text-center space-y-8 pt-8 pb-6 md:pt-20 md:pb-10 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] bg-pink-500/10 dark:bg-pink-500/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-400/8 dark:bg-indigo-500/10 rounded-full blur-[150px] animate-glow-pulse" />
        </div>

        {/* Decorative gradient line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          AI {locale === 'zh-CN' ? '短剧助手' : 'Drama Assistant'}
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight animate-fade-in-up">
          <span className="text-gradient">{t('title')}</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {t('subtitle')}
        </p>
      </section>

      {/* ── How it works ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 stagger-children">
        {steps.map((item, i) => (
          <div
            key={i}
            className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm card-hover"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-lg">
                {item.icon}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                {locale === 'zh-CN' ? `步骤 ${i + 1}` : `Step ${i + 1}`}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              {t(item.key)}
            </p>
          </div>
        ))}
      </section>

      {/* ── Drama Generator ── */}
      <ErrorBoundary locale={locale}>
        <DramaGenerator />
      </ErrorBoundary>
    </div>
  )
}