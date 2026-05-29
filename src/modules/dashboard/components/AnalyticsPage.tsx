'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTransactions } from '@/modules/transactions/hooks/useTransactions'
import { useCards } from '@/modules/cards/hooks/useCards'
import {
  cn,
  formatCurrency,
  getQuincena,
  getQuincenaDateRangeLabel,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/utils'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import { MonthFilter as MonthFilterComp } from '@/components/layout/MonthFilter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreditCard } from 'lucide-react'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const now = new Date()
  const [filter, setFilter] = useState<MonthFilter & { quincena: QuincenaFilter }>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    quincena: getQuincena(now),
  })

  const [cardFilter, setCardFilter] = useState<string>('all')
  const months = t('months', { returnObjects: true }) as string[]
  const rangeLabel = getQuincenaDateRangeLabel(filter.quincena, filter.month, filter.year)

  const { transactions: allTransactions, isLoading } = useTransactions({
    month: filter.month,
    year: filter.year,
  })
  const { cards } = useCards()

  const transactions = allTransactions.filter((tx) => {
    if (cardFilter === 'all') return true
    if (cardFilter === 'cc-only') return tx.isCC
    return tx.cardId === cardFilter
  })

  const byCategory = Object.keys(CATEGORY_LABELS)
    .map((key) => {
      const label = t(`categories.${key}`)
      const total = transactions
        .filter((tx) => tx.category === key)
        .reduce((s, tx) => s + tx.amount, 0)
      return { key, label, total }
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const grandTotal = byCategory.reduce((s, c) => s + c.total, 0)

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold">{t('analytics.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {months[filter.month - 1]} {filter.year}
          {rangeLabel ? ` · ${rangeLabel}` : ''}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MonthFilterComp filter={filter} onChange={setFilter} />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('analytics.byCategory')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-full animate-pulse rounded-full bg-muted" />
              </div>
            ))
          ) : byCategory.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t('analytics.noData')}</p>
          ) : (
            byCategory.map(({ key, label, total }) => {
              const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        CATEGORY_COLORS[key]
                      )}
                    >
                      {label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                      <span className="font-mono font-semibold">{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
          {!isLoading && grandTotal > 0 && (
            <div className="flex justify-between border-t border-border pt-3 text-sm font-semibold">
              <span>{t('analytics.monthTotal')}</span>
              <span className="font-mono text-red-600 dark:text-red-400">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {t('analytics.firstFortnight')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(
                transactions
                  .filter((tx) => tx.quincena === 'primera')
                  .reduce((s, tx) => s + tx.amount, 0)
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {t('analytics.secondFortnight')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(
                transactions
                  .filter((tx) => tx.quincena === 'segunda')
                  .reduce((s, tx) => s + tx.amount, 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
