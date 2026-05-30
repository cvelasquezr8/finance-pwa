# Card Selection Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `isCC` checkbox + credit-only card selector in both transaction modals with a single unified card selector that shows all cards (debit and credit) grouped, deriving `isCC` automatically from the selected card's type.

**Architecture:** `isCC` is no longer a user-controlled form field — it becomes a value derived at submit time from `selectedCard.type === 'CREDIT'`. The `onAdd` signatures are unchanged; only the modal internals change. `addTransactionSchema` loses its `isCC` field; `scheduledExpenseSchema` keeps it (the DTO flows through unchanged, but its value is overridden at submit time).

**Tech Stack:** React Hook Form, Zod, Shadcn/UI (`SelectGroup`, `SelectLabel` — already exported from `src/components/ui/select.tsx`), i18next, TypeScript.

---

## File Map

| File | Change |
|------|--------|
| `src/i18n/locales/es.json` | Add `addTransaction.debitHint`, `addScheduled.debitHint` |
| `src/i18n/locales/en.json` | Add same keys in English |
| `src/modules/transactions/schemas/transactionSchemas.ts` | Remove `isCC` from `addTransactionSchema` |
| `src/modules/transactions/components/AddTransactionModal.tsx` | Replace checkbox + credit select with grouped unified select |
| `src/modules/transactions/components/AddScheduledExpenseModal.tsx` | Same replacement |

---

## Task 1: Add i18n Keys

**Files:**
- Modify: `src/i18n/locales/es.json`
- Modify: `src/i18n/locales/en.json`

- [ ] **Add `debitHint` keys to `es.json`**

Open `src/i18n/locales/es.json`. Inside the `"addTransaction"` object, add after the `"ccHint"` line:

```json
"debitHint": "El saldo se descontará de inmediato"
```

Inside the `"addScheduled"` object, add after the `"ccHint"` line:

```json
"debitHint": "El saldo se descontará de inmediato"
```

- [ ] **Add `debitHint` keys to `en.json`**

Open `src/i18n/locales/en.json`. Inside `"addTransaction"`, add after `"ccHint"`:

```json
"debitHint": "Balance will be deducted immediately"
```

Inside `"addScheduled"`, add after `"ccHint"`:

```json
"debitHint": "Balance will be deducted immediately"
```

- [ ] **Verify keys exist**

```bash
node -e "const es=require('./src/i18n/locales/es.json'); console.log(es.addTransaction.debitHint, es.addScheduled.debitHint)"
```

Expected output:
```
El saldo se descontará de inmediato El saldo se descontará de inmediato
```

- [ ] **Commit**

```bash
git add src/i18n/locales/es.json src/i18n/locales/en.json
git commit -m "feat(i18n): add debitHint key for unified card selector"
```

---

## Task 2: Remove `isCC` from `addTransactionSchema`

**Files:**
- Modify: `src/modules/transactions/schemas/transactionSchemas.ts`

> **Context:** `addTransactionSchema` currently has `isCC: z.boolean().default(false)`. Since the modal now derives `isCC` from the selected card type at submit time (not from a user checkbox), the field is no longer a form-controlled value and should be removed from the schema. `scheduledExpenseSchema` keeps its `isCC` field because `onAdd` receives the entire DTO object and the field is overridden in `onSubmit`.

- [ ] **Remove `isCC` from `addTransactionSchema`**

In `src/modules/transactions/schemas/transactionSchemas.ts`, change `addTransactionSchema` from:

```ts
export const addTransactionSchema = z.object({
  mode: z.enum(['income', 'egreso']),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  category: categoryEnum.optional(),
  isCC: z.boolean().default(false),
  cardId: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
})
```

To:

```ts
export const addTransactionSchema = z.object({
  mode: z.enum(['income', 'egreso']),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  category: categoryEnum.optional(),
  cardId: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
})
```

- [ ] **Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: errors about `isCC` in `AddTransactionModal.tsx` — those get fixed in Task 3. If the only errors are in that file, proceed.

- [ ] **Commit**

```bash
git add src/modules/transactions/schemas/transactionSchemas.ts
git commit -m "feat(schema): remove isCC from addTransactionSchema — derived at submit time"
```

---

## Task 3: Rewrite `AddTransactionModal` Card Selection

**Files:**
- Modify: `src/modules/transactions/components/AddTransactionModal.tsx`

> **Context:** The modal currently has:
> 1. `const creditCards = cards?.filter((c) => c.type === 'CREDIT') ?? []` — filters out debit cards
> 2. `const isCC = watch('isCC')` — user-controlled checkbox
> 3. An `isCC` checkbox block (~lines 244–266)
> 4. An `isCC && creditCards.length > 0` conditional card select (~lines 268–291)
>
> All four are replaced by a single grouped `<Select>` showing all cards.
> `isCC` is derived in `onSubmit` from `cards?.find(c => c.id === data.cardId)?.type === 'CREDIT'`.

- [ ] **Replace the entire file with the updated version**

Write `src/modules/transactions/components/AddTransactionModal.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2, CreditCard, Paperclip, X, PartyPopper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { addTransactionSchema, type AddTransactionFormValues } from '../schemas/transactionSchemas'
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
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTransactionFormValues>({
    resolver: zodResolver(addTransactionSchema),
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
    const isCC = selectedCardForSubmit?.type === 'CREDIT' ?? false
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
```

