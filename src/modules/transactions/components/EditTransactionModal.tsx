'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { CATEGORY_LABELS } from '@/lib/utils'
import {
  editTransactionSchema,
  type EditTransactionFormValues,
} from '@/modules/transactions/schemas/transactionSchemas'
import type { TransactionResponseDTO, UpdateTransactionDTO, CardDTO } from '@/core/dtos'
import type { QuincenaType } from '@/core/types'

type EditFormValues = EditTransactionFormValues

interface Props {
  transaction: TransactionResponseDTO | null
  cards?: CardDTO[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, dto: UpdateTransactionDTO) => Promise<unknown>
}

export function EditTransactionModal({ transaction, cards, open, onOpenChange, onSave }: Props) {
  const { t } = useTranslation()
  const isScheduled = transaction?.type === 'scheduled'
  const creditCards = cards?.filter((c) => c.type === 'CREDIT') ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editTransactionSchema),
  })

  const quincena = watch('quincena')
  const isRecurring = watch('isRecurring')
  const isCC = watch('isCC')
  const cardId = watch('cardId')

  useEffect(() => {
    if (!transaction) return
    reset({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      dueDay: transaction.dueDay,
      quincena: transaction.quincena,
      isRecurring: transaction.isRecurring,
      isCC: transaction.isCC ?? false,
      cardId: transaction.cardId ?? null,
    })
  }, [transaction, reset])

  const onSubmit = async (data: EditFormValues) => {
    if (!transaction) return
    await onSave(transaction.id, data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isScheduled ? t('editTransaction.titleScheduled') : t('editTransaction.titleDaily')}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('common.dialogForm')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="e-description">{t('editTransaction.description')}</Label>
            <Input id="e-description" {...register('description')} />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-amount">{t('editTransaction.amount')}</Label>
            <Input id="e-amount" type="number" step="0.01" {...register('amount')} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className={isScheduled ? 'grid grid-cols-2 gap-3' : ''}>
            <div className="space-y-1.5">
              <Label>{t('editTransaction.category')}</Label>
              <Select
                value={watch('category')}
                onValueChange={(v) => setValue('category', v as EditFormValues['category'])}
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

            {isScheduled && (
              <div className="space-y-1.5">
                <Label htmlFor="e-dueDay">{t('editTransaction.dueDay')}</Label>
                <Input id="e-dueDay" type="number" min={1} max={31} {...register('dueDay')} />
                {errors.dueDay && (
                  <p className="text-xs text-destructive">{errors.dueDay.message}</p>
                )}
              </div>
            )}
          </div>

          {isScheduled && (
            <>
              <div className="space-y-1.5">
                <Label>{t('editTransaction.quincena')}</Label>
                <div className="flex w-fit rounded-lg border border-border p-0.5">
                  {(['primera', 'segunda'] as QuincenaType[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setValue('quincena', q)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        quincena === q
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {q === 'primera' ? t('quincena.primeraRange') : t('quincena.segundaRange')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="e-recurring"
                  checked={!!isRecurring}
                  onCheckedChange={(v) => setValue('isRecurring', Boolean(v))}
                />
                <Label htmlFor="e-recurring" className="cursor-pointer font-normal">
                  {t('editTransaction.recurring')}
                </Label>
              </div>
            </>
          )}

          {transaction?.type !== 'income' && (
            <>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="e-cc"
                  checked={!!isCC}
                  onCheckedChange={(v) => {
                    setValue('isCC', Boolean(v))
                    if (!v) setValue('cardId', null)
                  }}
                  className="mt-0.5"
                />
                <div>
                  <Label
                    htmlFor="e-cc"
                    className="flex cursor-pointer items-center gap-1.5 font-normal"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                    {t('editTransaction.cc')}
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t('editTransaction.ccHint')}
                  </p>
                </div>
              </div>

              {isCC && creditCards.length > 0 && (
                <div className="space-y-1.5">
                  <Label>{t('cards.selectCard')}</Label>
                  <Select
                    value={cardId ?? '__none__'}
                    onValueChange={(v) => setValue('cardId', v === '__none__' ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('cards.noCardLinked')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t('cards.noCardLinked')}</SelectItem>
                      {creditCards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5" />
                            {c.name} ···{c.lastFour}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('editTransaction.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('editTransaction.saving')}
                </>
              ) : (
                t('editTransaction.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
