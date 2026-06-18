'use client'

import { Sidebar } from './Sidebar'
import { BottomBar } from './BottomBar'
import { MobileHeader } from './MobileHeader'
import { FloatingActionButton } from './FloatingActionButton'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomBar />
      <FloatingActionButton />
    </div>
  )
}
