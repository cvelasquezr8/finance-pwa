import type {
  AuthResponseDTO,
  TransactionResponseDTO,
  BalanceSummaryDTO,
  AdjustBalanceDTO,
  PaginatedResponseDTO,
  CreateTransactionDTO,
  ConfirmTransactionDTO,
  AdminUserDTO,
  UpdateUserRoleDTO,
  UpdateUserStatusDTO,
  InviteUserDTO,
  CardDTO,
  CreateCardDTO,
  BudgetEventDTO,
  CreateEventDTO,
  InviteParticipantDTO,
  RespondInvitationDTO,
  AddShoppingItemDTO,
  ToggleShoppingItemDTO,
  MonthlyTrendDTO,
} from '@/core/dtos'
import type {
  MonthFilter,
  QuincenaFilter,
  QuincenaType,
  UserRole,
  UserStatus,
  EventParticipant,
  ShoppingItem,
} from '@/core/types'
import { getDaysInMonth } from 'date-fns'
import { getIdempotentResult, setIdempotentResult } from '@/lib/idempotency'
import { applyPagination, type PaginationParams } from './paginate'

const delay = (ms = 800) => new Promise<void>((r) => setTimeout(r, ms))

// ─── Fixed mock users ─────────────────────────────────────────────────────────

interface MockUser extends AdminUserDTO {
  password: string
}

let mockUsers: MockUser[] = [
  {
    id: 'usr_admin_001',
    email: 'admin@financeapp.com',
    name: 'Carlos Velasquez',
    firstName: 'Carlos',
    lastName: 'Velasquez',
    alias: '@admin',
    role: 'ADMIN' as UserRole,
    status: 'active' as UserStatus,
    password: 'admin123',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_002',
    email: 'ana.garcia@example.com',
    name: 'Ana Garcia',
    firstName: 'Ana',
    lastName: 'Garcia',
    alias: '@ana_garcia',
    role: 'USER' as UserRole,
    status: 'active' as UserStatus,
    password: 'user123',
    createdAt: '2024-03-15T00:00:00.000Z',
  },
  {
    id: 'usr_003',
    email: 'pedro.lopez@example.com',
    name: 'Pedro Lopez',
    firstName: 'Pedro',
    lastName: 'Lopez',
    alias: '@pedro_lopez',
    role: 'USER' as UserRole,
    status: 'blocked' as UserStatus,
    password: 'user123',
    createdAt: '2024-06-20T00:00:00.000Z',
  },
]

// ─── Mock cards ───────────────────────────────────────────────────────────────

let mockCards: CardDTO[] = [
  {
    id: 'card_001',
    userId: 'usr_admin_001',
    name: 'BBVA Azul',
    lastFour: '4521',
    type: 'CREDIT',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'card_002',
    userId: 'usr_admin_001',
    name: 'Banamex Oro',
    lastFour: '7842',
    type: 'CREDIT',
    createdAt: '2024-02-15T00:00:00.000Z',
  },
  {
    id: 'card_003',
    userId: 'usr_admin_001',
    name: 'HSBC Débito',
    lastFour: '1309',
    type: 'DEBIT',
    createdAt: '2024-03-01T00:00:00.000Z',
  },
]

// ─── Mock events ──────────────────────────────────────────────────────────────

let mockEvents: BudgetEventDTO[] = [
  {
    id: 'evt_001',
    title: 'Picnic de Verano',
    description: 'Reunión en el parque para celebrar el verano con comida y juegos.',
    goalAmount: 500,
    deadline: '2026-06-30',
    createdBy: 'usr_admin_001',
    status: 'ACTIVE',
    participants: [
      {
        userId: 'usr_002',
        alias: '@ana_garcia',
        assignedPct: 30,
        status: 'CONFIRMED',
        joinedAt: '2026-05-01T10:00:00.000Z',
        respondedAt: '2026-05-02T09:00:00.000Z',
      },
      {
        userId: 'usr_003',
        alias: '@pedro_lopez',
        assignedPct: 30,
        status: 'PENDING_CONFIRMATION',
        joinedAt: '2026-05-03T14:00:00.000Z',
      },
    ],
    shoppingItems: [
      {
        id: 'si_001',
        name: 'Carbón',
        estimatedCost: 80,
        bought: true,
        boughtBy: 'usr_admin_001',
        boughtAt: '2026-05-04T11:00:00.000Z',
      },
      {
        id: 'si_002',
        name: 'Bebidas',
        estimatedCost: 120,
        bought: false,
      },
      {
        id: 'si_003',
        name: 'Servilletas y platos',
        estimatedCost: 30,
        bought: false,
      },
    ],
    createdAt: '2026-05-01T09:00:00.000Z',
    updatedAt: '2026-05-04T11:00:00.000Z',
  },
]

