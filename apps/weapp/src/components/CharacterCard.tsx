import { View, Text } from '@tarojs/components'
import type { Character } from 'shared/types'
import { isChinese } from '../i18n'

interface Props {
  character: Character
}

const roleLabels: Record<string, Record<string, string>> = {
  'zh-CN': { protagonist: '主角', antagonist: '反派', supporting: '配角', minor: '客串' },
  en: { protagonist: 'Protagonist', antagonist: 'Antagonist', supporting: 'Supporting', minor: 'Minor' },
}

const roleBadge: Record<string, string> = {
  protagonist: 'badge-primary',
  antagonist: 'badge-danger',
  supporting: 'badge-success',
  minor: 'badge-default',
}

export default function CharacterCard({ character }: Props) {
  const labels = roleLabels[isChinese() ? 'zh-CN' : 'en']
  const locale = isChinese() ? 'zh-CN' : 'en'

  return (
    <View className='card'>
      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text className='h3'>
          {character.name}
          {character.age && <Text style={{ fontSize: 13, color: '#9ca3af', marginLeft: 6 }}>({character.age})</Text>}
        </Text>
        <Text className={`badge ${roleBadge[character.role] || 'badge-default'}`}>
          {labels[character.role] || character.role}
        </Text>
      </View>

      {character.personality?.length > 0 && (
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {character.personality.map((trait, i) => (
            <Text key={i} className='badge badge-default'>{trait}</Text>
          ))}
        </View>
      )}

      {character.background && (
        <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, display: 'block' }}>
          {character.background}
        </Text>
      )}

      {character.arc && (
        <Text style={{ fontSize: 12, color: '#7c3aed', fontStyle: 'italic', display: 'block' }}>
          {character.arc}
        </Text>
      )}

      {character.relationships?.length > 0 && (
        <View style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
          <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>
            {isChinese() ? '关系' : 'Relationships'}
          </Text>
          {character.relationships.map((rel, i) => (
            <Text key={i} className='badge badge-default' style={{ margin: 2 }}>
              {rel.name} — {rel.relation}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}