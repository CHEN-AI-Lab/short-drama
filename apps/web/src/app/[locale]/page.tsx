'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DramaGenerator from '../../components/DramaGenerator'

export default function HomePage() {
  const params = useParams()
  const locale = (params.locale as string) || 'zh-CN'
  const t = useTranslations('home')

  return (
    <div className="space-y-10">
      {/* Hero section */}
      <section className="text-center space-y-4 pt-8 pb-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </section>

      {/* Drama Generator */}
      <DramaGenerator />
    </div>
  )
}
