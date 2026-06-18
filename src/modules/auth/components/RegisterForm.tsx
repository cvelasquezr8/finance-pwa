'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TrendingUp, Loader2, AtSign, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createRegisterSchema, type RegisterFormValues } from '../schemas/authSchemas'
import { validationMessages } from '@/i18n/validation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface Props {
  onSwitchToLogin: () => void
}

const LOCALE_CURRENCY_MAP: Record<string, string> = {
  'es-MX': 'MXN',
  'es-AR': 'ARS',
  'es-CO': 'COP',
  'es-CL': 'CLP',
  'es-PE': 'PEN',
  'es-VE': 'VES',
  'es-ES': 'EUR',
  'en-US': 'USD',
  'en-GB': 'GBP',
  'en-CA': 'CAD',
  'en-AU': 'AUD',
  'pt-BR': 'BRL',
}

function detectLocale() {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'es-MX'
  const language = nav.split('-')[0] ?? 'es'
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'America/Mexico_City'
  const currency = LOCALE_CURRENCY_MAP[nav] ?? 'MXN'
  return { language, timezone, currency }
}

interface PasswordRule {
  key: string
  label: string
  test: (v: string) => boolean
}

function PasswordStrength({ password, rules }: { password: string; rules: PasswordRule[] }) {
  const passed = rules.filter((r) => r.test(password)).length
  if (!password) return null

  const segments = rules.length
  const colors = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const barColor = colors[Math.min(passed - 1, colors.length - 1)] ?? 'bg-muted'

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < passed ? barColor : 'bg-muted'
            )}
          />
        ))}
      </div>
      {/* Requirements list */}
      <ul className="space-y-0.5">
        {rules.map((rule) => {
          const ok = rule.test(password)
          return (
            <li
              key={rule.key}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                ok ? 'text-green-500' : 'text-muted-foreground'
              )}
            >
              {ok ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function RegisterForm({ onSwitchToLogin }: Props) {
  const { t } = useTranslation()
  const { register: registerUser } = useAuth()
  const schema = useMemo(() => createRegisterSchema(validationMessages(t)), [t])
  const [passwordValue, setPasswordValue] = useState('')

  const passwordRules: PasswordRule[] = useMemo(
    () => [
      { key: 'length', label: t('validation.minChars', { n: 8 }), test: (v) => v.length >= 8 },
      { key: 'upper', label: t('validation.passwordUppercase'), test: (v) => /[A-Z]/.test(v) },
      { key: 'lower', label: t('validation.passwordLowercase'), test: (v) => /[a-z]/.test(v) },
      { key: 'number', label: t('validation.passwordNumber'), test: (v) => /[0-9]/.test(v) },
    ],
    [t]
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
  })

  const aliasValue = watch('alias') ?? ''

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('alias', e.target.value.toLowerCase(), { shouldValidate: true })
  }

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const locale = detectLocale()
      await registerUser(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.alias,
        locale
      )
      toast({
        title: t('auth.registerPendingTitle'),
        description: t('auth.registerPendingDesc'),
      })
      onSwitchToLogin()
    } catch (err) {
      toast({
        title: t('auth.registerError'),
        description: (err as Error).message || t('auth.registerErrorDesc'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 dark:bg-primary/30">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('auth.registerTitle')}</CardTitle>
          <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                <Input id="firstName" placeholder="Juan" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="middleName">{t('auth.middleName')}</Label>
                <Input id="middleName" placeholder="Carlos" {...register('middleName')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                <Input id="lastName" placeholder="García" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="secondLastName">{t('auth.secondLastName')}</Label>
                <Input id="secondLastName" placeholder="López" {...register('secondLastName')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alias">{t('auth.alias')}</Label>
              <div className="relative">
                <AtSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="alias"
                  placeholder="tu_alias"
                  className="pl-8"
                  value={aliasValue}
                  onChange={handleAliasChange}
                />
              </div>
              {errors.alias ? (
                <p className="text-xs text-destructive">{errors.alias.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{t('auth.aliasHint')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t('auth.emailRequired')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t('auth.passwordRequired')}</Label>
              <PasswordInput
                id="password"
                placeholder={t('auth.passwordPlaceholder')}
                {...register('password', {
                  onChange: (e) => setPasswordValue(e.target.value),
                })}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : (
                <PasswordStrength password={passwordValue} rules={passwordRules} />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder={t('auth.passwordPlaceholder')}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.creatingAccount')}
                </>
              ) : (
                t('auth.createAccount')
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <button onClick={onSwitchToLogin} className="text-primary hover:underline">
              {t('auth.signInLink')}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
