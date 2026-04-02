import { useState } from 'react'
import { Trash2, Pencil, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReceiptCell } from './ReceiptCell'
import { EditTransactionModal } from './EditTransactionModal'
import { formatCurrency, CATEGORY_COLORS } from '@/lib/utils'
import type { TransactionResponseDTO, UpdateTransactionDTO } from '@/core/dtos'
import { cn } from '@/lib/utils'

interface Props {
  transactions: TransactionResponseDTO[]
  isLoading: boolean
  onConfirm: (id: string, confirmed: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (id: string, dto: UpdateTransactionDTO) => Promise<unknown>
  title: string
  showConfirmColumn?: boolean
  showReceiptColumn?: boolean
  readOnly?: boolean
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-4 w-full rounded bg-muted animate-pulse" /></td>
      ))}
    </tr>
  )
}

export function TransactionTable({
  transactions: initialTx,
  isLoading,
  onConfirm,
  onDelete,
  onEdit,
  title,
  showConfirmColumn = true,
  showReceiptColumn = false,
  readOnly = false,
}: Props) {
  const { t } = useTranslation()
  const [rows, setRows] = useState<TransactionResponseDTO[]>([])
  const [initialized, setInitialized] = useState(false)
  const [editingTx, setEditingTx] = useState<TransactionResponseDTO | null>(null)

  if (!initialized && initialTx.length > 0) {
    setRows(initialTx)
    setInitialized(true)
  }
  if (initialized && initialTx.length !== rows.length) {
    setRows(initialTx)
  }

  const transactions = initialized ? rows : initialTx

  const handleReceiptUploaded = (id: string, receiptUrl: string) => {
    setRows((prev) => prev.map((tx) => tx.id === id ? { ...tx, receiptUrl } : tx))
  }

  const handleEdit = async (id: string, dto: UpdateTransactionDTO) => {
    await onEdit(id, dto)
    setRows((prev) => prev.map((tx) => tx.id === id ? { ...tx, ...dto } : tx))
  }

  const colCount = 3 + (showConfirmColumn ? 1 : 0) + (showReceiptColumn ? 1 : 0) + 1 + (readOnly ? 1 : 2)

  return (
    <>
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('transactions.description')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">{t('transactions.category')}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('transactions.amount')}</th>
              {showConfirmColumn && <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('transactions.confirmedColumn')}</th>}
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('transactions.status')}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden sm:table-cell">CC</th>
              {showReceiptColumn && <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('transactions.receipt')}</th>}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
              : transactions.length === 0
              ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-8 text-center text-muted-foreground">
                    {t('transactions.empty')}
                  </td>
                </tr>
              )
              : transactions.map((tx) => (
                <tr key={tx.id} className={cn('transition-colors hover:bg-muted/30', tx.status === 'confirmed' && 'bg-emerald-500/5 dark:bg-emerald-500/10')}>
                  <td className="px-4 py-3 font-medium">
                    <div>{tx.description}</div>
                    {tx.isRecurring && (
                      <span className="text-xs text-muted-foreground">
                        {t('transactions.recurring', { day: tx.dueDay })}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[tx.category])}>
                      {t(`categories.${tx.category}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
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
                    <Badge variant={tx.status === 'confirmed' ? 'success' : tx.status === 'cancelled' ? 'destructive' : 'warning'}>
                      {tx.status === 'confirmed'
                        ? t('transactions.statusConfirmed')
                        : tx.status === 'cancelled'
                        ? t('transactions.statusCancelled')
                        : t('transactions.statusPending')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {tx.isCC && (
                      <span title={t('transactions.ccTooltip')}>
                        <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mx-auto" />
                      </span>
                    )}
                  </td>
                  {showReceiptColumn && (
                    <td className="px-4 py-3 text-center">
                      <ReceiptCell
                        transactionId={tx.id}
                        description={tx.description}
                        receiptUrl={tx.receiptUrl}
                        onUploaded={readOnly ? undefined : (url) => handleReceiptUploaded(tx.id, url)}
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
              ))}
          </tbody>
          {!isLoading && transactions.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-muted/20">
                <td colSpan={2} className="px-4 py-2.5 text-sm font-semibold text-muted-foreground hidden sm:table-cell">{t('transactions.total')}</td>
                <td colSpan={1} className="px-4 py-2.5 text-sm font-semibold text-muted-foreground sm:hidden">{t('transactions.total')}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold">
                  {(() => {
                    const isIncome = transactions[0]?.type === 'income'
                    return (
                      <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {isIncome ? '+' : '-'}{formatCurrency(transactions.reduce((s, tx) => s + tx.amount, 0))}
                      </span>
                    )
                  })()}
                </td>
                <td colSpan={colCount - 3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>

    <EditTransactionModal
      transaction={editingTx}
      open={!!editingTx}
      onOpenChange={(o) => { if (!o) setEditingTx(null) }}
      onSave={handleEdit}
    />
    </>
  )
}
