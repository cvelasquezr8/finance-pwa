'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { InviteUserDTO } from '@/core/dtos'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  alias: z.string().min(2, 'Mínimo 2 caracteres'),
  role: z.enum(['USER', 'ADMIN']),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onInvite: (dto: InviteUserDTO) => Promise<unknown>
}

export function InviteUserModal({ onInvite }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: 'USER' } })

  const onSubmit = async (data: FormValues) => {
    try {
      await onInvite(data)
      toast({ title: t('admin.inviteSent') })
      reset({ role: 'USER' })
      setOpen(false)
    } catch (e) {
      toast({ title: (e as Error).message ?? t('admin.inviteError'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('admin.invite')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.inviteTitle')}</DialogTitle>
          <DialogDescription>{t('admin.inviteSubtitle')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">{t('admin.columns.email')}</Label>
            <Input id="invite-email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="invite-first">{t('profile.firstName')}</Label>
              <Input id="invite-first" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-last">{t('profile.lastName')}</Label>
              <Input id="invite-last" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-alias">{t('admin.columns.alias')}</Label>
            <Input id="invite-alias" {...register('alias')} />
            {errors.alias && <p className="text-xs text-destructive">{errors.alias.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{t('admin.columns.role')}</Label>
            <Select
              value={watch('role')}
              onValueChange={(v) => setValue('role', v as FormValues['role'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('admin.inviteCta')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
