import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { Character } from 'shared/types'

interface Props {
  character: Character
}

export default function CharacterCard({ character }: Props) {
  const [expanded, setExpanded] = useState(false)

  const roleColors: Record<string, string> = {
    protagonist: '#6c63ff',
    antagonist: '#ff4757',
    supporting: '#2ed573',
    minor: '#ffa502',
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{character.name}</Text>
          {character.age && <Text style={styles.age}>({character.age})</Text>}
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: roleColors[character.role] || '#666' },
            ]}
          >
            <Text style={styles.roleText}>{character.role}</Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </View>

      <Text style={styles.background} numberOfLines={expanded ? undefined : 2}>
        {character.background}
      </Text>

      <View style={styles.traits}>
        {character.personality.map((trait, i) => (
          <View key={i} style={styles.trait}>
            <Text style={styles.traitText}>{trait}</Text>
          </View>
        ))}
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.arcTitle}>Arc: {character.arc}</Text>
          {character.relationships.length > 0 && (
            <View style={styles.relationships}>
              <Text style={styles.sectionTitle}>Relationships</Text>
              {character.relationships.map((rel, i) => (
                <Text key={i} style={styles.relationText}>
                  {rel.name} — {rel.relation}
                </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  age: {
    color: '#888',
    fontSize: 14,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  expandIcon: {
    color: '#888',
    fontSize: 12,
  },
  background: {
    color: '#bbb',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  traits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  trait: {
    backgroundColor: '#2a2a4a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  traitText: {
    color: '#aaa',
    fontSize: 11,
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
  arcTitle: {
    color: '#6c63ff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  relationships: {
    marginTop: 6,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  relationText: {
    color: '#bbb',
    fontSize: 13,
    marginBottom: 2,
  },
})