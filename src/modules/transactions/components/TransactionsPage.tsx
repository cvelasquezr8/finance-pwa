'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from '@/modules/dashboard/hooks/useDashboard'
import { useCards } from '@/modules/cards/hooks/useCards'
import { PaginatedTransactionSection } from './PaginatedTransactionSection'
import { MonthFilter } from '@/components/layout/MonthFilter'
import { FilterBar } from '@/components/layout/FilterBar'
import { getQuincena, getQuincenaDateRangeLabel, formatCurrency, cn } from '@/lib/utils'
import type { MonthFilter as MonthFilterType, QuincenaFilter } from '@/core/types'
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
        <div className="border-l-2 border-primary pl-3 lg:border-0 lg:pl-0">
          <h1 className="text-2xl font-bold">{t('transactions.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {months[filter.month - 1]} {filter.year}
            {rangeLabel ? ` · ${rangeLabel}` : ''}
          </p>
        </div>
      </div>

      <FilterBar>
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
      </FilterBar>

      <div className="flex flex-wrap divide-x divide-border rounded-xl border border-border bg-card">
        {[
          {
            label: t('transactions.income'),
            value: formatCurrency(totalIncome),
            color: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: t('transactions.scheduled'),
            value: `-${formatCurrency(totalScheduled)}`,
            color: 'text-red-600 dark:text-red-400',
          },
          {
            label: t('transactions.confirmed'),
            value: `-${formatCurrency(totalConfirmed)}`,
            color: 'text-amber-600 dark:text-amber-400',
          },
          {
            label: t('transactions.dailyExpenses'),
            value: `-${formatCurrency(totalDaily)}`,
            color: 'text-orange-600 dark:text-orange-400',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex min-w-[7rem] flex-1 flex-col gap-0.5 px-4 py-3">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <span className={cn('text-base font-bold tabular-nums', color)}>{value}</span>
          </div>
        ))}
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
