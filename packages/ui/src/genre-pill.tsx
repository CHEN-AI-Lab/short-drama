import React from 'react'

type PillSize = 'sm' | 'md'

interface GenrePillProps {
  icon?: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  size?: PillSize
  className?: string
}

const sizeStyles: Record<PillSize, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
}

const GenrePill: React.FC<GenrePillProps> = ({
  icon,
  label,
  active,
  onClick,
  size = 'md',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center rounded-full border font-medium transition-all duration-150',
        sizeStyles[size],
        active
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm dark:bg-indigo-500 dark:border-indigo-500 dark:shadow-indigo-500/20'
          : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900',
        'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={active}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}

export default GenrePill