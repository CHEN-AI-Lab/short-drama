import { createClient } from '@supabase/supabase-js'

export interface SupabaseEnv {
  supabaseUrl: string
  supabaseAnonKey: string
}

/**
 * Create a Supabase client instance.
 *
 * Handles both browser and server environments:
 * - In the browser, it creates a standard anonymous client.
 * - On the server, it can optionally be passed `auth` options
 *   if server-side session handling is needed.
 *
 * @param params - Supabase URL and anonymous key
 * @returns A Supabase client instance
 */
export function createSupabaseClient(params: SupabaseEnv) {
  const { supabaseUrl, supabaseAnonKey } = params

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL and anonymous key are required to create a client.'
    )
  }

  const isServer = typeof window === 'undefined'

  if (isServer) {
    // Server environment: create client without cookie forwarding
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  // Browser environment: use default cookie-based auth
  return createClient(supabaseUrl, supabaseAnonKey)
}
