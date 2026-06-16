import { z } from 'zod'
import type { ValidationMessages } from '@/i18n/validation'

export function createCardSchema(msg: ValidationMessages) {
  return z.object({
    name: z.string().min(2, msg.minChars(2)).max(50),
    lastFour: z.string().regex(/^\d{4}$/, msg.exactFourDigits()),
    type: z.enum(['CREDIT', 'DEBIT']),
  })
}

export type CardFormValues = { name: string; lastFour: string; type: 'CREDIT' | 'DEBIT' }
