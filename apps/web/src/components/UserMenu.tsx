'use client'

import { useUser } from './AuthProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const { user, loading, setUser } = useUser()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors px-3 py-1.5 rounded-lg"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
        {user.email}
      </span>
      <button
        type="button"
        onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST' })
          router.refresh()
          setUser(null)
        }}
        className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        Sign Out
      </button>
    </div>
  )
}
