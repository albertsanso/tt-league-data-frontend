import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/auth'
import type { AuthCredentials, AuthSession } from '../types'

const STORAGE_KEY = 'tt_auth_session'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (credentials: AuthCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as AuthSession) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  async function login(credentials: AuthCredentials) {
    const response = await authService.login(credentials)
    setSession({ username: response.username, token: response.token })
  }

  async function logout() {
    if (session) {
      await authService.logout(session.token)
    }
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: session !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
