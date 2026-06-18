'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const basePath = segments.length >= 2 ? '/' + segments.slice(1).join('/') : '/'
  const isActive = basePath === href || (href === '/' && !segments[1])

  return (
    <Link
      href={href}
      className={`relative inline-flex items-center px-1 py-1 text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
      )}
    </Link>
  )
}