- [ ] **Verify TypeScript compiles with 0 errors**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Commit**

```bash
git add src/modules/transactions/components/AddTransactionModal.tsx
git commit -m "feat(ui): unified card selector in AddTransactionModal — debit + credit grouped, isCC derived"
```

---

## Task 4: Rewrite `AddScheduledExpenseModal` Card Selection

**Files:**
- Modify: `src/modules/transactions/components/AddScheduledExpenseModal.tsx`

> **Context:** Same pattern as AddTransactionModal. The key difference: `onAdd` receives the full `ScheduledExpenseFormValues` DTO which includes `isCC`. So instead of passing `isCC` as a separate argument, we derive it and merge it into `data` before calling `onAdd`. `scheduledExpenseSchema` keeps its `isCC` field unchanged.
>
> Current state to remove:
> - `const isCC = watch('isCC')` (line 78)
> - `const creditCards = cards?.filter((c) => c.type === 'CREDIT') ?? []` (line 80)
> - The `isCC` checkbox block (~lines 198–218)
> - The `isCC && creditCards.length > 0` card select block (~lines 219–240)
>
> The `isCC` field in `defaultValues` also changes to `false` only (it won't be touched by the form anymore).

- [ ] **Read the current file to find exact line numbers of the checkbox and card select blocks**

```bash
grep -n "isCC\|creditCards\|checkbox\|s-cc" src/modules/transactions/components/AddScheduledExpenseModal.tsx
```

- [ ] **Update `AddScheduledExpenseModal.tsx`**

Make these targeted changes (read file first, then apply):

**1. Update imports** — add `SelectGroup`, `SelectLabel` to the Select import and add `cn` to utils import:

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORY_LABELS, cn } from '@/lib/utils'
```

Remove `Checkbox` from imports (it's no longer used after removing the checkbox block):
```tsx
// Remove this line:
import { Checkbox } from '@/components/ui/checkbox'
```

**2. Remove from inside the component:**

```ts
// Remove these three lines:
const isCC = watch('isCC')
const cardId = watch('cardId')
const creditCards = cards?.filter((c) => c.type === 'CREDIT') ?? []
```

Replace with:
```ts
const cardId = watch('cardId')
const allCards = cards ?? []
const debitCards = allCards.filter((c) => c.type === 'DEBIT')
const creditCards = allCards.filter((c) => c.type === 'CREDIT')
const selectedCard = allCards.find((c) => c.id === cardId)
```

**3. Update `defaultValues`** — remove `isCC: false`:

```ts
defaultValues: {
  category: 'otros',
  quincena: effectiveQuincena,
  dueDay: 1,
  isRecurring: false,
  cardId: null,
},
```

**4. Update `onSubmit`** — derive `isCC` and merge into data:

```ts
const onSubmit = async (data: ScheduledExpenseFormValues) => {
  const selectedCardForSubmit = allCards.find((c) => c.id === data.cardId)
  const derivedData: ScheduledExpenseFormValues = {
    ...data,
    isCC: selectedCardForSubmit?.type === 'CREDIT' ?? false,
  }
  await onAdd(derivedData, filter)
  reset()
  setOpen(false)
}
```

**5. Remove the `isCC` checkbox block** — delete from the JSX the entire `<div className="flex items-start gap-2">` that contains the `id="s-cc"` checkbox and `addScheduled.ccHint`.

**6. Remove the `isCC && creditCards.length > 0` card select block** — delete the conditional card `<Select>` that follows the checkbox.

**7. Add the unified card selector** in the same location (after the recurring checkbox), inside the form JSX:

```tsx
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
```

- [ ] **Verify TypeScript compiles with 0 errors**

```bash
npx tsc --noEmit
```

Expected: 0 errors. If `Checkbox` import triggers an "unused import" warning, confirm it was removed.

- [ ] **Run the test suite**

```bash
npm test -- --run
```

Expected: same pass/fail as before this change (the `api-config` tests fail pre-existing; component tests should all pass).

- [ ] **Commit**

```bash
git add src/modules/transactions/components/AddScheduledExpenseModal.tsx
git commit -m "feat(ui): unified card selector in AddScheduledExpenseModal — debit + credit grouped, isCC derived"
```

---

## Self-Review Checklist

After all tasks complete:

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] Selecting a credit card in AddTransactionModal shows amber hint text
- [ ] Selecting a debit card shows muted hint text
- [ ] Selecting "Sin tarjeta" shows no hint
- [ ] `isCC` checkbox is gone from both modals
- [ ] Debit cards appear in the grouped selector
- [ ] Credit cards appear in the grouped selector
- [ ] Submitting with a credit card passes `isCC: true` to `onAdd`
- [ ] Submitting with a debit card passes `isCC: false` to `onAdd`
- [ ] Submitting with no card passes `isCC: false` to `onAdd`
- [ ] `addTransactionSchema` no longer has an `isCC` field
- [ ] `scheduledExpenseSchema` still has `isCC` (needed for the DTO)
