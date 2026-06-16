import { z } from 'zod'
import type { ValidationMessages } from '@/i18n/validation'

export const categoryEnum = z.enum([
  'vivienda',
  'servicios',
  'alimentacion',
  'transporte',
  'salud',
  'entretenimiento',
  'educacion',
  'deuda',
  'otros',
])

export function createDailyExpenseSchema(msg: ValidationMessages) {
  return z
    .object({
      description: z.string().min(2, msg.minChars(2)),
      amount: z.coerce.number().positive(msg.positive()),
      category: categoryEnum,
      isCC: z.boolean().default(false),
      cardId: z.string().nullable().optional(),
    })
    .refine((data) => !data.isCC || !!data.cardId, {
      message: msg.selectCard(),
      path: ['cardId'],
    })
}

export function createScheduledExpenseSchema(msg: ValidationMessages) {
  return z
    .object({
      description: z.string().min(2, msg.minChars(2)),
      amount: z.coerce.number().positive(msg.positive()),
      category: categoryEnum,
      dueDay: z.coerce.number().min(1).max(31),
      quincena: z.enum(['primera', 'segunda']),
      isRecurring: z.boolean(),
      isCC: z.boolean().default(false),
      cardId: z.string().nullable().optional(),
    })
    .refine((data) => !data.isCC || !!data.cardId, {
      message: msg.selectCard(),
      path: ['cardId'],
    })
}

export function createEditTransactionSchema(msg: ValidationMessages) {
  return z.object({
    description: z.string().min(2, msg.minChars(2)),
    amount: z.coerce.number().positive(msg.positive()),
    category: categoryEnum,
    dueDay: z.coerce.number().min(1).max(31).optional(),
    quincena: z.enum(['primera', 'segunda']).optional(),
    isRecurring: z.boolean().optional(),
    isCC: z.boolean().optional(),
    cardId: z.string().nullable().optional(),
  })
}

export function createAddTransactionSchema(msg: ValidationMessages) {
  return z.object({
    mode: z.enum(['income', 'egreso']),
    description: z.string().min(2, msg.minChars(2)),
    amount: z.coerce.number().positive(msg.positive()),
    category: categoryEnum.optional(),
    cardId: z.string().nullable().optional(),
    eventId: z.string().nullable().optional(),
  })
}

export function createAdjustBalanceSchema(msg: ValidationMessages) {
  return z.object({
    newBalance: z.coerce.number().min(0, msg.notNegative()),
    reason: z.string().min(3, msg.minChars(3)),
  })
}

// Static types
export type DailyExpenseFormValues = {
  description: string
  amount: number
  category: z.infer<typeof categoryEnum>
  isCC: boolean
  cardId?: string | null
}
export type ScheduledExpenseFormValues = {
  description: string
  amount: number
  category: z.infer<typeof categoryEnum>
  dueDay: number
  quincena: 'primera' | 'segunda'
  isRecurring: boolean
  isCC: boolean
  cardId?: string | null
}
export type EditTransactionFormValues = {
  description: string
  amount: number
  category: z.infer<typeof categoryEnum>
  dueDay?: number
  quincena?: 'primera' | 'segunda'
  isRecurring?: boolean
  isCC?: boolean
  cardId?: string | null
}
export type AddTransactionFormValues = {
  mode: 'income' | 'egreso'
  description: string
  amount: number
  category?: z.infer<typeof categoryEnum>
  cardId?: string | null
  eventId?: string | null
}
export type AdjustBalanceFormValues = { newBalance: number; reason: string }
