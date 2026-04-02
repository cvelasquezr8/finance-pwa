import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTransactions } from '../hooks/useTransactions'
import { useDashboard } from '@/modules/dashboard/hooks/useDashboard'
import { TransactionTable } from './TransactionTable'
import { MonthFilter } from '@/components/layout/MonthFilter'
import { getQuincena, formatCurrency } from '@/lib/utils'
import type { MonthFilter as MonthFilterType, QuincenaFilter } from '@/core/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TransactionsPage() {
  const { t } = useTranslation()
  const now = new Date()
  const [filter, setFilter] = useState<MonthFilterType & { quincena: QuincenaFilter }>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    quincena: getQuincena(now),
  })

  const months = t('months', { returnObjects: true }) as string[]

  const { scheduled, daily, income, isLoading, confirmTransaction, removeTransaction, updateTransaction } = useTransactions(filter)
  const { refetch: refetchSummary } = useDashboard(filter)

  const handleConfirm = async (id: string, confirmed: boolean) => {
    await confirmTransaction(id, confirmed)
    refetchSummary()
  }

  const handleDelete = async (id: string) => {
    await removeTransaction(id)
    refetchSummary()
  }

  const totalScheduled     = scheduled.reduce((s, tx) => s + tx.amount, 0)
  const totalDaily         = daily.reduce((s, tx) => s + tx.amount, 0)
  const totalIncome        = income.reduce((s, tx) => s + tx.amount, 0)
  const confirmedScheduled = scheduled.filter((tx) => tx.status === 'confirmed').reduce((s, tx) => s + tx.amount, 0)

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('transactions.title')}</h1>
          <p className="text-sm text-muted-foreground">{months[filter.month - 1]} {filter.year}</p>
        </div>
      </div>

      <MonthFilter filter={filter} onChange={setFilter} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase">{t('transactions.income')}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(totalIncome)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase">{t('transactions.scheduled')}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-red-600 dark:text-red-400">-{formatCurrency(totalScheduled)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase">{t('transactions.confirmed')}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-amber-600 dark:text-amber-400">-{formatCurrency(confirmedScheduled)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase">{t('transactions.dailyExpenses')}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-orange-600 dark:text-orange-400">-{formatCurrency(totalDaily)}</p></CardContent>
        </Card>
      </div>

      <TransactionTable
        title={t('dashboard.scheduledExpenses')}
        transactions={scheduled}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onEdit={updateTransaction}
        showConfirmColumn
        showReceiptColumn
      />

      <TransactionTable
        title={t('dashboard.dailyExpenses')}
        transactions={daily}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onEdit={updateTransaction}
        showConfirmColumn={false}
        showReceiptColumn
      />

      {(isLoading || income.length > 0) && (
        <TransactionTable
          title={t('dashboard.income')}
          transactions={income}
          isLoading={isLoading}
          onConfirm={async () => {}}
          onDelete={handleDelete}
          onEdit={updateTransaction}
          showConfirmColumn={false}
          showReceiptColumn={false}
        />
      )}
    </div>
  )
}
