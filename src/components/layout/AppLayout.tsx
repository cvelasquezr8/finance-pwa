import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Sidebar } from './Sidebar'
import { BottomBar } from './BottomBar'
import { MobileHeader } from './MobileHeader'
import { FloatingActionButton } from './FloatingActionButton'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomBar />
      <FloatingActionButton />
      <Toaster position="bottom-right" duration={3000} richColors theme="system" />
    </div>
  )
}
