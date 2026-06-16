'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2, CreditCard, Paperclip, X, PartyPopper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  createAddTransactionSchema,
  type AddTransactionFormValues,
} from '../schemas/transactionSchemas'
import { validationMessages } from '@/i18n/validation'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CATEGORY_LABELS, cn } from '@/lib/utils'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import type { CardDTO, BudgetEventDTO } from '@/core/dtos'

interface Props {
  filter: MonthFilter & { quincena: QuincenaFilter }
  cards?: CardDTO[]
  events?: BudgetEventDTO[]
  defaultEventId?: string | null
  onAdd: (
    mode: 'income' | 'egreso',
    description: string,
    amount: number,
    category: AddTransactionFormValues['category'],
    isCC: boolean,
    receipt: File | null,
    filter: MonthFilter & { quincena: QuincenaFilter },
    cardId?: string | null,
    eventId?: string | null
  ) => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddTransactionModal({
  filter,
  cards,
  events,
  defaultEventId,
  onAdd,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen! : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen
  const [mode, setMode] = useState<'income' | 'egreso'>('egreso')
  const [receipt, setReceipt] = useState<File | null>(null)
  const schema = useMemo(() => createAddTransactionSchema(validationMessages(t)), [t])
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'egreso', category: 'otros', cardId: null, eventId: null },
  })

  const cardId = watch('cardId')
  const eventId = watch('eventId')

  const allCards = cards ?? []
  const debitCards = allCards.filter((c) => c.type === 'DEBIT')
  const creditCards = allCards.filter((c) => c.type === 'CREDIT')
  const selectedCard = allCards.find((c) => c.id === cardId)
  const activeEvents = events?.filter((e) => e.status === 'ACTIVE') ?? []

  useEffect(() => {
    if (open) {
      setValue('eventId', defaultEventId ?? null)
    } else {
      reset({ mode: 'egreso', category: 'otros', cardId: null, eventId: null })
      setReceipt(null)
      setMode('egreso')
    }
  }, [open, defaultEventId, setValue, reset])

  const handleModeSwitch = (m: 'income' | 'egreso') => {
    setMode(m)
    setValue('mode', m)
  }

  const onSubmit = async (data: AddTransactionFormValues) => {
    const selectedCardForSubmit = allCards.find((c) => c.id === data.cardId)
    const isCC = selectedCardForSubmit !== undefined && selectedCardForSubmit.type === 'CREDIT'
    await onAdd(
      mode,
      data.description,
      data.amount,
      data.category,
      isCC,
      receipt,
      filter,
      data.cardId ?? null,
      mode === 'egreso' ? (data.eventId ?? null) : null
    )
    reset({ mode: 'egreso', category: 'otros', cardId: null, eventId: null })
    setReceipt(null)
    setMode('egreso')
    setOpen(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return
    setReceipt(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addTransaction.triggerLabel')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addTransaction.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t('common.dialogForm')}</DialogDescription>
        </DialogHeader>

        <div className="flex w-fit rounded-lg border border-border p-0.5">
          {(['egreso', 'income'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeSwitch(m)}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                mode === m
                  ? m === 'income'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'income' ? t('addTransaction.income') : t('addTransaction.expense')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('mode')} />

          <div className="space-y-1.5">
            <Label htmlFor="at-description">{t('addTransaction.description')}</Label>
            <Input
              id="at-description"
              placeholder={
                mode === 'income'
                  ? t('addTransaction.descriptionIncPlaceholder')
                  : t('addTransaction.descriptionExpPlaceholder')
              }
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="at-amount">{t('addTransaction.amount')}</Label>
            <Input
              id="at-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {mode === 'egreso' && (
            <>
              <div className="space-y-1.5">
                <Label>{t('addTransaction.category')}</Label>
                <Select
                  defaultValue="otros"
                  onValueChange={(v) =>
                    setValue('category', v as AddTransactionFormValues['category'])
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

              {activeEvents.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <PartyPopper className="h-3.5 w-3.5 text-muted-foreground" />
                    {t('addTransaction.linkToEvent')}
                  </Label>
                  <Select
                    value={eventId ?? '__none__'}
                    onValueChange={(v) => setValue('eventId', v === '__none__' ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('addTransaction.noEvent')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t('addTransaction.noEvent')}</SelectItem>
                      {activeEvents.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          <span className="flex items-center gap-1.5">
                            <PartyPopper className="h-3.5 w-3.5" />
                            {e.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                        ? t('addTransaction.ccHint')
                        : t('addTransaction.debitHint')}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="space-y-1.5">
            <Label>{t('addTransaction.receipt')}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="h-3.5 w-3.5" />
                {receipt
                  ? receipt.name.slice(0, 20) + (receipt.name.length > 20 ? '…' : '')
                  : t('addTransaction.attachFile')}
              </Button>
              {receipt && (
                <button
                  type="button"
                  onClick={() => {
                    setReceipt(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFile}
            />
            <p className="text-xs text-muted-foreground">{t('addTransaction.fileFormats')}</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('addTransaction.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={mode === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('addTransaction.saving')}
                </>
              ) : mode === 'income' ? (
                t('addTransaction.addIncome')
              ) : (
                t('addTransaction.addExpense')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
