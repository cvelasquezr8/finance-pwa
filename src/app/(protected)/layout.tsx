'use client'

import { useAuth } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <NotificationProvider>
      <AppLayout>
        <div key={pathname} className="animate-fade-in-up" style={{ animationDuration: '150ms' }}>
          {children}
        </div>
      </AppLayout>
    </NotificationProvider>
  )
}
