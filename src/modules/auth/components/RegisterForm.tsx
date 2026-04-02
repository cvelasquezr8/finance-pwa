import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TrendingUp, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

interface Props {
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: Props) {
  const { t } = useTranslation()
  const { register: registerUser } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data.firstName, data.lastName, data.email, data.password)
    } catch {
      toast({ title: t('auth.registerError'), description: t('auth.registerErrorDesc'), variant: 'destructive' })
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
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
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
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="secondLastName">{t('auth.secondLastName')}</Label>
                <Input id="secondLastName" placeholder="López" {...register('secondLastName')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('auth.emailRequired')}</Label>
              <Input id="email" type="email" placeholder={t('auth.emailPlaceholder')} {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('auth.passwordRequired')}</Label>
              <Input id="password" type="password" placeholder={t('auth.passwordPlaceholder')} {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input id="confirmPassword" type="password" placeholder={t('auth.passwordPlaceholder')} {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('auth.creatingAccount')}</> : t('auth.createAccount')}
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
