export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  middleName?: string
  secondLastName?: string
  phone?: string
  currency: string
  timezone: string
  monthlyNotifications: boolean
  avatarUrl?: string
  language?: 'es' | 'en'
  theme?: 'dark' | 'light'
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
