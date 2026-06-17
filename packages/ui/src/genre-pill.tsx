import React from 'react'

type PillSize = 'sm' | 'md'

interface GenrePillProps {
  icon?: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  size?: PillSize
  className?: string
  title?: string
}

const sizeStyles: Record<PillSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
}

const GenrePill: React.FC<GenrePillProps> = ({
  icon,
  label,
  active,
  onClick,
  size = 'md',
  className = '',
  title,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        'inline-flex items-center rounded-full border font-medium transition-all duration-150',
        sizeStyles[size],
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20 dark:from-indigo-500 dark:to-purple-500 dark:border-indigo-400 dark:shadow-indigo-500/30 scale-105'
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
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