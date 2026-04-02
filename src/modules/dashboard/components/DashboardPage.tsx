import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from '../hooks/useDashboard'
import { useTransactions } from '@/modules/transactions/hooks/useTransactions'
import { SummaryCards } from './SummaryCards'
import { TransactionTable } from '@/modules/transactions/components/TransactionTable'
import { MonthFilter } from '@/components/layout/MonthFilter'
import { getQuincena } from '@/lib/utils'
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
  const { scheduled, daily, income, isLoading: txLoading } = useTransactions(filter)

  const months = t('months', { returnObjects: true }) as string[]

  const quincenaLabel = filter.quincena !== 'mensual'
    ? ` · ${filter.quincena === 'primera' ? t('quincena.days115') : t('quincena.days1631')}`
    : ''

  const scheduledTitle = `${t('dashboard.scheduledExpenses')}${filter.quincena !== 'mensual' ? ` · ${filter.quincena === 'primera' ? t('quincena.primera') : t('quincena.segunda')}` : ''}`

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {months[filter.month - 1]} {filter.year}{quincenaLabel}
        </p>
      </div>

      <MonthFilter filter={filter} onChange={setFilter} />

      <SummaryCards summary={summary} isLoading={summaryLoading} />

      <TransactionTable
        title={scheduledTitle}
        transactions={scheduled}
        isLoading={txLoading}
        onConfirm={async () => {}}
        onDelete={async () => {}}
        onEdit={async () => {}}
        showConfirmColumn={false}
        showReceiptColumn
        readOnly
      />

      <TransactionTable
        title={t('dashboard.dailyExpenses')}
        transactions={daily}
        isLoading={txLoading}
        onConfirm={async () => {}}
        onDelete={async () => {}}
        onEdit={async () => {}}
        showConfirmColumn={false}
        showReceiptColumn
        readOnly
      />

      {(txLoading || income.length > 0) && (
        <TransactionTable
          title={t('dashboard.income')}
          transactions={income}
          isLoading={txLoading}
          onConfirm={async () => {}}
          onDelete={async () => {}}
          onEdit={async () => {}}
          showConfirmColumn={false}
          showReceiptColumn={false}
          readOnly
        />
      )}
    </div>
  )
}
