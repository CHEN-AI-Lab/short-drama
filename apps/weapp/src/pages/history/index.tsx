import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import { isChinese } from '../../i18n'

interface HistoryItem {
  id: string
  genres: string[]
  title: string
  premise: string
  episodeCount: number
  timestamp: number
}

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    try {
      const raw = Taro.getStorageSync('short_drama_history') || '[]'
      setItems(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [])

  const clearAll = useCallback(() => {
    try {
      Taro.setStorageSync('short_drama_history', '[]')
      setItems([])
    } catch {}
    setConfirmClear(false)
  }, [])

  const removeItem = useCallback((id: string) => {
    try {
      const updated = items.filter(i => i.id !== id)
      Taro.setStorageSync('short_drama_history', JSON.stringify(updated))
      setItems(updated)
    } catch {}
  }, [items])

  const viewItem = useCallback((item: HistoryItem) => {
    Taro.switchTab({ url: '/pages/index/index' })
  }, [])

  if (!loaded) {
    return (
      <View className='loading'>
        <View className='spinner' />
      </View>
    )
  }

  return (
    <View className='page'>
      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text className='h2'>{isChinese() ? '历史记录' : 'History'}</Text>
        {items.length > 0 && (
          <Text
            style={{ fontSize: 13, color: '#ef4444' }}
            onClick={() => setConfirmClear(true)}
          >
            {isChinese() ? '清空' : 'Clear'}
          </Text>
        )}
      </View>

      {items.length === 0 && (
        <View className='empty'>
          <View className='empty-icon'>📋</View>
          <Text>{isChinese() ? '暂无历史记录' : 'No history'}</Text>
        </View>
      )}

      <ScrollView scrollY style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {items.map((item) => (
          <View
            key={item.id}
            className='card'
            onClick={() => viewItem(item)}
            style={{ position: 'relative' }}
          >
            <View className='h3' style={{ marginBottom: 4 }}>{item.title || 'Untitled'}</View>
            <Text className='caption' style={{ marginBottom: 8, display: 'block' }}>
              {item.premise?.slice(0, 80)}...
            </Text>
            <View style={{ display: 'flex', gap: 8, fontSize: 11, color: '#9ca3af' }}>
              <Text>{item.episodeCount} eps</Text>
              <Text>·</Text>
              <Text>{new Date(item.timestamp).toLocaleDateString()}</Text>
            </View>
            <Text
              style={{ position: 'absolute', right: 12, top: 12, fontSize: 12, color: '#ef4444' }}
              onClick={(e) => { e.stopPropagation?.(); removeItem(item.id) }}
            >
              {isChinese() ? '删除' : 'Del'}
            </Text>
          </View>
        ))}
      </ScrollView>

      {confirmClear && (
        <View
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          }}
          onClick={() => setConfirmClear(false)}
        >
          <View className='card' style={{ width: '80%', maxWidth: 300, textAlign: 'center' }}
            onClick={(e) => e.stopPropagation?.()}
          >
            <Text style={{ marginBottom: 16, display: 'block' }}>
              {isChinese() ? `确定清空 ${items.length} 条记录？` : `Clear ${items.length} records?`}
            </Text>
            <View style={{ display: 'flex', gap: 12 }}>
              <View className='btn btn-outline btn-sm' onClick={() => setConfirmClear(false)}>
                {isChinese() ? '取消' : 'Cancel'}
              </View>
              <View className='btn btn-primary btn-sm' onClick={clearAll}>
                {isChinese() ? '确认' : 'Confirm'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
