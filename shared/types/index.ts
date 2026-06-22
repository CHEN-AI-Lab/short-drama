export type Locale = 'zh-CN' | 'en'

export type DramaGenre = 
  | 'ceo' | 'time_travel' | 'sweet_romance' | 'xianxia' 
  | 'suspense' | 'urban' | 'fantasy' | 'rebirth'
  | 'school' | 'ancient_costume'

export type GenerationType = 'outline' | 'scene' | 'character' | 'full_script'

export type EpisodeCount = number

export interface Character {
  name: string
  age?: string
  gender?: 'male' | 'female'
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
  autoEpisodeCount?: boolean
  startEpisode?: number
}

export interface GenerationResponse {
  title: string
  premise: string
  characters: Character[]
  episodes: EpisodeOutline[]
  characterArcs: CharacterArc[]
  /** Auto mode: AI signals when the story reaches its natural conclusion */
  storyComplete?: boolean
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
  generationType?: GenerationType
  /** Full generation result stored for detail view */
  result?: GenerationResponse
}

/**
 * Checkpoint for resume — saved to localStorage when batch generation fails midway.
 * Allows resuming from the last successfully completed batch.
 */
export interface GenerationCheckpoint {
  /** The settings that produced this checkpoint (for matching) */
  genres: DramaGenre[]
  episodeCount: EpisodeCount
  generationType: GenerationType
  locale: Locale
  additionalInstructions?: string
  autoEpisodeCount: boolean
  /** The accumulated result so far */
  result: GenerationResponse
  /** How many batches completed (0-indexed, so next batch index is completedBatchIndex + 1) */
  completedBatchIndex: number
  /** Total batches (for display purposes) */
  totalBatches: number
  /** The episode number the next batch should start from */
  nextStartEpisode: number
  /** Timestamp when the checkpoint was saved */
  timestamp: number
}
