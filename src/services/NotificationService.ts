import { BaseApiService } from './BaseApiService'
import { eventService } from './EventService'
import { useMock } from './api-config'
import { API_ROUTES } from './api-routes'
import type { NotificationDTO, NotificationType } from '@/core/dtos'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string | null
  relatedId: string | null
  read: boolean
  createdAt: string
}

interface NotificationListResult {
  notifications: AppNotification[]
  unreadCount: number
}

function mapDto(dto: NotificationDTO): AppNotification {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    relatedId: dto.relatedId,
    read: dto.read,
    createdAt: dto.createdAt,
  }
}

class NotificationService extends BaseApiService {
  async list(userId: string): Promise<NotificationListResult> {
    if (useMock()) return this.deriveFromEvents(userId)
    const res = await this.get<{ data: NotificationDTO[]; unreadCount: number }>(
      API_ROUTES.notifications.list
    )
    return { notifications: res.data.map(mapDto), unreadCount: res.unreadCount }
  }

  async markRead(id: string): Promise<void> {
    if (useMock()) return
    await this.patch(API_ROUTES.notifications.read(id), {})
  }

  async markAllRead(): Promise<void> {
    if (useMock()) return
    await this.patch(API_ROUTES.notifications.readAll, {})
  }

  async dismiss(id: string): Promise<void> {
    if (useMock()) return
    await this.delete(API_ROUTES.notifications.byId(id))
  }

  /** Mock fallback: derive pending event invitations into notifications. */
  private async deriveFromEvents(userId: string): Promise<NotificationListResult> {
    const events = await eventService.listEvents(userId)
    const notifications: AppNotification[] = []
    for (const event of events) {
      const participant = event.participants.find(
        (p) => p.userId === userId && p.status === 'PENDING_CONFIRMATION'
      )
      if (participant) {
        notifications.push({
          id: `notif_${event.id}`,
          type: 'event_invitation',
          title: event.title,
          message: `${participant.assignedPct}%`,
          relatedId: event.id,
          read: false,
          createdAt: participant.joinedAt,
        })
      }
    }
    return { notifications, unreadCount: notifications.length }
  }
}

export const notificationService = new NotificationService()
