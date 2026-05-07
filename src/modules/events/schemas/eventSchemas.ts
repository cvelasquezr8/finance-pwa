import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(80),
  description: z.string().max(200).optional(),
  goalAmount: z.coerce.number().positive('Debe ser mayor a 0'),
  deadline: z.string().optional(),
})

export const inviteParticipantSchema = z.object({
  alias: z.string().regex(/^@[a-z0-9_]{2,20}$/, 'Alias inválido — empieza con @'),
  assignedPct: z.coerce.number().min(1, 'Mínimo 1%').max(100, 'Máximo 100%'),
})

export const addShoppingItemSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  estimatedCost: z.coerce.number().positive().optional().or(z.literal('')),
})

export type CreateEventFormValues = z.infer<typeof createEventSchema>
export type InviteParticipantFormValues = z.infer<typeof inviteParticipantSchema>
export type AddShoppingItemFormValues = z.infer<typeof addShoppingItemSchema>
