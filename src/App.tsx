import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthPage } from '@/modules/auth/components/AuthPage'
import { DashboardPage } from '@/modules/dashboard/components/DashboardPage'
import { TransactionsPage } from '@/modules/transactions/components/TransactionsPage'
import { HistoryPage } from '@/modules/transactions/components/HistoryPage'
import { AnalyticsPage } from '@/modules/dashboard/components/AnalyticsPage'
import { AdminUsersPage } from '@/modules/admin/components/AdminUsersPage'
import { MyCardsPage } from '@/modules/cards/components/MyCardsPage'
import { EventsPage } from '@/modules/events/components/EventsPage'
import { EventDetailPage } from '@/modules/events/components/EventDetailPage'
import { Loader2 } from 'lucide-react'
import { NotificationProvider } from '@/contexts/NotificationContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true }}>
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <NotificationProvider>
                  <AppLayout />
                </NotificationProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="cards" element={<MyCardsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route
              path="admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
