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
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '@/core/dtos'
import type { TransactionResponseDTO } from '@/core/dtos'

class EventService extends BaseApiService {
  async listEvents(userId: string): Promise<BudgetEventDTO[]> {
    if (useMock()) return mockEventService.listEvents(userId)
    return this.get<BudgetEventDTO[]>(API_ROUTES.events.list)
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
    return this.post<BudgetEventDTO, { alias: string; assignedPct: number }>(
      API_ROUTES.events.invite(dto.eventId),
      { alias: dto.alias, assignedPct: dto.assignedPct }
    )
  }

  async respondInvitation(dto: RespondInvitationDTO, userId: string): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.respondInvitation(dto, userId)
    return this.post<BudgetEventDTO, { status: string }>(API_ROUTES.events.respond(dto.eventId), {
      status: dto.status,
    })
  }

  async addShoppingItem(dto: AddShoppingItemDTO): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.addShoppingItem(dto)
    return this.post<BudgetEventDTO, { name: string; estimatedCost?: number; assignedTo?: string }>(
      API_ROUTES.events.items(dto.eventId),
      { name: dto.name, estimatedCost: dto.estimatedCost, assignedTo: dto.assignedTo }
    )
  }

  async toggleShoppingItem(dto: ToggleShoppingItemDTO, userId: string): Promise<BudgetEventDTO> {
    if (useMock()) return mockEventService.toggleShoppingItem(dto, userId)
    return this.patch<BudgetEventDTO, { bought: boolean }>(
      API_ROUTES.events.item(dto.eventId, dto.itemId),
      { bought: dto.bought }
    )
  }

  async cancelEvent(id: string): Promise<void> {
    if (useMock()) return mockEventService.cancelEvent(id)
    return this.post<void, object>(API_ROUTES.events.cancel(id), {})
  }

  async closeEvent(id: string): Promise<BudgetEventDTO> {
    return this.patch<BudgetEventDTO, object>(API_ROUTES.events.close(id), {})
  }

  async reopenEvent(id: string): Promise<BudgetEventDTO> {
    return this.patch<BudgetEventDTO, object>(API_ROUTES.events.reopen(id), {})
  }

  async getLinkedTransactions(
    eventId: string,
    query: PaginationQueryDTO = {}
  ): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    if (useMock()) return mockEventService.getLinkedTransactions(eventId, query)
    return this.get<PaginatedResponseDTO<TransactionResponseDTO>>(
      API_ROUTES.events.transactions(eventId),
      { params: query }
    )
  }
}

export const eventService = new EventService()
