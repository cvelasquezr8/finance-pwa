'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, History, TrendingUp, PartyPopper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/events', icon: PartyPopper, labelKey: 'events.navLabel' },
  { to: '/transactions', icon: ArrowLeftRight, labelKey: 'nav.transactions' },
  { to: '/analytics', icon: TrendingUp, labelKey: 'nav.analytics' },
  { to: '/history', icon: History, labelKey: 'nav.history' },
] as const

export function BottomBar() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const activeIndex = NAV_ITEMS.findIndex(({ to }) =>
    to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/')
  )

  const pillWidthPct = 100 / NAV_ITEMS.length
  const pillOffset = activeIndex >= 0 ? activeIndex * pillWidthPct : 0

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden">
      <div className="relative flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {/* sliding amber pill */}
        {activeIndex >= 0 && (
          <span
            className="pointer-events-none absolute top-1 h-10 rounded-xl bg-primary/10 transition-transform duration-300 ease-out"
            style={{
              width: `${pillWidthPct}%`,
              left: 0,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
            aria-hidden
          />
        )}

        {NAV_ITEMS.map(({ to, icon: Icon, labelKey }, idx) => {
          const active = idx === activeIndex
          return (
            <Link
              key={to}
              href={to}
              className={cn(
                'relative z-10 flex min-w-[4rem] flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-colors duration-200',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform duration-300',
                  active && 'scale-110 drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]'
                )}
              />
              <span>{t(labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
