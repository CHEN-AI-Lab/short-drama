import Taro from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { View as RNView } from 'react-native'
import { GENRES, GENERATION_TYPES, DAILY_LIMIT_FREE } from 'shared/constants'
import { generateDrama } from 'shared/api'
import type { DramaGenre, GenerationType, EpisodeCount, GenreInfo, GenerationTypeInfo, GenerationResponse } from 'shared/types'
import { generateId } from 'shared/utils'
import { t, isChinese } from '../../i18n'
import GenrePill from '../../components/GenrePill'
import CharacterCard from '../../components/CharacterCard'
import EpisodeCard from '../../components/EpisodeCard'
import NavBar from '../../components/NavBar'

type ResultTab = 'characters' | 'episodes' | 'characterArcs'

export default function Index() {
  const [selectedGenres, setSelectedGenres] = useState<DramaGenre[]>([])
  const [generationType, setGenerationType] = useState<GenerationType>('full_script')
  const [episodeCount, setEpisodeCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResponse | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<ResultTab>('characters')

  const toggleGenre = useCallback((genre: DramaGenre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre))
    } else if (selectedGenres.length < 3) {
      setSelectedGenres(prev => [...prev, genre])
    }
  }, [selectedGenres])

  const handleGenerate = useCallback(async () => {
    if (selectedGenres.length === 0) {
      setError(isChinese() ? '请至少选择一个题材' : 'Select at least one genre')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)

    const res = await generateDrama({
      genres: selectedGenres,
      episodeCount: episodeCount as EpisodeCount,
      generationType,
      locale: isChinese() ? 'zh-CN' : 'en',
    })

    if (res.error) {
      setError(res.error)
    } else {
      setResult(res)
      setActiveTab('characters')
    }
    setLoading(false)
  }, [selectedGenres, episodeCount, generationType])

  const saveToHistory = useCallback(() => {
    if (!result) return
    try {
      const raw = Taro.getStorageSync('short_drama_history') || '[]'
      const items = JSON.parse(raw)
      items.unshift({
        id: generateId(),
        genres: selectedGenres,
        title: result.title,
        premise: result.premise,
        episodeCount: result.episodes.length,
        locale: isChinese() ? 'zh-CN' : 'en',
        timestamp: Date.now(),
        result,
      })
      Taro.setStorageSync('short_drama_history', JSON.stringify(items.slice(0, 200)))
    } catch {}
  }, [result, selectedGenres])

  const getGenreLabel = (genre: DramaGenre) => {
    const info = GENRES.find(g => g.key === genre)
    return info ? (isChinese() ? info.labelZh : info.labelEn) : genre
  }

  const getGenreIcon = (genre: DramaGenre) => {
    return GENRES.find(g => g.key === genre)?.icon || ''
  }

  return (
    <View className='page'>
      {/* ── Genre selection ── */}
      <View className='section'>
        <View className='h3' style={{ marginBottom: 12 }}>
          {isChinese() ? '选择题材（最多3个）' : 'Select Genres (max 3)'}
        </View>
        <ScrollView scrollX enableFlex>
          <View style={{ display: 'flex', flexWrap: 'wrap' }}>
            {GENRES.map((genre: GenreInfo) => (
              <GenrePill
                key={genre.key}
                icon={genre.icon}
                label={isChinese() ? genre.labelZh : genre.labelEn}
                active={selectedGenres.includes(genre.key)}
                onClick={() => toggleGenre(genre.key as DramaGenre)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ── Generation type ── */}
      <View className='section'>
        <View className='h3' style={{ marginBottom: 12 }}>
          {isChinese() ? '生成类型' : 'Generation Type'}
        </View>
        <ScrollView scrollX enableFlex>
          <View style={{ display: 'flex', flexWrap: 'wrap' }}>
            {GENERATION_TYPES.map((gt: GenerationTypeInfo) => (
              <GenrePill
                key={gt.key}
                icon={gt.icon}
                label={isChinese() ? gt.labelZh : gt.labelEn}
                active={generationType === gt.key}
                onClick={() => setGenerationType(gt.key as GenerationType)}
                small
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ── Episode count ── */}
      <View className='section'>
        <View className='h3' style={{ marginBottom: 8 }}>
          {isChinese() ? '集数' : 'Episodes'}
        </View>
        <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text
            className='btn btn-outline btn-sm'
            style={{ width: 40 }}
            onClick={() => setEpisodeCount(Math.max(1, episodeCount - 5))}
          >-5</Text>
          <Text style={{ fontSize: 18, fontWeight: 700, minWidth: 40, textAlign: 'center' }}>
            {episodeCount}
          </Text>
          <Text
            className='btn btn-outline btn-sm'
            style={{ width: 40 }}
            onClick={() => setEpisodeCount(Math.min(200, episodeCount + 5))}
          >+5</Text>
        </View>
      </View>

      {/* ── Generate button ── */}
      <View className='section'>
        <View
          className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
          onClick={loading ? undefined : handleGenerate}
        >
          {loading
            ? (isChinese() ? '生成中...' : 'Generating...')
            : (isChinese() ? '✨ 生成剧本' : '✨ Generate Script')
          }
        </View>
      </View>

      {/* ── Error ── */}
      {error && (
        <View className='card' style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <Text style={{ color: '#ef4444', fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {/* ── Result ── */}
      {result && !loading && (
        <View className='section'>
          {/* Title card */}
          <View className='card'>
            <View className='result-title'>{result.title}</View>
            <View className='result-meta'>
              <Text>{isChinese() ? '题材' : 'Genres'}: {selectedGenres.map(getGenreLabel).join(' · ')}</Text>
              <Text>{isChinese() ? '集数' : 'Episodes'}: {result.episodes.length}</Text>
            </View>
            <View className='result-premise'>{result.premise}</View>
          </View>

          {/* Tabs */}
          <View className='tabs'>
            {(['characters', 'episodes', 'characterArcs'] as ResultTab[]).map(tab => (
              <View
                key={tab}
                className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'characters'
                  ? (isChinese() ? '人物' : 'Characters')
                  : tab === 'episodes'
                    ? (isChinese() ? '剧情' : 'Episodes')
                    : (isChinese() ? '弧光' : 'Arcs')
                }
              </View>
            ))}
          </View>

          {/* Tab content */}
          {activeTab === 'characters' && result.characters.length > 0 && (
            result.characters.map((char, i) => <CharacterCard key={i} character={char} />)
          )}
          {activeTab === 'characters' && result.characters.length === 0 && (
            <View className='empty'><Text>暂无角色信息</Text></View>
          )}

          {activeTab === 'episodes' && result.episodes.length > 0 && (
            result.episodes.map((ep, i) => <EpisodeCard key={i} episode={ep} />)
          )}
          {activeTab === 'episodes' && result.episodes.length === 0 && (
            <View className='empty'><Text>暂无分集信息</Text></View>
          )}

          {activeTab === 'characterArcs' && result.characterArcs.length > 0 && (
            result.characterArcs.map((arc, i) => (
              <View key={i} className='card'>
                <View className='h3'>{arc.character?.name || `Arc ${i + 1}`}</View>
                {arc.finalState && (
                  <Text style={{ fontSize: 13, color: '#7c3aed', marginTop: 8 }}>
                    {isChinese() ? '最终状态' : 'Final State'}: {arc.finalState}
                  </Text>
                )}
              </View>
            ))
          )}
          {activeTab === 'characterArcs' && result.characterArcs.length === 0 && (
            <View className='empty'><Text>暂无弧光信息</Text></View>
          )}

          {/* Save button */}
          <View className='section' style={{ marginTop: 12 }}>
            <View className='btn btn-secondary' onClick={saveToHistory}>
              {isChinese() ? '💾 保存到历史' : '💾 Save to History'}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
