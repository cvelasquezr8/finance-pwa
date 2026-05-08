import { BaseApiService } from './BaseApiService'
import { mockTransactionService, mockBalanceService } from './mock/MockAdapter'
import { useMock } from './api-config'
import { API_ROUTES } from './api-routes'
import type {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionResponseDTO,
  ConfirmTransactionDTO,
  BalanceSummaryDTO,
  AdjustBalanceDTO,
  PaginatedResponseDTO,
  MonthlyTrendDTO,
} from '@/core/dtos'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import { generateKey } from '@/lib/idempotency'

class TransactionService extends BaseApiService {
  async list(
    filter: MonthFilter & { quincena?: QuincenaFilter }
  ): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    if (useMock()) return mockTransactionService.list(filter)
    return this.get(API_ROUTES.transactions.list, { params: filter })
  }

  async create(dto: CreateTransactionDTO): Promise<TransactionResponseDTO> {
    const key = generateKey()
    if (useMock()) return mockTransactionService.create({ ...dto, idempotencyKey: key })
    return this.post(
      API_ROUTES.transactions.create,
      {
        ...dto,
        status: dto.type === 'daily' ? 'confirmed' : 'pending',
      },
      { headers: { 'x-idempotency-key': key } }
    )
  }

  async confirm(dto: ConfirmTransactionDTO): Promise<TransactionResponseDTO> {
    if (useMock()) return mockTransactionService.confirm(dto)
    return this.patch(API_ROUTES.transactions.confirm(dto.transactionId), dto)
  }

  async remove(id: string): Promise<void> {
    if (useMock()) return mockTransactionService.remove(id)
    return this.delete(API_ROUTES.transactions.byId(id))
  }

  async listHistory(filters: {
    year: number
    type?: 'scheduled' | 'daily' | 'income' | 'all'
    category?: string
  }): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    if (useMock()) return mockTransactionService.listHistory(filters)
    return this.get(API_ROUTES.transactions.history, { params: filters })
  }

  async update(id: string, dto: UpdateTransactionDTO): Promise<TransactionResponseDTO> {
    const key = generateKey()
    if (useMock()) return mockTransactionService.update(id, { ...dto, idempotencyKey: key })
    return this.put(API_ROUTES.transactions.byId(id), dto, {
      headers: { 'x-idempotency-key': key },
    })
  }

  async uploadReceipt(id: string, file: File): Promise<TransactionResponseDTO> {
    if (useMock()) return mockTransactionService.uploadReceipt(id, file)
    const form = new FormData()
    form.append('receipt', file)
    return this.post(API_ROUTES.transactions.receipt(id), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}

class BalanceService extends BaseApiService {
  async getSummary(
    filter: MonthFilter & { quincena?: QuincenaFilter }
  ): Promise<BalanceSummaryDTO> {
    if (useMock()) return mockBalanceService.getSummary(filter)
    return this.get(API_ROUTES.balance.summary, { params: filter })
  }

  async adjust(dto: AdjustBalanceDTO): Promise<BalanceSummaryDTO> {
    if (useMock()) return mockBalanceService.adjust(dto)
    return this.post(API_ROUTES.balance.adjust, dto)
  }

  async addIncome(dto: { description: string; amount: number }): Promise<BalanceSummaryDTO> {
    if (useMock()) return mockBalanceService.addIncome(dto)
    return this.post(API_ROUTES.balance.income, dto)
  }

  async getMonthlyTrend(months = 6): Promise<MonthlyTrendDTO[]> {
    if (useMock()) return mockBalanceService.getMonthlyTrend(months)
    return this.get(API_ROUTES.balance.trend, { params: { months } })
  }
}

export const transactionService = new TransactionService()
export const balanceService = new BalanceService()
