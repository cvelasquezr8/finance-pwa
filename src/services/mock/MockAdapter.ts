import type {
  AuthResponseDTO,
  TransactionResponseDTO,
  BalanceSummaryDTO,
  AdjustBalanceDTO,
  PaginatedResponseDTO,
  CreateTransactionDTO,
  ConfirmTransactionDTO,
} from '@/core/dtos'
import type { MonthFilter, QuincenaFilter, QuincenaType } from '@/core/types'
import { getDaysInMonth } from 'date-fns'

const delay = (ms = 800) => new Promise<void>((r) => setTimeout(r, ms))

let mockBalance = 15_420.50
let mockTransactions: TransactionResponseDTO[] = buildSeedTransactions()

function buildHistoricalTransactions(): TransactionResponseDTO[] {
  const now = new Date()
  const results: TransactionResponseDTO[] = []

  const scheduledTemplates = [
    { description: 'Renta', amount: 6_500, dueDay: 1, quincena: 'primera' as QuincenaType, category: 'vivienda' },
    { description: 'Luz CFE', amount: 850, dueDay: 5, quincena: 'primera' as QuincenaType, category: 'servicios' },
    { description: 'Internet Telmex', amount: 480, dueDay: 8, quincena: 'primera' as QuincenaType, category: 'servicios' },
    { description: 'Seguro Gastos Médicos', amount: 1_200, dueDay: 10, quincena: 'primera' as QuincenaType, category: 'salud' },
    { description: 'Colegio', amount: 3_200, dueDay: 12, quincena: 'primera' as QuincenaType, category: 'educacion' },
    { description: 'Tarjeta BBVA', amount: 2_400, dueDay: 17, quincena: 'segunda' as QuincenaType, category: 'deuda' },
    { description: 'Tarjeta Banamex', amount: 1_800, dueDay: 20, quincena: 'segunda' as QuincenaType, category: 'deuda' },
    { description: 'Gas', amount: 350, dueDay: 22, quincena: 'segunda' as QuincenaType, category: 'servicios' },
    { description: 'Netflix + Spotify', amount: 290, dueDay: 25, quincena: 'segunda' as QuincenaType, category: 'entretenimiento' },
  ]

  const dailyTemplates = [
    { description: 'Comida oficina', amount: 120, category: 'alimentacion', dueDay: 3 },
    { description: 'Uber', amount: 85, category: 'transporte', dueDay: 5 },
    { description: 'Farmacia', amount: 230, category: 'salud', dueDay: 8 },
    { description: 'Supermercado', amount: 650, category: 'alimentacion', dueDay: 10 },
    { description: 'Gasolina', amount: 700, category: 'transporte', dueDay: 14 },
    { description: 'Cine', amount: 180, category: 'entretenimiento', dueDay: 20 },
  ]

  for (let offset = 1; offset <= 5; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const pastIso = d.toISOString()

    scheduledTemplates.forEach((tpl) => {
      results.push({
        id: uuid(),
        description: tpl.description,
        amount: tpl.amount,
        type: 'scheduled',
        category: tpl.category as TransactionResponseDTO['category'],
        status: 'confirmed',
        quincena: tpl.quincena,
        dueDay: tpl.dueDay,
        month: m,
        year: y,
        isRecurring: true,
        isCC: false,
        receiptUrl: null,
        confirmedAt: pastIso,
        createdAt: pastIso,
        updatedAt: pastIso,
      })
    })

    dailyTemplates.forEach((tpl) => {
      const q: QuincenaType = tpl.dueDay <= 15 ? 'primera' : 'segunda'
      results.push({
        id: uuid(),
        description: tpl.description,
        amount: tpl.amount + Math.floor(Math.random() * 50),
        type: 'daily',
        category: tpl.category as TransactionResponseDTO['category'],
        status: 'confirmed',
        quincena: q,
        dueDay: tpl.dueDay,
        month: m,
        year: y,
        isRecurring: false,
        isCC: false,
        receiptUrl: null,
        confirmedAt: pastIso,
        createdAt: pastIso,
        updatedAt: pastIso,
      })
    })
  }

  return results
}

// Seed historical data once on load
mockTransactions = [...mockTransactions, ...buildHistoricalTransactions()]

// In-memory receipt store: transactionId → data URL
const receiptStore = new Map<string, string>()

function uuid() {
  return Math.random().toString(36).slice(2, 11)
}

function iso() {
  return new Date().toISOString()
}

