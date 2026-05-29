'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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

const schema = z.object({
  description: z.string().min(2),
  amount: z.coerce.number().positive(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onAdd: (description: string, amount: number) => Promise<void>
}

export function AddIncomeModal({ onAdd }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    await onAdd(data.description, data.amount)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          {t('addIncome.triggerLabel')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addIncome.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inc-desc">{t('addIncome.concept')}</Label>
            <Input
              id="inc-desc"
              placeholder={t('addIncome.conceptPlaceholder')}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{t('addIncome.minChars')}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inc-amount">{t('addIncome.amount')}</Label>
            <Input
              id="inc-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{t('addIncome.positiveAmount')}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('addIncome.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('addIncome.adding')}
                </>
              ) : (
                t('addIncome.add')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
