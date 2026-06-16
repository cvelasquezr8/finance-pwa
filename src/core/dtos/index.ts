import type {
  TransactionCategory,
  TransactionType,
  QuincenaType,
  TransactionStatus,
  UserRole,
  UserStatus,
  CardType,
  EventStatus,
  ParticipantStatus,
  EventParticipant,
  ShoppingItem,
} from '@/core/types'

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
  alias: string
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
    role: UserRole
    status: UserStatus
    alias: string
    mustChangePassword?: boolean
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
  cardId?: string | null
  eventId?: string | null
  userId?: string | null
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
  cardId: string | null
  eventId: string | null
  userId: string | null
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

export interface PaginationQueryDTO {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface ApiErrorDTO {
  code: string
  message: string
  details?: Record<string, string[]>
}

// --- Card DTOs ---

export interface CardDTO {
  id: string
  userId: string
  name: string
  lastFour: string
  type: CardType
  /** Expiry date as entered by the user (e.g. "12/25"). Slash must be preserved as-is. */
  expiryDate?: string
  createdAt: string
}

export interface CreateCardDTO {
  name: string
  lastFour: string
  type: CardType
}

// --- Admin DTOs ---

export interface AdminUserDTO {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  alias: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface UpdateUserRoleDTO {
  userId: string
  role: UserRole
}

export interface UpdateUserStatusDTO {
  userId: string
  status: UserStatus
}

export interface InviteUserDTO {
  email: string
  firstName: string
  lastName: string
  alias: string
  role?: UserRole
}

// --- Notification DTOs ---

export type NotificationType =
  | 'event_invitation'
  | 'invitation_response'
  | 'account_invited'
  | 'account_blocked'
  | 'monthly_summary'

export interface NotificationDTO {
  id: string
  type: NotificationType
  title: string
  message: string | null
  relatedId: string | null
  read: boolean
  createdAt: string
}

export interface NotificationListDTO {
  data: NotificationDTO[]
  unreadCount: number
}

// --- Event DTOs ---

export interface BudgetEventDTO {
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

export interface CreateEventDTO {
  title: string
  description?: string
  goalAmount: number
  deadline?: string
}

export interface InviteParticipantDTO {
  eventId: string
  alias: string
  assignedPct: number
}

export interface RespondInvitationDTO {
  eventId: string
  status: 'CONFIRMED' | 'DECLINED'
}

export interface AddShoppingItemDTO {
  eventId: string
  name: string
  estimatedCost?: number
  assignedTo?: string
}

export interface ToggleShoppingItemDTO {
  eventId: string
  itemId: string
  bought: boolean
}

// --- Chart DTOs ---

export interface MonthlyTrendDTO {
  month: number
  year: number
  monthLabel: string
  income: number
  expenses: number
}

// re-export event types for convenience
export type { EventStatus, ParticipantStatus }
