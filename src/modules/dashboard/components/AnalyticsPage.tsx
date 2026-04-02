import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTransactions } from '@/modules/transactions/hooks/useTransactions'
import { CATEGORY_LABELS, CATEGORY_COLORS, formatCurrency } from '@/lib/utils'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import { MonthFilter as MonthFilterComp } from '@/components/layout/MonthFilter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getQuincena } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const now = new Date()
  const [filter, setFilter] = useState<MonthFilter & { quincena: QuincenaFilter }>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    quincena: getQuincena(now),
  })

  const months = t('months', { returnObjects: true }) as string[]

  const { transactions, isLoading } = useTransactions({ month: filter.month, year: filter.year })

  const byCategory = Object.keys(CATEGORY_LABELS).map((key) => {
    const label = t(`categories.${key}`)
    const total = transactions.filter((tx) => tx.category === key).reduce((s, tx) => s + tx.amount, 0)
    return { key, label, total }
  }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total)

  const grandTotal = byCategory.reduce((s, c) => s + c.total, 0)

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">{t('analytics.title')}</h1>
        <p className="text-sm text-muted-foreground">{months[filter.month - 1]} {filter.year}</p>
      </div>

      <MonthFilterComp filter={filter} onChange={setFilter} />

      <Card>
        <CardHeader><CardTitle className="text-base">{t('analytics.byCategory')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-full rounded-full bg-muted animate-pulse" />
                </div>
              ))
            : byCategory.length === 0
            ? <p className="text-center text-muted-foreground py-8">{t('analytics.noData')}</p>
            : byCategory.map(({ key, label, total }) => {
                const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[key])}>{label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">{pct.toFixed(1)}%</span>
                        <span className="font-mono font-semibold">{formatCurrency(total)}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
          }
          {!isLoading && grandTotal > 0 && (
            <div className="border-t border-border pt-3 flex justify-between text-sm font-semibold">
              <span>{t('analytics.monthTotal')}</span>
              <span className="font-mono text-red-600 dark:text-red-400">{formatCurrency(grandTotal)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">{t('analytics.firstFortnight')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(transactions.filter((tx) => tx.quincena === 'primera').reduce((s, tx) => s + tx.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">{t('analytics.secondFortnight')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(transactions.filter((tx) => tx.quincena === 'segunda').reduce((s, tx) => s + tx.amount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
