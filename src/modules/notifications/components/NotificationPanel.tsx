import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@/contexts/NotificationContext'
import { cn } from '@/lib/utils'

export function NotificationPanel({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications()

  const handleItemClick = (id: string, eventId: string) => {
    markAsRead(id)
    navigate(`/events/${eventId}`)
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
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          {t('notifications.empty')}
        </p>
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
                onClick={() => handleItemClick(n.id, n.eventId)}
              >
                <p className="truncate text-sm font-medium">
                  {t('notifications.eventInvitation', { title: n.eventTitle })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('notifications.assignedPct', { pct: n.assignedPct })}
                </p>
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
