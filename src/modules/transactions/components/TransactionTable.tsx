'use client'

import { useMemo, useState } from 'react'
import { Trash2, Pencil, CreditCard, MoreVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SortableHeader } from '@/components/ui/data-table'
import { ReceiptCell } from './ReceiptCell'
import { EditTransactionModal } from './EditTransactionModal'
import { formatCurrency, CATEGORY_COLORS } from '@/lib/utils'
import type { TransactionResponseDTO, UpdateTransactionDTO, CardDTO } from '@/core/dtos'
import type { SortOrder } from '@/lib/hooks/useDataTableState'
import { cn } from '@/lib/utils'

interface Props {
  transactions: TransactionResponseDTO[]
  cards?: CardDTO[]
  isLoading: boolean
  onConfirm: (id: string, confirmed: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (id: string, dto: UpdateTransactionDTO) => Promise<unknown>
  title: string
  showConfirmColumn?: boolean
  showReceiptColumn?: boolean
  readOnly?: boolean
  sortBy?: string
  order?: SortOrder
  onSort?: (field: string) => void
}

interface RowActions {
  onConfirm: (id: string, confirmed: boolean) => void
  onEditClick: (tx: TransactionResponseDTO) => void
  onDelete: (id: string) => void
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  )
}

function MobileSkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-3 w-14 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

interface MobileRowProps extends RowActions {
  tx: TransactionResponseDTO
  card?: CardDTO
  showConfirm: boolean
  readOnly: boolean
  t: TFunction
}

