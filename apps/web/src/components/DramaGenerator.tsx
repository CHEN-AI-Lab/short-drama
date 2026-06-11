'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  GENRES,
  EPISODE_COUNTS,
  GENERATION_TYPES,
  generationRequestSchema,
} from 'shared'
import { generateDrama } from 'shared/api'
import { useDramaHistory } from 'shared'
import type {
  DramaGenre,
  EpisodeCount,
  GenerationType,
  GenerationResponse,
  GenreInfo,
  GenerationTypeInfo,
  HistoryItem,
} from 'shared'
import { GenrePill, Button, Card, CardContent, Badge } from 'ui'
import CharacterList from './CharacterList'
import EpisodeList from './EpisodeList'
import CharacterArcsView from './CharacterArcsView'

type ResultTab = 'characters' | 'episodes' | 'characterArcs'

export default function DramaGenerator() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = (params.locale as string) || 'zh-CN'
  const t = useTranslations('home')
  const ct = useTranslations('common')
  const ot = useTranslations('output')
  const gt = useTranslations('genres')
  const gtt = useTranslations('generationTypes')
  const et = useTranslations('errors')
  const { addItem } = useDramaHistory()

  // ── State ──
  const [selectedGenres, setSelectedGenres] = useState<DramaGenre[]>([])
  const [episodeCount, setEpisodeCount] = useState<EpisodeCount>(10)
  const [generationType, setGenerationType] = useState<GenerationType>('outline')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ResultTab>('characters')

  // ── Restore state from URL params (from history page) ──
  useEffect(() => {
    const genreStr = searchParams.get('genres')
    const epStr = searchParams.get('episodes')
    const historyId = searchParams.get('historyId')

    // First priority: restore full result from history
    if (historyId) {
      const raw = localStorage.getItem('short_drama_history')
      if (raw) {
        try {
          const items: HistoryItem[] = JSON.parse(raw)
          const found = items.find((i) => i.id === historyId)
          if (found && found.result) {
            setSelectedGenres(found.genres)
            setEpisodeCount(found.episodeCount as EpisodeCount)
            setResult(found.result)
            setActiveTab('characters')
            window.history.replaceState({}, '', `/${locale}`)
            return
          }
        } catch { /* ignore parse errors */ }
      }
    }

    // Fallback: restore genres/episode count for regeneration
    if (genreStr) {
      const restored = genreStr.split(',').filter((g) => GENRES.some((gi: GenreInfo) => gi.key === g)) as DramaGenre[]
      if (restored.length > 0) setSelectedGenres(restored)
    }
    if (epStr) {
      const count = parseInt(epStr, 10)
      if (EPISODE_COUNTS.includes(count as EpisodeCount)) setEpisodeCount(count as EpisodeCount)
    }
    // Clean URL after restoring
    if (genreStr || epStr) {
      window.history.replaceState({}, '', `/${locale}`)
    }
  }, [])

  // ── Handlers ──
  const toggleGenre = useCallback(
    (genre: DramaGenre) => {
      if (selectedGenres.includes(genre)) {
        setSelectedGenres((prev) => prev.filter((g) => g !== genre))
      } else if (selectedGenres.length < 3) {
        setSelectedGenres((prev) => [...prev, genre])
      }
    },
    [selectedGenres]
  )

  const handleGenerate = useCallback(async () => {
    setError(null)
    setResult(null)

    const parseResult = generationRequestSchema.safeParse({
      genres: selectedGenres,
      episodeCount,
      generationType,
      locale,
      additionalInstructions: additionalInstructions || undefined,
    })

    if (!parseResult.success) {
      setError(parseResult.error.errors[0]?.message || 'Invalid input')
      return
    }

    setLoading(true)

    try {
      const res = await generateDrama(parseResult.data)
      if (res.error) {
        setError(res.error)
      } else {
        setResult(res)
        setActiveTab('characters')
        // Save to history
        addItem({
          genres: selectedGenres,
          title: res.title,
          premise: res.premise,
          episodeCount,
          locale,
          result: res,
        })
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : et('apiError')
      )
    } finally {
      setLoading(false)
    }
  }, [selectedGenres, episodeCount, generationType, locale, additionalInstructions, et])

  const getGenreLabel = (genre: DramaGenre): string => gt(genre)
  const getGenreIcon = (genre: DramaGenre): string =>
    GENRES.find((g: GenreInfo) => g.key === genre)?.icon || ''

  // ── Export helpers ──
  const formatScriptAsText = (r: GenerationResponse): string => {
    const lines: string[] = []
    lines.push(`《${r.title}》`)
    lines.push('='.repeat(30))
    lines.push('')
    lines.push(r.premise)
    lines.push('')
    lines.push('── 角色 ──')
    r.characters.forEach((c) => {
      lines.push(`  ${c.name}（${c.role}）: ${c.personality.join(', ')}`)
    })
    lines.push('')
    lines.push('── 分集 ──')
    r.episodes.forEach((ep) => {
      lines.push(`  第${ep.episode}集: ${ep.title}`)
      lines.push(`    ${ep.synopsis}`)
    })
    lines.push('')
    lines.push('── 人物弧光 ──')
    r.characterArcs.forEach((arc) => {
      lines.push(`  ${arc.character.name}: → ${arc.finalState}`)
    })
    return lines.join('\n')
  }

  const downloadTxt = (r: GenerationResponse) => {
    const text = formatScriptAsText(r)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${r.title || 'script'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Section wrapper ──
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6 shadow-sm card-hover">
      <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
        {title}
      </h2>
      {children}
    </section>
  )

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Genre selection */}
      <Section title={ct('selectGenre')}>
        <div className="flex flex-wrap gap-2.5">
          {GENRES.map((genre: GenreInfo) => {
            const isActive = selectedGenres.includes(genre.key)
            return (
              <GenrePill
                key={genre.key}
                icon={<span>{genre.icon}</span>}
                label={gt(genre.key)}
                active={isActive}
                onClick={() => toggleGenre(genre.key)}
                size="md"
              />
            )
          })}
        </div>
        {selectedGenres.length >= 3 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            {ct('selectGenreMax')}
          </p>
        )}
      </Section>

      {/* Generation type + Episode count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Section title={ct('selectGenerationType')}>
          <div className="flex flex-wrap gap-2">
            {GENERATION_TYPES.map((gtItem: GenerationTypeInfo) => {
              const isActive = generationType === gtItem.key
              return (
                <GenrePill
                  key={gtItem.key}
                  icon={<span>{gtItem.icon}</span>}
                  label={gtt(gtItem.key)}
                  active={isActive}
                  onClick={() => setGenerationType(gtItem.key)}
                  size="sm"
                />
              )
            })}
          </div>
        </Section>

        <Section title={ct('selectEpisodeCount')}>
          <div className="flex flex-wrap gap-2">
            {EPISODE_COUNTS.map((count: EpisodeCount) => {
              const isActive = episodeCount === count
              return (
                <GenrePill
                  key={count}
                  label={`${count} ${locale === 'zh-CN' ? '集' : 'eps'}`}
                  active={isActive}
                  onClick={() => setEpisodeCount(count)}
                  size="sm"
                />
              )
            })}
          </div>
        </Section>
      </div>

      {/* Additional instructions */}
      <Section title={ct('additionalInstructions')}>
        <textarea
          value={additionalInstructions}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setAdditionalInstructions(e.target.value)
            }
          }}
          placeholder={ct('placeholder')}
          rows={3}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
        />
        <p className="text-xs text-gray-400 mt-1.5 text-right">
          {additionalInstructions.length}/500
        </p>
      </Section>

      {/* Generate button — transforms into loading state */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6 shadow-sm text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-800" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
                {locale === 'zh-CN' ? '正在生成剧本' : 'Generating script'}
                <span className="inline-block animate-pulse ml-0.5">.</span>
                <span className="inline-block animate-pulse ml-0.5" style={{ animationDelay: '0.15s' }}>.</span>
                <span className="inline-block animate-pulse ml-0.5" style={{ animationDelay: '0.3s' }}>.</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {locale === 'zh-CN' ? 'AI 正在创作中，请稍候...' : 'AI is creating, please wait...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <Button
              variant="gradient"
              size="lg"
              disabled={selectedGenres.length === 0}
              onClick={handleGenerate}
              className="whitespace-nowrap min-w-[220px] shadow-lg shadow-purple-500/20"
            >
              {ct('generate')}
            </Button>

            {!result && !loading && (
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                {selectedGenres.length === 0
                  ? (locale === 'zh-CN' ? '请先选择 1-3 个题材' : 'Select 1-3 genres first')
                  : (locale === 'zh-CN' ? '已准备就绪，点击生成' : 'Ready, click to generate')}
              </p>
            )}
          </>
        )}
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-5 py-4 flex items-start gap-3">
          <svg
            className="h-5 w-5 shrink-0 mt-0.5 text-red-500"
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
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleGenerate}>
            {ct('retry')}
          </Button>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <section className="space-y-6">
          {/* Title + Premise */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {result.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {result.premise}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedGenres.map((genre) => (
                  <Badge key={genre} color="primary">
                    {getGenreIcon(genre)} {getGenreLabel(genre)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tab switcher */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(
              [
                { key: 'characters', label: ot('characters') },
                { key: 'episodes', label: ot('episodes') },
                { key: 'characterArcs', label: ot('characterArcs') },
              ] as { key: ResultTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {activeTab === 'characters' && (
              <CharacterList characters={result.characters} locale={locale} />
            )}
            {activeTab === 'episodes' && (
              <EpisodeList
                episodes={result.episodes}
                locale={locale}
                title={result.title}
                premise={result.premise}
              />
            )}
            {activeTab === 'characterArcs' && (
              <CharacterArcsView arcs={result.characterArcs} locale={locale} />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button variant="ghost" size="md" onClick={() => downloadTxt(result)}>
              {locale === 'zh-CN' ? '📥 下载 TXT' : '📥 Download TXT'}
            </Button>
            <Button variant="outline" size="md" onClick={() => setResult(null)}>
              {ot('generateAgain')}
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}