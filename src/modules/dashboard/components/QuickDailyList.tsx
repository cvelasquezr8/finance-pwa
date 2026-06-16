'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { TransactionResponseDTO } from '@/core/dtos'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/lib/hooks/useCurrency'

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
  const formatCurrency = useCurrency()

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
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium">{t('dashboard.noExpenses')}</p>
        </div>
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
