import { z } from 'zod'

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

// A credit-card expense must reference the card it was charged to.
const cardRefinement = {
  message: 'Selecciona una tarjeta',
  path: ['cardId'],
}

export const dailyExpenseSchema = z
  .object({
    description: z.string().min(2, 'Mínimo 2 caracteres'),
    amount: z.coerce.number().positive('Debe ser mayor a 0'),
    category: categoryEnum,
    isCC: z.boolean().default(false),
    cardId: z.string().nullable().optional(),
  })
  .refine((data) => !data.isCC || !!data.cardId, cardRefinement)

export const scheduledExpenseSchema = z
  .object({
    description: z.string().min(2, 'Mínimo 2 caracteres'),
    amount: z.coerce.number().positive('Debe ser mayor a 0'),
    category: categoryEnum,
    dueDay: z.coerce.number().min(1).max(31),
    quincena: z.enum(['primera', 'segunda']),
    isRecurring: z.boolean(),
    isCC: z.boolean().default(false),
    cardId: z.string().nullable().optional(),
  })
  .refine((data) => !data.isCC || !!data.cardId, cardRefinement)

// Edit form: superset of daily + scheduled fields, all conditionally optional
// (the modal shows/hides fields based on the transaction type being edited).
export const editTransactionSchema = z.object({
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  category: categoryEnum,
  dueDay: z.coerce.number().min(1).max(31).optional(),
  quincena: z.enum(['primera', 'segunda']).optional(),
  isRecurring: z.boolean().optional(),
  isCC: z.boolean().optional(),
  cardId: z.string().nullable().optional(),
})

// Unified transaction schema: Ingreso or Egreso (daily)
export const addTransactionSchema = z.object({
  mode: z.enum(['income', 'egreso']),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  category: categoryEnum.optional(),
  cardId: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
})

export const adjustBalanceSchema = z.object({
  newBalance: z.coerce.number().min(0, 'No puede ser negativo'),
  reason: z.string().min(3, 'Describe el motivo'),
})

export type DailyExpenseFormValues = z.infer<typeof dailyExpenseSchema>
export type ScheduledExpenseFormValues = z.infer<typeof scheduledExpenseSchema>
export type EditTransactionFormValues = z.infer<typeof editTransactionSchema>
export type AdjustBalanceFormValues = z.infer<typeof adjustBalanceSchema>
export type AddTransactionFormValues = z.infer<typeof addTransactionSchema>
