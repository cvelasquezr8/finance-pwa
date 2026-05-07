import { z } from 'zod'

export const cardSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  lastFour: z.string().regex(/^\d{4}$/, 'Debe ser exactamente 4 dígitos'),
  type: z.enum(['CREDIT', 'DEBIT']),
})

export type CardFormValues = z.infer<typeof cardSchema>
