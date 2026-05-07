import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from '../hooks/useDashboard'
import { useTransactions } from '@/modules/transactions/hooks/useTransactions'
import { SummaryCards } from './SummaryCards'
import { BalanceTrendChart } from './BalanceTrendChart'
import { CategorySpendingChart } from './CategorySpendingChart'
import { QuickDailyList } from './QuickDailyList'
import { MonthFilter } from '@/components/layout/MonthFilter'
import { getQuincena, getQuincenaDateRangeLabel } from '@/lib/utils'
import type { MonthFilter as MonthFilterType, QuincenaFilter } from '@/core/types'

function useDefaultFilter() {
  const now = new Date()
  return useState<MonthFilterType & { quincena: QuincenaFilter }>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    quincena: getQuincena(now),
  })
}

export function DashboardPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useDefaultFilter()
  const { summary, isLoading: summaryLoading } = useDashboard(filter)
  const { scheduled, daily, isLoading: txLoading } = useTransactions(filter)

  const months = t('months', { returnObjects: true }) as string[]
  const rangeLabel = getQuincenaDateRangeLabel(filter.quincena, filter.month, filter.year)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {months[filter.month - 1]} {filter.year}
          {rangeLabel ? ` · ${rangeLabel}` : ''}
        </p>
      </div>

      <MonthFilter filter={filter} onChange={setFilter} />

      <div className="mt-6">
        <SummaryCards summary={summary} isLoading={summaryLoading} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <BalanceTrendChart />
          <CategorySpendingChart transactions={[...daily, ...scheduled]} isLoading={txLoading} />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <QuickDailyList transactions={daily} isLoading={txLoading} filter={filter} />
        </div>
      </div>
    </div>
  )
}
