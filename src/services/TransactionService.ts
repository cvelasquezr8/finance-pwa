import { BaseApiService } from './BaseApiService'
import { mockTransactionService, mockBalanceService } from './mock/MockAdapter'
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionResponseDTO,
  ConfirmTransactionDTO,
  BalanceSummaryDTO,
  AdjustBalanceDTO,
  PaginatedResponseDTO,
} from '@/core/dtos'
import type { MonthFilter, QuincenaFilter } from '@/core/types'

const USE_MOCK = true

class TransactionService extends BaseApiService {
  async list(
    filter: MonthFilter & { quincena?: QuincenaFilter }
  ): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    if (USE_MOCK) return mockTransactionService.list(filter)
    // GET /api/v1/transactions?month=&year=&quincena=
    return this.get('/transactions', { params: filter })
  }

  async create(dto: CreateTransactionDTO): Promise<TransactionResponseDTO> {
    if (USE_MOCK) return mockTransactionService.create(dto)
    // POST /api/v1/transactions
    // Daily expenses are auto-confirmed (already spent); scheduled start as pending
    return this.post('/transactions', {
      ...dto,
      status: dto.type === 'daily' ? 'confirmed' : 'pending',
    })
  }

  async confirm(dto: ConfirmTransactionDTO): Promise<TransactionResponseDTO> {
    if (USE_MOCK) return mockTransactionService.confirm(dto)
    // PATCH /api/v1/transactions/:id/confirm
    return this.patch(`/transactions/${dto.transactionId}/confirm`, dto)
  }

  async remove(id: string): Promise<void> {
    if (USE_MOCK) return mockTransactionService.remove(id)
    // DELETE /api/v1/transactions/:id
    return this.delete(`/transactions/${id}`)
  }

  async listHistory(filters: {
    year: number
    type?: 'scheduled' | 'daily' | 'income' | 'all'
    category?: string
  }): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    if (USE_MOCK) return mockTransactionService.listHistory(filters)
    // GET /api/v1/transactions/history?year=&type=&category=
    return this.get('/transactions/history', { params: filters })
  }

  async update(id: string, dto: UpdateTransactionDTO): Promise<TransactionResponseDTO> {
    if (USE_MOCK) return mockTransactionService.update(id, dto)
    // PUT /api/v1/transactions/:id
    return this.put(`/transactions/${id}`, dto)
  }

  async uploadReceipt(id: string, file: File): Promise<TransactionResponseDTO> {
    if (USE_MOCK) return mockTransactionService.uploadReceipt(id, file)
    // POST /api/v1/transactions/:id/receipt  (multipart/form-data)
    const form = new FormData()
    form.append('receipt', file)
    return this.post(`/transactions/${id}/receipt`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}

class BalanceService extends BaseApiService {
  async getSummary(
    filter: MonthFilter & { quincena?: QuincenaFilter }
  ): Promise<BalanceSummaryDTO> {
    if (USE_MOCK) return mockBalanceService.getSummary(filter)
    // GET /api/v1/balance?month=&year=&quincena=
    return this.get('/balance', { params: filter })
  }

  async adjust(dto: AdjustBalanceDTO): Promise<BalanceSummaryDTO> {
    if (USE_MOCK) return mockBalanceService.adjust(dto)
    // POST /api/v1/balance/adjust
    return this.post('/balance/adjust', dto)
  }

  async addIncome(dto: { description: string; amount: number }): Promise<BalanceSummaryDTO> {
    if (USE_MOCK) return mockBalanceService.addIncome(dto)
    // POST /api/v1/balance/income
    return this.post('/balance/income', dto)
  }
}

export const transactionService = new TransactionService()
export const balanceService = new BalanceService()
