import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { AuthProvider } from '../../components/AuthProvider'
import ThemeToggle from '../../components/ThemeToggle'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import UserMenu from '../../components/UserMenu'
import NavLink from '../../components/NavLink'
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
        <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 text-lg font-bold"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm shadow-md">
                  🎬
                </span>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  {t('appName')}
                </span>
              </Link>

              {/* Vertical divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-gray-700" />

              {/* Nav links */}
              <nav className="hidden sm:flex items-center gap-1">
                <span className="relative">
                  <NavLink href={`/${locale}`}>
                    <span className="hidden md:inline">{t('navGenerate')}</span>
                    <span className="md:hidden">生成</span>
                  </NavLink>
                </span>
                <span className="relative">
                  <NavLink href={`/${locale}/history`}>
                    <span className="hidden md:inline">{t('navHistory')}</span>
                    <span className="md:hidden">历史</span>
                  </NavLink>
                </span>
                <span className="relative">
                  <NavLink href={`/${locale}/pricing`}>
                    <span className="hidden md:inline">{t('pricing')}</span>
                    <span className="md:hidden">定价</span>
                  </NavLink>
                </span>
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
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
