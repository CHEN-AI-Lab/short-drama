import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import type { EpisodeOutline } from 'shared/types'
import { isChinese } from '../i18n'

interface Props {
  episode: EpisodeOutline
}

export default function EpisodeCard({ episode }: Props) {
  const [expanded, setExpanded] = useState(false)
  const epLabel = isChinese()
    ? `第 ${episode.episode} 集`
    : `Episode ${episode.episode}`

  return (
    <View className='card' onClick={() => setExpanded(!expanded)}>
      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text className='badge badge-primary'>{epLabel}</Text>
          <Text className='h3'>{episode.title}</Text>
        </View>
        <Text style={{ fontSize: 16, color: '#9ca3af' }}>{expanded ? '▲' : '▼'}</Text>
      </View>

      <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, display: 'block' }}>
        {episode.synopsis}
      </Text>

      {expanded && (
        <View style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
          {episode.hook && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 4 }}>
                {isChinese() ? '悬念钩子' : 'Hook'}
              </Text>
              <Text style={{ fontSize: 13, color: '#7c3aed', fontStyle: 'italic' }}>
                {episode.hook}
              </Text>
            </View>
          )}

          {episode.scenes?.length > 0 && (
            <View>
              <Text style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginBottom: 8 }}>
                {isChinese() ? '场景' : 'Scenes'}
              </Text>
              {episode.scenes.map((scene, si) => (
                <View
                  key={si}
                  style={{
                    padding: 8, marginBottom: 8, borderRadius: 8,
                    background: '#f9fafb', border: '1px solid var(--color-border)',
                  }}
                >
                  <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, fontWeight: 600 }}>{scene.title}</Text>
                    {scene.duration && (
                      <Text className='badge badge-default'>{scene.duration}</Text>
                    )}
                  </View>
                  {scene.location && (
                    <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      📍 {scene.location}
                    </Text>
                  )}
                  {scene.description && (
                    <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4, display: 'block' }}>
                      {scene.description}
                    </Text>
                  )}
                  {scene.keyDialogue?.length > 0 && (
                    <View style={{ marginTop: 8, borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                      <Text style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
                        💬 {isChinese() ? '对白' : 'Dialogue'}
                      </Text>
                      {scene.keyDialogue.map((line, di) => (
                        <Text
                          key={di}
                          style={{
                            fontSize: 12, color: '#6b7280', marginBottom: 4,
                            padding: 6, background: '#fff', borderRadius: 6,
                          }}
                        >
                          {line}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}