import { BaseApiService } from './BaseApiService'
import { mockEventService } from './mock/MockAdapter'
import type {
  BudgetEventDTO,
  CreateEventDTO,
  InviteParticipantDTO,
  RespondInvitationDTO,
  AddShoppingItemDTO,
  ToggleShoppingItemDTO,
} from '@/core/dtos'
import type { TransactionResponseDTO } from '@/core/dtos'

const USE_MOCK = true

class EventService extends BaseApiService {
  async listEvents(userId: string): Promise<BudgetEventDTO[]> {
    if (USE_MOCK) return mockEventService.listEvents(userId)
    return this.get<BudgetEventDTO[]>(`/events?userId=${userId}`)
  }

  async getEvent(id: string): Promise<BudgetEventDTO> {
    if (USE_MOCK) return mockEventService.getEvent(id)
    return this.get<BudgetEventDTO>(`/events/${id}`)
  }

  async createEvent(dto: CreateEventDTO, creatorUserId: string): Promise<BudgetEventDTO> {
    if (USE_MOCK) return mockEventService.createEvent(dto, creatorUserId)
    return this.post<BudgetEventDTO, CreateEventDTO>('/events', dto)
  }

  async inviteParticipant(dto: InviteParticipantDTO): Promise<BudgetEventDTO> {
    if (USE_MOCK) return mockEventService.inviteParticipant(dto)
    return this.post<BudgetEventDTO, InviteParticipantDTO>(`/events/${dto.eventId}/invite`, dto)
  }

  async respondInvitation(dto: RespondInvitationDTO, userId: string): Promise<BudgetEventDTO> {
    if (USE_MOCK) return mockEventService.respondInvitation(dto, userId)
    return this.post<BudgetEventDTO, RespondInvitationDTO>(`/events/${dto.eventId}/respond`, dto)
  }

  async addShoppingItem(dto: AddShoppingItemDTO): Promise<BudgetEventDTO> {
    if (USE_MOCK) return mockEventService.addShoppingItem(dto)
    return this.post<BudgetEventDTO, AddShoppingItemDTO>(`/events/${dto.eventId}/items`, dto)
  }

  async toggleShoppingItem(dto: ToggleShoppingItemDTO, userId: string): Promise<BudgetEventDTO> {
    if (USE_MOCK) return mockEventService.toggleShoppingItem(dto, userId)
    return this.patch<BudgetEventDTO, ToggleShoppingItemDTO>(
      `/events/${dto.eventId}/items/${dto.itemId}`,
      dto
    )
  }

  async cancelEvent(id: string): Promise<void> {
    if (USE_MOCK) return mockEventService.cancelEvent(id)
    return this.post<void, object>(`/events/${id}/cancel`, {})
  }

  async getLinkedTransactions(eventId: string): Promise<TransactionResponseDTO[]> {
    if (USE_MOCK) return mockEventService.getLinkedTransactions(eventId)
    return this.get<TransactionResponseDTO[]>(`/events/${eventId}/transactions`)
  }
}

export const eventService = new EventService()
