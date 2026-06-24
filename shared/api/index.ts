import type { GenerationRequest, GenerationResponse } from '../types'

const TIMEOUT_MS = 120000 // 120s — SenseTime API often takes 55-67s

/**
 * Send a drama generation request to the API.
 * Handles timeout, network errors, and non-ok responses gracefully.
 */
export async function generateDrama(
  req: GenerationRequest
): Promise<GenerationResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }))
      return {
        title: '',
        premise: '',
        characters: [],
        episodes: [],
        characterArcs: [],
        error: err.error || `Request failed (${res.status})`,
      }
    }

    const data: GenerationResponse = await res.json()
    return data
  } catch (err) {
    clearTimeout(timeoutId)

    let errorMsg = 'AI service error, please try again later'
    if (err instanceof DOMException && err.name === 'AbortError') {
      errorMsg = 'Request timed out. The AI service is taking too long, please try again.'
    } else if (err instanceof TypeError) {
      errorMsg = 'Network error. Please check your connection and try again.'
    } else if (err instanceof Error) {
      errorMsg = err.message
    }

    return {
      title: '',
      premise: '',
      characters: [],
      episodes: [],
      characterArcs: [],
      error: errorMsg,
    }
  }
}

export { createSupabaseClient } from './supabase'
export type { SupabaseEnv } from './supabase'