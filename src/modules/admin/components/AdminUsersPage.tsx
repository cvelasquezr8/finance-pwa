import { useEffect } from 'react'
import { Shield, MoreHorizontal, MoreVertical, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AdminUserDTO } from '@/core/dtos'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const STATUS_STYLES: Record<AdminUserDTO['status'], string> = {
  active: 'bg-success/15 text-success',
  blocked: 'bg-warning/15 text-warning',
  deleted: 'bg-destructive/15 text-destructive',
}

const ROLE_STYLES: Record<AdminUserDTO['role'], string> = {
  ADMIN: 'bg-primary/15 text-primary',
  USER: 'bg-muted text-muted-foreground',
}

type ActionProps = {
  user: AdminUserDTO
  onToggleRole: () => void
  onBlock: () => void
  onDelete: () => void
  onRestore: () => void
}

// ─── Actions dropdown (shared between table row and mobile card) ──────────────

function ActionsMenu({
  user,
  onToggleRole,
  onBlock,
  onDelete,
  onRestore,
  icon: Icon,
}: ActionProps & { icon: typeof MoreHorizontal }) {
  const { t } = useTranslation()
  const isDeleted = user.status === 'deleted'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <Icon className="h-4 w-4" />
          <span className="sr-only">{t('admin.columns.actions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onToggleRole}>
          <Shield className="mr-2 h-4 w-4" />
          {user.role === 'ADMIN' ? t('admin.actions.removeAdmin') : t('admin.actions.makeAdmin')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.status !== 'active' ? (
          <DropdownMenuItem onClick={onRestore}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('admin.actions.restore')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-warning focus:bg-warning/10 focus:text-warning"
            onClick={onBlock}
          >
            {t('admin.actions.block')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={onDelete}
          disabled={isDeleted}
        >
          {t('admin.actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function UserCard({ user, onToggleRole, onBlock, onDelete, onRestore }: ActionProps) {
  const { t } = useTranslation()
  const isDeleted = user.status === 'deleted'

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary dark:bg-primary/30">
        {user.firstName[0]}
        {user.lastName[0]}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-semibold',
            isDeleted && 'text-muted-foreground line-through'
          )}
        >
          {user.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          {user.alias}
        </span>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              ROLE_STYLES[user.role]
            )}
          >
            {user.role === 'ADMIN' && <Shield className="h-2.5 w-2.5" />}
            {user.role}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              STATUS_STYLES[user.status]
            )}
          >
            {t(`admin.status.${user.status}`)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Three-dot menu */}
      <ActionsMenu
        user={user}
        icon={MoreVertical}
        onToggleRole={onToggleRole}
        onBlock={onBlock}
        onDelete={onDelete}
        onRestore={onRestore}
      />
    </div>
  )
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function UserRow({ user, onToggleRole, onBlock, onDelete, onRestore }: ActionProps) {
  const { t } = useTranslation()
  const isDeleted = user.status === 'deleted'

  return (
    <tr className="border-b border-border transition-colors hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary dark:bg-primary/30">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                'truncate text-sm font-medium',
                isDeleted && 'text-muted-foreground line-through'
              )}
            >
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          {user.alias}
        </span>
      </td>

      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            ROLE_STYLES[user.role]
          )}
        >
          {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
          {user.role}
        </span>
      </td>

      <td className="px-4 py-3">
        <span
          className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[user.status])}
        >
          {t(`admin.status.${user.status}`)}
        </span>
      </td>

      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </td>

      <td className="px-4 py-3">
        <ActionsMenu
          user={user}
          icon={MoreHorizontal}
          onToggleRole={onToggleRole}
          onBlock={onBlock}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const { t } = useTranslation()
  const { users, isLoading, error, fetchUsers, toggleRole, blockUser, deleteUser, restoreUser } =
    useAdminUsers()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const actionProps = (user: AdminUserDTO): ActionProps => ({
    user,
    onToggleRole: () => toggleRole(user),
    onBlock: () => blockUser(user.id),
    onDelete: () => deleteUser(user.id),
    onRestore: () => restoreUser(user.id),
  })

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('admin.title')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('admin.subtitle')}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          <span className="hidden sm:inline">{t('admin.refresh')}</span>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t('admin.totalUsers'), value: users.length },
          { label: t('admin.admins'), value: users.filter((u) => u.role === 'ADMIN').length },
          { label: t('admin.active'), value: users.filter((u) => u.status === 'active').length },
          { label: t('admin.blocked'), value: users.filter((u) => u.status === 'blocked').length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card py-12 text-sm text-muted-foreground">
          {t('admin.loading')}
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card py-12 text-sm text-muted-foreground">
          {t('admin.empty')}
        </div>
      ) : (
        <>
          {/* Mobile: card list (< md) */}
          <div className="flex flex-col gap-3 md:hidden">
            {users.map((user) => (
              <UserCard key={user.id} {...actionProps(user)} />
            ))}
          </div>

          {/* Desktop: table (md+) */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {t('admin.columns.user')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {t('admin.columns.alias')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {t('admin.columns.role')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {t('admin.columns.status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {t('admin.columns.registered')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {t('admin.columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <UserRow key={user.id} {...actionProps(user)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
