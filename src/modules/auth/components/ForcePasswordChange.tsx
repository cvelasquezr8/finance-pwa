'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { createChangePasswordSchema, type ChangePasswordFormValues } from '../schemas/authSchemas'
import { validationMessages } from '@/i18n/validation'
import { authService } from '@/services/AuthService'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Shown full-screen when the invited user must replace their temporary password. */
export function ForcePasswordChange() {
  const { t } = useTranslation()
  const { setPasswordChanged } = useAuth()
  const schema = useMemo(() => createChangePasswordSchema(validationMessages(t)), [t])
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword)
      toast({ title: t('auth.passwordChanged') })
      setPasswordChanged()
    } catch {
      toast({ title: t('auth.passwordChangeError'), variant: 'destructive' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 text-amber-500">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-medium">{t('auth.actionRequired')}</span>
          </div>
          <CardTitle>{t('auth.changePasswordTitle')}</CardTitle>
          <CardDescription>{t('auth.changePasswordSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">{t('auth.currentPassword')}</Label>
              <PasswordInput id="currentPassword" {...register('currentPassword')} />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
              <PasswordInput id="newPassword" {...register('newPassword')} />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <PasswordInput id="confirmPassword" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.changePasswordCta')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
