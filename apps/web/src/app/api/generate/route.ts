import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generationRequestSchema, buildGenerationPrompt, buildUserPrompt } from 'shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DAILY_FREE_LIMIT = 3

/**
 * Get Supabase server client with auth context.
 */
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

/**
 * POST /api/generate
 */
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
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
      const genDate = meta.daily_gen_date
      const genCount = (meta.daily_gen_count as number) || 0

      // Reset counter if a new day
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
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => 'Unknown AI error')
      return NextResponse.json(
        { error: `AI API error: ${aiRes.status} ${errText}` },
        { status: 502 }
      )
    }

    const aiData = await aiRes.json()
    let content = ''
    if (aiData.choices?.length) {
      content = aiData.choices[0].message?.content || ''
    } else if (aiData.data?.choices?.length) {
      content = aiData.data.choices[0].message?.content || ''
    }

    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 })
    }

    // ── Parse AI JSON response ──
    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (jsonMatch) jsonStr = jsonMatch[1].trim()

    let generationResponse
    try {
      generationResponse = JSON.parse(jsonStr)
    } catch {
      const firstBrace = jsonStr.indexOf('{')
      const lastBrace = jsonStr.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          generationResponse = JSON.parse(jsonStr.slice(firstBrace, lastBrace + 1))
        } catch {
          return NextResponse.json(
            { title: '', premise: content.slice(0, 200), characters: [], episodes: [], characterArcs: [], error: 'Failed to parse AI response as JSON', rawContent: content },
            { status: 502 }
          )
        }
      } else {
        return NextResponse.json(
          { title: '', premise: content.slice(0, 200), characters: [], episodes: [], characterArcs: [], error: 'Failed to parse AI response as JSON', rawContent: content },
          { status: 502 }
        )
      }
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
          user_metadata: {
            ...meta,
            daily_gen_date: today,
            daily_gen_count: dailyCount + 1,
          },
        })
      }
    }

    // ── Return result ──
    const response = {
      title: generationResponse.title || 'Untitled Drama',
      premise: generationResponse.premise || '',
      characters: generationResponse.characters || [],
      episodes: generationResponse.episodes || [],
      characterArcs: generationResponse.characterArcs || [],
    }
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request: ' + error.message }, { status: 400 })
    }

    // Handle AbortError / timeout
    const err = error as Error
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'AI service timed out. Please try again.' }, { status: 504 })
    }

    // Handle fetch errors (network, DNS, etc.)
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return NextResponse.json({ error: 'Network error connecting to AI service.' }, { status: 502 })
    }

    const errorMessage = err.message || 'Internal server error'
    console.error('Generation error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}