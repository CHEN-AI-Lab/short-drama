import Taro from '@tarojs/taro'
import { View, Text, Switch } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { isChinese, setLocale, getLocale } from '../../i18n'

export default function Settings() {
  const [localeState, setLocaleState] = useState(getLocale())
  const [darkMode, setDarkMode] = useState(false)

  const toggleLocale = () => {
    const next = localeState === 'zh-CN' ? 'en' : 'zh-CN'
    setLocale(next)
    setLocaleState(next)
    Taro.showToast({ title: isChinese() ? '已切换' : 'Switched', icon: 'success' })
  }

  const userEmail = (() => {
    try { return Taro.getStorageSync('user_email') } catch { return '' }
  })()

  const handleLogout = () => {
    Taro.showModal({
      title: isChinese() ? '退出登录' : 'Sign Out',
      content: isChinese() ? '确定退出？' : 'Are you sure?',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('user_email')
          Taro.showToast({ title: isChinese() ? '已退出' : 'Signed out', icon: 'success' })
        }
      },
    })
  }

  return (
    <View className='page'>
      <Text className='h2' style={{ marginBottom: 20 }}>
        {isChinese() ? '设置' : 'Settings'}
      </Text>

      {/* User info */}
      <View className='card'>
        <View style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <View style={{ fontSize: 36 }}>👤</View>
          <View>
            <Text className='h3'>{userEmail || (isChinese() ? '未登录' : 'Not signed in')}</Text>
            <Text className='caption'>{isChinese() ? '账号信息' : 'Account'}</Text>
          </View>
        </View>
        {userEmail && (
          <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 8, display: 'block' }} onClick={handleLogout}>
            {isChinese() ? '退出登录' : 'Sign Out'}
          </Text>
        )}
        {!userEmail && (
          <Text
            style={{ fontSize: 12, color: '#7c3aed', marginTop: 8, display: 'block' }}
            onClick={() => Taro.switchTab({ url: '/pages/auth/index' })}
          >
            {isChinese() ? '去登录' : 'Sign In'}
          </Text>
        )}
      </View>

      {/* Language */}
      <View className='card'>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text className='h3'>{isChinese() ? '语言' : 'Language'}</Text>
            <Text className='caption'>{localeState === 'zh-CN' ? '中文' : 'English'}</Text>
          </View>
          <Switch
            checked={localeState === 'en'}
            onChange={toggleLocale}
            color='#7c3aed'
          />
        </View>
      </View>

      {/* App info */}
      <View className='card'>
        <Text className='h3' style={{ marginBottom: 8 }}>
          {isChinese() ? '关于' : 'About'}
        </Text>
        <Text className='caption' style={{ marginBottom: 4 }}>
          {isChinese() ? '短剧工坊 - AI 短剧生成器' : 'Short Drama Studio - AI Script Generator'}
        </Text>
        <Text className='caption'>v1.0.0</Text>
      </View>
    </View>
  )
}
