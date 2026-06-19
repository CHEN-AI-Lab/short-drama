import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'phoebe.yanxi@gmail.com'

/**
 * GET /api/admin/stats
 * Get admin dashboard stats.
 * Requires authenticated admin session (admin email). Returns 401 if not verified.
 * Returns { totalUsers, paidUsers, totalGenerations, todayGenerations }.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // ── Step 1: Verify the caller is the admin via their session ──
    const cookieStore = await cookies()
    const anonClient = createServerClient(supabaseUrl, supabaseAnonKey, {
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

    const { data: { user } } = await anonClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userEmail = user.email?.toLowerCase()
    if (userEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    // ── Step 2: Query all users with service role client ──
    const serviceClient = createServerClient(supabaseUrl, serviceRoleKey, {
      cookies: { getAll() { return [] }, setAll() {} },
      auth: { persistSession: false },
    })

    let totalUsers = 0
    let paidUsers = 0
    let totalGenerations = 0
    let todayGenerations = 0

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartISO = todayStart.toISOString()

    let page = 1
    const perPage = 1000
    let hasMore = true

    while (hasMore) {
      const { data: { users }, error } = await serviceClient.auth.admin.listUsers({
        page,
        perPage,
      })

      if (error) {
        console.error('admin/stats: listUsers error:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
      }

      for (const u of users) {
        totalUsers++

        const meta = u.user_metadata || {}
        const appMeta = u.app_metadata || {}

        // Check paid status (matches the same check in /api/user/paid)
        const isPaid =
          meta?.paid === true ||
          appMeta?.paid === true ||
          appMeta?.role === 'pro' ||
          meta?.role === 'pro'
        if (isPaid) {
          paidUsers++
        }

        // Aggregate generation counts from metadata
        const genCount = typeof meta?.generation_count === 'number' ? meta.generation_count : 0
        totalGenerations += genCount

        // Daily generation count — approximations
        const dailyCount = typeof meta?.daily_generation_count === 'number' ? meta.daily_generation_count : 0
        todayGenerations += dailyCount
      }

      // If we got a full page, there might be more
      if (users.length < perPage) {
        hasMore = false
      } else {
        page++
      }
    }

    return NextResponse.json({
      totalUsers,
      paidUsers,
      totalGenerations,
      todayGenerations,
    })
  } catch (err) {
    console.error('admin/stats GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}