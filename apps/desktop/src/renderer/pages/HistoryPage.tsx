import React, { useState, useEffect } from 'react'
import type { HistoryItem } from 'shared'
import { useLocale } from '../contexts/useLocale.tsx'
import GenrePill from '../components/GenrePill'
import CharacterCard from '../components/CharacterCard'
import EpisodeCard from '../components/EpisodeCard'
import { GENRES } from 'shared'

const HISTORY_KEY = 'short_drama_history'

export default function HistoryPage() {
  const { t, locale } = useLocale()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        setItems(JSON.parse(raw))
      }
    } catch {
      // ignore
    }
  }, [])

  const handleClearAll = () => {
    try {
      localStorage.removeItem(HISTORY_KEY)
      setItems([])
      setSelectedItem(null)
    } catch {
      // ignore
    }
  }

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = items.filter((item) => item.id !== id)
    setItems(updated)
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="history-page">
        <div className="empty-state">
          <h2>{t('history.title')}</h2>
          <p>{t('history.empty')}</p>
        </div>
      </div>
    )
  }

  // Detail view
  if (selectedItem) {
    const result = selectedItem.result
    return (
      <div className="history-page">
        <button className="back-btn" onClick={() => setSelectedItem(null)}>
          &larr; {t('output.cancel')}
        </button>
        <div className="detail-view">
          <h2 className="result-title">{selectedItem.title || t('history.untitled')}</h2>
          {selectedItem.premise && (
            <p className="result-premise">
              <strong>{t('output.premise')}:</strong> {selectedItem.premise}
            </p>
          )}

          {result?.characters && result.characters.length > 0 && (
            <div className="result-characters">
              <h3>{t('output.characters')}</h3>
              <div className="characters-grid">
                {result.characters.map((char, i) => (
                  <CharacterCard key={i} character={char} locale={locale} />
                ))}
              </div>
            </div>
          )}

          {result?.episodes && result.episodes.length > 0 && (
            <div className="result-episodes">
              <h3>{t('output.episodes')}</h3>
              <div className="episodes-list">
                {result.episodes.map((ep, i) => (
                  <EpisodeCard key={i} episode={ep} locale={locale} />
                ))}
              </div>
            </div>
          )}

          {!result && (
            <p className="no-detail">
              {locale === 'zh-CN' ? '详细内容不可用' : 'Detailed content not available'}
            </p>
          )}
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="history-page">
      <div className="history-header">
        <h2>{t('history.title')}</h2>
        <button className="clear-btn" onClick={handleClearAll}>
          {t('history.clearAll')} ({items.length})
        </button>
      </div>
      <div className="history-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="history-item"
            onClick={() => setSelectedItem(item)}
          >
            <div className="history-item-header">
              <span className="history-item-title">
                {item.title || t('history.untitled')}
              </span>
              <span className="history-item-date">
                {new Date(item.timestamp).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US')}
              </span>
            </div>
            <div className="history-item-genres">
              {item.genres.map((g) => {
                const genreInfo = GENRES.find((gi) => gi.key === g)
                return (
                  <span key={g} className="history-genre-tag">
                    {genreInfo?.icon} {locale === 'zh-CN' ? genreInfo?.labelZh : genreInfo?.labelEn}
                  </span>
                )
              })}
            </div>
            <div className="history-item-meta">
              <span>{item.episodeCount} {locale === 'zh-CN' ? '集' : 'episodes'}</span>
              <span className="history-item-locale">{item.locale}</span>
            </div>
            <button
              className="delete-btn"
              onClick={(e) => handleDeleteItem(item.id, e)}
              title={locale === 'zh-CN' ? '删除' : 'Delete'}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}