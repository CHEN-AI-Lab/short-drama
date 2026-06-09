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
          ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500',
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