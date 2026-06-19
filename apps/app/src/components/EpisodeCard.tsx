import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { EpisodeOutline } from 'shared/types'

interface Props {
  episode: EpisodeOutline
  index: number
}

export default function EpisodeCard({ episode, index }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.episodeBadge}>
          <Text style={styles.episodeNum}>EP {index + 1}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {episode.title}
        </Text>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </View>

      <Text style={styles.synopsis} numberOfLines={expanded ? undefined : 2}>
        {episode.synopsis}
      </Text>

      {expanded && (
        <View style={styles.expandedContent}>
          {episode.hook ? (
            <View style={styles.hookBox}>
              <Text style={styles.hookLabel}>Hook</Text>
              <Text style={styles.hookText}>{episode.hook}</Text>
            </View>
          ) : null}

          {episode.scenes.length > 0 && (
            <View style={styles.scenes}>
              <Text style={styles.scenesTitle}>Scenes ({episode.scenes.length})</Text>
              {episode.scenes.map((scene, i) => (
                <View key={i} style={styles.scene}>
                  <Text style={styles.sceneTitle}>
                    {scene.title} — {scene.location}
                  </Text>
                  <Text style={styles.sceneDuration}>{scene.duration}</Text>
                  <Text style={styles.sceneDesc} numberOfLines={3}>
                    {scene.description}
                  </Text>
                  {scene.keyDialogue.length > 0 && (
                    <View style={styles.dialogueBox}>
                      {scene.keyDialogue.slice(0, 2).map((line, j) => (
                        <Text key={j} style={styles.dialogueLine}>
                          "{line}"
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
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  episodeBadge: {
    backgroundColor: '#6c63ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  episodeNum: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  expandIcon: {
    color: '#888',
    fontSize: 12,
  },
  synopsis: {
    color: '#bbb',
    fontSize: 13,
    lineHeight: 18,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
  hookBox: {
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ffa502',
  },
  hookLabel: {
    color: '#ffa502',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  hookText: {
    color: '#ddd',
    fontSize: 13,
    fontStyle: 'italic',
  },
  scenes: {
    marginTop: 4,
  },
  scenesTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scene: {
    backgroundColor: '#252545',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  sceneTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  sceneDuration: {
    color: '#6c63ff',
    fontSize: 11,
    marginBottom: 4,
  },
  sceneDesc: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 16,
  },
  dialogueBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  dialogueLine: {
    color: '#ddd',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 2,
  },
})