import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTransactions } from '../hooks/useTransactions'
import { useDashboard } from '@/modules/dashboard/hooks/useDashboard'
import { useCards } from '@/modules/cards/hooks/useCards'
import { TransactionTable } from './TransactionTable'
import { MonthFilter } from '@/components/layout/MonthFilter'
import { getQuincena, getQuincenaDateRangeLabel, formatCurrency } from '@/lib/utils'
import type { MonthFilter as MonthFilterType, QuincenaFilter } from '@/core/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreditCard } from 'lucide-react'

export function TransactionsPage() {
  const { t } = useTranslation()
  const now = new Date()
  const [filter, setFilter] = useState<MonthFilterType & { quincena: QuincenaFilter }>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    quincena: getQuincena(now),
  })

  const months = t('months', { returnObjects: true }) as string[]
  const rangeLabel = getQuincenaDateRangeLabel(filter.quincena, filter.month, filter.year)

  const [cardFilter, setCardFilter] = useState<string>('all')

  const {
    scheduled,
    daily,
    income,
    isLoading,
    confirmTransaction,
    removeTransaction,
    updateTransaction,
  } = useTransactions(filter)
  const { refetch: refetchSummary } = useDashboard(filter)
  const { cards } = useCards()

  const applyCardFilter = <T extends { isCC: boolean; cardId: string | null }>(txs: T[]): T[] => {
    if (cardFilter === 'all') return txs
    if (cardFilter === 'cc-only') return txs.filter((t) => t.isCC)
    return txs.filter((t) => t.cardId === cardFilter)
  }

  const filteredScheduled = applyCardFilter(scheduled)
  const filteredDaily = applyCardFilter(daily)
  const filteredIncome = cardFilter === 'all' || cardFilter === 'cc-only' ? income : []

  const handleConfirm = async (id: string, confirmed: boolean) => {
    await confirmTransaction(id, confirmed)
    refetchSummary()
  }

  const handleDelete = async (id: string) => {
    await removeTransaction(id)
    refetchSummary()
  }

  const totalScheduled = filteredScheduled.reduce((s, tx) => s + tx.amount, 0)
  const totalDaily = filteredDaily.reduce((s, tx) => s + tx.amount, 0)
  const totalIncome = filteredIncome.reduce((s, tx) => s + tx.amount, 0)
  const confirmedScheduled = filteredScheduled
    .filter((tx) => tx.status === 'confirmed')
    .reduce((s, tx) => s + tx.amount, 0)

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('transactions.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {months[filter.month - 1]} {filter.year}
            {rangeLabel ? ` · ${rangeLabel}` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MonthFilter filter={filter} onChange={setFilter} />
        {cards.length > 0 && (
          <Select value={cardFilter} onValueChange={setCardFilter}>
            <SelectTrigger className="h-9 w-auto gap-1.5 text-xs">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('cards.allCards')}</SelectItem>
              <SelectItem value="cc-only">{t('cards.ccOnly')}</SelectItem>
              {cards.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ···{c.lastFour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              {t('transactions.income')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              {t('transactions.scheduled')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              -{formatCurrency(totalScheduled)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              {t('transactions.confirmed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              -{formatCurrency(confirmedScheduled)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              {t('transactions.dailyExpenses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              -{formatCurrency(totalDaily)}
            </p>
          </CardContent>
        </Card>
      </div>

      <TransactionTable
        title={t('dashboard.scheduledExpenses')}
        transactions={filteredScheduled}
        cards={cards}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onEdit={updateTransaction}
        showConfirmColumn
        showReceiptColumn
      />

      <TransactionTable
        title={t('dashboard.dailyExpenses')}
        transactions={filteredDaily}
        cards={cards}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onEdit={updateTransaction}
        showConfirmColumn={false}
        showReceiptColumn
      />

      {(isLoading || filteredIncome.length > 0) && (
        <TransactionTable
          title={t('dashboard.income')}
          transactions={filteredIncome}
          cards={cards}
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
