'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent } from 'ui'

const FREE_FEATURES = ['freeLimit', 'freeBasicOutline', 'freeGenreLimit', 'freeEpisodeLimit', 'freeHistory']

const PRO_FEATURES = ['proUnlimited', 'proFullScript', 'proAllTypes', 'proEpisodeLimit', 'proUnlimitedHistory', 'proPriority', 'proExport']

const featureIcons: Record<string, string> = {
  freeLimit: '3️⃣',
  freeBasicOutline: '📋',
  freeGenreLimit: '🎭',
  freeEpisodeLimit: '🔢',
  freeHistory: '📜',
  proUnlimited: '♾️',
  proFullScript: '📝',
  proAllTypes: '🎬',
  proEpisodeLimit: '🔢',
  proUnlimitedHistory: '💾',
  proPriority: '⚡',
  proExport: '📥',
}

export default function PricingPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'zh-CN'
  const t = useTranslations()
  const pt = useTranslations('pricing')
  const router = useRouter()
  const [subscribing, setSubscribing] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setSubscribing(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Checkout failed')
      }

      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-4">
            💎 {t('common.pricing')}
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gradient">
            {t('common.pricing')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('common.choosePlan')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card className="relative flex flex-col hover:shadow-lg transition-shadow duration-200">
            <CardContent className="flex-1 flex flex-col">
              <div className="mb-6">
                <div className="text-4xl mb-3">📦</div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {pt('free')}
                </h2>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  {pt('freePrice')}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map((key, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-base shrink-0 mt-0.5">{featureIcons[key] || '✅'}</span>
                    <span>{pt(key)}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block w-full text-center px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.getStarted')}
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex flex-col ring-2 ring-purple-500 dark:ring-purple-400 overflow-hidden hover:shadow-xl transition-shadow duration-200">
            {/* Decorative gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 via-white to-pink-50/60 dark:from-purple-950/30 dark:via-gray-900 dark:to-pink-950/30 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-10">
              {t('common.popular')}
            </div>

            <CardContent className="flex-1 flex flex-col relative z-0">
              <div className="mb-6">
                <div className="text-4xl mb-3">🚀</div>
                <h2 className="text-xl font-bold mb-1">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    {pt('pro')}
                  </span>
                </h2>
                <p className="text-3xl font-extrabold">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    {pt('proPrice')}
                  </span>
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map((key, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-base shrink-0 mt-0.5">{featureIcons[key] || '✅'}</span>
                    <span>{pt(key)}</span>
                  </li>
                ))}
              </ul>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4 text-center" role="alert">
                  {error}
                </p>
              )}

              <Button
                variant="gradient"
                size="lg"
                onClick={handleSubscribe}
                loading={subscribing}
                className="w-full shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10"
              >
                {pt('subscribe')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {locale === 'zh-CN' ? '安全支付 · 随时取消 · 数据加密' : 'Secure payment · Cancel anytime · Data encrypted'}
        </p>
      </div>
    </main>
  )
}