function MobileTransactionRow({
  tx,
  card,
  showConfirm,
  readOnly,
  onConfirm,
  onEditClick,
  onDelete,
  t,
}: MobileRowProps) {
  const statusVariant =
    tx.status === 'confirmed' ? 'success' : tx.status === 'cancelled' ? 'destructive' : 'warning'
  const statusLabel =
    tx.status === 'confirmed'
      ? t('transactions.statusConfirmed')
      : tx.status === 'cancelled'
        ? t('transactions.statusCancelled')
        : t('transactions.statusPending')

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        tx.status === 'confirmed' && 'bg-emerald-500/5 dark:bg-emerald-500/10'
      )}
    >
      {showConfirm && !readOnly && (
        <Checkbox
          checked={tx.status === 'confirmed'}
          onCheckedChange={(v) => onConfirm(tx.id, Boolean(v))}
          className="flex-shrink-0"
          aria-label={t('transactions.confirmExpense')}
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">{tx.description}</p>
          {tx.isRecurring && (
            <span
              className="flex-shrink-0 text-[10px] text-muted-foreground"
              title={t('transactions.recurring', { day: tx.dueDay })}
            >
              ↻
            </span>
          )}
        </div>
        <span
          className={cn(
            'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium',
            CATEGORY_COLORS[tx.category]
          )}
        >
          {t(`categories.${tx.category}`)}
        </span>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          {tx.isCC &&
            (card ? (
              <span
                className="flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold leading-none text-amber-600 dark:text-amber-400"
                title={t('transactions.ccTooltip')}
              >
                <CreditCard className="h-2.5 w-2.5" />
                {card.name} ···{card.lastFour}
              </span>
            ) : (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold leading-none text-amber-600 dark:text-amber-400">
                TC
              </span>
            ))}
          <span
            className={cn(
              'font-heading text-sm font-semibold',
              tx.type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {tx.type === 'income' ? '+' : '-'}
            {formatCurrency(tx.amount)}
          </span>
        </div>
        <Badge variant={statusVariant} className="h-4 px-1.5 py-0 text-[10px]">
          {statusLabel}
        </Badge>
      </div>

      {!readOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0 text-muted-foreground"
              aria-label={t('transactions.actionsAria')}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEditClick(tx)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('transactions.editAria')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => onDelete(tx.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('transactions.deleteAria')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export function TransactionTable({
  transactions,
  cards,
  isLoading,
  onConfirm,
  onDelete,
  onEdit,
  title,
  showConfirmColumn = true,
  showReceiptColumn = false,
  readOnly = false,
  sortBy,
  order,
  onSort,
}: Props) {
  const { t } = useTranslation()
  const [editingTx, setEditingTx] = useState<TransactionResponseDTO | null>(null)

  const cardMap = useMemo(() => {
    const map = new Map<string, CardDTO>()
    cards?.forEach((c) => map.set(c.id, c))
    return map
  }, [cards])

  const handleEdit = async (id: string, dto: UpdateTransactionDTO) => {
    await onEdit(id, dto)
  }

  const rowActions: RowActions = {
    onConfirm,
    onEditClick: setEditingTx,
    onDelete,
  }

  const colCount =
    3 + (showConfirmColumn ? 1 : 0) + (showReceiptColumn ? 1 : 0) + 1 + (readOnly ? 1 : 2)

  const totalAmount = transactions.reduce((s, tx) => s + tx.amount, 0)
  const isIncome = transactions[0]?.type === 'income'

  const sortableProps = onSort && sortBy && order ? { active: sortBy, order, onSort } : null

  return (
    <>
      <div className="space-y-3">
        {title && (
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h3>
        )}

        <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {sortableProps ? (
                    <SortableHeader
                      label={t('transactions.description')}
                      field="description"
                      {...sortableProps}
                    />
                  ) : (
                    t('transactions.description')
                  )}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  {sortableProps ? (
                    <SortableHeader
                      label={t('transactions.category')}
                      field="category"
                      {...sortableProps}
                    />
                  ) : (
                    t('transactions.category')
                  )}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  {sortableProps ? (
                    <SortableHeader
                      label={t('transactions.amount')}
                      field="amount"
                      align="right"
                      {...sortableProps}
                    />
                  ) : (
                    t('transactions.amount')
                  )}
                </th>
                {showConfirmColumn && (
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    {t('transactions.confirmedColumn')}
                  </th>
                )}
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  {sortableProps ? (
                    <SortableHeader
                      label={t('transactions.status')}
                      field="status"
                      align="center"
                      {...sortableProps}
                    />
                  ) : (
                    t('transactions.status')
                  )}
                </th>
                <th className="hidden px-4 py-3 text-center font-medium text-muted-foreground sm:table-cell">
                  CC
                </th>
                {showReceiptColumn && (
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    {t('transactions.receipt')}
                  </th>
                )}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-8 text-center text-muted-foreground">
                    {t('pagination.noResults')}
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={cn(
                      'transition-colors hover:bg-muted/30',
                      tx.status === 'confirmed' && 'bg-emerald-500/5 dark:bg-emerald-500/10'
                    )}
                  >
                    <td className="px-4 py-3 font-medium">
                      <div>{tx.description}</div>
                      {tx.isRecurring && (
                        <span className="text-xs text-muted-foreground">
                          {t('transactions.recurring', { day: tx.dueDay })}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          CATEGORY_COLORS[tx.category]
                        )}
                      >
                        {t(`categories.${tx.category}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      <span
                        className={
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    {showConfirmColumn && (
                      <td className="px-4 py-3 text-center">
                        <Checkbox
                          checked={tx.status === 'confirmed'}
                          onCheckedChange={(v) => onConfirm(tx.id, Boolean(v))}
                          className="mx-auto"
                          aria-label={t('transactions.confirmExpense')}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          tx.status === 'confirmed'
                            ? 'success'
                            : tx.status === 'cancelled'
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {tx.status === 'confirmed'
                          ? t('transactions.statusConfirmed')
                          : tx.status === 'cancelled'
                            ? t('transactions.statusCancelled')
                            : t('transactions.statusPending')}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {tx.isCC &&
                        (() => {
                          const card = tx.cardId ? cardMap.get(tx.cardId) : undefined
                          return card ? (
                            <span
                              className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"
                              title={t('transactions.ccTooltip')}
                            >
                              <CreditCard className="h-2.5 w-2.5" />
                              {card.name} ···{card.lastFour}
                            </span>
                          ) : (
                            <span title={t('transactions.ccTooltip')}>
                              <CreditCard className="mx-auto h-3.5 w-3.5 text-amber-500" />
                            </span>
                          )
                        })()}
                    </td>
                    {showReceiptColumn && (
                      <td className="px-4 py-3 text-center">
                        <ReceiptCell
                          transactionId={tx.id}
                          description={tx.description}
                          receiptUrl={tx.receiptUrl}
                          readOnly={readOnly}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      {!readOnly && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => setEditingTx(tx)}
                            aria-label={t('transactions.editAria')}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(tx.id)}
                            aria-label={t('transactions.deleteAria')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!isLoading && transactions.length > 0 && (
              <tfoot>
                <tr className="border-t border-border bg-muted/20">
                  <td
                    colSpan={2}
                    className="hidden px-4 py-2.5 text-sm font-semibold text-muted-foreground sm:table-cell"
                  >
                    {t('transactions.total')}
                  </td>
                  <td
                    colSpan={1}
                    className="px-4 py-2.5 text-sm font-semibold text-muted-foreground sm:hidden"
                  >
                    {t('transactions.total')}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    <span
                      className={
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(totalAmount)}
                    </span>
                  </td>
                  <td colSpan={colCount - 3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="overflow-hidden rounded-lg border border-border md:hidden">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <MobileSkeletonRow key={i} />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t('pagination.noResults')}
            </p>
          ) : (
            <>
              <div className="divide-y divide-border">
                {transactions.map((tx) => (
                  <MobileTransactionRow
                    key={tx.id}
                    tx={tx}
                    card={tx.cardId ? cardMap.get(tx.cardId) : undefined}
                    showConfirm={showConfirmColumn}
                    readOnly={readOnly}
                    t={t}
                    {...rowActions}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5">
                <span className="text-sm font-semibold text-muted-foreground">
                  {t('transactions.total')}
                </span>
                <span
                  className={cn(
                    'font-heading text-sm font-bold',
                    isIncome
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <EditTransactionModal
        transaction={editingTx}
        cards={cards}
        open={!!editingTx}
        onOpenChange={(o) => {
          if (!o) setEditingTx(null)
        }}
        onSave={handleEdit}
      />
    </>
  )
}
