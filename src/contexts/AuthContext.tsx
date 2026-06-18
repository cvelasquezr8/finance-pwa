import React, { createContext, useContext, useEffect, useReducer } from 'react'
import type { AuthState, User } from '@/core/types'
import { authService } from '@/services/AuthService'
import { getStoredToken } from '@/services/BaseApiService'
import i18n from '@/i18n'
import { useSplash } from '@/contexts/SplashContext'

type AuthAction =
  | { type: 'SET_USER'; user: User; token: string }
  | { type: 'UPDATE_USER'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; loading: boolean }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

function applyTheme(theme: 'dark' | 'light' | undefined) {
  document.documentElement.classList.toggle('dark', theme !== 'light')
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.user,
        token: action.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'UPDATE_USER':
      return { ...state, user: action.user }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    alias: string,
    locale?: { language: string; timezone: string; currency: string }
  ) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  setPasswordChanged: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { showSplash } = useSplash()

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      dispatch({ type: 'SET_LOADING', loading: false })
      return
    }
    const stored = localStorage.getItem('finance_user')
    if (stored) {
      try {
        const user = JSON.parse(stored) as User
        i18n.changeLanguage(user.language ?? 'es')
        applyTheme(user.theme)
        dispatch({ type: 'SET_USER', user, token })
      } catch {
        dispatch({ type: 'SET_LOADING', loading: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login({ email, password })
    i18n.changeLanguage(user.language ?? 'es')
    applyTheme(user.theme)
    localStorage.setItem('finance_user', JSON.stringify(user))
    dispatch({ type: 'SET_USER', user, token })
    await showSplash('login')
  }

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    alias: string,
    locale?: { language: string; timezone: string; currency: string }
  ) => {
    await authService.register({ firstName, lastName, email, password, alias, ...locale })
    // Account starts as blocked — admin must approve before user can log in.
    // No token is issued at registration time.
  }

  const logout = async () => {
    await Promise.all([showSplash('logout'), authService.logout().catch(() => {})])
    localStorage.removeItem('finance_user')
    // SECURITY: purge any service-worker-cached responses so financial data does
    // not linger on disk after sign-out (e.g. on shared devices).
    if (typeof caches !== 'undefined') {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      } catch {
        /* cache eviction is best-effort */
      }
    }
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!state.user) return
    // Persist to the backend when running against the real API; in mock mode the
    // service returns null and we keep the optimistic local merge.
    const server = await authService.updateProfile(updates)
    const updated = server ?? { ...state.user, ...updates }
    localStorage.setItem('finance_user', JSON.stringify(updated))
    if (updated.language) i18n.changeLanguage(updated.language)
    if (updated.theme) applyTheme(updated.theme)
    dispatch({ type: 'UPDATE_USER', user: updated })
  }

  const setPasswordChanged = () => {
    if (!state.user) return
    const updated = { ...state.user, mustChangePassword: false }
    localStorage.setItem('finance_user', JSON.stringify(updated))
    dispatch({ type: 'UPDATE_USER', user: updated })
  }

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser, setPasswordChanged }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
