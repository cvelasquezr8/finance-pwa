import { z } from 'zod'
import type { ValidationMessages } from '@/i18n/validation'

export function createIncomeSchema(msg: ValidationMessages) {
  return z.object({
    description: z.string().min(2, msg.minChars(2)),
    amount: z.coerce.number().positive(msg.positive()),
  })
}

export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  middleName: z.string().optional(),
  secondLastName: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().min(1),
  timezone: z.string().min(1),
  monthlyNotifications: z.boolean(),
  language: z.enum(['es', 'en']),
  theme: z.enum(['dark', 'light']),
})

export type IncomeFormValues = { description: string; amount: number }
export type ProfileFormValues = z.infer<typeof profileSchema>
