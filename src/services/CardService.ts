import { BaseApiService } from './BaseApiService'
import { mockCardService } from './mock/MockAdapter'
import type { CardDTO, CreateCardDTO } from '@/core/dtos'

const USE_MOCK = true

class CardService extends BaseApiService {
  async listCards(userId: string): Promise<CardDTO[]> {
    if (USE_MOCK) return mockCardService.listCards(userId)
    return this.get(`/cards?userId=${userId}`)
  }

  async createCard(userId: string, dto: CreateCardDTO): Promise<CardDTO> {
    if (USE_MOCK) return mockCardService.createCard(userId, dto)
    return this.post('/cards', { ...dto, userId })
  }

  async deleteCard(id: string): Promise<void> {
    if (USE_MOCK) return mockCardService.deleteCard(id)
    return this.delete(`/cards/${id}`)
  }

  async updateCard(id: string, dto: Partial<CreateCardDTO>): Promise<CardDTO> {
    if (USE_MOCK) return mockCardService.updateCard(id, dto)
    return this.put(`/cards/${id}`, dto)
  }
}

export const cardService = new CardService()
