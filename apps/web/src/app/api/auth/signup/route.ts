import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${new URL(request.url).origin}/auth/callback` } })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Sign up error:', err)
    return NextResponse.json({ error: 'Sign up failed' }, { status: 500 })
  }
}