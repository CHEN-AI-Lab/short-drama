import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/creem
 * Handle Creem payment webhooks.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-creem-signature') || ''

    // ── Verify webhook signature ──
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
    if (webhookSecret) {
      // Simple HMAC-SHA256 verification
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      )
      const sigBytes = hexToBytes(signature)
      const valid = await crypto.subtle.verify(
        'HMAC',
        key,
        sigBytes,
        encoder.encode(body)
      )
      if (!valid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // ── Parse webhook payload ──
    const payload = JSON.parse(body)
    const eventType = payload.type || payload.event

    // Only handle checkout.completed events
    if (eventType !== 'checkout.completed' && eventType !== 'payment.succeeded') {
      return NextResponse.json({ received: true })
    }

    const userId = payload.metadata?.user_id
    if (!userId) {
      console.error('Creem webhook missing user_id in metadata')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    // ── Update user payment status via Supabase ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const serviceClient = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: { getAll() { return [] }, setAll() {} },
      auth: { persistSession: false },
    })

    // Get current user metadata
    const { data: { user } } = await serviceClient.auth.admin.getUserById(userId)
    if (!user) {
      console.error('Creem webhook: user not found:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await serviceClient.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user_metadata,
        paid: true,
      },
      app_metadata: {
        ...user.app_metadata,
        paid: true,
        role: 'pro',
      },
    })

    console.log(`Creem: Upgraded user ${userId} to Pro`)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes.buffer as ArrayBuffer
}