'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, Badge } from 'ui'
import type { Character } from 'shared'

interface CharacterListProps {
  characters: Character[]
  locale: string
  editing?: boolean
  onCharacterEdit?: (index: number, char: Character) => void
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

const inputCls = 'w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const selectCls = 'rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

function EditableField({ label, value, onChange, multiline }: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={inputCls + ' resize-none'} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </div>
  )
}

export default function CharacterList({ characters, locale, editing, onCharacterEdit }: CharacterListProps) {
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

  const sorted = [...characters].sort(
    (a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99)
  )

  if (editing && onCharacterEdit) {
    return (
      <div className="space-y-4">
        {characters.map((char, idx) => (
          <Card key={idx}>
            <CardContent className="space-y-3">
              <EditableField
                label={locale === 'zh-CN' ? '角色名' : 'Name'}
                value={char.name}
                onChange={(v) => onCharacterEdit(idx, { ...char, name: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {locale === 'zh-CN' ? '定位' : 'Role'}
                  </label>
                  <select
                    value={char.role}
                    onChange={(e) => onCharacterEdit(idx, { ...char, role: e.target.value as Character['role'] })}
                    className={selectCls}
                  >
                    <option value="protagonist">{locale === 'zh-CN' ? '主角' : 'Protagonist'}</option>
                    <option value="antagonist">{locale === 'zh-CN' ? '反派' : 'Antagonist'}</option>
                    <option value="supporting">{locale === 'zh-CN' ? '配角' : 'Supporting'}</option>
                    <option value="minor">{locale === 'zh-CN' ? '客串' : 'Minor'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {locale === 'zh-CN' ? '性别' : 'Gender'}
                  </label>
                  <select
                    value={char.gender || ''}
                    onChange={(e) => onCharacterEdit(idx, { ...char, gender: (e.target.value || undefined) as 'male' | 'female' | undefined })}
                    className={selectCls}
                  >
                    <option value="">—</option>
                    <option value="male">{locale === 'zh-CN' ? '男' : 'Male'}</option>
                    <option value="female">{locale === 'zh-CN' ? '女' : 'Female'}</option>
                  </select>
                </div>
              </div>
              <EditableField
                label={locale === 'zh-CN' ? '年龄' : 'Age'}
                value={char.age || ''}
                onChange={(v) => onCharacterEdit(idx, { ...char, age: v || undefined })}
              />
              <EditableField
                label={locale === 'zh-CN' ? '性格（逗号分隔）' : 'Personality (comma-separated)'}
                value={char.personality.join(', ')}
                onChange={(v) => onCharacterEdit(idx, { ...char, personality: v.split(/[,，、]/).map(s => s.trim()).filter(Boolean) })}
              />
              <EditableField
                label={locale === 'zh-CN' ? '背景' : 'Background'}
                value={char.background}
                onChange={(v) => onCharacterEdit(idx, { ...char, background: v })}
                multiline
              />
              <EditableField
                label={locale === 'zh-CN' ? '关系（格式：角色名-关系）' : 'Relationships (format: name-relation)'}
                value={char.relationships.map(r => `${r.name}-${r.relation}`).join(', ')}
                onChange={(v) => {
                  const rels = v.split(/[,，]/).map(p => {
                    const parts = p.split('-').map(s => s.trim())
                    return parts.length >= 2 ? { name: parts[0], relation: parts.slice(1).join('-') } : null
                  }).filter(Boolean) as { name: string; relation: string }[]
                  onCharacterEdit(idx, { ...char, relationships: rels })
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sorted.map((char, idx) => (
        <Card key={idx}>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {char.name}
              </h4>
              <Badge color={roleColors[char.role] || 'default'}>
                {labels[char.role] || char.role}
              </Badge>
            </div>

            {(char.gender || char.age) && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {char.gender && (genderEmoji[char.gender] + ' ' + genders[char.gender])} {char.age ? `· ${char.age}岁` : ''}
              </div>
            )}

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

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {char.background}
            </p>

            {char.arc && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {char.arc}
              </p>
            )}

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