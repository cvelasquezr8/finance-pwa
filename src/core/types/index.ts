export type QuincenaType = 'primera' | 'segunda'
export type QuincenaFilter = QuincenaType | 'mensual'

export type TransactionCategory =
  | 'vivienda'
  | 'servicios'
  | 'alimentacion'
  | 'transporte'
  | 'salud'
  | 'entretenimiento'
  | 'educacion'
  | 'deuda'
  | 'otros'

export type TransactionType = 'scheduled' | 'daily' | 'income' | 'adjustment'

export type TransactionStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Transaction {
  id: string
  numericId: number
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  status: TransactionStatus
  quincena: QuincenaType
  dueDay: number // Day of month (1-31)
  month: number // 1-12
  year: number
  isRecurring: boolean
  isCC: boolean // Credit card — does not affect bank balance
  confirmedAt?: string // ISO date
  createdAt: string
  updatedAt: string
}

export interface BalanceSummary {
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

export interface MonthFilter {
  month: number
  year: number
}

export type UserRole = 'ADMIN' | 'USER'
export type UserStatus = 'active' | 'blocked' | 'deleted'

export type CardType = 'CREDIT' | 'DEBIT'

export interface Card {
  id: string
  userId: string
  name: string
  lastFour: string
  type: CardType
  createdAt: string
}

export interface User {
  id: string
  numericId: number
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
  avatarUrl?: string
  language?: 'es' | 'en'
  theme?: 'dark' | 'light'
  role: UserRole
  status: UserStatus
  alias: string
  mustChangePassword?: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── Events ───────────────────────────────────────────────────────────────────

export type EventStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type ParticipantStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'DECLINED'

export interface EventParticipant {
  userId: string
  alias: string
  assignedPct: number
  status: ParticipantStatus
  joinedAt: string
  respondedAt?: string
}

export interface ShoppingItem {
  id: string
  name: string
  estimatedCost?: number
  bought: boolean
  assignedTo?: string
  boughtBy?: string
  boughtAt?: string
}

export interface BudgetEvent {
  id: string
  title: string
  description?: string
  goalAmount: number
  deadline?: string
  createdBy: string
  status: EventStatus
  participants: EventParticipant[]
  shoppingItems: ShoppingItem[]
  createdAt: string
  updatedAt: string
}
