'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, Badge } from 'ui'
import type { EpisodeOutline } from 'shared'

interface EpisodeListProps {
  episodes: EpisodeOutline[]
  locale: string
  title: string
  premise: string
}

export default function EpisodeList({
  episodes,
  locale,
  title,
  premise,
}: EpisodeListProps) {
  const t = useTranslations('output')
  const [openEpisode, setOpenEpisode] = useState<number | null>(null)

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {t('noEpisodes')}
      </div>
    )
  }

  const toggleEpisode = (ep: number) => {
    setOpenEpisode((prev) => (prev === ep ? null : ep))
  }

  const episodeLabel =
    locale === 'zh-CN'
      ? (ep: number) => `第 ${ep} 集`
      : (ep: number) => `Episode ${ep}`

  const sceneLabel = t('scenes')
  const hookLabel = t('hook')

  return (
    <div className="space-y-6">
      {/* Episode accordion */}
      <div className="space-y-3">
        {episodes.map((ep) => {
          const isOpen = openEpisode === ep.episode

          return (
            <Card key={ep.episode} hover onClick={() => toggleEpisode(ep.episode)}>
              <CardContent className="space-y-2">
                {/* Episode header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge color="primary">{episodeLabel(ep.episode)}</Badge>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {ep.title}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Synopsis (always visible) */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {ep.synopsis}
                </p>

                {/* Expanded content */}
                {isOpen && (
                  <div className="pt-3 space-y-4 border-t border-gray-100 dark:border-gray-700">
                    {/* Hook */}
                    {ep.hook && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {hookLabel}
                        </span>
                        <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 italic">
                          {ep.hook}
                        </p>
                      </div>
                    )}

                    {/* Scenes */}
                    {ep.scenes && ep.scenes.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {sceneLabel}
                        </span>
                        <div className="mt-2 space-y-2">
                          {ep.scenes.map((scene, si) => (
                            <div
                              key={si}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {scene.title}
                                </span>
                                {scene.duration && (
                                  <Badge color="default">{scene.duration}</Badge>
                                )}
                              </div>
                              {scene.location && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  📍 {scene.location}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {scene.description}
                              </p>
                              {scene.characters && scene.characters.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {scene.characters.map((char, ci) => (
                                    <Badge key={ci} color="default">
                                      {char.name}
                                      {char.emotion ? ` (${char.emotion})` : ''}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {scene.keyDialogue && scene.keyDialogue.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    💬 {locale === 'zh-CN' ? '对白' : 'Dialogue'}
                                  </span>
                                  <div className="mt-2 space-y-1.5">
                                    {scene.keyDialogue.map((line, di) => {
                                      // Split character name from dialogue text (format: "角色名：对白" or "角色名: 对白")
                                      const sepIndex = Math.min(
                                        line.indexOf('\uFF1A') >= 0 ? line.indexOf('\uFF1A') : Infinity,
                                        line.indexOf(':') >= 0 ? line.indexOf(':') : Infinity,
                                      )
                                      const charName = sepIndex < Infinity ? line.slice(0, sepIndex).trim() : ''
                                      const dialogueText = sepIndex < Infinity ? line.slice(sepIndex + 1).trim() : line
                                      return (
                                        <div key={di} className="flex items-start gap-1 text-sm bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700">
                                          {charName && (
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap shrink-0">
                                              {charName}：
                                            </span>
                                          )}
                                          <span className="text-gray-700 dark:text-gray-300">
                                            {dialogueText}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}