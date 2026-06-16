'use client'

import { useRouter } from 'next/navigation'
import { Bell, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'

export function NotificationPanel({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications()

  const handleItemClick = (id: string, type: string, relatedId: string | null) => {
    markAsRead(id)
    if (relatedId && (type === 'event_invitation' || type === 'invitation_response')) {
      router.push(`/events/${relatedId}`)
    }
    onClose?.()
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">{t('notifications.title')}</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium">{t('notifications.empty')}</p>
        </div>
      ) : (
        <ul className="max-h-72 overflow-y-auto">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                'flex items-start gap-3 border-b border-border px-4 py-3 last:border-0',
                !n.read && 'bg-amber-50/40 dark:bg-amber-950/20'
              )}
            >
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => handleItemClick(n.id, n.type, n.relatedId)}
              >
                <p className="truncate text-sm font-medium">{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground">{n.message}</p>}
              </button>
              <button
                onClick={() => dismiss(n.id)}
                className="mt-0.5 flex-shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