function buildSeedTransactions(): TransactionResponseDTO[] {
  const now = new Date()
  const m = now.getMonth() + 1
  const y = now.getFullYear()

  const base = (
    description: string,
    amount: number,
    dueDay: number,
    quincena: QuincenaType,
    isRecurring = true,
    status: TransactionResponseDTO['status'] = 'pending'
  ): TransactionResponseDTO => ({
    id: uuid(),
    description,
    amount,
    type: 'scheduled',
    category: 'vivienda',
    status,
    quincena,
    dueDay,
    month: m,
    year: y,
    isRecurring,
    isCC: false,
    receiptUrl: null,
    confirmedAt: status === 'confirmed' ? iso() : null,
    createdAt: iso(),
    updatedAt: iso(),
  })

  return [
    { ...base('Renta', 6_500, 1, 'primera', true, 'confirmed'), category: 'vivienda' },
    { ...base('Luz CFE', 850, 5, 'primera'), category: 'servicios' },
    { ...base('Internet Telmex', 480, 8, 'primera'), category: 'servicios' },
    { ...base('Seguro Gastos Médicos', 1_200, 10, 'primera'), category: 'salud' },
    { ...base('Colegio', 3_200, 12, 'primera'), category: 'educacion' },
    { ...base('Tarjeta BBVA', 2_400, 17, 'segunda', true, 'confirmed'), category: 'deuda' },
    { ...base('Tarjeta Banamex', 1_800, 20, 'segunda'), category: 'deuda' },
    { ...base('Gas', 350, 22, 'segunda'), category: 'servicios' },
    { ...base('Netflix + Spotify', 290, 25, 'segunda'), category: 'entretenimiento' },
    // Daily expenses
    {
      id: uuid(), description: 'Comida oficina', amount: 120,
      type: 'daily', category: 'alimentacion', status: 'confirmed',
      quincena: 'primera', dueDay: now.getDate(), month: m, year: y,
      isRecurring: false, isCC: false, receiptUrl: null, confirmedAt: iso(), createdAt: iso(), updatedAt: iso(),
    },
    {
      id: uuid(), description: 'Uber', amount: 85,
      type: 'daily', category: 'transporte', status: 'confirmed',
      quincena: 'primera', dueDay: now.getDate(), month: m, year: y,
      isRecurring: false, isCC: false, receiptUrl: null, confirmedAt: iso(), createdAt: iso(), updatedAt: iso(),
    },
  ]
}

