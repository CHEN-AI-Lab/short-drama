'use client'

import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useDramaHistory } from 'shared'
import { Button } from 'ui'

export default function HistoryPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'zh-CN'
  const t = useTranslations('common')
  const ht = useTranslations('history')
  const gt = useTranslations('genres')
  const { items, clearAll } = useDramaHistory()

  const handleRegenerate = (genres: string[], episodeCount: number) => {
    const sp = new URLSearchParams({
      genres: genres.join(','),
      episodes: String(episodeCount),
    })
    router.push(`/${locale}?${sp.toString()}`)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {ht('title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {ht('subtitle')}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
          >
            {ht('clearAll')}
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 mb-5">
            <svg
              className="w-8 h-8 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {ht('empty')}
          </p>
          <Button variant="outline" onClick={() => router.push(`/${locale}`)}>
            {locale === 'zh-CN' ? '去生成第一条剧本' : 'Go create your first script'}
          </Button>
        </div>
      )}

      {/* History list */}
      {items.length > 0 && (
        <div className="grid gap-4 stagger-children">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 card-hover cursor-pointer"
              onClick={() => handleRegenerate(item.genres, item.episodeCount)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleRegenerate(item.genres, item.episodeCount)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {item.title || ht('untitled')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.premise}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <span>{item.episodeCount} {locale === 'zh-CN' ? '集' : 'eps'}</span>
                    <span>·</span>
                    <span>{new Date(item.timestamp).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US')}</span>
                    <span>·</span>
                    <span className="text-indigo-500">{item.genres.length} {locale === 'zh-CN' ? '题材' : 'genres'}</span>
                  </div>
                  {/* Genre tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.genres.map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                      >
                        {gt(g)}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRegenerate(item.genres, item.episodeCount)}
                  >
                    {locale === 'zh-CN' ? '重新生成' : 'Regenerate'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}