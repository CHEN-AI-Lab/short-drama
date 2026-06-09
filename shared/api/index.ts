import type { GenerationRequest, GenerationResponse } from '../types'

/**
 * Send a drama generation request to the API.
 */
export async function generateDrama(
  req: GenerationRequest
): Promise<GenerationResponse> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    return {
      title: '',
      premise: '',
      characters: [],
      episodes: [],
      characterArcs: [],
      error: err.error || 'Request failed',
    }
  }

  const data: GenerationResponse = await res.json()
  return data
}

export { createSupabaseClient } from './supabase'
export type { SupabaseEnv } from './supabase'
