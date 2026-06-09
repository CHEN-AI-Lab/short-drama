'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent } from 'ui'

const FREE_FEATURES = ['freeLimit', 'freeBasicOutline', 'freeGenreLimit', 'freeEpisodeLimit', 'freeHistory']

const PRO_FEATURES = ['proUnlimited', 'proFullScript', 'proAllTypes', 'proEpisodeLimit', 'proUnlimitedHistory', 'proPriority', 'proExport']

export default function PricingPage() {
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
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
          {t('common.pricing')}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          {t('common.choosePlan')}
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card className="relative flex flex-col">
            <CardContent className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {pt('free')}
              </h2>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                {pt('freePrice')}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map((key, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-5 h-5 shrink-0 text-green-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{pt(key)}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block w-full text-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.getStarted')}
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex flex-col ring-2 ring-purple-500 dark:ring-purple-400">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('common.popular')}
            </div>
            <CardContent className="flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {pt('pro')}
              </h2>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                {pt('proPrice')}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {PRO_FEATURES.map((key, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-5 h-5 shrink-0 text-green-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
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
                className="w-full"
              >
                {pt('subscribe')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}