import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login')
  return view === 'login' ? (
    <LoginForm onSwitchToRegister={() => setView('register')} />
  ) : (
    <RegisterForm onSwitchToLogin={() => setView('login')} />
  )
}
