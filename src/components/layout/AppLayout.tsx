import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomBar } from './BottomBar'
import { FloatingActionButton } from './FloatingActionButton'
import { Toaster } from '@/components/ui/toaster'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <Outlet />
      </main>
      <BottomBar />
      <FloatingActionButton />
      <Toaster />
    </div>
  )
}
