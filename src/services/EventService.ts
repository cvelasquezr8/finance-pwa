import { BaseApiService } from './BaseApiService'
import { mockEventService } from './mock/MockAdapter'
import { useMock } from './api-config'
import { API_ROUTES } from './api-routes'
import type {
  BudgetEventDTO,
  CreateEventDTO,
  InviteParticipantDTO,
  RespondInvitationDTO,
  AddShoppingItemDTO,
  ToggleShoppingItemDTO,
} from '@/core/dtos'
import type { TransactionResponseDTO } from '@/core/dtos'

class EventService extends BaseApiService {
  async listEvents(userId: string): Promise<BudgetEventDTO[]> {
    if (useMock()) return mockEventService.listEvents(userId)
    return this.get<BudgetEventDTO[]>(API_ROUTES.events.list, { params: { userId } })
  }

  async getEvent(id: string): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.getEvent(id)
    return this.get<BudgetEventDTO>(API_ROUTES.events.byId(id))
  }

  async createEvent(dto: CreateEventDTO, creatorUserId: string): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.createEvent(dto, creatorUserId)
    return this.post<BudgetEventDTO, CreateEventDTO>(API_ROUTES.events.list, dto)
  }

  async inviteParticipant(dto: InviteParticipantDTO): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.inviteParticipant(dto)
    return this.post<BudgetEventDTO, InviteParticipantDTO>(
      API_ROUTES.events.invite(dto.eventId),
      dto
    )
  }

  async respondInvitation(dto: RespondInvitationDTO, userId: string): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.respondInvitation(dto, userId)
    return this.post<BudgetEventDTO, RespondInvitationDTO>(
      API_ROUTES.events.respond(dto.eventId),
      dto
    )
  }

  async addShoppingItem(dto: AddShoppingItemDTO): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.addShoppingItem(dto)
    return this.post<BudgetEventDTO, AddShoppingItemDTO>(API_ROUTES.events.items(dto.eventId), dto)
  }

  async toggleShoppingItem(dto: ToggleShoppingItemDTO, userId: string): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.toggleShoppingItem(dto, userId)
    return this.patch<BudgetEventDTO, ToggleShoppingItemDTO>(
      API_ROUTES.events.item(dto.eventId, dto.itemId),
      dto
    )
  }

  async cancelEvent(id: string): Promise<void> {
    if (useMock()) return mockEventService.cancelEvent(id)
    return this.post<void, object>(API_ROUTES.events.cancel(id), {})
  }

  async getLinkedTransactions(eventId: string): Promise<TransactionResponseDTO[]> {
    if (useMock()) return mockEventService.getLinkedTransactions(eventId)
    return this.get<TransactionResponseDTO[]>(API_ROUTES.events.transactions(eventId))
  }
}

export const eventService = new EventService()
