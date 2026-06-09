'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from 'ui'

interface AdminStats {
  totalUsers: number
  paidUsers: number
  totalGenerations: number
  todayGenerations: number
}

export default function AdminPage() {
  const t = useTranslations()
  const at = useTranslations('admin')
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats] = useState<AdminStats>({
    totalUsers: 0,
    paidUsers: 0,
    totalGenerations: 0,
    todayGenerations: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/session')
        if (!res.ok) throw new Error(at('notAuthenticated'))

        const data = await res.json()

        // Check if user is admin (by email or user_metadata)
        const user = data.user
        if (user) {
          const isAdminUser =
            user.email === 'admin@example.com' ||
            user.user_metadata?.role === 'admin' ||
            user.app_metadata?.role === 'admin'

          if (isAdminUser) {
            setIsAdmin(true)
          } else {
            setError(at('accessDenied'))
          }
        } else {
          setError(at('pleaseSignIn'))
        }
      } catch {
        setError(at('authFailed'))
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [at])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => router.push('/sign-in')}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >
              {at('goToSignIn')}
            </button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {at('accessDenied')}
            </p>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
            >
              {at('goToHome')}
            </button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          {t('common.admin')}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{at('totalUsers')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{at('paidUsers')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.paidUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{at('totalGenerations')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalGenerations}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{at('todayGenerations')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.todayGenerations}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {at('activityLog')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {at('noActivity')}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}