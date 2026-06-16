'use client'

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { CardDTO } from '@/core/dtos'

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
    <div className="group relative w-full" style={{ aspectRatio: '85.6/54' }}>
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-between rounded-2xl p-5 text-white shadow-lg',
          isCredit
            ? 'bg-gradient-to-br from-amber-500 to-amber-800 dark:from-amber-600 dark:to-amber-900'
            : 'bg-gradient-to-br from-stone-500 to-stone-800 dark:from-stone-700 dark:to-stone-900'
        )}
      >
        <div className="flex items-start justify-between">
          <CreditCard className="h-6 w-6 opacity-80" />
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider">
            {isCredit ? t('cards.credit') : t('cards.debit')}
          </span>
        </div>

        <div className="font-mono text-sm tracking-widest opacity-90">
          •••• •••• •••• {card.lastFour}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xs uppercase tracking-wide opacity-60">{t('cards.cardName')}</p>
            <p className="text-sm font-semibold">{card.name}</p>
          </div>
          {card.expiryDate && (
            <div className="text-right">
              <p className="text-2xs uppercase tracking-wide opacity-60">{t('cards.expires')}</p>
              {/* Slash preserved as-is — do not sanitize */}
              <p className="font-mono text-sm">{card.expiryDate}</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <EditCardModal card={card} onSave={onEdit} />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-black/20 text-white hover:bg-black/40 hover:text-white"
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="w-full animate-pulse rounded-2xl bg-muted"
              style={{ aspectRatio: '85.6/54' }}
            />
          ))}
        </div>
      ) : (
        <>
          {cards.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">{t('cards.noCards')}</p>
              <p className="text-sm text-muted-foreground">{t('cards.addFirstCard')}</p>
            </div>
          )}

          {cards.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
