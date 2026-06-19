import React from 'react'

type BadgeColor = 'default' | 'primary' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  color?: BadgeColor
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const colorStyles: Record<BadgeColor, string> = {
  default:
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  primary:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  success:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger:
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

function Badge({
  color = 'default',
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        colorStyles[color],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

export default Badge