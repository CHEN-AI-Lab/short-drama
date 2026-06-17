'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

const navIcons: Record<string, string> = {
  '/': '✨',
  '/history': '📋',
  '/pricing': '💎',
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  // Strip locale prefix to find the base path
  const segments = pathname.split('/').filter(Boolean)
  const basePath = segments.length >= 2 ? '/' + segments.slice(1).join('/') : '/'
  const isActivePath = basePath === href || (href === '/' && pathname.replace(/\/[a-z]{2}(-[A-Z]{2})?$/, '') === '')

  const icon = navIcons[href] || ''

  return (
    <Link
      href={href}
      className={`relative inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-150 ${
        isActivePath
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
      }`}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{children}</span>
      {isActivePath && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
      )}
    </Link>
  )
}