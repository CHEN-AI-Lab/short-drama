import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import type { GenreInfo, DramaGenre } from 'shared/types'

interface Props {
  genre: GenreInfo
  isActive: boolean
  onToggle: (key: DramaGenre) => void
  locale: 'zh-CN' | 'en'
}

export default function GenrePill({ genre, isActive, onToggle, locale }: Props) {
  const label = locale === 'zh-CN' ? genre.labelZh : genre.labelEn

  return (
    <TouchableOpacity
      style={[styles.pill, isActive && styles.activePill]}
      onPress={() => onToggle(genre.key)}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{genre.icon}</Text>
      <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a4a',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activePill: {
    backgroundColor: '#6c63ff',
    borderColor: '#8b83ff',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#fff',
    fontWeight: '600',
  },
})