import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type User = {
  id: string
  email: string
} | null

export interface AuthState {
  user: User
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  googleSignIn: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Restore session on mount
  useEffect(() => {
    ;(async () => {
      try {
        const [token, userJson] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ])
        if (token && userJson) {
          const user = JSON.parse(userJson)
          setState({ user, token, isLoading: false, isAuthenticated: true })
        } else {
          setState((s) => ({ ...s, isLoading: false }))
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }))
      }
    })()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // TODO: replace with real API call to backend /api/auth/login
    const user = { id: email.replace(/[^a-zA-Z0-9]/g, '_'), email }
    const token = `mock-token-${Date.now()}`
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ])
    setState({ user, token, isLoading: false, isAuthenticated: true })
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    // TODO: replace with real API call to backend /api/auth/register
    const user = { id: email.replace(/[^a-zA-Z0-9]/g, '_'), email }
    const token = `mock-token-${Date.now()}`
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ])
    setState({ user, token, isLoading: false, isAuthenticated: true })
  }, [])

  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ])
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false })
  }, [])

  const googleSignIn = useCallback(async () => {
    // TODO: implement real Google OAuth flow via expo-auth-session or Supabase
    // For now, mock a Google sign-in
    const user = { id: 'google_user', email: 'google.user@gmail.com' }
    const token = `mock-google-token-${Date.now()}`
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ])
    setState({ user, token, isLoading: false, isAuthenticated: true })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, googleSignIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}