import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, Loader2, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { scheduledExpenseSchema, type ScheduledExpenseFormValues } from '../schemas/transactionSchemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { CATEGORY_LABELS } from '@/lib/utils'
import type { MonthFilter, QuincenaFilter, QuincenaType } from '@/core/types'

interface Props {
  filter: MonthFilter & { quincena: QuincenaFilter }
  onAdd: (dto: ScheduledExpenseFormValues, filter: MonthFilter) => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddScheduledExpenseModal({ filter, onAdd, open: controlledOpen, onOpenChange }: Props) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen! : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  const effectiveQuincena = filter.quincena === 'mensual' ? 'primera' : filter.quincena
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ScheduledExpenseFormValues>({
    resolver: zodResolver(scheduledExpenseSchema),
    defaultValues: {
      category: 'otros',
      quincena: effectiveQuincena,
      dueDay: 1,
      isRecurring: false,
      isCC: false,
    },
  })

  const isRecurring = watch('isRecurring')
  const quincena = watch('quincena')
  const isCC = watch('isCC')

  const onSubmit = async (data: ScheduledExpenseFormValues) => {
    await onAdd(data, filter)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 border-violet-500/50 bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 hover:text-violet-700 dark:hover:text-violet-300">
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
            <Input id="s-description" placeholder={t('addScheduled.descriptionPlaceholder')} {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-amount">{t('addScheduled.amount')}</Label>
            <Input id="s-amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('addScheduled.category')}</Label>
              <Select defaultValue="otros" onValueChange={(v) => setValue('category', v as ScheduledExpenseFormValues['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(CATEGORY_LABELS).map((k) => (
                    <SelectItem key={k} value={k}>{t(`categories.${k}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-dueDay">{t('addScheduled.dueDay')}</Label>
              <Input id="s-dueDay" type="number" min={1} max={31} placeholder="1" {...register('dueDay')} />
              {errors.dueDay && <p className="text-xs text-destructive">{errors.dueDay.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('addScheduled.quincena')}</Label>
            <div className="flex rounded-lg border border-border p-0.5 w-fit">
              {(['primera', 'segunda'] as QuincenaType[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setValue('quincena', q)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    quincena === q ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
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

          <div className="flex items-start gap-2">
            <Checkbox
              id="s-cc"
              checked={!!isCC}
              onCheckedChange={(v) => setValue('isCC', Boolean(v))}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="s-cc" className="cursor-pointer font-normal flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                {t('addScheduled.cc')}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">{t('addScheduled.ccHint')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('addScheduled.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('addScheduled.saving')}</>
                : t('addScheduled.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
