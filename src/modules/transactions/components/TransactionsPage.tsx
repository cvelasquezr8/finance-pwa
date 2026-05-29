'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from '@/modules/dashboard/hooks/useDashboard'
import { useCards } from '@/modules/cards/hooks/useCards'
import { PaginatedTransactionSection } from './PaginatedTransactionSection'
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

  const { summary, refetch: refetchSummary } = useDashboard(filter)
  const { cards } = useCards()

  const totalScheduled = summary?.totalPendingScheduled ?? 0
  const totalConfirmed = summary?.totalConfirmedScheduled ?? 0
  const totalDaily = summary?.totalDailyExpenses ?? 0
  const totalIncome = summary?.expectedIncome ?? 0

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
              -{formatCurrency(totalConfirmed)}
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

      <PaginatedTransactionSection
        title={t('dashboard.scheduledExpenses')}
        filter={filter}
        type="scheduled"
        cardFilter={cardFilter}
        cards={cards}
        showConfirmColumn
        showReceiptColumn
        onMutated={() => refetchSummary()}
      />

      <PaginatedTransactionSection
        title={t('dashboard.dailyExpenses')}
        filter={filter}
        type="daily"
        cardFilter={cardFilter}
        cards={cards}
        showReceiptColumn
        onMutated={() => refetchSummary()}
      />

      <PaginatedTransactionSection
        title={t('dashboard.income')}
        filter={filter}
        type="income"
        cardFilter={cardFilter}
        cards={cards}
        onMutated={() => refetchSummary()}
        hideWhenEmpty
      />
    </div>
  )
}
