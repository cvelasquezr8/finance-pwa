import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckSquare2, Square, Plus, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { addShoppingItemSchema, type AddShoppingItemFormValues } from '../schemas/eventSchemas'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ShoppingItem } from '@/core/types'
import type { AddShoppingItemDTO, ToggleShoppingItemDTO } from '@/core/dtos'

interface Props {
  items: ShoppingItem[]
  eventId: string
  onAddItem: (dto: AddShoppingItemDTO) => Promise<void>
  onToggleItem: (dto: ToggleShoppingItemDTO) => Promise<void>
  participantAliases?: Record<string, string>
}

export function ShoppingList({
  items,
  eventId,
  onAddItem,
  onToggleItem,
  participantAliases = {},
}: Props) {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddShoppingItemFormValues>({
    resolver: zodResolver(addShoppingItemSchema),
  })

  const onSubmit = async (data: AddShoppingItemFormValues) => {
    await onAddItem({
      eventId,
      name: data.name,
      estimatedCost: data.estimatedCost ? Number(data.estimatedCost) : undefined,
    })
    reset()
    setShowForm(false)
  }

  const handleToggle = async (item: ShoppingItem) => {
    setToggling(item.id)
    try {
      await onToggleItem({ eventId, itemId: item.id, bought: !item.bought })
    } finally {
      setToggling(null)
    }
  }

  const fmt = (n?: number) =>
    n != null
      ? new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0,
        }).format(n)
      : null

  return (
    <div className="space-y-3">
      {items.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">{t('events.noItems')}</p>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'flex items-center gap-3 rounded-lg border border-border bg-card/50 px-3 py-2',
            item.bought && 'opacity-60'
          )}
        >
          <button
            onClick={() => handleToggle(item)}
            disabled={toggling === item.id}
            className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
          >
            {toggling === item.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : item.bought ? (
              <CheckSquare2 className="h-4 w-4 text-success" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className={cn('text-sm', item.bought && 'text-muted-foreground line-through')}>
              {item.name}
            </p>
            {item.boughtBy && (
              <p className="text-xs text-muted-foreground">
                {t('events.boughtBy', {
                  alias: participantAliases[item.boughtBy] ?? item.boughtBy,
                })}
              </p>
            )}
          </div>
          {item.estimatedCost != null && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {fmt(item.estimatedCost)}
            </span>
          )}
        </div>
      ))}

      {showForm ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 rounded-lg border border-dashed border-border p-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="item-name" className="text-xs">
                {t('events.itemName')}
              </Label>
              <Input
                id="item-name"
                placeholder={t('events.itemNamePlaceholder')}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="item-cost" className="text-xs">
                {t('events.estimatedCost')}
              </Label>
              <Input
                id="item-cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('estimatedCost')}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                t('events.addItem')
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                reset()
                setShowForm(false)
              }}
            >
              {t('events.cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          {t('events.addItem')}
        </button>
      )}
    </div>
  )
}
