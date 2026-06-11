export type Locale = 'zh-CN' | 'en'

export type DramaGenre = 
  | 'ceo' | 'time_travel' | 'sweet_romance' | 'xianxia' 
  | 'suspense' | 'urban' | 'fantasy' | 'rebirth'
  | 'school' | 'ancient_costume'

export type GenerationType = 'outline' | 'scene' | 'character' | 'full_script'

export type EpisodeCount = 5 | 10 | 20 | 30 | 50 | 80 | 100

export interface Character {
  name: string
  age?: string
  personality: string[]
  background: string
  arc: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  relationships: { name: string; relation: string }[]
}

export interface Scene {
  title: string
  location: string
  characters: { name: string; emotion: string }[]
  description: string
  keyDialogue: string[]
  duration: string // e.g., "3min"
}

export interface EpisodeOutline {
  episode: number
  title: string
  synopsis: string
  scenes: Scene[]
  hook: string  // cliffhanger for end of episode
}

export interface CharacterArc {
  character: Character
  episodes: { episode: number; change: string }[]
  finalState: string
}

export interface GenerationRequest {
  genres: DramaGenre[]
  episodeCount: EpisodeCount
  generationType: GenerationType
  locale: Locale
  additionalInstructions?: string
  existingCharacters?: Character[]
  existingOutlines?: EpisodeOutline[]
}

export interface GenerationResponse {
  title: string
  premise: string
  characters: Character[]
  episodes: EpisodeOutline[]
  characterArcs: CharacterArc[]
  error?: string
}

export interface GenreInfo {
  key: DramaGenre
  labelZh: string
  labelEn: string
  icon: string
}

export interface GenerationTypeInfo {
  key: GenerationType
  labelZh: string
  labelEn: string
  icon: string
}

export interface HistoryItem {
  id: string
  genres: DramaGenre[]
  title: string
  premise: string
  episodeCount: number
  locale: string
  timestamp: number
}
