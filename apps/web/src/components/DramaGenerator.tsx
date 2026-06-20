'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  GENRES,
  GENERATION_TYPES,
  generationRequestSchema,
  DAILY_LIMIT_FREE,
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
import { useUser } from './AuthProvider'
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
  const { user } = useUser()

  // ── Daily usage ──
  const today = new Date().toISOString().slice(0, 10)
  const rawCount = (user?.user_metadata?.daily_generation_count as number) ?? 0
  const lastDate = user?.user_metadata?.last_generation_date as string | undefined
  const dailyUsed = lastDate === today ? rawCount : 0
  const isLimitReached = user ? dailyUsed >= DAILY_LIMIT_FREE : false
  const isPaid = user?.user_metadata?.paid === true

  // ── Error translation ──
  const translateError = (msg: string): string => {
    if (locale !== 'zh-CN') return msg
    const map: Record<string, string> = {
      'Network error. Please check your connection and try again.': '网络连接失败，请检查网络后重试',
      'Network error connecting to AI service.': '连接 AI 服务失败，请检查网络后重试',
      'Request timed out.': '请求超时，AI 服务响应较慢，请稍后重试',
      'AI service error, please try again later': 'AI 服务异常，请稍后重试',
      'AI service timed out': 'AI 服务响应超时，请稍后重试',
      'Empty response from AI': 'AI 返回为空，请重试',
      'Failed to parse AI response': 'AI 返回格式异常，请重试',
      'AI service not configured': 'AI 服务未配置',
      'Daily limit reached.': '今日免费次数已用完',
      'AI API error: 429': 'AI 服务繁忙（限流），请稍后重试',
      'AI API error: 502': 'AI 服务暂时不可用，请稍后重试',
      'AI API error: 503': 'AI 服务正在维护，请稍后重试',
      'AI API error: 504': 'AI 服务响应超时，请稍后重试',
      'AI API error: 400': 'AI 请求参数错误，请重试',
      'AI 服务暂时不可用': 'AI 服务暂时不可用，请稍后再试',
    }
    for (const [en, zh] of Object.entries(map)) {
      if (msg.includes(en)) return zh
    }
    return msg
  }

  // ── State ──
  const [selectedGenres, setSelectedGenres] = useState<DramaGenre[]>([])
  const [autoEpisodeCount, setAutoEpisodeCount] = useState(true)
  const [episodeCount, setEpisodeCount] = useState<EpisodeCount>(10)
  const [generationType, setGenerationType] = useState<GenerationType>('full_script')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ResultTab>('characters')
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number | string } | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const BATCH_SIZE = 3 // episodes per batch (fits Vercel Hobby 10s limit)
  const MAX_AUTO_BATCHES = 20 // auto mode safety limit: at most 60 episodes (20 × 3)

  // ── Restore state from URL params (from history page) ──
  useEffect(() => {
    const genreStr = searchParams.get('genres')
    const epStr = searchParams.get('episodes')
    const historyId = searchParams.get('historyId')

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
        } catch { /* ignore */ }
      }
    }

    if (genreStr) {
      const restored = genreStr.split(',').filter((g) => GENRES.some((gi: GenreInfo) => gi.key === g)) as DramaGenre[]
      if (restored.length > 0) setSelectedGenres(restored)
    }
    if (epStr) {
      const count = parseInt(epStr, 10)
      if (count >= 1 && count <= 200) setEpisodeCount(count as EpisodeCount)
    }
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
    setBatchProgress(null)

    const parseResult = generationRequestSchema.safeParse({
      genres: selectedGenres,
      episodeCount: autoEpisodeCount ? 0 : episodeCount,
      generationType,
      locale,
      additionalInstructions: additionalInstructions || undefined,
      autoEpisodeCount,
    })

    if (!parseResult.success) {
      setError(translateError(parseResult.error.errors[0]?.message || 'Invalid input'))
      return
    }

    setLoading(true)

    const targetCount = autoEpisodeCount ? 0 : episodeCount
    const batchCount = autoEpisodeCount ? MAX_AUTO_BATCHES : Math.ceil(targetCount / BATCH_SIZE)

    let merged: GenerationResponse = { title: '', premise: '', characters: [], episodes: [], characterArcs: [] }
    const seenCharNames = new Set<string>()
    const seenArcChars = new Set<string>()

    try {
      for (let batch = 0; batch < batchCount; batch++) {
        setBatchProgress({ current: batch + 1, total: autoEpisodeCount ? String(MAX_AUTO_BATCHES) : String(batchCount) })

        const startEp = merged.episodes.length + 1
        const epInBatch = autoEpisodeCount ? BATCH_SIZE : Math.min(BATCH_SIZE, targetCount - batch * BATCH_SIZE)

        if (epInBatch <= 0) break

        const req = {
          ...parseResult.data,
          startEpisode: startEp,
          episodeCount: epInBatch,
          autoEpisodeCount, // pass through the original flag so prompt includes storyComplete signal
        }

        const res = await generateDrama(req as any)

        if (res.error) {
          setError(translateError(res.error))
          setLoading(false)
          setBatchProgress(null)
          return
        }

        // Merge: keep first non-empty title/premise
        if (!merged.title) merged.title = res.title
        if (!merged.premise) merged.premise = res.premise

        // Merge characters (deduplicate by name)
        for (const ch of res.characters || []) {
          if (!seenCharNames.has(ch.name)) {
            seenCharNames.add(ch.name)
            merged.characters.push(ch)
          }
        }

        // Merge episodes (append with corrected numbering)
        const epOffset = startEp - 1
        for (const ep of res.episodes || []) {
          merged.episodes.push({ ...ep, episode: ep.episode + epOffset })
        }

        // Merge arcs (deduplicate by character name)
        for (const arc of res.characterArcs || []) {
          if (arc.character?.name && !seenArcChars.has(arc.character.name)) {
            seenArcChars.add(arc.character.name)
            merged.characterArcs.push(arc)
          }
        }

        // Auto mode: stop when AI signals the story is complete (storyComplete: true)
        if (autoEpisodeCount && res.storyComplete === true) break
      }

      if (merged.episodes.length === 0) {
        setError(translateError('Empty response from AI'))
        setLoading(false)
        setBatchProgress(null)
        return
      }

      setResult(merged)
      setActiveTab('characters')
      if (autoEpisodeCount && merged.episodes.length > 0) {
        setEpisodeCount(merged.episodes.length as EpisodeCount)
      }
      addItem({
        genres: selectedGenres,
        title: merged.title,
        premise: merged.premise,
        episodeCount: merged.episodes.length,
        generationType,
        locale,
        result: merged,
      })
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : et('apiError')))
    } finally {
      setLoading(false)
      setBatchProgress(null)
    }
  }, [selectedGenres, episodeCount, generationType, locale, additionalInstructions, et, autoEpisodeCount])

  const getGenreLabel = (genre: DramaGenre): string => gt(genre)
  const getGenreIcon = (genre: DramaGenre): string =>
    GENRES.find((g: GenreInfo) => g.key === genre)?.icon || ''

  // ── Export helpers ──
  const formatScriptAsMarkdown = (r: GenerationResponse): string => {
    const lines: string[] = []
    lines.push(`# 《${r.title}》`)
    lines.push('')
    lines.push('> ' + r.premise)
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('**生成参数**')
    lines.push(`- 题材：${selectedGenres.map((g) => getGenreLabel(g)).join(' · ')}`)
    lines.push(`- 集数：${episodeCount} 集`)
    lines.push(`- 生成类型：${gtt(generationType)}`)
    lines.push('')
    lines.push('---')
    lines.push('')
    lines.push('## 👥 角色介绍')
    lines.push('')
    r.characters.forEach((c, i) => {
      lines.push(`### ${i + 1}. ${c.name}`)
      lines.push(`- **角色定位**：${c.role === 'protagonist' ? '主角' : c.role === 'antagonist' ? '反派' : c.role === 'supporting' ? '配角' : '其他'}`)
      if (c.age) lines.push(`- **年龄**：${c.age}`)
      if (c.personality.length) lines.push(`- **性格**：${c.personality.join('、')}`)
      if (c.background) lines.push(`- **背景**：${c.background}`)
      if (c.relationships?.length) {
        lines.push(`- **关系**：${c.relationships.map((rel) => `${rel.name}（${rel.relation}）`).join('、')}`)
      }
      if (c.arc) lines.push(`- **弧光**：${c.arc}`)
      lines.push('')
    })

    lines.push('---')
    lines.push('')
    lines.push('## 📺 分集剧情')
    lines.push('')
    r.episodes.forEach((ep) => {
      lines.push(`### 第 ${ep.episode} 集：${ep.title}`)
      lines.push('')
      if (ep.hook) lines.push(`> **悬念钩子**：${ep.hook}`)
      lines.push('')
      lines.push(ep.synopsis)
      lines.push('')
      if (ep.scenes?.length) {
        lines.push('**场景列表：**')
        ep.scenes.forEach((s, si) => {
          lines.push(`1. **${s.title || `场景 ${si + 1}`}**`)
          if (s.location) lines.push(`   - 📍 地点：${s.location}`)
          if (s.duration) lines.push(`   - ⏱ 时长：${s.duration}`)
          if (s.description) lines.push(`   - 📝 描述：${s.description}`)
          if (s.keyDialogue?.length) {
            lines.push(`   - 💬 对白：`)
            ;(Array.isArray(s.keyDialogue) ? s.keyDialogue : [s.keyDialogue]).forEach((d) => lines.push(`     > ${d}`))
          }
        })
        lines.push('')
      }
    })

    lines.push('---')
    lines.push('')
    lines.push('## 📈 人物弧光')
    lines.push('')
    r.characterArcs.forEach((arc) => {
      lines.push(`### ${arc.character.name}`)
      lines.push(`- **最终状态**：${arc.finalState}`)
      if (arc.episodes?.length) {
        lines.push('- **成长轨迹**：')
        arc.episodes.forEach((ep) => {
          if (ep.change) lines.push(`  - 第 ${ep.episode} 集：${ep.change}`)
        })
      }
      lines.push('')
    })

    lines.push('---')
    lines.push(`*由 短剧工坊 AI 自动生成*`)
    return lines.join('\n')
  }

  const downloadMd = (r: GenerationResponse) => {
    const text = formatScriptAsMarkdown(r)
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${r.title || 'script'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Generation info (like liblib's "creation process") ──
  const generationInfo = !result ? null : {
    genres: selectedGenres,
    episodeCount,
    generationType,
    locale,
  }

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* ── Config Panel ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6 shadow-sm">
        {/* Genre pills */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {ct('selectGenre')}
            </h2>
            {selectedGenres.length >= 3 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 ml-auto">{ct('selectGenreMax')}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre: GenreInfo) => (
              <GenrePill
                key={genre.key}
                icon={<span>{genre.icon}</span>}
                label={gt(genre.key)}
                active={selectedGenres.includes(genre.key)}
                onClick={() => toggleGenre(genre.key)}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Generation type + Episode count — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {ct('selectGenerationType')}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {GENERATION_TYPES.map((gtItem: GenerationTypeInfo) => {
                const tooltip =
                  locale === 'zh-CN'
                    ? ({ outline: '每集标题+悬念+概要，无场景和对白', scene: '场景拆分：地点+时长+角色', character: '刻画角色性格/背景/关系/弧光', full_script: '完整剧本，含场景/对白/弧光' } as Record<string, string>)[gtItem.key]
                    : ({ outline: 'Titles, hooks & summaries only', scene: 'Scene breakdowns: location, duration, characters', character: 'Character profiles, backgrounds & arcs', full_script: 'Full script with scenes, dialogue & arcs' } as Record<string, string>)[gtItem.key]
                return (
                <GenrePill
                  key={gtItem.key}
                  icon={<span>{gtItem.icon}</span>}
                  label={gtt(gtItem.key)}
                  active={generationType === gtItem.key}
                  onClick={() => setGenerationType(gtItem.key)}
                  size="sm"
                  title={tooltip}
                />
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {ct('selectEpisodeCount')}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Auto toggle */}
              <button
                type="button"
                onClick={() => setAutoEpisodeCount(!autoEpisodeCount)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${
                  autoEpisodeCount
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700'
                }`}
                role="switch"
                aria-checked={autoEpisodeCount}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                  autoEpisodeCount ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 min-w-[40px]">
                {locale === 'zh-CN' ? '自动' : 'Auto'}
              </span>
              {!autoEpisodeCount && (
                <div className="flex items-center gap-2 ml-1">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={episodeCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val) && val >= 1 && val <= 200) setEpisodeCount(val as EpisodeCount)
                      if (!isNaN(val) && val > 200) setEpisodeCount(200 as EpisodeCount)
                    }}
                    className="w-20 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {locale === 'zh-CN' ? '集' : 'eps'}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                    (1-200)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions — collapsed by default */}
        <details className="group mb-4">
          <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none list-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {ct('additionalInstructions')}
              {additionalInstructions && <span className="text-xs text-indigo-500">({additionalInstructions.length})</span>}
            </span>
          </summary>
          <div className="mt-3">
            <textarea
              value={additionalInstructions}
              onChange={(e) => {
                if (e.target.value.length <= 500) setAdditionalInstructions(e.target.value)
              }}
              placeholder={ct('placeholder')}
              rows={2}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{additionalInstructions.length}/500</p>
          </div>
        </details>

        {/* Generate button */}
        <div className="text-center pt-1">
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
                  {batchProgress
                    ? (locale === 'zh-CN'
                      ? `第 ${batchProgress.current}/${batchProgress.total} 批`
                      : `Batch ${batchProgress.current}/${batchProgress.total}`)
                    : (locale === 'zh-CN' ? 'AI 正在创作中，请稍候...' : 'AI is creating, please wait...')}
                </p>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="gradient"
                size="lg"
                disabled={selectedGenres.length === 0 || (!isPaid && isLimitReached)}
                onClick={handleGenerate}
                className="whitespace-nowrap min-w-[220px] shadow-lg shadow-purple-500/20"
              >
                {isLimitReached && !isPaid
                  ? (locale === 'zh-CN' ? '今日次数已用完' : 'Daily limit reached')
                  : ct('generate')}
              </Button>
              {!result && !isLimitReached && (
                <p className="mt-2 text-xs text-gray-400">
                  {selectedGenres.length === 0
                    ? (locale === 'zh-CN' ? '选个题材开始创作' : 'Pick a genre to start')
                    : (locale === 'zh-CN' ? '点击生成剧本' : 'Click to generate')}
                </p>
              )}
              {/* ── Usage indicator ── */}
              {user && !isPaid && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <span className="text-gray-400">
                    {locale === 'zh-CN'
                      ? `今日已用 ${dailyUsed}/${DAILY_LIMIT_FREE} 次`
                      : `Used ${dailyUsed}/${DAILY_LIMIT_FREE} today`}
                  </span>
                  {isLimitReached && (
                    <a
                      href={`/${locale}/pricing`}
                      className="text-indigo-500 hover:text-indigo-400 font-medium underline underline-offset-2"
                    >
                      {locale === 'zh-CN' ? '升级Pro' : 'Upgrade to Pro'}
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-5 py-4 flex items-start gap-3">
          <svg className="h-5 w-5 shrink-0 mt-0.5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleGenerate}>{ct('retry')}</Button>
        </div>
      )}

      {/* ── Result (liblib-style "作品展示") ── */}
      {result && !loading && (
        <div ref={resultRef} className="space-y-6 animate-fade-in">
          {/* Title card with generation info */}
          <Card>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {result.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{locale === 'zh-CN' ? '题材' : 'Genres'}:</span>{' '}
                    {selectedGenres.map((g) => getGenreLabel(g)).join(' · ')}
                  </span>
                  <span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{locale === 'zh-CN' ? '集数' : 'Episodes'}:</span>{' '}
                    {result.episodes.length}
                  </span>
                  <span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{locale === 'zh-CN' ? '类型' : 'Type'}:</span>{' '}
                    {gtt(generationType)}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {result.premise}
              </p>
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
          <div className="flex justify-center pt-4">
            <Button variant="ghost" size="md" onClick={() => downloadMd(result)}>
              {locale === 'zh-CN' ? '📥 下载剧本' : '📥 Download Script'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}