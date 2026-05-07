import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { eventService } from '@/services/EventService'

export interface AppNotification {
  id: string
  type: 'event_invitation'
  eventId: string
  eventTitle: string
  assignedPct: number
  joinedAt: string
  read: boolean
}

interface NotificationState {
  notifications: AppNotification[]
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; notifications: AppNotification[] }
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DISMISS'; id: string }

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismiss: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS': {
      const readIds = new Set(state.notifications.filter((n) => n.read).map((n) => n.id))
      return {
        notifications: action.notifications.map((n) => ({
          ...n,
          read: readIds.has(n.id) ? true : n.read,
        })),
      }
    }
    case 'MARK_READ':
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      }
    case 'MARK_ALL_READ':
      return { notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'DISMISS':
      return { notifications: state.notifications.filter((n) => n.id !== action.id) }
    default:
      return state
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] })

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      const events = await eventService.listEvents(user.id)
      const pending: AppNotification[] = []
      for (const event of events) {
        const participant = event.participants.find(
          (p) => p.userId === user.id && p.status === 'PENDING_CONFIRMATION'
        )
        if (participant) {
          pending.push({
            id: `notif_${event.id}`,
            type: 'event_invitation',
            eventId: event.id,
            eventTitle: event.title,
            assignedPct: participant.assignedPct,
            joinedAt: participant.joinedAt,
            read: false,
          })
        }
      }
      dispatch({ type: 'SET_NOTIFICATIONS', notifications: pending })
    } catch {
      // silent
    }
  }, [user])

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('financeDataChanged', handler)
    return () => window.removeEventListener('financeDataChanged', handler)
  }, [refresh])

  const markAsRead = (id: string) => dispatch({ type: 'MARK_READ', id })
  const markAllAsRead = () => dispatch({ type: 'MARK_ALL_READ' })
  const dismiss = (id: string) => dispatch({ type: 'DISMISS', id })

  const unreadCount = state.notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismiss,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
