import { NextResponse } from 'next/server'
import { generationRequestSchema, buildGenerationPrompt, buildUserPrompt } from 'shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * SenseTime auth: exchange access_key + secret_key for a bearer token.
 */
async function getAccessToken(
  baseUrl: string,
  accessKey: string,
  secretKey: string
): Promise<string> {
  const tokenUrl = `${baseUrl}/auth/token`
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_key: accessKey, secret_key: secretKey }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown auth error')
    throw new Error(`SenseTime auth failed: ${res.status} ${errText}`)
  }

  const data = await res.json()
  const token = data.access_token || data.token || data.data?.access_token
  if (!token) throw new Error('No access token in SenseTime response')
  return token
}

/**
 * POST /api/generate
 * Generate a drama script using the SenseTime (OpenAI-compatible) API.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const parsed = generationRequestSchema.parse(body)
    const { genres, episodeCount, generationType, locale, additionalInstructions } = parsed

    // Rate limiting: check daily usage from localStorage-style tracking via fetching user stats
    // This is a basic check — production should use a proper DB
    const usageRes = await fetch(
      `${request.url?.replace('/api/generate', '')}/api/user/paid`
    ).catch(() => null)

    let isPaid = false
    if (usageRes && usageRes.ok) {
      const usageData = await usageRes.json()
      isPaid = usageData.paid === true
    }

    if (!isPaid) {
      // Enforce free tier daily limit
      return NextResponse.json(
        { error: 'Daily limit reached. Please upgrade to continue generating.' },
        { status: 429 }
      )
    }

    // Build prompts
    const systemPrompt = buildGenerationPrompt({
      genres,
      episodeCount,
      locale,
    })

    const userPrompt = buildUserPrompt({
      genres,
      episodeCount,
      generationType,
      additionalInstructions,
    })

    // OpenAI-compatible API call (SenseTime / token.sensenova.cn)
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://token.sensenova.cn/v1'
    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL || 'sensenova-6.7-flash-lite'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Call chat completions directly (OpenAI-compatible format)
    const chatUrl = `${baseUrl}/chat/completions`
    const aiRes = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.8,
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => 'Unknown AI error')
      return NextResponse.json(
        { error: `AI API error: ${aiRes.status} ${errText}` },
        { status: 502 }
      )
    }

    const aiData = await aiRes.json()

    // Extract content from response
    let content = ''
    if (aiData.choices && aiData.choices.length > 0) {
      content = aiData.choices[0].message?.content || ''
    } else if (aiData.data?.choices) {
      content = aiData.data.choices[0].message?.content || ''
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 502 }
      )
    }

    // Try to parse JSON from the response
    // The AI might wrap it in markdown code blocks
    let jsonStr = content.trim()
    const jsonMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    let generationResponse
    try {
      generationResponse = JSON.parse(jsonStr)
    } catch {
      // Try to find JSON object boundaries
      const firstBrace = jsonStr.indexOf('{')
      const lastBrace = jsonStr.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          generationResponse = JSON.parse(jsonStr.slice(firstBrace, lastBrace + 1))
        } catch {
          return NextResponse.json(
            {
              title: '',
              premise: content.slice(0, 200),
              characters: [],
              episodes: [],
              characterArcs: [],
              error: 'Failed to parse AI response as JSON',
              rawContent: content,
            },
            { status: 502 }
          )
        }
      } else {
        return NextResponse.json(
          {
            title: '',
            premise: content.slice(0, 200),
            characters: [],
            episodes: [],
            characterArcs: [],
            error: 'Failed to parse AI response as JSON',
            rawContent: content,
          },
          { status: 502 }
        )
      }
    }

    // Validate response structure
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
      return NextResponse.json(
        { error: 'Invalid request: ' + error.message },
        { status: 400 }
      )
    }

    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}