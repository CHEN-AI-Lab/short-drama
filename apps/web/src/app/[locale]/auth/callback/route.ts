import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
      )
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch (err) {
    console.error('Auth callback error:', err)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/?error=auth_callback_failed`)
  }
}