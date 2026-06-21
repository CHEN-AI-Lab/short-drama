'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, Badge } from 'ui'
import type { Character } from 'shared'

interface CharacterListProps {
  characters: Character[]
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

const roleOrder: Record<string, number> = {
  protagonist: 0,
  supporting: 1,
  antagonist: 2,
  minor: 3,
}

const genderEmoji: Record<string, string> = {
  male: '♂️',
  female: '♀️',
}

const genderLabel: Record<string, Record<string, string>> = {
  'zh-CN': { male: '男', female: '女' },
  en: { male: 'Male', female: 'Female' },
}

export default function CharacterList({ characters, locale }: CharacterListProps) {
  const t = useTranslations('output')

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {t('noCharacters')}
      </div>
    )
  }

  const labels = roleLabels[locale] || roleLabels['en']
  const genders = genderLabel[locale] || genderLabel['en']

  // Sort by role: protagonist → supporting → antagonist → minor
  const sorted = [...characters].sort(
    (a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99)
  )

  return (
    <div className="space-y-4">
      {sorted.map((char, idx) => (
        <Card key={idx}>
          <CardContent className="space-y-3">
            {/* Name + Role badge */}
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {char.name}
              </h4>
              <Badge color={roleColors[char.role] || 'default'}>
                {labels[char.role] || char.role}
              </Badge>
            </div>

            {/* Gender + Age line */}
            {(char.gender || char.age) && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {char.gender && (genderEmoji[char.gender] + ' ' + genders[char.gender])} {char.age ? `· ${char.age}岁` : ''}
              </div>
            )}

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
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {char.background}
            </p>

            {/* Arc */}
            {char.arc && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {char.arc}
              </p>
            )}

            {/* Relationships */}
            {char.relationships && char.relationships.length > 0 && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('relationship')}
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {char.relationships.map((rel, ri) => (
                    <span
                      key={ri}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      <span className="font-medium">{rel.name}</span>
                      <span className="text-gray-400">—</span>
                      <span>{rel.relation}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}