import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, Plus, Trash2, Loader2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cardSchema, type CardFormValues } from '../schemas/cardSchemas'
import { useCards } from '../hooks/useCards'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { CardDTO } from '@/core/dtos'

const TYPE_STYLES: Record<CardDTO['type'], string> = {
  CREDIT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  DEBIT: 'bg-primary/15 text-primary',
}

// ─── Edit Card Modal ──────────────────────────────────────────────────────────

function EditCardModal({
  card,
  onSave,
}: {
  card: CardDTO
  onSave: (id: string, values: Partial<CardFormValues>) => Promise<void>
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { name: card.name, lastFour: card.lastFour, type: card.type },
  })

  const type = watch('type')

  const onOpen = (v: boolean) => {
    if (v) reset({ name: card.name, lastFour: card.lastFour, type: card.type })
    setOpen(v)
  }

  const onSubmit = async (data: CardFormValues) => {
    await onSave(card.id, data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-amber-500"
          aria-label={t('cards.edit')}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('cards.editCard')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-card-name">{t('cards.name')}</Label>
            <Input
              id="edit-card-name"
              placeholder={t('cards.namePlaceholder')}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{t('cards.minChars')}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-card-last-four">{t('cards.lastFour')}</Label>
            <Input
              id="edit-card-last-four"
              placeholder={t('cards.lastFourPlaceholder')}
              maxLength={4}
              inputMode="numeric"
              {...register('lastFour')}
            />
            {errors.lastFour && (
              <p className="text-xs text-destructive">{t('cards.lastFourError')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{t('cards.type')}</Label>
            <Select
              value={type}
              onValueChange={(v) => setValue('type', v as CardFormValues['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREDIT">{t('cards.credit')}</SelectItem>
                <SelectItem value="DEBIT">{t('cards.debit')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cards.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('cards.saving')}
                </>
              ) : (
                t('cards.save')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Card Item ────────────────────────────────────────────────────────────────

function CardItem({
  card,
  onDelete,
  onEdit,
}: {
  card: CardDTO
  onDelete: () => void
  onEdit: (id: string, values: Partial<CardFormValues>) => Promise<void>
}) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{card.name}</p>
          <p className="text-xs text-muted-foreground">···· ···· ···· {card.lastFour}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            TYPE_STYLES[card.type]
          )}
        >
          {card.type === 'CREDIT' ? t('cards.creditBadge') : t('cards.debitBadge')}
        </span>
        <EditCardModal card={card} onSave={onEdit} />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          aria-label={t('cards.delete')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Add Card Dialog ──────────────────────────────────────────────────────────

function AddCardDialog({ onAdd }: { onAdd: (values: CardFormValues) => Promise<void> }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { type: 'CREDIT' },
  })

  const type = watch('type')

  const onSubmit = async (data: CardFormValues) => {
    await onAdd(data)
    reset({ type: 'CREDIT' })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t('cards.addCard')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('cards.addCard')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="card-name">{t('cards.name')}</Label>
            <Input id="card-name" placeholder={t('cards.namePlaceholder')} {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="card-last-four">{t('cards.lastFour')}</Label>
            <Input
              id="card-last-four"
              placeholder={t('cards.lastFourPlaceholder')}
              maxLength={4}
              inputMode="numeric"
              {...register('lastFour')}
            />
            {errors.lastFour && (
              <p className="text-xs text-destructive">{t('cards.lastFourError')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{t('cards.type')}</Label>
            <Select
              value={type}
              onValueChange={(v) => setValue('type', v as CardFormValues['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREDIT">{t('cards.credit')}</SelectItem>
                <SelectItem value="DEBIT">{t('cards.debit')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cards.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('cards.adding')}
                </>
              ) : (
                t('cards.addButton')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MyCardsPage() {
  const { t } = useTranslation()
  const { cards, isLoading, addCard, removeCard, updateCard } = useCards()

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{t('cards.title')}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('cards.subtitle')}</p>
        </div>
        <AddCardDialog
          onAdd={async (values) => {
            await addCard(values)
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-muted" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <CreditCard className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t('cards.noCards')}</p>
          <p className="mt-1 text-xs text-muted-foreground/60">{t('cards.addCard')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onDelete={() => removeCard(card.id)}
              onEdit={async (id, values) => {
                await updateCard(id, values)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
