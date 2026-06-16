'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus, AtSign } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  createInviteParticipantSchema,
  type InviteParticipantFormValues,
} from '../schemas/eventSchemas'
import { validationMessages } from '@/i18n/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { InviteParticipantDTO } from '@/core/dtos'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  usedPct: number
  onInvite: (dto: InviteParticipantDTO) => Promise<void>
}

export function InviteParticipantModal({ open, onOpenChange, eventId, usedPct, onInvite }: Props) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const remaining = Math.max(0, 100 - usedPct)
  const schema = useMemo(() => createInviteParticipantSchema(validationMessages(t)), [t])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteParticipantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { assignedPct: remaining },
  })

  const aliasValue = watch('alias') ?? ''

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value
    if (v && !v.startsWith('@')) v = `@${v}`
    setValue('alias', v.toLowerCase(), { shouldValidate: true })
  }

  const onSubmit = async (data: InviteParticipantFormValues) => {
    setIsSubmitting(true)
    try {
      await onInvite({ eventId, alias: data.alias, assignedPct: data.assignedPct })
      reset()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {t('events.inviteAlias')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('common.dialogForm')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inv-alias">{t('events.aliasPlaceholder')}</Label>
            <div className="relative">
              <AtSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="inv-alias"
                placeholder="@alias"
                className="pl-8"
                value={aliasValue}
                onChange={handleAliasChange}
              />
            </div>
            {errors.alias && <p className="text-xs text-destructive">{errors.alias.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-pct">{t('events.assignedPct')}</Label>
            <Input id="inv-pct" type="number" min={1} max={100} {...register('assignedPct')} />
            <p className="text-xs text-muted-foreground">
              {t('events.remainingPct', { pct: remaining })}
            </p>
            {errors.assignedPct && (
              <p className="text-xs text-destructive">{errors.assignedPct.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('events.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('events.sending')}
                </>
              ) : (
                t('events.invite')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
