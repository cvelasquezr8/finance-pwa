'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.replace('/')
    }
  }, [user, isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') return null

  return <>{children}</>
}
