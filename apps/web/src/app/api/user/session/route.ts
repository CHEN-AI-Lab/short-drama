import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/user/session
 * Get current user session.
 * Returns the user object or null.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ user: null })
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

    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      return NextResponse.json({ user: null })
    }

    // Return safe user data (no app_metadata secrets)
    const { app_metadata, ...safeUser } = data.user || {}

    return NextResponse.json({ user: safeUser || null })
  } catch {
    return NextResponse.json({ user: null })
  }
}