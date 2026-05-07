import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  History,
  Wallet,
  LogOut,
  Settings,
  ChevronsUpDown,
  ShieldCheck,
  CreditCard,
  PartyPopper,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { UserProfileModal } from '@/modules/dashboard/components/UserProfileModal'
import { NotificationBell } from '@/modules/notifications/components/NotificationBell'

export function Sidebar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/events', icon: PartyPopper, label: t('events.navLabel') },
    { to: '/transactions', icon: ArrowLeftRight, label: t('nav.transactions') },
    { to: '/analytics', icon: TrendingUp, label: t('nav.analytics') },
    { to: '/history', icon: History, label: t('nav.history') },
    { to: '/cards', icon: CreditCard, label: t('cards.navLabel') },
    ...(user?.role === 'ADMIN'
      ? [{ to: '/admin/users', icon: ShieldCheck, label: t('admin.navLabel') }]
      : []),
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
    <aside className="hidden h-screen w-60 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/30">
          <Wallet className="h-4 w-4 text-primary" />
        </div>
        <span className="flex-1 font-semibold">{t('sidebar.appName')}</span>
        <NotificationBell />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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

      <div className="relative border-t border-border p-3" ref={dropdownRef}>
        {dropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 z-50 mx-3 mb-1 rounded-lg border border-border bg-card py-1 shadow-lg">
            <div className="px-3 py-2">
              <p className="truncate text-xs font-medium">{user?.firstName ?? user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
              onClick={() => {
                setDropdownOpen(false)
                setProfileOpen(true)
              }}
            >
              <Settings className="h-4 w-4" />
              {t('sidebar.accountSettings')}
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              onClick={() => {
                setDropdownOpen(false)
                logout()
              }}
            >
              <LogOut className="h-4 w-4" />
              {t('sidebar.logout')}
            </button>
          </div>
        )}

        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold text-primary dark:bg-primary/30">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium">{user?.firstName ?? user?.name}</p>
            {user?.alias && (
              <p className="truncate text-xs font-medium text-amber-500 dark:text-amber-400">
                {user.alias}
              </p>
            )}
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <ChevronsUpDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        </button>
      </div>

      <UserProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </aside>
  )
}
