import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, TrendingUp, History, Wallet, LogOut, Settings, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { UserProfileModal } from '@/modules/dashboard/components/UserProfileModal'

export function Sidebar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/transactions', icon: ArrowLeftRight, label: t('nav.transactions') },
    { to: '/history', icon: History, label: t('nav.history') },
    { to: '/analytics', icon: TrendingUp, label: t('nav.analytics') },
  ]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user
    ? `${(user.firstName ?? user.name)[0]}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <aside className="hidden lg:flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/30">
          <Wallet className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold">{t('sidebar.appName')}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3 relative" ref={dropdownRef}>
        {dropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 mx-3 mb-1 z-50 rounded-lg border border-border bg-card shadow-lg py-1">
            <div className="px-3 py-2">
              <p className="text-xs font-medium truncate">{user?.firstName ?? user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <div className="h-px bg-border my-1" />
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
              onClick={() => { setDropdownOpen(false); setProfileOpen(true) }}
            >
              <Settings className="h-4 w-4" />
              {t('sidebar.accountSettings')}
            </button>
            <div className="h-px bg-border my-1" />
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => { setDropdownOpen(false); logout() }}
            >
              <LogOut className="h-4 w-4" />
              {t('sidebar.logout')}
            </button>
          </div>
        )}

        <button
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 dark:bg-primary/30 text-sm font-semibold text-primary flex-shrink-0 overflow-hidden">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              : initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName ?? user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </button>
      </div>

      <UserProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </aside>
  )
}
