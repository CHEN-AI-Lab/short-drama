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
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            {/* Top gradient accent bar */}
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
              <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
                {/* Logo */}
                <Link
                  href={`/${locale}`}
                  className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
                >
                  {t('appName')}
                </Link>

                {/* Nav links */}
                <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <Link
                    href={`/${locale}/pricing`}
                    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {t('pricing')}
                  </Link>
                  <Link
                    href={`/${locale}/sign-in`}
                    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {t('signIn')}
                  </Link>
                </nav>

                {/* Right section */}
                <div className="flex items-center gap-3">
                  <LanguageSwitcher />
                  <ThemeToggle />
                  <UserMenu />
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
              <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} {t('appName')}. {t('allRights')}</p>
              </div>
            </footer>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}