'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useDramaHistory } from 'shared'
import { Button, Card, CardContent } from 'ui'

export default function HistoryPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'zh-CN'
  const t = useTranslations('common')
  const ht = useTranslations('history')
  const gt = useTranslations('genres')
  const { items, clearAll, removeItem } = useDramaHistory()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  const handleRegenerate = (genres: string[], episodeCount: number) => {
    const sp = new URLSearchParams({ genres: genres.join(','), episodes: String(episodeCount) })
    router.push(`/${locale}?${sp.toString()}`)
  }

  const handleView = (itemId: string) => {
    router.push(`/${locale}?historyId=${itemId}`)
  }

  const handleSingleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDelete(id)
  }

  const confirmSingleDelete = () => {
    if (confirmDelete) {
      removeItem(confirmDelete)
      setConfirmDelete(null)
    }
  }

  const handleClearAll = () => {
    setConfirmClearAll(true)
  }

  const confirmClearAllAction = () => {
    clearAll()
    setConfirmClearAll(false)
  }

  // ── Confirmation Modal ──
  const ConfirmDialog = ({
    message,
    onConfirm,
    onCancel,
  }: {
    message: string
    onConfirm: () => void
    onCancel: () => void
  }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => onCancel()}>
      <Card className="max-w-sm mx-4 w-full animate-fade-in-up">
        <CardContent className="text-center space-y-4 p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" size="sm" onClick={() => onCancel()}>
              {locale === 'zh-CN' ? '取消' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onConfirm()}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {locale === 'zh-CN' ? '确认删除' : 'Delete'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

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
            onClick={handleClearAll}
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
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
              onClick={() => handleView(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleView(item.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {item.title || ht('untitled')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.premise}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <span>{item.episodeCount} {locale === 'zh-CN' ? '集' : 'eps'}</span>
                    {item.generationType && (
                      <>
                        <span>·</span>
                        <span className="text-purple-500">{locale === 'zh-CN'
                          ? ({ outline: '大纲', scene: '场景', character: '弧光', full_script: '剧本' } as Record<string, string>)[item.generationType] || item.generationType
                          : item.generationType}</span>
                      </>
                    )}
                    {item.result?.characters && (
                      <>
                        <span>·</span>
                        <span>{item.result.characters.length} {locale === 'zh-CN' ? '角色' : 'chars'}</span>
                      </>
                    )}
                    <span className="ml-auto">{new Date(item.timestamp).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.genres.map((g) => (
                      <span key={g} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {gt(g)}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="primary" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRegenerate(item.genres, item.episodeCount) }}>
                    {locale === 'zh-CN' ? '重新生成' : 'Regenerate'}
                  </Button>
                  <button
                    type="button"
                    onClick={(e) => handleSingleDelete(item.id, e)}
                    className="text-xs text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1"
                  >
                    {locale === 'zh-CN' ? '删除' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete single confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          message={locale === 'zh-CN' ? '确定要删除这条记录吗？' : 'Delete this record?'}
          onConfirm={confirmSingleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Clear all confirmation */}
      {confirmClearAll && (
        <ConfirmDialog
          message={locale === 'zh-CN' ? `确定要清空全部 ${items.length} 条记录吗？此操作不可恢复。` : `Clear all ${items.length} records? This cannot be undone.`}
          onConfirm={confirmClearAllAction}
          onCancel={() => setConfirmClearAll(false)}
        />
      )}
    </div>
  )
}