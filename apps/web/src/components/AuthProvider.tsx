'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

interface User {
  id: string
  email?: string
}

interface UserContextValue {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  setUser: () => {},
})

export function useUser(): UserContextValue {
  return useContext(UserContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    fetch('/api/user/session')
      .then((res) => {
        if (!res.ok) {
          setUser(null)
          setLoading(false)
          return
        }
        return res.json()
      })
      .then((data) => {
        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
