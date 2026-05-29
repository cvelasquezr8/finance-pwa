'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  adjustBalanceSchema,
  type AdjustBalanceFormValues,
} from '@/modules/transactions/schemas/transactionSchemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

interface Props {
  currentBalance: number
  onAdjust: (newBalance: number, reason: string) => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BalanceAdjustmentModal({
  currentBalance,
  onAdjust,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen! : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdjustBalanceFormValues>({
    resolver: zodResolver(adjustBalanceSchema),
    defaultValues: { newBalance: currentBalance, reason: '' },
  })

  const onSubmit = async (data: AdjustBalanceFormValues) => {
    await onAdjust(data.newBalance, data.reason)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {t('adjustBalance.triggerLabel')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('adjustBalance.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newBalance">{t('adjustBalance.newBalance')}</Label>
            <Input
              id="newBalance"
              type="number"
              step="0.01"
              placeholder="15000.00"
              {...register('newBalance')}
            />
            {errors.newBalance && (
              <p className="text-xs text-destructive">{errors.newBalance.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">{t('adjustBalance.reason')}</Label>
            <Input
              id="reason"
              placeholder={t('adjustBalance.reasonPlaceholder')}
              {...register('reason')}
            />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('adjustBalance.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('adjustBalance.saving')}
                </>
              ) : (
                t('adjustBalance.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
