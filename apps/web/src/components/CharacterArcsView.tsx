'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, Badge } from 'ui'
import type { CharacterArc } from 'shared'

interface CharacterArcsViewProps {
  arcs: CharacterArc[]
  locale: string
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

export default function CharacterArcsView({
  arcs,
  locale,
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

  return (
    <div className="space-y-6">
      {arcs.map((arc, idx) => {
        const char = arc.character

        return (
          <Card key={idx}>
            <CardContent className="space-y-4">
              {/* Character header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {char.name}
                  </h4>
                  <Badge color={roleColors[char.role] || 'default'}>
                    {labels[char.role] || char.role}
                  </Badge>
                </div>
              </div>

              {/* Personality tags */}
              {char.personality && char.personality.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {char.personality.map((trait) => (
                    <span
                      key={trait}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}

              {/* Background */}
              {char.background && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {char.background}
                </p>
              )}

              {/* Episode timeline */}
              {arc.episodes && arc.episodes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {growthTimelineLabel}
                  </span>
                  <div className="relative pl-6 space-y-3">
                    {/* Vertical line */}
                    <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    {arc.episodes.map((ep, ei) => (
                      <div key={ei} className="relative">
                        {/* Dot */}
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

              {/* Final state */}
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