import React from 'react'
import type { Character } from 'shared'

interface CharacterCardProps {
  character: Character
  locale: string
}

export default function CharacterCard({ character, locale }: CharacterCardProps) {
  const roleLabel = {
    protagonist: locale === 'zh-CN' ? '主角' : 'Protagonist',
    antagonist: locale === 'zh-CN' ? '反派' : 'Antagonist',
    supporting: locale === 'zh-CN' ? '配角' : 'Supporting',
    minor: locale === 'zh-CN' ? '次要' : 'Minor',
  }[character.role]

  return (
    <div className="character-card">
      <div className="character-card-header">
        <span className="character-name">{character.name}</span>
        <span className="character-role-badge">{roleLabel}</span>
      </div>
      {character.age && <div className="character-age">{character.age}</div>}
      <div className="character-personality">
        {character.personality.map((trait, i) => (
          <span key={i} className="trait-tag">{trait}</span>
        ))}
      </div>
      <div className="character-bg">
        <strong>{locale === 'zh-CN' ? '背景' : 'Background'}:</strong> {character.background}
      </div>
      <div className="character-arc">
        <strong>{locale === 'zh-CN' ? '成长弧光' : 'Arc'}:</strong> {character.arc}
      </div>
      {character.relationships.length > 0 && (
        <div className="character-relationships">
          <strong>{locale === 'zh-CN' ? '关系' : 'Relationships'}:</strong>
          <ul>
            {character.relationships.map((rel, i) => (
              <li key={i}>{rel.name} — {rel.relation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}