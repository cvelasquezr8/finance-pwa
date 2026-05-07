import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Loader2, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/lib/toast'

const CURRENCIES = ['MXN', 'USD', 'EUR', 'CAD', 'COP', 'ARS', 'CLP', 'PEN', 'BRL']
const TIMEZONES = [
  'America/Mexico_City',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Europe/Madrid',
]

const profileSchema = z.object({
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

type ProfileFormValues = z.infer<typeof profileSchema>

interface Props {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UserProfileModal({ trigger, open: controlledOpen, onOpenChange }: Props) {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      currency: 'MXN',
      timezone: 'America/Mexico_City',
      monthlyNotifications: false,
      language: 'es',
      theme: 'dark',
    },
  })

  const monthlyNotifications = watch('monthlyNotifications')

  useEffect(() => {
    if (user && open) {
      reset({
        firstName: user.firstName ?? user.name.split(' ')[0],
        lastName: user.lastName ?? '',
        middleName: user.middleName ?? '',
        secondLastName: user.secondLastName ?? '',
        phone: user.phone ?? '',
        currency: user.currency ?? 'MXN',
        timezone: user.timezone ?? 'America/Mexico_City',
        monthlyNotifications: user.monthlyNotifications ?? false,
        language: user.language ?? 'es',
        theme: user.theme ?? 'dark',
      })
      setAvatarPreview(user.avatarUrl ?? null)
    }
  }, [user, open, reset])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t('profile.imageTooBig'), variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: ProfileFormValues) => {
    await new Promise((r) => setTimeout(r, 400))
    updateUser({
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      secondLastName: data.secondLastName,
      phone: data.phone,
      currency: data.currency,
      timezone: data.timezone,
      monthlyNotifications: data.monthlyNotifications,
      language: data.language,
      theme: data.theme,
      name: `${data.firstName} ${data.lastName}`,
      ...(avatarPreview ? { avatarUrl: avatarPreview } : {}),
    })
    toast({ title: t('profile.saved') })
    setOpen(false)
  }

  const initials = user
    ? `${(user.firstName ?? user.name)[0]}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  const currentAvatar = user?.avatarUrl

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-1 transition-colors hover:bg-accent">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-semibold text-primary dark:bg-primary/30">
                {currentAvatar ? (
                  <img src={currentAvatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">{user?.firstName ?? user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('profile.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar */}
          <div className="flex justify-center py-2">
            <div className="group relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/15 ring-2 ring-border dark:bg-primary/30">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={t('profile.changePhoto')}
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {user?.alias && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                {t('profile.alias')}
              </Label>
              <div className="flex h-9 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                {user.alias}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-firstName">{t('profile.firstName')}</Label>
              <Input id="p-firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-xs text-destructive">{t('profile.minChars')}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-middleName">{t('profile.middleName')}</Label>
              <Input id="p-middleName" {...register('middleName')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-lastName">{t('profile.lastName')}</Label>
              <Input id="p-lastName" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-xs text-destructive">{t('profile.minChars')}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-secondLastName">{t('profile.secondLastName')}</Label>
              <Input id="p-secondLastName" {...register('secondLastName')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-phone">{t('profile.phone')}</Label>
            <Input
              id="p-phone"
              placeholder={t('profile.phonePlaceholder')}
              {...register('phone')}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              {t('profile.emailReadOnly')}
            </Label>
            <div className="flex h-9 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
              {user?.email}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('profile.currency')}</Label>
              <Select value={watch('currency')} onValueChange={(v) => setValue('currency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('profile.timezone')}</Label>
              <Select value={watch('timezone')} onValueChange={(v) => setValue('timezone', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace('America/', '').replace('Europe/', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('profile.language')}</Label>
              <Select
                value={watch('language')}
                onValueChange={(v) => setValue('language', v as 'es' | 'en')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">{t('profile.spanish')}</SelectItem>
                  <SelectItem value="en">{t('profile.english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('profile.theme')}</Label>
              <Select
                value={watch('theme')}
                onValueChange={(v) => setValue('theme', v as 'dark' | 'light')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">{t('profile.dark')}</SelectItem>
                  <SelectItem value="light">{t('profile.light')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="p-notifications"
              checked={!!monthlyNotifications}
              onCheckedChange={(v) => setValue('monthlyNotifications', Boolean(v))}
            />
            <Label htmlFor="p-notifications" className="cursor-pointer font-normal">
              {t('profile.notifications')}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('profile.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('profile.saving')}
                </>
              ) : (
                t('profile.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
