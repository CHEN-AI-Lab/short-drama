import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { t } from '../i18n'

interface NavItem {
  key: string
  label: string
  icon: string
}

interface Props {
  activeTab: string
  onTabChange: (key: string) => void
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'navGenerate', icon: '✨' },
  { key: 'history', label: 'navHistory', icon: '📋' },
  { key: 'settings', label: 'pricing', icon: '⚙️' },
]

export default function NavBar({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(item.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {t(`common.${item.label}`)}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#16162a',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#6c63ff',
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#6c63ff',
    fontWeight: '600',
  },
})