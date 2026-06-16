import { z } from 'zod'
import type { ValidationMessages } from '@/i18n/validation'

export function createEventSchema(msg: ValidationMessages) {
  return z.object({
    title: z.string().min(3, msg.minChars(3)).max(80),
    description: z.string().max(200).optional(),
    goalAmount: z.coerce.number().positive(msg.positive()),
    deadline: z.string().optional(),
  })
}

export function createInviteParticipantSchema(msg: ValidationMessages) {
  return z.object({
    alias: z.string().regex(/^@[a-z0-9_]{2,20}$/, msg.aliasFormat()),
    assignedPct: z.coerce.number().min(1, msg.minPercent(1)).max(100, msg.maxPercent(100)),
  })
}

export function createAddShoppingItemSchema(msg: ValidationMessages) {
  return z.object({
    name: z.string().min(2, msg.minChars(2)).max(80),
    estimatedCost: z.coerce.number().positive().optional().or(z.literal('')),
  })
}

export type CreateEventFormValues = {
  title: string
  description?: string
  goalAmount: number
  deadline?: string
}
export type InviteParticipantFormValues = { alias: string; assignedPct: number }
export type AddShoppingItemFormValues = { name: string; estimatedCost?: number | '' }
