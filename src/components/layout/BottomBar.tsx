import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, History, TrendingUp, PartyPopper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function BottomBar() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/events', icon: PartyPopper, label: t('events.navLabel') },
    { to: '/transactions', icon: ArrowLeftRight, label: t('nav.transactions') },
    { to: '/analytics', icon: TrendingUp, label: t('nav.analytics') },
    { to: '/history', icon: History, label: t('nav.history') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-w-[4rem] flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn('rounded-full p-1', isActive && 'bg-primary/15 dark:bg-primary/30')}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
