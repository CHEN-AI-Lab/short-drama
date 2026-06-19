import React from 'react'

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

function Card({
  children,
  className = '',
  hover = false,
  onClick,
}: CardProps) {
  const base = [
    'rounded-xl border border-gray-200 dark:border-gray-700',
    'bg-white dark:bg-gray-800',
    'shadow-sm',
    'transition-all duration-200',
  ]

  if (hover) {
    base.push(
      'hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600'
    )
  }

  if (onClick) {
    base.push('cursor-pointer')
  }

  return (
    <div
      className={[...base, className].filter(Boolean).join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CardHeader                                                         */
/* ------------------------------------------------------------------ */

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

function CardHeader({
  children,
  className = '',
}: CardHeaderProps) {
  return (
    <div
      className={[
        'border-b border-gray-200 dark:border-gray-700',
        'px-4 py-3',
        'font-semibold text-gray-900 dark:text-gray-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CardContent                                                        */
/* ------------------------------------------------------------------ */

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

function CardContent({
  children,
  className = '',
}: CardContentProps) {
  return (
    <div className={['px-4 py-4 text-gray-700 dark:text-gray-300', className].join(' ')}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Skeleton (loading placeholder)                                     */
/* ------------------------------------------------------------------ */

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700'

  const variantClass =
    variant === 'circular' ? 'rounded-full' : variant === 'rectangular' ? 'rounded-md' : 'rounded h-4'

  return (
    <div
      className={[base, variantClass, className].filter(Boolean).join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

/* ------------------------------------------------------------------ */
/*  ErrorBanner                                                        */
/* ------------------------------------------------------------------ */

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
  className?: string
}

function ErrorBanner({
  message,
  onDismiss,
  className = '',
}: ErrorBannerProps) {
  return (
    <div
      className={[
        'flex items-center gap-3 rounded-lg border border-red-300 dark:border-red-700',
        'bg-red-50 dark:bg-red-900/30',
        'px-4 py-3 text-sm text-red-800 dark:text-red-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <svg
        className="h-5 w-5 shrink-0 text-red-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
          aria-label="Dismiss error"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  )
}

export { Card, CardHeader, CardContent, Skeleton, ErrorBanner }
export default Card