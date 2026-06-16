'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { dailyExpenseSchema, type DailyExpenseFormValues } from '../schemas/transactionSchemas'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { MonthFilter, QuincenaType } from '@/core/types'

interface Props {
  filter: MonthFilter & { quincena: QuincenaType }
  onAdd: (
    description: string,
    amount: number,
    category: DailyExpenseFormValues['category'],
    filter: MonthFilter & { quincena: QuincenaType }
  ) => Promise<void>
}

export function AddDailyExpenseModal({ filter, onAdd }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DailyExpenseFormValues>({
    resolver: zodResolver(dailyExpenseSchema),
    defaultValues: { category: 'otros' },
  })

  const onSubmit = async (data: DailyExpenseFormValues) => {
    await onAdd(data.description, data.amount, data.category, filter)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {t('addDaily.triggerLabel')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addDaily.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('common.dialogForm')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">{t('addDaily.description')}</Label>
            <Input
              id="description"
              placeholder={t('addDaily.descriptionPlaceholder')}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">{t('addDaily.amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{t('addDaily.category')}</Label>
            <Select
              defaultValue="otros"
              onValueChange={(v) => setValue('category', v as DailyExpenseFormValues['category'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORY_LABELS).map((k) => (
                  <SelectItem key={k} value={k}>
                    {t(`categories.${k}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('addDaily.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('addDaily.saving')}
                </>
              ) : (
                t('addDaily.add')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
