import React, { createContext, useContext, useEffect, useReducer } from 'react'
import type { AuthState, User } from '@/core/types'
import { authService } from '@/services/AuthService'
import { getStoredToken } from '@/services/BaseApiService'
import i18n from '@/i18n'

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
      return { ...state, user: action.user, token: action.token, isAuthenticated: true, isLoading: false }
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
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

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
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const { user, token } = await authService.register({ firstName, lastName, email, password, confirmPassword: password })
    i18n.changeLanguage(user.language ?? 'es')
    applyTheme(user.theme)
    localStorage.setItem('finance_user', JSON.stringify(user))
    dispatch({ type: 'SET_USER', user, token })
  }

  const logout = async () => {
    await authService.logout()
    localStorage.removeItem('finance_user')
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (updates: Partial<User>) => {
    if (!state.user) return
    const updated = { ...state.user, ...updates }
    localStorage.setItem('finance_user', JSON.stringify(updated))
    if (updates.language) i18n.changeLanguage(updates.language)
    if (updates.theme) applyTheme(updates.theme)
    dispatch({ type: 'UPDATE_USER', user: updated })
  }

  return <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
