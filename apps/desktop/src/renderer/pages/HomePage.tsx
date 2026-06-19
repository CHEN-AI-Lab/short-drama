import React, { useState, useCallback } from 'react'
import { GENRES, GENERATION_TYPES, EPISODE_COUNTS } from 'shared'
import { generateDrama } from 'shared/api'
import type { DramaGenre, GenerationType, GenerationResponse, Locale } from 'shared'
import { generateId } from 'shared'
import { useLocale } from '../hooks/useLocale.tsx'
import GenrePill from '../components/GenrePill'
import CharacterCard from '../components/CharacterCard'
import EpisodeCard from '../components/EpisodeCard'

const HISTORY_KEY = 'short_drama_history'

export default function HomePage() {
  const { t, locale, setLocale } = useLocale()

  const [selectedGenres, setSelectedGenres] = useState<DramaGenre[]>([])
  const [episodeCount, setEpisodeCount] = useState(10)
  const [generationType, setGenerationType] = useState<GenerationType>('outline')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [additionalInstructions, setAdditionalInstructions] = useState('')

  const handleGenreToggle = useCallback((key: DramaGenre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(key)) {
        return prev.filter((g) => g !== key)
      }
      if (prev.length >= 3) return prev
      return [...prev, key]
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    if (selectedGenres.length === 0) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await generateDrama({
        genres: selectedGenres,
        episodeCount,
        generationType,
        locale: locale as Locale,
        additionalInstructions: additionalInstructions.trim() || undefined,
      })

      if (res.error) {
        setError(res.error)
        return
      }

      setResult(res)

      // Save to history (localStorage)
      try {
        const raw = localStorage.getItem(HISTORY_KEY)
        const history = raw ? JSON.parse(raw) : []
        const newItem = {
          id: generateId(),
          genres: selectedGenres,
          title: res.title,
          premise: res.premise,
          episodeCount,
          locale,
          timestamp: Date.now(),
          result: res,
        }
        history.unshift(newItem)
        if (history.length > 200) history.length = 200
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
      } catch {
        // localStorage may be full
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [selectedGenres, episodeCount, generationType, locale, additionalInstructions])

  return (
    <div className="home-page">
      {/* Genre Selection */}
      <section className="section">
        <h2>{t('common.selectGenre')}</h2>
        {selectedGenres.length >= 3 && (
          <p className="hint-warning">{t('common.selectGenreMax')}</p>
        )}
        <div className="genre-grid">
          {GENRES.map((genre) => (
            <GenrePill
              key={genre.key}
              genre={genre}
              selected={selectedGenres.includes(genre.key)}
              locale={locale}
              onToggle={handleGenreToggle}
              disabled={selectedGenres.length >= 3}
            />
          ))}
        </div>
      </section>

      {/* Generation Options */}
      <section className="section">
        <h2>{t('common.episodeCountLabel')}</h2>
        <div className="episode-count-options">
          {EPISODE_COUNTS.map((count) => (
            <button
              key={count}
              className={`option-pill ${episodeCount === count ? 'selected' : ''}`}
              onClick={() => setEpisodeCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </section>

      {/* Generation Type */}
      <section className="section">
        <h2>{t('common.selectGenerationType')}</h2>
        <div className="generation-type-options">
          {GENERATION_TYPES.map((gt) => (
            <button
              key={gt.key}
              className={`option-pill ${generationType === gt.key ? 'selected' : ''}`}
              onClick={() => setGenerationType(gt.key)}
            >
              <span className="gt-icon">{gt.icon}</span>
              <span className="gt-label">
                {locale === 'zh-CN' ? gt.labelZh : gt.labelEn}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Additional Instructions */}
      <section className="section">
        <h2>{t('common.additionalInstructions')}</h2>
        <textarea
          className="instructions-input"
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          placeholder={locale === 'zh-CN' ? '输入额外要求（可选）...' : 'Enter additional requirements (optional)...'}
          rows={3}
          maxLength={500}
        />
      </section>

      {/* Generate Button */}
      <div className="generate-section">
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={loading || selectedGenres.length === 0}
        >
          {loading ? (
            <span className="loading-indicator">
              <span className="spinner" /> {t('common.loading')}
            </span>
          ) : (
            t('common.generate')
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-section">
          <div className="loading-bar" />
          <p>{t('common.loading')}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-section">
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={handleGenerate}>
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Results */}
      {result && !result.error && (
        <section className="section results-section">
          <h2 className="result-title">{result.title}</h2>
          <div className="result-premise">
            <strong>{t('output.premise')}:</strong> {result.premise}
          </div>

          {/* Characters */}
          {result.characters.length > 0 && (
            <div className="result-characters">
              <h3>{t('output.characters')}</h3>
              <div className="characters-grid">
                {result.characters.map((char, i) => (
                  <CharacterCard key={i} character={char} locale={locale} />
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          {result.episodes.length > 0 && (
            <div className="result-episodes">
              <h3>{t('output.episodes')}</h3>
              <div className="episodes-list">
                {result.episodes.map((ep, i) => (
                  <EpisodeCard key={i} episode={ep} locale={locale} />
                ))}
              </div>
            </div>
          )}

          {/* Character Arcs */}
          {result.characterArcs && result.characterArcs.length > 0 && (
            <div className="result-arcs">
              <h3>{t('output.characterArcs')}</h3>
              {result.characterArcs.map((arc, i) => (
                <div key={i} className="arc-card">
                  <h4>{arc.character.name}</h4>
                  <p><strong>{locale === 'zh-CN' ? '最终状态' : 'Final State'}:</strong> {arc.finalState}</p>
                  {arc.episodes.map((ep, j) => (
                    <div key={j} className="arc-episode">
                      <span className="arc-ep-num">
                        {locale === 'zh-CN' ? `第 ${ep.episode} 集` : `Ep ${ep.episode}`}
                      </span>
                      <span>{ep.change}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="empty-state">
          <p>{t('home.noResult')}</p>
        </div>
      )}
    </div>
  )
}