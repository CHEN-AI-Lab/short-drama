import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const cookieStore = await cookies()

    if (serviceRoleKey) {
      // Admin API — create user with email_confirm=true (skip confirmation email)
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      // Sign in to establish session cookies in the response
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
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        console.error('Post-signup sign-in failed:', signInError.message)
        // User can still sign in manually — not a hard failure
      }

      return NextResponse.json({ success: true })
    }

    // Fallback without service role — will require email confirmation
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: { getAll() { return cookieStore.getAll() }, setAll() {} },
    })
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${new URL(request.url).origin}/auth/callback` },
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, emailConfirmationRequired: true })
  } catch (err) {
    console.error('Sign up error:', err)
    return NextResponse.json({ error: 'Sign up failed' }, { status: 500 })
  }
}