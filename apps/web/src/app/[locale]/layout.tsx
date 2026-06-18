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
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-base shadow-md shadow-indigo-500/20">🎬</span>
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hidden sm:inline">{t('appName')}</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              <NavLink href={`/${locale}`}>{t('navGenerate')}</NavLink>
              <NavLink href={`/${locale}/history`}>{t('navHistory')}</NavLink>
              <NavLink href={`/${locale}/pricing`}>{t('pricing')}</NavLink>
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
          {/* Mobile bottom nav */}
          <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-2 shadow-lg">
            <NavLink href={`/${locale}`}>
              <span className="flex flex-col items-center gap-0.5 text-xs"><span className="text-lg">✨</span><span>{t('navGenerate')}</span></span>
            </NavLink>
            <NavLink href={`/${locale}/history`}>
              <span className="flex flex-col items-center gap-0.5 text-xs"><span className="text-lg">📋</span><span>{t('navHistory')}</span></span>
            </NavLink>
            <NavLink href={`/${locale}/pricing`}>
              <span className="flex flex-col items-center gap-0.5 text-xs"><span className="text-lg">💎</span><span>{t('pricing')}</span></span>
            </NavLink>
          </nav>
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