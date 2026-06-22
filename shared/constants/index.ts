import type { GenreInfo, GenerationTypeInfo, DramaGenre, GenerationType, EpisodeCount } from '../types'

export const GENRES: GenreInfo[] = [
  { key: 'ceo', labelZh: '霸总', labelEn: 'CEO Romance', icon: '👔' },
  { key: 'time_travel', labelZh: '穿越', labelEn: 'Time Travel', icon: '⏳' },
  { key: 'sweet_romance', labelZh: '甜宠', labelEn: 'Sweet Romance', icon: '💕' },
  { key: 'xianxia', labelZh: '仙侠', labelEn: 'Xianxia', icon: '⚔️' },
  { key: 'suspense', labelZh: '悬疑', labelEn: 'Suspense', icon: '🔍' },
  { key: 'urban', labelZh: '都市', labelEn: 'Urban', icon: '🏙️' },
  { key: 'fantasy', labelZh: '玄幻', labelEn: 'Fantasy', icon: '✨' },
  { key: 'rebirth', labelZh: '重生', labelEn: 'Rebirth', icon: '🔄' },
  { key: 'school', labelZh: '校园', labelEn: 'School', icon: '🎒' },
  { key: 'ancient_costume', labelZh: '古装', labelEn: 'Ancient Costume', icon: '👘' },
]

export const GENRE_KEYS: DramaGenre[] = GENRES.map(g => g.key)

export const GENERATION_TYPES: GenerationTypeInfo[] = [
  { key: 'outline', labelZh: '分集大纲', labelEn: 'Episode Outline', icon: '📋' },
  { key: 'scene', labelZh: '场景拆分', labelEn: 'Scene Breakdown', icon: '🎬' },
  { key: 'character', labelZh: '人物弧光', labelEn: 'Character Arc', icon: '👤' },
  { key: 'full_script', labelZh: '完整剧本', labelEn: 'Full Script', icon: '📝' },
]

export const EPISODE_COUNTS: EpisodeCount[] = [5, 10, 20, 30, 50, 80, 100]

export const CHARACTER_ARCHETYPES = {
  protagonist: ['坚强', '聪明', '成长', '善良', '勇敢'],
  antagonist: ['复杂', '执念', '智慧', '魅力', '悲剧'],
  supporting: ['忠诚', '幽默', '温暖', '牺牲', '引导'],
} as const

export const DAILY_LIMIT_FREE = 3

export const CHECKPOINT_KEY = 'short_drama_generation_checkpoint'
export const CHECKPOINT_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours — resume window

// ─── Locale data ──────────────────────────
export { locales, defaultLocale } from './locales'