function computeBalance(filter: MonthFilter & { quincena?: QuincenaFilter }): BalanceSummaryDTO {
  const now = new Date()
  const daysInMonth = getDaysInMonth(new Date(filter.year, filter.month - 1))
  const remainingDays = Math.max(1, daysInMonth - now.getDate())
  const quincena: QuincenaType = (filter.quincena && filter.quincena !== 'mensual')
    ? filter.quincena
    : (now.getDate() <= 15 ? 'primera' : 'segunda')
  const isMensual = filter.quincena === 'mensual'

  const relevant = mockTransactions.filter(
    (t) => t.month === filter.month && t.year === filter.year && (isMensual || t.quincena === quincena)
  )

  const scheduled = relevant.filter((t) => t.type === 'scheduled')
  const confirmed = scheduled.filter((t) => t.status === 'confirmed')
  const pending = scheduled.filter((t) => t.status === 'pending')
  const daily = relevant.filter((t) => t.type === 'daily')

  const totalPending = pending.reduce((s, t) => s + t.amount, 0)
  const totalConfirmed = confirmed.reduce((s, t) => s + t.amount, 0)
  const totalDaily = daily.reduce((s, t) => s + t.amount, 0)
  const expectedIncome = quincena === 'primera' ? 12_000 : 12_000
  const totalDebt = mockTransactions
    .filter((t) => t.category === 'deuda' && t.month === filter.month && t.year === filter.year)
    .reduce((s, t) => s + t.amount, 0)

  const projected = mockBalance + expectedIncome - totalPending
  return {
    currentBalance: mockBalance,
    initialBalance: mockBalance + totalConfirmed + totalDaily,
    projectedBalance: projected,
    dailyAllowance: projected / remainingDays,
    totalDebt,
    totalPendingScheduled: totalPending,
    totalConfirmedScheduled: totalConfirmed,
    totalDailyExpenses: totalDaily,
    expectedIncome,
    remainingDays,
    month: filter.month,
    year: filter.year,
    quincena,
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const mockAuthService = {
  // POST /api/v1/auth/login
  async login(email: string, _password: string): Promise<AuthResponseDTO> {
    await delay()
    if (!email.includes('@')) throw new Error('Credenciales inválidas')
    const firstName = email.split('@')[0]
    return {
      token: `mock_jwt_${uuid()}`,
      refreshToken: `mock_refresh_${uuid()}`,
      expiresIn: 3600,
      user: {
        id: uuid(), email, name: firstName, firstName, lastName: 'Usuario',
        currency: 'MXN', timezone: 'America/Mexico_City',
        monthlyNotifications: false, createdAt: iso(),
      },
    }
  },

  // POST /api/v1/auth/register
  async register(firstName: string, lastName: string, email: string, _password: string): Promise<AuthResponseDTO> {
    await delay()
    return {
      token: `mock_jwt_${uuid()}`,
      refreshToken: `mock_refresh_${uuid()}`,
      expiresIn: 3600,
      user: {
        id: uuid(), email, name: `${firstName} ${lastName}`, firstName, lastName,
        currency: 'MXN', timezone: 'America/Mexico_City',
        monthlyNotifications: false, createdAt: iso(),
      },
    }
  },

  // POST /api/v1/auth/logout
  async logout(): Promise<void> {
    await delay(300)
  },
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export const mockTransactionService = {
  // GET /api/v1/transactions?month=&year=&quincena=
  async list(filter: MonthFilter & { quincena?: QuincenaFilter }): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    await delay()
    const isMensual = filter.quincena === 'mensual'
    const data = mockTransactions.filter(
      (t) =>
        t.month === filter.month &&
        t.year === filter.year &&
        (isMensual || !filter.quincena || t.quincena === filter.quincena)
    )
    return { data, total: data.length, page: 1, pageSize: 100, hasMore: false }
  },

  // GET /api/v1/transactions/history?year=&type=&category=
  async listHistory(filters: {
    year: number
    type?: 'scheduled' | 'daily' | 'income' | 'all'
    category?: string
  }): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    await delay()
    const data = mockTransactions.filter((t) => {
      if (t.year !== filters.year) return false
      if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false
      if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false
      return true
    }).sort((a, b) => a.month - b.month || a.dueDay - b.dueDay)
    return { data, total: data.length, page: 1, pageSize: 500, hasMore: false }
  },

  // POST /api/v1/transactions
  async create(dto: CreateTransactionDTO): Promise<TransactionResponseDTO> {
    await delay()
    const autoConfirm = dto.type === 'daily' || dto.type === 'income'
    const tx: TransactionResponseDTO = {
      id: uuid(),
      ...dto,
      isCC: dto.isCC ?? false,
      status: autoConfirm ? 'confirmed' : 'pending',
      receiptUrl: null,
      confirmedAt: autoConfirm ? iso() : null,
      createdAt: iso(),
      updatedAt: iso(),
    }
    if (dto.type === 'income') mockBalance += dto.amount
    mockTransactions.push(tx)
    return tx
  },

  // PATCH /api/v1/transactions/:id/confirm
  async confirm(dto: ConfirmTransactionDTO): Promise<TransactionResponseDTO> {
    await delay()
    const tx = mockTransactions.find((t) => t.id === dto.transactionId)
    if (!tx) throw new Error('Transacción no encontrada')
    tx.status = dto.confirmed ? 'confirmed' : 'pending'
    tx.confirmedAt = dto.confirmed ? iso() : null
    tx.updatedAt = iso()
    return { ...tx }
  },

  // PUT /api/v1/transactions/:id
  async update(id: string, dto: Partial<TransactionResponseDTO>): Promise<TransactionResponseDTO> {
    await delay()
    const tx = mockTransactions.find((t) => t.id === id)
    if (!tx) throw new Error('Transacción no encontrada')
    Object.assign(tx, dto, { updatedAt: iso() })
    return { ...tx }
  },

  // DELETE /api/v1/transactions/:id
  async remove(id: string): Promise<void> {
    await delay()
    mockTransactions = mockTransactions.filter((t) => t.id !== id)
    receiptStore.delete(id)
  },

  // POST /api/v1/transactions/:id/receipt  (multipart/form-data)
  async uploadReceipt(id: string, file: File): Promise<TransactionResponseDTO> {
    await delay(600)
    const tx = mockTransactions.find((t) => t.id === id)
    if (!tx) throw new Error('Transacción no encontrada')
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    receiptStore.set(id, dataUrl)
    tx.receiptUrl = dataUrl
    tx.updatedAt = iso()
    return { ...tx }
  },
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export const mockBalanceService = {
  // GET /api/v1/balance?month=&year=&quincena=
  async getSummary(filter: MonthFilter & { quincena?: QuincenaFilter }): Promise<BalanceSummaryDTO> {
    await delay()
    return computeBalance(filter)
  },

  // POST /api/v1/balance/adjust
  async adjust(dto: AdjustBalanceDTO): Promise<BalanceSummaryDTO> {
    await delay()
    mockBalance = dto.newBalance
    const now = new Date()
    return computeBalance({ month: now.getMonth() + 1, year: now.getFullYear() })
  },

  // POST /api/v1/balance/income
  async addIncome(dto: { description: string; amount: number }): Promise<BalanceSummaryDTO> {
    await delay()
    mockBalance += dto.amount
    const now = new Date()
    const m = now.getMonth() + 1
    const y = now.getFullYear()
    const q: QuincenaType = now.getDate() <= 15 ? 'primera' : 'segunda'
    mockTransactions.push({
      id: Math.random().toString(36).slice(2, 11),
      description: dto.description,
      amount: dto.amount,
      type: 'income',
      category: 'otros',
      status: 'confirmed',
      quincena: q,
      dueDay: now.getDate(),
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    })
    return computeBalance({ month: m, year: y })
  },
}
