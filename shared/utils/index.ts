import type { EpisodeOutline, Character, GenerationResponse } from '../types'

/**
 * Generate a unique ID using crypto API with timestamp and random components.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  const randomPart2 = Math.random().toString(36).substring(2, 6)
  return `${timestamp}-${randomPart}-${randomPart2}`
}

/**
 * Truncate text to a maximum length, appending an ellipsis if truncated.
 */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/**
 * Create a debounced version of a function.
 * The debounced function has a `.cancel()` method to cancel pending invocations.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): { (...args: Parameters<T>): void; cancel: () => void } {
  let timerId: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>): void => {
    if (timerId !== null) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }

  debounced.cancel = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  return debounced
}

export { buildGenerationPrompt, buildUserPrompt } from './prompts'
export {
  formatEpisodeOutline,
  formatCharacter,
  formatScriptPreview,
  generateShareText,
} from './format'
export type { EpisodeOutline, Character, GenerationResponse }
