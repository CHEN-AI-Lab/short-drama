import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/checkout
 * Create a Creem payment checkout session.
 */
export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin

    // ── Authenticate user ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Auth service not configured' }, { status: 500 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Please sign in first' }, { status: 401 })
    }

    // ── Verify Creem credentials ──
    const creemApiKey = process.env.CREEM_API_KEY
    const productId = process.env.CREEM_PRODUCT_ID
    if (!creemApiKey || !productId) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
    }

    // ── Create Creem checkout session ──
    const creemRes = await fetch('https://api.creem.io/v1/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': creemApiKey,
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: `${origin}/${user.user_metadata?.locale || 'zh-CN'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/${user.user_metadata?.locale || 'zh-CN'}/pricing`,
        metadata: {
          user_id: user.id,
        },
      }),
    })

    if (!creemRes.ok) {
      const errText = await creemRes.text().catch(() => 'Unknown error')
      console.error('Creem API error:', creemRes.status, errText)
      return NextResponse.json({ error: 'Payment service temporarily unavailable' }, { status: 502 })
    }

    const data = await creemRes.json()

    return NextResponse.json({
      url: data.checkout_url || data.url,
      checkout_url: data.checkout_url || data.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}