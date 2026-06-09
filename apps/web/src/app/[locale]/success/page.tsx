'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from 'ui'

export default function SuccessPage() {
  const t = useTranslations('success')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const [status, setStatus] = useState<'updating' | 'success' | 'error'>('updating')

  useEffect(() => {
    async function updatePaymentStatus() {
      try {
        // Mark user as paid in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('short_drama_paid', JSON.stringify({ verified: true }))
        }

        // Also update server-side via API
        const sessionId = searchParams.get('session_id')
        await fetch('/api/user/paid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paid: true, sessionId }),
        })

        setStatus('success')

        // Redirect to home after countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              router.push('/')
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      } catch {
        setStatus('error')
      }
    }

    updatePaymentStatus()
  }, [router, searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          {status === 'updating' && (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('updating')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {t('updatingDesc')}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('welcomePro')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('redirecting')} {countdown}s...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('somethingWrong')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('verificationFailed')}
              </p>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
              >
                {t('returnHome')}
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}