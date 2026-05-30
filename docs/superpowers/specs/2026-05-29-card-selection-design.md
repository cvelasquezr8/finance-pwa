# Card Selection Redesign

**Date:** 2026-05-29
**Scope:** `AddTransactionModal` + `AddScheduledExpenseModal` only — no API, hook, or service changes.

## Problem

Debit cards (type `DEBIT`) exist in the system but are invisible in both transaction modals. The UI filters `cards` down to `creditCards` and hides the selector behind an `isCC` checkbox. Users cannot associate a debit card with a transaction.

## Business Rules

- **Credit card selected** → `isCC = true`, balance deferred (no immediate cash deduction)
- **Debit card selected** → `isCC = false`, balance deducted immediately; card ID saved for tracking/filtering
- **No card selected** → `isCC = false`, regular expense

`isCC` is an implementation detail derived from the selected card's type. Users should never need to understand or toggle it manually.

---

## Design

### UX: Unified Card Selector

Remove the `isCC` checkbox and the credit-only card `<Select>`. Replace with a single optional card field:

**Label:** `Pagar con tarjeta (opcional)`

**Select options:**
```
Sin tarjeta
── Débito ──────────────
💳 BBVA Débito  ···4521
── Crédito ─────────────
💳 Santander    ···1234
```

- `SelectSeparator` + `SelectLabel` Shadcn primitives provide the group headers
- If no debit cards exist, the `── Débito ──` group is omitted (and vice versa)
- If `cards` is empty or undefined, the entire field is hidden

**Contextual hint** below the select (replaces old `ccHint` text):
- Card selected, type CREDIT → amber info text: `"Este gasto no reducirá tu saldo inmediato"`
- Card selected, type DEBIT → muted text: `"El saldo se descontará de inmediato"`
- No card selected → hint hidden

### Data Flow

`isCC` becomes a **derived value computed at submit time**, not a user-controlled field:

```ts
const selectedCard = cards?.find((c) => c.id === data.cardId)
const isCC = selectedCard?.type === 'CREDIT' ?? false
```

The `onAdd` / `onSubmit` signatures are unchanged — `isCC` is still passed to parent hooks. Only the source changes: from checkbox → derived from card type.

---

## File Changes

### `src/modules/transactions/schemas/transactionSchemas.ts`

- **`addTransactionSchema`**: remove `isCC` field. It is no longer a user-controlled value; the modal computes it before calling `onAdd`.
- **`scheduledExpenseSchema`**: keep `isCC`. The `onAdd` callback for scheduled expenses receives the full `ScheduledExpenseFormValues` DTO (including `isCC`), so the field must remain for the type to be correct. It is overridden at submit time.

### `src/modules/transactions/components/AddTransactionModal.tsx`

Remove:
- `const creditCards = cards?.filter((c) => c.type === 'CREDIT') ?? []`
- `watch('isCC')` and all `setValue('isCC', ...)` calls
- The `isCC` checkbox `<div>` block (lines ~244–266)
- The `isCC && creditCards.length > 0` conditional card select block (lines ~268–291)

Add:
- `const allCards = cards ?? []`
- Unified card select (shown when `allCards.length > 0`, inside `mode === 'egreso'` block)
- `const selectedCard = allCards.find((c) => c.id === cardId)` for the hint
- Contextual hint `<p>` below the select
- In `onSubmit`: `const isCC = cards?.find((c) => c.id === data.cardId)?.type === 'CREDIT' ?? false`
- Pass derived `isCC` to `onAdd(..., isCC, ...)`
- Reset: `{ mode: 'egreso', category: 'otros', cardId: null, eventId: null }` (no `isCC`)
- `defaultValues`: remove `isCC: false`

**Grouped select implementation:**
```tsx
import { SelectGroup, SelectLabel, SelectSeparator } from '@/components/ui/select'

const debitCards = allCards.filter((c) => c.type === 'DEBIT')
const creditCards = allCards.filter((c) => c.type === 'CREDIT')

<Select value={cardId ?? '__none__'} onValueChange={(v) => setValue('cardId', v === '__none__' ? null : v)}>
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
  <p className={cn(
    'text-xs',
    selectedCard.type === 'CREDIT'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground'
  )}>
    {selectedCard.type === 'CREDIT'
      ? t('addTransaction.ccHint')
      : t('addTransaction.debitHint')}
  </p>
)}
```

### `src/modules/transactions/components/AddScheduledExpenseModal.tsx`

Same card selector redesign as above. Key difference in `onSubmit`:

```ts
const onSubmit = async (data: ScheduledExpenseFormValues) => {
  const selectedCard = cards?.find((c) => c.id === data.cardId)
  const derivedData: ScheduledExpenseFormValues = {
    ...data,
    isCC: selectedCard?.type === 'CREDIT' ?? false,
  }
  await onAdd(derivedData, filter)
  reset()
  setOpen(false)
}
```

Remove `watch('isCC')`, the checkbox block, and `creditCards` filter. Add the same grouped select and contextual hint.

---

## i18n Keys Required

`cards.debit` ("Débito") and `cards.credit` ("Crédito") already exist in both locale files — no change needed.

Add only:
- `addTransaction.debitHint` — `"El saldo se descontará de inmediato"` (es.json)

Existing key `addTransaction.ccHint` is reused for the credit hint — no change needed.

---

## Out of Scope

- `AddDailyExpenseModal` — no `cards` prop, no card selection
- API, services, hooks — no changes
- `transactionService` — no changes
- i18n keys in `en.json` (en is a secondary locale; add but low priority)
