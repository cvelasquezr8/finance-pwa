'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { SplashProvider } from '@/contexts/SplashContext'
import { SplashScreen } from '@/components/SplashScreen'
import '@/i18n'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SplashProvider>
        <AuthProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
        <SplashScreen />
        <Toaster position="bottom-right" duration={3000} richColors theme="system" />
      </SplashProvider>
    </QueryClientProvider>
  )
}
