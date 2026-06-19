import { NextResponse } from 'next/server'
import { generationRequestSchema, buildGenerationPrompt, buildUserPrompt } from 'shared'
import type { Character, EpisodeOutline, CharacterArc } from 'shared'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = generationRequestSchema.parse(body)
    const { genres, episodeCount, generationType, locale, additionalInstructions, autoEpisodeCount, startEpisode } = parsed

    // ── Build prompts ──
    const systemPrompt = buildGenerationPrompt({ genres, episodeCount, locale, autoEpisodeCount, generationType, startEpisode, existingSummary: '剧情已展开' })
    const userPrompt = buildUserPrompt({ genres, episodeCount: autoEpisodeCount ? 30 : episodeCount, generationType, additionalInstructions })

    // ── Call AI API with provider fallback ──
    // Primary: OPENAI_* env vars. Backup: BACKUP_* env vars (optional).
    // If SenseTime fails, falls back to the backup provider automatically.

    const providers: { baseUrl: string; apiKey: string; model: string; label: string }[] = []

    const primaryKey = process.env.OPENAI_API_KEY
    if (primaryKey) {
      providers.push({
        baseUrl: process.env.OPENAI_BASE_URL || 'https://token.sensenova.cn/v1',
        apiKey: primaryKey,
        model: process.env.OPENAI_MODEL || 'sensenova-6.7-flash-lite',
        label: 'SenseTime',
      })
    }

    const backupKey = process.env.BACKUP_API_KEY
    if (backupKey) {
      providers.push({
        baseUrl: process.env.BACKUP_BASE_URL || 'https://api.openai.com/v1',
        apiKey: backupKey,
        model: process.env.BACKUP_MODEL || 'gpt-4o-mini',
        label: 'Backup',
      })
    }

    if (providers.length === 0) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    let generationResponse: any = null
    let lastError = ''

    for (const provider of providers) {
      try {
        const aiRes = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 8192,
            temperature: 0.7,
          }),
        })

        if (!aiRes.ok) {
          const errText = await aiRes.text().catch(() => 'Unknown')
          lastError = `${provider.label}: ${aiRes.status} ${errText.slice(0, 100)}`
          console.warn(lastError)
          continue
        }

        const aiData = await aiRes.json()
        let content = ''
        if (aiData.choices?.length) {
          content = aiData.choices[0].message?.content || ''
        } else if (aiData.data?.choices?.length) {
          content = aiData.data.choices[0].message?.content || ''
        }

        if (!content) { lastError = `${provider.label}: empty response`; continue }

        // ── Parse AI response ──
        let jsonStr = content.trim()
        const jsonMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
        if (jsonMatch) jsonStr = jsonMatch[1].trim()

        // Try multiple JSON extraction strategies
        const strategies = [
          // Strategy 1: whole string
          () => jsonStr,
          // Strategy 2: between first { and last }
          () => {
            const fb = jsonStr.indexOf('{')
            const lb = jsonStr.lastIndexOf('}')
            return fb !== -1 && lb > fb ? jsonStr.slice(fb, lb + 1) : null
          },
          // Strategy 3: find { ... } with balanced braces
          () => {
            const fb = jsonStr.indexOf('{')
            if (fb === -1) return null
            let depth = 0
            for (let i = fb; i < jsonStr.length; i++) {
              if (jsonStr[i] === '{') depth++
              if (jsonStr[i] === '}') { depth--; if (depth === 0) return jsonStr.slice(fb, i + 1) }
            }
            return null
          },
        ]

        for (const strat of strategies) {
          const candidate = strat()
          if (!candidate) continue
          try {
            generationResponse = JSON.parse(candidate)
            break
          } catch {
            // Try to repair
            let repaired = candidate
              .replace(/,\s*}/g, '}')
              .replace(/,\s*]/g, ']')
              // Quote ALL unquoted values after : (Chinese characters, unquoted words, etc.)
              .replace(/:\s*([A-Za-z\u4e00-\u9fff_][^,}\]]*?)(\s*[,}\]])/g, ': "$1"$2')
              // Also fix unquoted values with digits mixed in (like "30岁" or "未知1")
              .replace(/:\s*([^"{\[0-9tfn\-][^,}\]]*?)([,}\]])/g, ': "$1"$2')
              // Final pass: catch any remaining :value patterns without quotes
              .replace(/:\s+([^"{\[0-9tfn\-][^,\]}]*)([,}\]])/g, ': "$1"$2')
              try {
              generationResponse = JSON.parse(repaired)
              break
            } catch { continue }
          }
        }

        if (generationResponse) break
        // Debug: show JSON parse error with position context
        const fbPos = jsonStr.indexOf('{')
        const lbPos = jsonStr.lastIndexOf('}')
        let debugInfo = `fb=${fbPos} lb=${lbPos} len=${jsonStr.length}`
        if (fbPos !== -1 && lbPos > fbPos) {
          const ex = jsonStr.slice(fbPos, lbPos + 1)
          try { JSON.parse(ex); debugInfo += ' ok' }
          catch (e) {
            const msg = String((e as Error).message || e).slice(0, 80)
            // Find position of the error in the extracted JSON
            const posMatch = msg.match(/position\s+(\d+)/i)
            const errPos = posMatch ? parseInt(posMatch[1]) : -1
            const ctxStart = Math.max(0, errPos - 40)
            const ctxEnd = Math.min(ex.length, errPos + 40)
            const ctx = errPos >= 0 ? ex.slice(ctxStart, ctxEnd).replace(/\n/g, '\\n') : '?'
            debugInfo += ` errPos=${errPos} ctx="${ctx}" msg=${msg}`
          }
          debugInfo += ` preview=${ex.slice(0, 100).replace(/\n/g, '\\n')}`
        } else {
          debugInfo += ` raw=${jsonStr.slice(0, 200).replace(/\n/g, '\\n')}`
        }
        lastError = `${provider.label}: JSON parse failed [${debugInfo}]`
        // Include raw content preview for debugging
        console.warn(`Raw AI response (first 300 chars): ${content.slice(0, 300)}`)
        continue
      } catch (fetchErr) {
        lastError = `${provider.label}: ${fetchErr instanceof Error ? fetchErr.message : 'request failed'}`
        console.warn(lastError)
        continue
      }
    }

    if (!generationResponse) {
      return NextResponse.json(
        { error: `AI 服务暂不可用${lastError ? '（' + lastError.slice(0, 300) + '）' : ''}` },
        { status: 502 }
      )
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
    const targetCount = autoEpisodeCount ? episodes.length : episodeCount
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