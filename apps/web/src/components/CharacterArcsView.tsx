'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, Badge } from 'ui'
import type { CharacterArc } from 'shared'

interface CharacterArcsViewProps {
  arcs: CharacterArc[]
  locale: string
  editing?: boolean
  onArcEdit?: (index: number, arc: CharacterArc) => void
}

const roleLabels: Record<string, Record<string, string>> = {
  'zh-CN': {
    protagonist: '主角',
    antagonist: '反派',
    supporting: '配角',
    minor: '客串',
  },
  en: {
    protagonist: 'Protagonist',
    antagonist: 'Antagonist',
    supporting: 'Supporting',
    minor: 'Minor',
  },
}

const roleColors: Record<string, 'primary' | 'danger' | 'success' | 'default'> = {
  protagonist: 'primary',
  antagonist: 'danger',
  supporting: 'success',
  minor: 'default',
}

const inputCls = 'w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const inputClsSm = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function CharacterArcsView({
  arcs,
  locale,
  editing,
  onArcEdit,
}: CharacterArcsViewProps) {
  const t = useTranslations('output')

  if (!arcs || arcs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {t('noCharacters')}
      </div>
    )
  }

  const labels = roleLabels[locale] || roleLabels['en']
  const episodeLabel =
    locale === 'zh-CN' ? (ep: number) => `第 ${ep} 集` : (ep: number) => `Ep.${ep}`
  const finalStateLabel = t('finalState')
  const growthTimelineLabel = t('growthTimeline')

  if (editing && onArcEdit) {
    return (
      <div className="space-y-6">
        {arcs.map((arc, idx) => {
          const char = arc.character
          return (
            <Card key={idx}>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => onArcEdit(idx, { ...arc, character: { ...char, name: e.target.value } })}
                    className={inputCls + ' text-lg font-semibold'}
                  />
                  <select
                    value={char.role}
                    onChange={(e) => onArcEdit(idx, { ...arc, character: { ...char, role: e.target.value as CharacterArc['character']['role'] } })}
                    className="rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="protagonist">{locale === 'zh-CN' ? '主角' : 'Protagonist'}</option>
                    <option value="antagonist">{locale === 'zh-CN' ? '反派' : 'Antagonist'}</option>
                    <option value="supporting">{locale === 'zh-CN' ? '配角' : 'Supporting'}</option>
                    <option value="minor">{locale === 'zh-CN' ? '客串' : 'Minor'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {locale === 'zh-CN' ? '弧光' : 'Arc'}
                  </label>
                  <textarea
                    value={char.arc || ''}
                    onChange={(e) => onArcEdit(idx, { ...arc, character: { ...char, arc: e.target.value } })}
                    rows={3}
                    className={inputCls + ' resize-none'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {locale === 'zh-CN' ? '最终状态' : 'Final State'}
                  </label>
                  <textarea
                    value={arc.finalState || ''}
                    onChange={(e) => onArcEdit(idx, { ...arc, finalState: e.target.value })}
                    rows={2}
                    className={inputCls + ' resize-none'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {locale === 'zh-CN' ? '成长轨迹' : 'Growth Timeline'}
                  </label>
                  <div className="space-y-2">
                    {(arc.episodes || []).map((ep, ei) => (
                      <div key={ei} className="flex items-start gap-2">
                        <span className="text-xs font-medium text-indigo-500 mt-1.5 shrink-0">
                          {episodeLabel(ep.episode)}
                        </span>
                        <input
                          type="text"
                          value={ep.change}
                          onChange={(e) => {
                            const episodes = [...(arc.episodes || [])]
                            episodes[ei] = { ...ep, change: e.target.value }
                            onArcEdit(idx, { ...arc, episodes })
                          }}
                          className={inputClsSm}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {arcs.map((arc, idx) => {
        const char = arc.character

        return (
          <Card key={idx}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {char.name}
                  </h4>
                  <Badge color={roleColors[char.role] || 'default'}>
                    {labels[char.role] || char.role}
                  </Badge>
                </div>
              </div>

              {char.arc && (
                <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/50 px-4 py-3">
                  <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed italic">
                    &ldquo;{char.arc}&rdquo;
                  </p>
                </div>
              )}

              {arc.episodes && arc.episodes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {growthTimelineLabel}
                  </span>
                  <div className="relative pl-6 space-y-3">
                    <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    {arc.episodes.map((ep, ei) => (
                      <div key={ei} className="relative">
                        <div className="absolute -left-[14px] top-1 w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 ring-2 ring-white dark:ring-gray-950" />
                        <div className="flex items-start gap-2">
                          <Badge color="primary">
                            {episodeLabel(ep.episode)}
                          </Badge>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ep.change}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {arc.finalState && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {finalStateLabel}
                  </span>
                  <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 leading-relaxed">
                    {arc.finalState}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}