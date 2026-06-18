import { z } from 'zod'
import type { ValidationMessages } from '@/i18n/validation'

export function createLoginSchema(msg: ValidationMessages) {
  return z.object({
    email: z.string().email(msg.invalidEmail()),
    password: z.string().min(1, msg.required()),
  })
}

export function createRegisterSchema(msg: ValidationMessages) {
  return z
    .object({
      firstName: z.string().min(2, msg.minChars(2)),
      lastName: z.string().min(2, msg.minChars(2)),
      middleName: z.string().optional(),
      secondLastName: z.string().optional(),
      alias: z.string().regex(/^[a-z0-9_]{2,20}$/, msg.aliasFormat()),
      email: z.string().email(msg.invalidEmail()),
      password: z
        .string()
        .min(8, msg.minChars(8))
        .regex(/[A-Z]/, msg.passwordUppercase())
        .regex(/[a-z]/, msg.passwordLowercase())
        .regex(/[0-9]/, msg.passwordNumber()),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: msg.passwordMatch(),
      path: ['confirmPassword'],
    })
}

export function createChangePasswordSchema(msg: ValidationMessages) {
  return z
    .object({
      currentPassword: z.string().min(1, msg.required()),
      newPassword: z
        .string()
        .min(8, msg.minChars(8))
        .regex(/[A-Z]/, msg.passwordUppercase())
        .regex(/[a-z]/, msg.passwordLowercase())
        .regex(/[0-9]/, msg.passwordNumber()),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: msg.passwordMatch(),
      path: ['confirmPassword'],
    })
}

// Static types (message content doesn't affect shape)
export type LoginFormValues = { email: string; password: string }
export type RegisterFormValues = {
  firstName: string
  lastName: string
  middleName?: string
  secondLastName?: string
  alias: string
  email: string
  password: string
  confirmPassword: string
}
export type ChangePasswordFormValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
