'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, Plus, Trash2, Loader2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createCardSchema, type CardFormValues } from '../schemas/cardSchemas'
import { validationMessages } from '@/i18n/validation'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { CardDTO } from '@/core/dtos'

// ─── Card Chip Visual ─────────────────────────────────────────────────────────

function CardChip() {
  return (
    <div className="relative h-7 w-10 overflow-hidden rounded-sm bg-amber-300/90 shadow-inner dark:bg-amber-400/80">
      <div className="absolute inset-x-0 top-[33%] h-px bg-amber-700/30" />
      <div className="absolute inset-x-0 top-[66%] h-px bg-amber-700/30" />
      <div className="absolute inset-y-0 left-[33%] w-px bg-amber-700/30" />
      <div className="absolute inset-y-0 left-[66%] w-px bg-amber-700/30" />
    </div>
  )
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
  const schema = useMemo(() => createCardSchema(validationMessages(t)), [t])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(schema),
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
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          aria-label={t('cards.edit')}
        >
          <Pencil className="h-3 w-3" />
          <span className="hidden sm:inline">{t('cards.edit')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('cards.editCard')}</DialogTitle>
          <DialogDescription className="sr-only">{t('common.dialogForm')}</DialogDescription>
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

// ─── Card Tile ────────────────────────────────────────────────────────────────

function CardTile({
  card,
  onEdit,
  onDelete,
}: {
  card: CardDTO
  onEdit: (id: string, values: Partial<CardFormValues>) => Promise<void>
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const isCredit = card.type === 'CREDIT'

  return (
    <div className="flex flex-col gap-2">
      {/* Card face */}
      <div
        className={cn(
          'relative w-full cursor-default overflow-hidden rounded-2xl shadow-lg transition-transform duration-150 active:scale-[0.97]',
          isCredit
            ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-900 dark:from-amber-600 dark:via-amber-700 dark:to-amber-950'
            : 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800 dark:from-slate-600 dark:via-slate-700 dark:to-slate-900'
        )}
        style={{ aspectRatio: '85.6/54' }}
      >
        {/* Shine highlight */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5" />
        {/* Ambient glow top-left */}
        <div className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
          {/* Top row: chip + type badge */}
          <div className="flex items-start justify-between">
            <CardChip />
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm">
              {isCredit ? t('cards.credit') : t('cards.debit')}
            </span>
          </div>

          {/* Card number */}
          <div className="font-mono text-sm tracking-[0.2em] opacity-90 drop-shadow">
            •••• •••• •••• {card.lastFour}
          </div>

          {/* Bottom row: name + expiry */}
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest opacity-60">
                {t('cards.cardName')}
              </p>
              <p className="truncate text-sm font-semibold drop-shadow">{card.name}</p>
            </div>
            {card.expiryDate && (
              <div className="shrink-0 text-right">
                <p className="text-[9px] uppercase tracking-widest opacity-60">
                  {t('cards.expires')}
                </p>
                {/* Slash preserved as-is — do not sanitize */}
                <p className="font-mono text-sm">{card.expiryDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions bar — always visible (not hover-only) for touch accessibility */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-2 py-0.5">
        <div className="flex items-center gap-2 pl-1">
          <div
            className={cn('h-1.5 w-1.5 rounded-full', isCredit ? 'bg-amber-500' : 'bg-slate-400')}
          />
          <span className="font-mono text-xs text-muted-foreground">···· {card.lastFour}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <EditCardModal card={card} onSave={onEdit} />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            aria-label={t('cards.delete')}
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden sm:inline">{t('cards.delete')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Card Dialog ──────────────────────────────────────────────────────────

function AddCardDialog({ onAdd }: { onAdd: (values: CardFormValues) => Promise<void> }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const schema = useMemo(() => createCardSchema(validationMessages(t)), [t])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(schema),
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="border-l-2 border-primary pl-3 lg:border-0 lg:pl-0">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div
                className="w-full animate-pulse rounded-2xl bg-muted"
                style={{ aspectRatio: '85.6/54' }}
              />
              <div className="h-9 animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {cards.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-8 w-8 text-primary/70" />
              </div>
              <div>
                <p className="font-semibold">{t('cards.noCards')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('cards.addFirstCard')}</p>
              </div>
            </div>
          )}

          {cards.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {cards.map((card) => (
                <CardTile
                  key={card.id}
                  card={card}
                  onEdit={async (id, values) => {
                    await updateCard(id, values)
                  }}
                  onDelete={() => removeCard(card.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
