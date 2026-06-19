import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { GENRES, GENERATION_TYPES, EPISODE_COUNTS } from 'shared/constants'
import { generateDrama } from 'shared/api'
import type { DramaGenre, GenerationType, GenerationResponse } from 'shared/types'
import { useDramaHistory } from 'shared/hooks'
import GenrePill from '../components/GenrePill'
import CharacterCard from '../components/CharacterCard'
import EpisodeCard from '../components/EpisodeCard'
import { t, getLocale } from '../i18n'

export default function HomeScreen() {
  const [selectedGenres, setSelectedGenres] = useState<DramaGenre[]>([])
  const [generationType, setGenerationType] = useState<GenerationType>('full_script')
  const [episodeCount, setEpisodeCount] = useState(10)
  const [locale, setLocaleState] = useState<'zh-CN' | 'en'>('zh-CN')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResponse | null>(null)
  const [activeResultTab, setActiveResultTab] = useState<'characters' | 'episodes' | 'arcs'>('characters')
  const [additionalInstructions, setAdditionalInstructions] = useState('')

  const { addItem } = useDramaHistory()

  // Load locale on mount
  React.useEffect(() => {
    getLocale().then(setLocaleState)
  }, [])

  const toggleGenre = useCallback((key: DramaGenre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(key)) {
        return prev.filter((g) => g !== key)
      }
      if (prev.length >= 3) return prev
      return [...prev, key]
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    if (selectedGenres.length === 0) return

    setLoading(true)
    setResult(null)

    try {
      const res = await generateDrama({
        genres: selectedGenres,
        episodeCount,
        generationType,
        locale,
        additionalInstructions: additionalInstructions || undefined,
      })

      setResult(res)

      if (res.title && !res.error) {
        addItem({
          genres: selectedGenres,
          title: res.title,
          premise: res.premise,
          episodeCount,
          locale,
          result: res,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [selectedGenres, episodeCount, generationType, locale, additionalInstructions, addItem])

  const displayGenreLabel = (key: DramaGenre, loc: 'zh-CN' | 'en') => {
    const genre = GENRES.find((g) => g.key === key)
    if (!genre) return key
    return loc === 'zh-CN' ? genre.labelZh : genre.labelEn
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.appTitle}>{t('common.appName')}</Text>
        <Text style={styles.tagline}>{t('home.title')}</Text>

        {/* Genre Selection */}
        <Text style={styles.sectionTitle}>{t('common.selectGenre')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
          {GENRES.map((genre) => (
            <View key={genre.key}>
              <GenrePill
                genre={genre}
                isActive={selectedGenres.includes(genre.key)}
                onToggle={toggleGenre}
                locale={locale}
              />
            </View>
          ))}
        </ScrollView>
        {selectedGenres.length >= 3 && (
          <Text style={styles.maxLabel}>{t('common.selectGenreMax')}</Text>
        )}

        {/* Generation Type */}
        <Text style={styles.sectionTitle}>{t('common.selectGenerationType')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
          {GENERATION_TYPES.map((gt) => (
            <TouchableOpacity
              key={gt.key}
              style={[
                styles.typePill,
                generationType === gt.key && styles.activeTypePill,
              ]}
              onPress={() => setGenerationType(gt.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.typeIcon}>{gt.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  generationType === gt.key && styles.activeTypeLabel,
                ]}
              >
                {locale === 'zh-CN' ? gt.labelZh : gt.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Episode Count */}
        <Text style={styles.sectionTitle}>{t('common.episodeCountLabel')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
          {EPISODE_COUNTS.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.countPill,
                episodeCount === count && styles.activeCountPill,
              ]}
              onPress={() => setEpisodeCount(count)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.countLabel,
                  episodeCount === count && styles.activeCountLabel,
                ]}
              >
                {count} {t('output.episodes')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Additional Instructions */}
        <TextInput
          style={styles.input}
          placeholder={t('common.additionalInstructions')}
          placeholderTextColor="#666"
          value={additionalInstructions}
          onChangeText={setAdditionalInstructions}
          multiline
          numberOfLines={2}
        />

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            (selectedGenres.length === 0 || loading) && styles.disabledButton,
          ]}
          onPress={handleGenerate}
          disabled={selectedGenres.length === 0 || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.generateText}>{t('common.generate')}</Text>
          )}
        </TouchableOpacity>

        {/* Results */}
        {result && !result.error && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultPremise}>{result.premise}</Text>

            {/* Result Tabs */}
            <View style={styles.tabRow}>
              {(['characters', 'episodes', 'arcs'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeResultTab === tab && styles.activeTab]}
                  onPress={() => setActiveResultTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      activeResultTab === tab && styles.activeTabLabel,
                    ]}
                  >
                    {t(`output.${tab}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeResultTab === 'characters' && (
              <View>
                {result.characters.length > 0 ? (
                  result.characters.map((char, i) => (
                    <CharacterCard key={i} character={char} />
                  ))
                ) : (
                  <Text style={styles.emptyText}>{t('output.noCharacters')}</Text>
                )}
              </View>
            )}

            {activeResultTab === 'episodes' && (
              <View>
                {result.episodes.length > 0 ? (
                  result.episodes.map((ep, i) => (
                    <EpisodeCard key={i} episode={ep} index={i} />
                  ))
                ) : (
                  <Text style={styles.emptyText}>{t('output.noEpisodes')}</Text>
                )}
              </View>
            )}

            {activeResultTab === 'arcs' && (
              <View>
                {result.characterArcs.length > 0 ? (
                  result.characterArcs.map((arc, i) => (
                    <View key={i} style={styles.arcCard}>
                      <Text style={styles.arcName}>{arc.character.name}</Text>
                      <Text style={styles.arcFinal}>{t('output.finalState')}: {arc.finalState}</Text>
                      {arc.episodes.map((ep, j) => (
                        <Text key={j} style={styles.arcEpisode}>
                          EP {ep.episode}: {ep.change}
                        </Text>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No character arcs available</Text>
                )}
              </View>
            )}
          </View>
        )}

        {result?.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{result.error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleGenerate}>
              <Text style={styles.retryText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!result && selectedGenres.length === 0 && (
          <Text style={styles.emptyState}>{t('home.noResult')}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  appTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  tagline: {
    color: '#888',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 16,
  },
  pillScroll: {
    marginBottom: 4,
  },
  maxLabel: {
    color: '#ffa502',
    fontSize: 11,
    marginTop: 4,
  },
  typePill: {
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
  activeTypePill: {
    backgroundColor: '#6c63ff',
    borderColor: '#8b83ff',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeLabel: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTypeLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  countPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCountPill: {
    backgroundColor: '#6c63ff',
    borderColor: '#8b83ff',
  },
  countLabel: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  activeCountLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1e1e3a',
    color: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  generateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultSection: {
    marginTop: 24,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultPremise: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#1e1e3a',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6c63ff',
  },
  tabLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  arcCard: {
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  arcName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  arcFinal: {
    color: '#6c63ff',
    fontSize: 13,
    marginBottom: 8,
  },
  arcEpisode: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 2,
    paddingLeft: 8,
  },
  errorBox: {
    backgroundColor: '#3a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  errorText: {
    color: '#ff6b81',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#ff4757',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 20,
  },
})