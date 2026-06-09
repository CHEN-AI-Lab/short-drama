import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['zh-CN', 'en']
const defaultLocale = 'zh-CN'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    const { createServerClient } = await import('@supabase/ssr')
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    await supabase.auth.getUser()

    const intlResponse = intlMiddleware(request)
    const finalResponse = intlResponse
    for (const [key, value] of supabaseResponse.headers.entries()) {
      if (key.toLowerCase() === 'set-cookie') {
        finalResponse.headers.append(key, value)
      }
    }
    return finalResponse
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}