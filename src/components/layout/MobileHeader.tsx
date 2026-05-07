import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Settings, LogOut, ShieldCheck, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserProfileModal } from '@/modules/dashboard/components/UserProfileModal'
import { NotificationBell } from '@/modules/notifications/components/NotificationBell'

export function MobileHeader() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const initials = user
    ? `${(user.firstName ?? user.name)[0]}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <>
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        {/* Logo — mirrors Sidebar branding */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 dark:bg-primary/30">
            <Wallet className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">{t('sidebar.appName')}</span>
        </div>

        {/* Notification bell */}
        <NotificationBell />

        {/* User avatar — opens DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={t('sidebar.accountSettings')}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full',
                'bg-primary/15 dark:bg-primary/30',
                'text-sm font-semibold text-primary',
                'overflow-hidden ring-2 ring-transparent',
                'transition-all hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-primary/40'
              )}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium">{user?.firstName ?? user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              {t('sidebar.accountSettings')}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/cards')}>
              <CreditCard className="mr-2 h-4 w-4" />
              {t('cards.navLabel')}
            </DropdownMenuItem>

            {user?.role === 'ADMIN' && (
              <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t('admin.navLabel')}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('sidebar.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <UserProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
