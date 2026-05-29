'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, PartyPopper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createEventSchema, type CreateEventFormValues } from '../schemas/eventSchemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { CreateEventDTO } from '@/core/dtos'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (dto: CreateEventDTO) => Promise<void>
}

export function CreateEventModal({ open, onOpenChange, onCreate }: Props) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
  })

  const onSubmit = async (data: CreateEventFormValues) => {
    setIsSubmitting(true)
    try {
      await onCreate({
        title: data.title,
        description: data.description || undefined,
        goalAmount: data.goalAmount,
        deadline: data.deadline || undefined,
      })
      reset()
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-amber-500" />
            {t('events.createEvent')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">{t('events.eventTitle')}</Label>
            <Input
              id="ev-title"
              placeholder={t('events.eventTitlePlaceholder')}
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-desc">{t('events.description')}</Label>
            <Input
              id="ev-desc"
              placeholder={t('events.descriptionPlaceholder')}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-goal">{t('events.goalAmount')}</Label>
              <Input
                id="ev-goal"
                type="number"
                step="0.01"
                placeholder="500.00"
                {...register('goalAmount')}
              />
              {errors.goalAmount && (
                <p className="text-xs text-destructive">{errors.goalAmount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-deadline">{t('events.deadline')}</Label>
              <Input id="ev-deadline" type="date" {...register('deadline')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('events.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('events.creating')}
                </>
              ) : (
                t('events.create')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
