'use client'

import { Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from '../hooks/useDashboard'
import { useTransactions } from '@/modules/transactions/hooks/useTransactions'
import { SummaryCards } from './SummaryCards'
import { BalanceTrendChart } from './BalanceTrendChart'
import { CategorySpendingChart } from './CategorySpendingChart'
import { QuickDailyList } from './QuickDailyList'
import { MonthFilter } from '@/components/layout/MonthFilter'
import { Skeleton } from '@/components/ui/skeleton'
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

function DashboardContent({ filter }: { filter: MonthFilterType & { quincena: QuincenaFilter } }) {
  const { summary } = useDashboard(filter)
  const { daily } = useTransactions(filter)
  const animKey = `${filter.month}-${filter.quincena}`

  return (
    <>
      <SummaryCards summary={summary} isLoading={false} animationKey={animKey} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Suspense
            fallback={
              <div className="relative h-[280px] overflow-hidden rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-full w-full" />
              </div>
            }
          >
            <BalanceTrendChart />
          </Suspense>
          <Suspense
            fallback={
              <div className="relative h-[240px] overflow-hidden rounded-xl border border-border bg-card p-5">
                <Skeleton className="h-full w-full" />
              </div>
            }
          >
            <CategorySpendingChart transactions={daily} />
          </Suspense>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start lg:border-l lg:border-border lg:pl-6">
          <Suspense
            fallback={
              <div className="space-y-2 rounded-xl border border-border bg-card p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            }
          >
            <QuickDailyList transactions={daily} filter={filter} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useDefaultFilter()

  const months = t('months', { returnObjects: true }) as string[]
  const rangeLabel = getQuincenaDateRangeLabel(filter.quincena, filter.month, filter.year)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <div className="border-l-2 border-primary pl-3 lg:border-0 lg:pl-0">
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {months[filter.month - 1]} {filter.year}
            {rangeLabel ? ` · ${rangeLabel}` : ''}
          </p>
        </div>
      </div>

      <MonthFilter filter={filter} onChange={setFilter} />

      <div className="mt-6">
        <Suspense fallback={<SummaryCardsSkeleton />}>
          <DashboardContent filter={filter} />
        </Suspense>
      </div>
    </div>
  )
}
