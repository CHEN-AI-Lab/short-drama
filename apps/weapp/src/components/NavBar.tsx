import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { isChinese } from '../i18n'

export default function NavBar() {
  const pages = [
    { key: 'generate', icon: '✨', path: '/pages/index/index' },
    { key: 'history', icon: '📋', path: '/pages/history/index' },
    { key: 'settings', icon: '⚙️', path: '/pages/settings/index' },
  ]

  const currentPage = (() => {
    try {
      const pages = Taro.getCurrentPages()
      const current = pages[pages.length - 1]
      return current?.route || ''
    } catch { return '' }
  })()

  return (
    <View
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-around',
        background: '#fff', borderTop: '1px solid var(--color-border)',
        padding: '8px 0', paddingBottom: '24px', zIndex: 50,
      }}
    >
      {pages.map(p => {
        const isActive = currentPage.includes(p.path.replace('/pages/', '').replace('/index', ''))
        return (
          <View
            key={p.key}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            onClick={() => Taro.switchTab({ url: p.path })}
          >
            <Text style={{ fontSize: 20 }}>{p.icon}</Text>
            <Text style={{
              fontSize: 10,
              color: isActive ? '#7c3aed' : '#9ca3af',
              fontWeight: isActive ? 600 : 400,
            }}>
              {p.key === 'generate' ? (isChinese() ? '生成' : 'Generate') :
               p.key === 'history' ? (isChinese() ? '历史' : 'History') :
               (isChinese() ? '设置' : 'Settings')}
            </Text>
          </View>
        )
      })}
    </View>
  )
}