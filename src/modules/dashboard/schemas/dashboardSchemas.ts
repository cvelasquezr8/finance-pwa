import { z } from 'zod'

export const incomeSchema = z.object({
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
})

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

export type IncomeFormValues = z.infer<typeof incomeSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
