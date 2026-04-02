import type { TransactionCategory, TransactionType, QuincenaType, TransactionStatus } from '@/core/types'

// --- Auth DTOs ---

export interface LoginRequestDTO {
  email: string
  password: string
}

export interface RegisterRequestDTO {
  firstName: string
  lastName: string
  middleName?: string
  secondLastName?: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponseDTO {
  token: string
  refreshToken: string
  expiresIn: number
  user: {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    middleName?: string
    secondLastName?: string
    phone?: string
    currency: string
    timezone: string
    monthlyNotifications: boolean
    createdAt: string
  }
}

// --- Transaction DTOs ---

export interface CreateTransactionDTO {
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  quincena: QuincenaType
  dueDay: number
  month: number
  year: number
  isRecurring: boolean
  isCC: boolean
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {
  status?: TransactionStatus
}

export interface TransactionResponseDTO {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  status: TransactionStatus
  quincena: QuincenaType
  dueDay: number
  month: number
  year: number
  isRecurring: boolean
  isCC: boolean
  receiptUrl: string | null
  confirmedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ConfirmTransactionDTO {
  transactionId: string
  confirmed: boolean
}

// --- Balance DTOs ---

export interface BalanceSummaryDTO {
  currentBalance: number
  initialBalance: number
  projectedBalance: number
  dailyAllowance: number
  totalDebt: number
  totalPendingScheduled: number
  totalConfirmedScheduled: number
  totalDailyExpenses: number
  expectedIncome: number
  remainingDays: number
  month: number
  year: number
  quincena: QuincenaType
}

export interface AdjustBalanceDTO {
  newBalance: number
  reason: string
  adjustmentDate: string
}

export interface PaginatedResponseDTO<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiErrorDTO {
  code: string
  message: string
  details?: Record<string, string[]>
}
