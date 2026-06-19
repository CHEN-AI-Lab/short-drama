import React from 'react'
import type { DramaGenre } from 'shared'

interface GenrePillProps {
  genre: { key: DramaGenre; icon: string; labelEn: string; labelZh: string }
  selected: boolean
  locale: string
  onToggle: (key: DramaGenre) => void
  disabled: boolean
}

export default function GenrePill({ genre, selected, locale, onToggle, disabled }: GenrePillProps) {
  const label = locale === 'zh-CN' ? genre.labelZh : genre.labelEn

  return (
    <button
      className={`genre-pill ${selected ? 'selected' : ''}`}
      onClick={() => onToggle(genre.key)}
      disabled={disabled && !selected}
      title={label}
    >
      <span className="genre-pill-icon">{genre.icon}</span>
      <span className="genre-pill-label">{label}</span>
    </button>
  )
}