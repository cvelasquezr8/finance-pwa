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
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  status: TransactionStatus
  quincena: QuincenaType
  dueDay: number // day of month (1-31)
  month: number // 1-12
  year: number
  isRecurring: boolean
  isCC: boolean // credit card — does NOT reduce bank balance until statement payment
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
