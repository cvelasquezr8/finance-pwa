'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, Loader2, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  scheduledExpenseSchema,
  type ScheduledExpenseFormValues,
} from '../schemas/transactionSchemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CATEGORY_LABELS, cn } from '@/lib/utils'
import type { MonthFilter, QuincenaFilter, QuincenaType } from '@/core/types'
import type { CardDTO } from '@/core/dtos'

interface Props {
  filter: MonthFilter & { quincena: QuincenaFilter }
  cards?: CardDTO[]
  onAdd: (dto: ScheduledExpenseFormValues, filter: MonthFilter) => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddScheduledExpenseModal({
  filter,
  cards,
  onAdd,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen! : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  const effectiveQuincena = filter.quincena === 'mensual' ? 'primera' : filter.quincena
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduledExpenseFormValues>({
    resolver: zodResolver(scheduledExpenseSchema),
    defaultValues: {
      category: 'otros',
      quincena: effectiveQuincena,
      dueDay: 1,
      isRecurring: false,
      cardId: null,
    },
  })

  const isRecurring = watch('isRecurring')
  const quincena = watch('quincena')
  const cardId = watch('cardId')
  const allCards = cards ?? []
  const debitCards = allCards.filter((c) => c.type === 'DEBIT')
  const creditCards = allCards.filter((c) => c.type === 'CREDIT')
  const selectedCard = allCards.find((c) => c.id === cardId)

  const onSubmit = async (data: ScheduledExpenseFormValues) => {
    const selectedCardForSubmit = allCards.find((c) => c.id === data.cardId)
    const derivedData: ScheduledExpenseFormValues = {
      ...data,
      isCC: selectedCardForSubmit !== undefined && selectedCardForSubmit.type === 'CREDIT',
    }
    await onAdd(derivedData, filter)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-violet-500/50 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            <CalendarClock className="h-4 w-4" />
            {t('addScheduled.triggerLabel')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addScheduled.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="s-description">{t('addScheduled.description')}</Label>
            <Input
              id="s-description"
              placeholder={t('addScheduled.descriptionPlaceholder')}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-amount">{t('addScheduled.amount')}</Label>
            <Input
              id="s-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('addScheduled.category')}</Label>
              <Select
                defaultValue="otros"
                onValueChange={(v) =>
                  setValue('category', v as ScheduledExpenseFormValues['category'])
                }
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

            <div className="space-y-1.5">
              <Label htmlFor="s-dueDay">{t('addScheduled.dueDay')}</Label>
              <Input
                id="s-dueDay"
                type="number"
                min={1}
                max={31}
                placeholder="1"
                {...register('dueDay')}
              />
              {errors.dueDay && <p className="text-xs text-destructive">{errors.dueDay.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('addScheduled.quincena')}</Label>
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
              id="s-recurring"
              checked={isRecurring}
              onCheckedChange={(v) => setValue('isRecurring', Boolean(v))}
            />
            <Label htmlFor="s-recurring" className="cursor-pointer font-normal">
              {t('addScheduled.recurring')}
            </Label>
          </div>

          {allCards.length > 0 && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                {t('cards.selectCard')}
              </Label>
              <Select
                value={cardId ?? '__none__'}
                onValueChange={(v) => setValue('cardId', v === '__none__' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('cards.noCardLinked')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('cards.noCardLinked')}</SelectItem>
                  {debitCards.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>{t('cards.debit')}</SelectLabel>
                      {debitCards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5" />
                            {c.name} ···{c.lastFour}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {creditCards.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>{t('cards.credit')}</SelectLabel>
                      {creditCards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5" />
                            {c.name} ···{c.lastFour}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              {selectedCard && (
                <p
                  className={cn(
                    'text-xs',
                    selectedCard.type === 'CREDIT'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {selectedCard.type === 'CREDIT'
                    ? t('addScheduled.ccHint')
                    : t('addScheduled.debitHint')}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('addScheduled.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('addScheduled.saving')}
                </>
              ) : (
                t('addScheduled.add')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
