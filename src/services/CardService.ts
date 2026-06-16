import { BaseApiService } from './BaseApiService'
import { mockCardService } from './mock/MockAdapter'
import { useMock } from './api-config'
import { API_ROUTES } from './api-routes'
import type { CardDTO, CreateCardDTO } from '@/core/dtos'

class CardService extends BaseApiService {
  async listCards(userId: string): Promise<CardDTO[]> {
    if (useMock()) return mockCardService.listCards(userId)
    return this.get(API_ROUTES.cards.list)
  }

  async createCard(userId: string, dto: CreateCardDTO): Promise<CardDTO> {
    if (useMock()) return mockCardService.createCard(userId, dto)
    return this.post(API_ROUTES.cards.list, dto)
  }

  async deleteCard(id: string): Promise<void> {
    if (useMock()) return mockCardService.deleteCard(id)
    return this.delete(API_ROUTES.cards.byId(id))
  }

  async updateCard(id: string, dto: Partial<CreateCardDTO>): Promise<CardDTO> {
    if (useMock()) return mockCardService.updateCard(id, dto)
    return this.put(API_ROUTES.cards.byId(id), dto)
  }
}

export const cardService = new CardService()