let mockBalance = 15_420.5
let mockTransactions: TransactionResponseDTO[] = buildSeedTransactions()

function buildHistoricalTransactions(): TransactionResponseDTO[] {
  const now = new Date()
  const results: TransactionResponseDTO[] = []

  const scheduledTemplates = [
    {
      description: 'Renta',
      amount: 6_500,
      dueDay: 1,
      quincena: 'primera' as QuincenaType,
      category: 'vivienda',
    },
    {
      description: 'Luz CFE',
      amount: 850,
      dueDay: 5,
      quincena: 'primera' as QuincenaType,
      category: 'servicios',
    },
    {
      description: 'Internet Telmex',
      amount: 480,
      dueDay: 8,
      quincena: 'primera' as QuincenaType,
      category: 'servicios',
    },
    {
      description: 'Seguro Gastos Médicos',
      amount: 1_200,
      dueDay: 10,
      quincena: 'primera' as QuincenaType,
      category: 'salud',
    },
    {
      description: 'Colegio',
      amount: 3_200,
      dueDay: 12,
      quincena: 'primera' as QuincenaType,
      category: 'educacion',
    },
    {
      description: 'Tarjeta BBVA',
      amount: 2_400,
      dueDay: 17,
      quincena: 'segunda' as QuincenaType,
      category: 'deuda',
    },
    {
      description: 'Tarjeta Banamex',
      amount: 1_800,
      dueDay: 20,
      quincena: 'segunda' as QuincenaType,
      category: 'deuda',
    },
    {
      description: 'Gas',
      amount: 350,
      dueDay: 22,
      quincena: 'segunda' as QuincenaType,
      category: 'servicios',
    },
    {
      description: 'Netflix + Spotify',
      amount: 290,
      dueDay: 25,
      quincena: 'segunda' as QuincenaType,
      category: 'entretenimiento',
    },
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
        cardId: null,
        eventId: null,
        userId: null,
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
        cardId: null,
        eventId: null,
        userId: null,
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
    status: TransactionResponseDTO['status'] = 'pending',
    isCC = false,
    cardId: string | null = null
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
    isCC,
    cardId,
    eventId: null,
    userId: 'usr_admin_001',
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
    {
      ...base('Tarjeta BBVA', 2_400, 17, 'segunda', true, 'confirmed', true, 'card_001'),
      category: 'deuda',
    },
    {
      ...base('Tarjeta Banamex', 1_800, 20, 'segunda', true, 'pending', true, 'card_002'),
      category: 'deuda',
    },
    { ...base('Gas', 350, 22, 'segunda'), category: 'servicios' },
    { ...base('Netflix + Spotify', 290, 25, 'segunda'), category: 'entretenimiento' },
    // Daily expenses
    {
      id: uuid(),
      description: 'Comida oficina',
      amount: 120,
      type: 'daily',
      category: 'alimentacion',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: now.getDate(),
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      cardId: null,
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
    {
      id: uuid(),
      description: 'Compra con BBVA',
      amount: 450,
      type: 'daily',
      category: 'alimentacion',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: now.getDate(),
      month: m,
      year: y,
      isRecurring: false,
      isCC: true,
      cardId: 'card_001',
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
    {
      id: uuid(),
      description: 'Uber',
      amount: 85,
      type: 'daily',
      category: 'transporte',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: now.getDate(),
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      cardId: null,
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
    // Extra daily seed transactions for QuickDailyList
    {
      id: uuid(),
      description: 'Farmacia',
      amount: 230,
      type: 'daily',
      category: 'salud',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: 3,
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      cardId: null,
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
    {
      id: uuid(),
      description: 'Supermercado',
      amount: 620,
      type: 'daily',
      category: 'alimentacion',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: 6,
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      cardId: null,
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
    {
      id: uuid(),
      description: 'Gasolina',
      amount: 700,
      type: 'daily',
      category: 'transporte',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: 9,
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      cardId: null,
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
    {
      id: uuid(),
      description: 'Cine',
      amount: 180,
      type: 'daily',
      category: 'entretenimiento',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: 11,
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      cardId: null,
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
    {
      id: uuid(),
      description: 'Papelería',
      amount: 95,
      type: 'daily',
      category: 'educacion',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: 13,
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      cardId: null,
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
    // Ana Garcia's contribution to the Picnic event
    {
      id: 'tx_evt_001',
      description: 'Aporte Picnic de Verano',
      amount: 75,
      type: 'daily',
      category: 'otros',
      status: 'confirmed',
      quincena: 'primera',
      dueDay: now.getDate(),
      month: m,
      year: y,
      isRecurring: false,
      isCC: false,
      cardId: null,
      eventId: 'evt_001',
      userId: 'usr_002',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    },
  ]
}

function computeBalance(filter: MonthFilter & { quincena?: QuincenaFilter }): BalanceSummaryDTO {
  const now = new Date()
  const daysInMonth = getDaysInMonth(new Date(filter.year, filter.month - 1))
  const remainingDays = Math.max(1, daysInMonth - now.getDate())
  const quincena: QuincenaType =
    filter.quincena && filter.quincena !== 'mensual'
      ? filter.quincena
      : now.getDate() <= 15
        ? 'primera'
        : 'segunda'
  const isMensual = filter.quincena === 'mensual'

  const relevant = mockTransactions.filter(
    (t) =>
      t.month === filter.month && t.year === filter.year && (isMensual || t.quincena === quincena)
  )

  const scheduled = relevant.filter((t) => t.type === 'scheduled')
  const confirmed = scheduled.filter((t) => t.status === 'confirmed')
  const pending = scheduled.filter((t) => t.status === 'pending')
  const daily = relevant.filter((t) => t.type === 'daily')

  const totalPending = pending.reduce((s, t) => s + t.amount, 0)
  const totalConfirmed = confirmed.reduce((s, t) => s + t.amount, 0)
  const totalDaily = daily.reduce((s, t) => s + t.amount, 0)

  // Credit-card transactions are projected debt: they must NOT affect the cash
  // balance until the statement payment is processed (see CLAUDE.md). Cash-only
  // sums exclude isCC so the initial/projected *cash* figures stay accurate.
  const sum = (list: typeof relevant) => list.reduce((s, t) => s + t.amount, 0)
  const cashConfirmed = sum(confirmed.filter((t) => !t.isCC))
  const cashDaily = sum(daily.filter((t) => !t.isCC))
  const cashPending = sum(pending.filter((t) => !t.isCC))

  const expectedIncome = quincena === 'primera' ? 12_000 : 12_000
  const totalDebt = mockTransactions
    .filter((t) => t.category === 'deuda' && t.month === filter.month && t.year === filter.year)
    .reduce((s, t) => s + t.amount, 0)

  const projected = mockBalance + expectedIncome - cashPending
  return {
    currentBalance: mockBalance,
    initialBalance: mockBalance + cashConfirmed + cashDaily,
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
  async login(email: string, password: string): Promise<AuthResponseDTO> {
    await delay()
    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!found || found.password !== password) throw new Error('Credenciales inválidas')
    if (found.status === 'blocked')
      throw new Error('Tu cuenta ha sido bloqueada. Contacta al administrador.')
    if (found.status === 'deleted') throw new Error('Esta cuenta ya no existe.')
    return {
      token: `mock_jwt_${uuid()}`,
      refreshToken: `mock_refresh_${uuid()}`,
      expiresIn: 3600,
      user: {
        id: found.id,
        email: found.email,
        name: found.name,
        firstName: found.firstName,
        lastName: found.lastName,
        alias: found.alias,
        currency: 'MXN',
        timezone: 'America/Mexico_City',
        monthlyNotifications: false,
        role: found.role,
        status: found.status,
        createdAt: found.createdAt,
      },
    }
  },

  async register(
    firstName: string,
    lastName: string,
    email: string,
    _password: string,
    alias: string
  ): Promise<AuthResponseDTO> {
    await delay()
    const exists = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) throw new Error('Este correo ya está registrado.')
    const aliasExists = mockUsers.some((u) => u.alias.toLowerCase() === alias.toLowerCase())
    if (aliasExists) throw new Error('Este alias ya está en uso.')
    const newUser: MockUser = {
      id: `usr_${uuid()}`,
      email,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      alias,
      role: 'USER',
      status: 'active',
      password: _password,
      createdAt: iso(),
    }
    mockUsers.push(newUser)
    return {
      token: `mock_jwt_${uuid()}`,
      refreshToken: `mock_refresh_${uuid()}`,
      expiresIn: 3600,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        alias: newUser.alias,
        currency: 'MXN',
        timezone: 'America/Mexico_City',
        monthlyNotifications: false,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    }
  },

  async logout(): Promise<void> {
    await delay(300)
  },
}

// ─── Transactions ─────────────────────────────────────────────────────────────

const TRANSACTION_SORT_ACCESSORS = {
  date: (t: TransactionResponseDTO) => t.year * 10000 + t.month * 100 + t.dueDay,
  amount: (t: TransactionResponseDTO) => t.amount,
  description: (t: TransactionResponseDTO) => t.description.toLowerCase(),
  category: (t: TransactionResponseDTO) => t.category,
  status: (t: TransactionResponseDTO) => t.status,
  createdAt: (t: TransactionResponseDTO) => new Date(t.createdAt),
} as const

const TRANSACTION_SEARCH_FIELDS = [
  (t: TransactionResponseDTO) => t.description,
  (t: TransactionResponseDTO) => t.category,
] as const

export const mockTransactionService = {
  async list(
    filter: MonthFilter & {
      quincena?: QuincenaFilter
      type?: 'scheduled' | 'daily' | 'income' | 'all'
      cardId?: string | null
    } & PaginationParams
  ): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    await delay()
    const isMensual = filter.quincena === 'mensual'
    const filtered = mockTransactions.filter((t) => {
      if (t.month !== filter.month || t.year !== filter.year) return false
      if (filter.quincena && !isMensual && t.quincena !== filter.quincena) return false
      if (filter.type && filter.type !== 'all' && t.type !== filter.type) return false
      if (filter.cardId === 'cc-only' && !t.isCC) return false
      if (
        filter.cardId &&
        filter.cardId !== 'all' &&
        filter.cardId !== 'cc-only' &&
        t.cardId !== filter.cardId
      )
        return false
      return true
    })
    return applyPagination(filtered, filter, {
      searchFields: [...TRANSACTION_SEARCH_FIELDS],
      sortAccessors: TRANSACTION_SORT_ACCESSORS,
      defaultSortBy: 'date',
      defaultOrder: 'asc',
    })
  },

  async listHistory(
    filters: {
      fromMonth?: number
      fromYear?: number
      toMonth?: number
      toYear?: number
      year?: number
      type?: 'scheduled' | 'daily' | 'income' | 'all'
      category?: string
    } & PaginationParams
  ): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    await delay()
    const toKey = (year: number, month: number) => year * 100 + month
    const filtered = mockTransactions.filter((t) => {
      if (filters.year != null && t.year !== filters.year) return false
      if (
        filters.fromYear != null &&
        filters.fromMonth != null &&
        toKey(t.year, t.month) < toKey(filters.fromYear, filters.fromMonth)
      )
        return false
      if (
        filters.toYear != null &&
        filters.toMonth != null &&
        toKey(t.year, t.month) > toKey(filters.toYear, filters.toMonth)
      )
        return false
      if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false
      if (filters.category && filters.category !== 'all' && t.category !== filters.category)
        return false
      return true
    })
    return applyPagination(filtered, filters, {
      searchFields: [...TRANSACTION_SEARCH_FIELDS],
      sortAccessors: TRANSACTION_SORT_ACCESSORS,
      defaultSortBy: 'date',
      defaultOrder: 'desc',
    })
  },

  async create(
    dto: CreateTransactionDTO & { idempotencyKey?: string }
  ): Promise<TransactionResponseDTO> {
    if (dto.idempotencyKey) {
      const cached = getIdempotentResult<TransactionResponseDTO>(dto.idempotencyKey)
      if (cached) return cached
    }
    await delay()
    const autoConfirm = dto.type === 'daily' || dto.type === 'income'
    const tx: TransactionResponseDTO = {
      id: uuid(),
      ...dto,
      isCC: dto.isCC ?? false,
      cardId: dto.cardId ?? null,
      eventId: dto.eventId ?? null,
      userId: 'mock-user',
      status: autoConfirm ? 'confirmed' : 'pending',
      receiptUrl: null,
      confirmedAt: autoConfirm ? iso() : null,
      createdAt: iso(),
      updatedAt: iso(),
    }
    if (dto.type === 'income') mockBalance += dto.amount
    mockTransactions.push(tx)
    if (dto.idempotencyKey) setIdempotentResult(dto.idempotencyKey, tx)
    return tx
  },

  async confirm(dto: ConfirmTransactionDTO): Promise<TransactionResponseDTO> {
    await delay()
    const tx = mockTransactions.find((t) => t.id === dto.transactionId)
    if (!tx) throw new Error('Transacción no encontrada')
    tx.status = dto.confirmed ? 'confirmed' : 'pending'
    tx.confirmedAt = dto.confirmed ? iso() : null
    tx.updatedAt = iso()
    return { ...tx }
  },

  async update(
    id: string,
    dto: Partial<TransactionResponseDTO> & { idempotencyKey?: string }
  ): Promise<TransactionResponseDTO> {
    const ikey = dto.idempotencyKey
    if (ikey) {
      const cached = getIdempotentResult<TransactionResponseDTO>(ikey)
      if (cached) return cached
    }
    await delay()
    const tx = mockTransactions.find((t) => t.id === id)
    if (!tx) throw new Error('Transacción no encontrada')
    const { idempotencyKey: _k, ...rest } = dto
    Object.assign(tx, rest, { updatedAt: iso() })
    const result = { ...tx }
    if (ikey) setIdempotentResult(ikey, result)
    return result
  },

  async remove(id: string): Promise<void> {
    await delay()
    mockTransactions = mockTransactions.filter((t) => t.id !== id)
    receiptStore.delete(id)
  },

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

// ─── Cards ────────────────────────────────────────────────────────────────────

export const mockCardService = {
  async listCards(userId: string): Promise<CardDTO[]> {
    await delay(400)
    return mockCards.filter((c) => c.userId === userId)
  },

  async createCard(userId: string, dto: CreateCardDTO): Promise<CardDTO> {
    await delay()
    const card: CardDTO = { id: `card_${uuid()}`, userId, ...dto, createdAt: iso() }
    mockCards.push(card)
    return card
  },

  async deleteCard(id: string): Promise<void> {
    await delay(400)
    const idx = mockCards.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Tarjeta no encontrada')
    mockCards.splice(idx, 1)
  },

  async updateCard(id: string, dto: Partial<CreateCardDTO>): Promise<CardDTO> {
    await delay(400)
    const card = mockCards.find((c) => c.id === id)
    if (!card) throw new Error('Tarjeta no encontrada')
    Object.assign(card, dto)
    return { ...card }
  },
}

// ─── Admin ────────────────────────────────────────────────────────────────────

const ADMIN_SORT_ACCESSORS = {
  name: (u: AdminUserDTO) => u.name.toLowerCase(),
  email: (u: AdminUserDTO) => u.email.toLowerCase(),
  alias: (u: AdminUserDTO) => u.alias.toLowerCase(),
  role: (u: AdminUserDTO) => u.role,
  status: (u: AdminUserDTO) => u.status,
  createdAt: (u: AdminUserDTO) => new Date(u.createdAt),
} as const

export const mockAdminService = {
  async listUsers(query: PaginationParams = {}): Promise<PaginatedResponseDTO<AdminUserDTO>> {
    await delay()
    const all = mockUsers.map(({ password: _p, ...rest }) => rest)
    return applyPagination(all, query, {
      searchFields: [(u) => u.name, (u) => u.email, (u) => u.alias],
      sortAccessors: ADMIN_SORT_ACCESSORS,
      defaultSortBy: 'createdAt',
      defaultOrder: 'desc',
    })
  },

  async updateRole(dto: UpdateUserRoleDTO): Promise<AdminUserDTO> {
    await delay()
    const user = mockUsers.find((u) => u.id === dto.userId)
    if (!user) throw new Error('Usuario no encontrado')
    user.role = dto.role
    const { password: _p, ...rest } = user
    return rest
  },

  async updateStatus(dto: UpdateUserStatusDTO): Promise<AdminUserDTO> {
    await delay()
    const user = mockUsers.find((u) => u.id === dto.userId)
    if (!user) throw new Error('Usuario no encontrado')
    user.status = dto.status
    const { password: _p, ...rest } = user
    return rest
  },

  async inviteUser(dto: InviteUserDTO): Promise<AdminUserDTO> {
    await delay()
    if (mockUsers.some((u) => u.email.toLowerCase() === dto.email.toLowerCase()))
      throw new Error('Este correo ya está registrado.')
    if (mockUsers.some((u) => u.alias.toLowerCase() === dto.alias.toLowerCase()))
      throw new Error('Este alias ya está en uso.')
    const newUser: MockUser = {
      id: `usr_${uuid()}`,
      email: dto.email,
      name: `${dto.firstName} ${dto.lastName}`,
      firstName: dto.firstName,
      lastName: dto.lastName,
      alias: dto.alias,
      role: dto.role ?? 'USER',
      status: 'active',
      password: 'Temp1234',
      createdAt: iso(),
    }
    mockUsers.push(newUser)
    const { password: _p, ...rest } = newUser
    return rest
  },
}

// ─── Balance ──────────────────────────────────────────────────────────────────

export const mockBalanceService = {
  async getSummary(
    filter: MonthFilter & { quincena?: QuincenaFilter }
  ): Promise<BalanceSummaryDTO> {
    await delay()
    return computeBalance(filter)
  },

  async adjust(dto: AdjustBalanceDTO): Promise<BalanceSummaryDTO> {
    await delay()
    mockBalance = dto.newBalance
    const now = new Date()
    return computeBalance({ month: now.getMonth() + 1, year: now.getFullYear() })
  },

  async getMonthlyTrend(months = 6): Promise<MonthlyTrendDTO[]> {
    await delay(400)
    const lang =
      typeof localStorage !== 'undefined' ? (localStorage.getItem('finance_lang') ?? 'es') : 'es'
    const now = new Date()
    const result: MonthlyTrendDTO[] = []
    for (let offset = months - 1; offset >= 0; offset--) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const monthLabel = new Intl.DateTimeFormat(lang, { month: 'short' }).format(d)
      const relevant = mockTransactions.filter(
        (t) => t.month === m && t.year === y && t.status === 'confirmed'
      )
      const incomeSum = relevant
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0)
      const expensesSum = relevant
        .filter((t) => t.type === 'scheduled' || t.type === 'daily')
        .reduce((s, t) => s + t.amount, 0)
      result.push({
        month: m,
        year: y,
        monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        income: incomeSum > 0 ? incomeSum : 12_000,
        expenses: expensesSum,
      })
    }
    return result
  },

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
      cardId: null,
      eventId: null,
      userId: 'usr_admin_001',
      receiptUrl: null,
      confirmedAt: iso(),
      createdAt: iso(),
      updatedAt: iso(),
    })
    return computeBalance({ month: m, year: y })
  },
}

// ─── Events ───────────────────────────────────────────────────────────────────

export const mockEventService = {
  async listEvents(userId: string): Promise<BudgetEventDTO[]> {
    await delay(400)
    return mockEvents.filter(
      (e) => e.createdBy === userId || e.participants.some((p) => p.userId === userId)
    )
  },

  async getEvent(id: string): Promise<BudgetEventDTO> {
    await delay(400)
    const event = mockEvents.find((e) => e.id === id)
    if (!event) throw new Error('Evento no encontrado')
    return {
      ...event,
      participants: [...event.participants],
      shoppingItems: [...event.shoppingItems],
    }
  },

  async createEvent(dto: CreateEventDTO, creatorUserId: string): Promise<BudgetEventDTO> {
    await delay()
    const event: BudgetEventDTO = {
      id: `evt_${uuid()}`,
      ...dto,
      createdBy: creatorUserId,
      status: 'ACTIVE',
      participants: [],
      shoppingItems: [],
      createdAt: iso(),
      updatedAt: iso(),
    }
    mockEvents.push(event)
    return { ...event }
  },

  async inviteParticipant(dto: InviteParticipantDTO): Promise<BudgetEventDTO> {
    await delay()
    const event = mockEvents.find((e) => e.id === dto.eventId)
    if (!event) throw new Error('Evento no encontrado')
    const user = mockUsers.find((u) => u.alias.toLowerCase() === dto.alias.toLowerCase())
    if (!user) throw new Error(`No se encontró ningún usuario con alias ${dto.alias}`)

    const existing = event.participants.find((p) => p.userId === user.id)
    if (existing) {
      if (existing.status === 'CONFIRMED')
        throw new Error('Este participante ya confirmó su asistencia')
      // re-invite DECLINED participant
      existing.status = 'PENDING_CONFIRMATION'
      existing.joinedAt = iso()
      existing.respondedAt = undefined
    } else {
      const participant: EventParticipant = {
        userId: user.id,
        alias: user.alias,
        assignedPct: dto.assignedPct,
        status: 'PENDING_CONFIRMATION',
        joinedAt: iso(),
      }
      event.participants.push(participant)
    }
    event.updatedAt = iso()
    return {
      ...event,
      participants: [...event.participants],
      shoppingItems: [...event.shoppingItems],
    }
  },

  async respondInvitation(dto: RespondInvitationDTO, userId: string): Promise<BudgetEventDTO> {
    await delay()
    const event = mockEvents.find((e) => e.id === dto.eventId)
    if (!event) throw new Error('Evento no encontrado')
    const participant = event.participants.find((p) => p.userId === userId)
    if (!participant) throw new Error('No estás invitado a este evento')
    if (participant.status === 'CONFIRMED') throw new Error('Ya confirmaste tu asistencia')
    participant.status = dto.status
    participant.respondedAt = iso()
    event.updatedAt = iso()
    return {
      ...event,
      participants: [...event.participants],
      shoppingItems: [...event.shoppingItems],
    }
  },

  async addShoppingItem(dto: AddShoppingItemDTO): Promise<BudgetEventDTO> {
    await delay()
    const event = mockEvents.find((e) => e.id === dto.eventId)
    if (!event) throw new Error('Evento no encontrado')
    const item: ShoppingItem = {
      id: `si_${uuid()}`,
      name: dto.name,
      estimatedCost: dto.estimatedCost,
      bought: false,
      assignedTo: dto.assignedTo,
    }
    event.shoppingItems.push(item)
    event.updatedAt = iso()
    return {
      ...event,
      participants: [...event.participants],
      shoppingItems: [...event.shoppingItems],
    }
  },

  async toggleShoppingItem(dto: ToggleShoppingItemDTO, userId: string): Promise<BudgetEventDTO> {
    await delay()
    const event = mockEvents.find((e) => e.id === dto.eventId)
    if (!event) throw new Error('Evento no encontrado')
    const item = event.shoppingItems.find((i) => i.id === dto.itemId)
    if (!item) throw new Error('Artículo no encontrado')
    item.bought = dto.bought
    item.boughtBy = dto.bought ? userId : undefined
    item.boughtAt = dto.bought ? iso() : undefined
    event.updatedAt = iso()
    return {
      ...event,
      participants: [...event.participants],
      shoppingItems: [...event.shoppingItems],
    }
  },

  async cancelEvent(id: string): Promise<void> {
    await delay()
    const event = mockEvents.find((e) => e.id === id)
    if (!event) throw new Error('Evento no encontrado')
    event.status = 'CANCELLED'
    event.updatedAt = iso()
  },

  async getLinkedTransactions(
    eventId: string,
    query: PaginationParams = {}
  ): Promise<PaginatedResponseDTO<TransactionResponseDTO>> {
    await delay(300)
    const filtered = mockTransactions.filter((t) => t.eventId === eventId)
    return applyPagination(filtered, query, {
      searchFields: [...TRANSACTION_SEARCH_FIELDS],
      sortAccessors: TRANSACTION_SORT_ACCESSORS,
      defaultSortBy: 'createdAt',
      defaultOrder: 'desc',
    })
  },
}
