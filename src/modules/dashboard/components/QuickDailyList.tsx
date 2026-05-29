'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import type { TransactionResponseDTO } from '@/core/dtos'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import { formatCurrency, cn } from '@/lib/utils'

export function QuickDailyList({
  transactions,
  isLoading,
  className,
}: {
  transactions: TransactionResponseDTO[]
  isLoading?: boolean
  filter?: MonthFilter & { quincena: QuincenaFilter }
  className?: string
}) {
  const { t } = useTranslation()
  const router = useRouter()

  const recent = [...transactions].sort((a, b) => b.dueDay - a.dueDay).slice(0, 5)

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card',
        'border-l-4 border-l-amber-500',
        className
      )}
    >
      <div className="px-4 pt-4">
        <h3 className="text-sm font-semibold">{t('dashboard.recentExpenses')}</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          {t('dashboard.noExpenses')}
        </p>
      ) : (
        <ul className="divide-y divide-border px-4">
          {recent.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between py-2.5">
              <span className="mr-2 min-w-0 truncate text-sm">{tx.description}</span>
              <span className="flex-shrink-0 text-sm font-medium text-destructive">
                -{formatCurrency(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-4 py-3">
        <button
          onClick={() => router.push('/transactions')}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          {t('dashboard.viewAll')} →
        </button>
      </div>
    </div>
  )
}
