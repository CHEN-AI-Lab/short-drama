import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { t, setLocale, getLocale } from '../i18n'
import type { Locale } from 'shared/types'

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { user, isAuthenticated, logout } = useAuth()
  const [currentLocale, setCurrentLocale] = useState<Locale>('zh-CN')
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    getLocale().then(setCurrentLocale)
  }, [])

  const toggleLocale = async () => {
    const newLocale: Locale = currentLocale === 'zh-CN' ? 'en' : 'zh-CN'
    await setLocale(newLocale)
    setCurrentLocale(newLocale)
    // Force re-render by navigating — for now just update state
  }

  const handleLogout = () => {
    Alert.alert(
      t('auth.signOut'),
      'Are you sure you want to sign out?',
      [
        { text: t('output.cancel'), style: 'cancel' },
        {
          text: t('auth.signOut'),
          style: 'destructive',
          onPress: async () => {
            await logout()
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email || 'Not signed in'}</Text>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('common.switchLanguage')}</Text>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLocale}>
              <Text style={[styles.langOption, currentLocale === 'zh-CN' && styles.langActive]}>中文</Text>
              <Text style={[styles.langOption, currentLocale === 'en' && styles.langActive]}>EN</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              {darkMode ? t('common.darkMode') : t('common.lightMode')}
            </Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#3a3a5a', true: '#6c63ff' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Sign Out */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('auth.signOut')}</Text>
          </TouchableOpacity>
        )}

        {/* Sign In */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInText}>{t('common.signIn')}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.version}>Short Drama Studio v1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e3a',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  rowLabel: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '500',
  },
  rowValue: {
    color: '#888',
    fontSize: 14,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  langActive: {
    backgroundColor: '#6c63ff',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#3a1a1a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  logoutText: {
    color: '#ff6b81',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
  },
})