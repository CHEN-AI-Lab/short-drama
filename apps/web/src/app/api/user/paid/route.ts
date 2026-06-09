import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/user/paid
 * Check if the current user has paid.
 * Returns { paid: boolean }.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ paid: false })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // `set` may throw in middleware — silently ignore
            }
          })
        },
      },
    })

    const { data } = await supabase.auth.getUser()
    const user = data?.user

    if (!user) {
      return NextResponse.json({ paid: false })
    }

    // Check paid status from user metadata or app metadata
    const isPaid =
      user.user_metadata?.paid === true ||
      user.app_metadata?.paid === true ||
      user.app_metadata?.role === 'pro'

    return NextResponse.json({ paid: isPaid })
  } catch (err) {
    console.error('user/paid GET error:', err)
    return NextResponse.json({ paid: false })
  }
}

/**
 * POST /api/user/paid
 * Update payment status (called after successful checkout).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paid } = body

    if (paid !== true) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Use service_role client for admin operations
    const serviceClient = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: { getAll() { return [] }, setAll() {} },
      auth: { persistSession: false },
    })

    const { data } = await serviceClient.auth.getUser()
    const user = data?.user

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Update user metadata with paid status
    await serviceClient.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, paid: true },
    })

    return NextResponse.json({ paid: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}