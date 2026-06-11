import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { AuthProvider } from '../../components/AuthProvider'
import ThemeToggle from '../../components/ThemeToggle'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import UserMenu from '../../components/UserMenu'
import Link from 'next/link'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const messages = await getMessages({ locale })
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link
                href={`/${locale}`}
                className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hover:from-indigo-400 hover:to-purple-500 transition-all"
              >
                {t('appName')}
              </Link>

              {/* Nav links */}
              <nav className="hidden sm:flex items-center gap-5">
                <Link
                  href={`/${locale}`}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  生成
                </Link>
                <Link
                  href={`/${locale}/history`}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  历史
                </Link>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {t('pricing')}
                </Link>
              </nav>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} {t('appName')}. {t('allRights')}</p>
          </div>
        </footer>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
