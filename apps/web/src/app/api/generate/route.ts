import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generationRequestSchema, buildGenerationPrompt, buildUserPrompt } from 'shared'
import type { Character, EpisodeOutline, CharacterArc } from 'shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const DAILY_FREE_LIMIT = 3

async function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) return null
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try { cookieStore.set(name, value, options) } catch {}
        })
      },
    },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = generationRequestSchema.parse(body)
    const { genres, episodeCount, generationType, locale, additionalInstructions } = parsed

    // ── Authenticate user ──
    const supabase = await getSupabase()
    let user = null
    if (supabase) {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    }

    // ── Check daily limit (free users) ──
    if (user) {
      const meta = user.user_metadata || {}
      const today = new Date().toISOString().slice(0, 10)
      const genDate = meta.daily_gen_date
      const genCount = (meta.daily_gen_count as number) || 0
      const dailyCount = genDate === today ? genCount : 0
      const isPaid =
        meta.paid === true || user.app_metadata?.paid === true || user.app_metadata?.role === 'pro'
      if (!isPaid && dailyCount >= DAILY_FREE_LIMIT) {
        return NextResponse.json(
          { error: `Daily limit reached. Free users get ${DAILY_FREE_LIMIT} generations/day. Upgrade to continue.` },
          { status: 429 }
        )
      }
    }

    // ── Build prompts ──
    const systemPrompt = buildGenerationPrompt({ genres, episodeCount, locale })
    const userPrompt = buildUserPrompt({ genres, episodeCount, generationType, additionalInstructions })

    // ── Call AI API with fallback models ──
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://token.sensenova.cn/v1'
    const apiKey = process.env.OPENAI_API_KEY
    const primaryModel = process.env.OPENAI_MODEL || 'sensenova-6.7-flash-lite'
    const fallbackModels = ['sensenova-6.7-flash', 'sensenova-4.0-flash', 'sensenova-4.0-turbo']

    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    async function callModel(modelName: string): Promise<Response> {
      return fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 4096,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(9000),
      })
    }

    const modelsToTry = [primaryModel, ...fallbackModels.filter((m) => m !== primaryModel)]
    let generationResponse: any = null
    let lastError = ''

    for (const modelName of modelsToTry) {
      let aiRes: Response
      try {
        aiRes = await callModel(modelName)
      } catch (fetchErr) {
        lastError = `Model ${modelName}: ${fetchErr instanceof Error ? fetchErr.message : 'timeout'}`
        continue
      }

      if (!aiRes.ok) {
        const errText = await aiRes.text().catch(() => '')
        lastError = `Model ${modelName}: ${aiRes.status} ${errText.slice(0, 80)}`
        continue
      }

      // Parse the AI response
      const aiData = await aiRes.json()
      let content = ''
      if (aiData.choices?.length) {
        content = aiData.choices[0].message?.content || ''
      } else if (aiData.data?.choices?.length) {
        content = aiData.data.choices[0].message?.content || ''
      }

      if (!content) continue

      let jsonStr = content.trim()
      const jsonMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
      if (jsonMatch) jsonStr = jsonMatch[1].trim()

      try {
        generationResponse = JSON.parse(jsonStr)
        break // Success!
      } catch {
        const firstBrace = jsonStr.indexOf('{')
        const lastBrace = jsonStr.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          try {
            generationResponse = JSON.parse(jsonStr.slice(firstBrace, lastBrace + 1))
            break // Success!
          } catch {
            lastError = `Model ${modelName}: failed to parse JSON`
            continue
          }
        }
        lastError = `Model ${modelName}: no JSON in response`
        continue
      }
    }

    if (!generationResponse) {
      return NextResponse.json(
        { error: `AI 服务暂时不可用，请稍后再试。${lastError ? lastError.slice(0, 80) : ''}` },
        { status: 502 }
      )
    }

    // ── Increment daily counter ──
    if (user && supabase) {
      const meta = user.user_metadata || {}
      const today = new Date().toISOString().slice(0, 10)
      const genDate = meta.daily_gen_date
      const genCount = (meta.daily_gen_count as number) || 0
      const dailyCount = genDate === today ? genCount : 0
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceRoleKey) {
        const serviceClient = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { cookies: { getAll() { return [] }, setAll() {} }, auth: { persistSession: false } }
        )
        await serviceClient.auth.admin.updateUserById(user.id, {
          user_metadata: { ...meta, daily_gen_date: today, daily_gen_count: dailyCount + 1 },
        })
      }
    }

    // ── Transform AI response ──
    const normalizePersonality = (val: unknown): string[] => {
      if (Array.isArray(val)) return val.filter(Boolean)
      if (typeof val === 'string') return val.split(/[、，,]/).map((s) => s.trim()).filter(Boolean)
      return []
    }

    const roleMap: Record<string, string> = {
      '主角': 'protagonist', '反派': 'antagonist', '配角': 'supporting', '客串': 'minor',
      'protagonist': 'protagonist', 'antagonist': 'antagonist', 'supporting': 'supporting', 'minor': 'minor',
    }
    const normalizeRole = (role: unknown): string => roleMap[String(role || '').toLowerCase()] || 'supporting'

    const normalizeCharacters = (chars: unknown[]): Character[] =>
      (chars || []).map((c: any) => ({
        name: c.name || 'Unknown',
        age: c.age ? String(c.age) : undefined,
        personality: normalizePersonality(c.personality),
        background: c.background || '',
        arc: c.arc || '',
        role: normalizeRole(c.role) as Character['role'],
        relationships: typeof c.relationship === 'string'
          ? [{ name: c.relationship.split(/[、，,]/)[0] || '', relation: c.relationship }]
          : Array.isArray(c.relationships) ? c.relationships : [],
      }))

    const normalizeEpisodes = (eps: unknown[]): EpisodeOutline[] =>
      (eps || []).map((ep: any, i: number) => ({
        episode: ep.episode || ep.episodeNumber || i + 1,
        title: ep.title || '',
        synopsis: ep.synopsis || ep.summary || '',
        scenes: (ep.scenes || []).map((s: any) => ({
          title: s.title || '',
          location: s.location || '',
          characters: (s.characters || []).map((ch: any) =>
            typeof ch === 'string' ? { name: ch, emotion: '' } : { name: ch.name || '', emotion: ch.emotion || '' }
          ),
          description: s.description || '',
          keyDialogue: s.keyDialogue || s.dialogue || [],
          duration: s.duration || '',
        })),
        hook: ep.hook || '',
      }))

    const normalizeArcs = (arcs: unknown[], chars: Character[]): CharacterArc[] =>
      (arcs || []).map((arc: any, i: number) => ({
        character: chars.find((c) => c.name === (arc.character?.name || arc.name)) || {
          name: arc.character?.name || arc.name || `Character ${i + 1}`,
          personality: normalizePersonality(arc.character?.personality),
          background: arc.character?.background || '',
          arc: arc.arc || '',
          role: normalizeRole(arc.character?.role) as Character['role'],
          relationships: [],
        },
        episodes: Array.isArray(arc.episodes)
          ? arc.episodes.map((ep: any) => ({ episode: ep.episode || 0, change: ep.change || '' }))
          : typeof arc.arc === 'string' ? [{ episode: 1, change: arc.arc }] : [],
        finalState: arc.finalState || '',
      }))

    // ── Return result ──
    const characters: Character[] = normalizeCharacters(generationResponse.characters)
    const episodes: EpisodeOutline[] = normalizeEpisodes(generationResponse.episodes)
    const targetCount = episodeCount
    const trimmedEpisodes = episodes.slice(0, targetCount)
    const renumberedEpisodes = trimmedEpisodes.map((ep, i) => ({ ...ep, episode: i + 1 }))
    const characterArcs: CharacterArc[] = normalizeArcs(generationResponse.characterArcs || generationResponse.character_arcs, characters)
    const fixedArcs = characterArcs.map((arc) => ({
      ...arc,
      episodes: arc.episodes.filter((ep) => ep.episode <= targetCount).map((ep) => ({ ...ep })),
    }))

    return NextResponse.json({
      title: generationResponse.title || 'Untitled Drama',
      premise: generationResponse.premise || '',
      characters,
      episodes: renumberedEpisodes,
      characterArcs: fixedArcs,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request: ' + error.message }, { status: 400 })
    }
    const err = error as Error
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'AI service timed out. Please try again.' }, { status: 504 })
    }
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return NextResponse.json({ error: 'Network error connecting to AI service.' }, { status: 502 })
    }
    const errorMessage = err.message || 'Internal server error'
    console.error('Generation error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}