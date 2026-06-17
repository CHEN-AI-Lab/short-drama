import { NextResponse } from 'next/server'
import { generationRequestSchema, buildGenerationPrompt, buildUserPrompt } from 'shared'
import type { Character, EpisodeOutline, CharacterArc } from 'shared'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = generationRequestSchema.parse(body)
    const { genres, episodeCount, generationType, locale, additionalInstructions } = parsed

    // ── Build prompts ──
    const systemPrompt = buildGenerationPrompt({ genres, episodeCount, locale })
    const userPrompt = buildUserPrompt({ genres, episodeCount, generationType, additionalInstructions })

    // ── Call AI API ──
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://token.sensenova.cn/v1'
    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL || 'sensenova-6.7-flash-lite'

    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 16384,
        temperature: 0.7,
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `AI API error: ${aiRes.status} ${errText.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const aiData = await aiRes.json()

    // ── Parse AI response ──
    let content = ''
    if (aiData.choices?.length) {
      content = aiData.choices[0].message?.content || ''
    } else if (aiData.data?.choices?.length) {
      content = aiData.data.choices[0].message?.content || ''
    }

    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 })
    }

    // ── Parse AI response with better fallback ──
    let jsonStr = content.trim()

    // Try to extract JSON from code fences (```json ... ```)
    const jsonMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()

    // Try to find JSON object in the response (handle extra text before/after)
    const firstBrace = jsonStr.indexOf('{')
    const lastBrace = jsonStr.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1)
    }

    let generationResponse: any
    try {
      generationResponse = JSON.parse(jsonStr)
    } catch {
      // Last resort: try to repair common issues
      try {
        // Remove trailing commas, unquoted keys
        const repaired = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        generationResponse = JSON.parse(repaired)
      } catch {
        return NextResponse.json(
          { error: 'AI 返回格式异常，请重试。' },
          { status: 502 }
        )
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
          keyDialogue: Array.isArray(s.keyDialogue) ? s.keyDialogue : 
                Array.isArray(s.dialogue) ? s.dialogue : 
                typeof s.keyDialogue === 'string' ? [s.keyDialogue] :
                typeof s.dialogue === 'string' ? [s.dialogue] : [],
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
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return NextResponse.json({ error: 'Network error connecting to AI service.' }, { status: 502 })
    }
    const errorMessage = err.message || 'Internal server error'
    console.error('Generation error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}