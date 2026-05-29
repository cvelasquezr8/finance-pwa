'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { TransactionResponseDTO } from '@/core/dtos'
import { CATEGORY_LABELS, formatCurrency, cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const CHART_PALETTE = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#78716c',
]

interface CategoryPoint {
  category: string
  label: string
  amount: number
}

export function CategorySpendingChart({
  transactions,
  isLoading,
  className,
}: {
  transactions: TransactionResponseDTO[]
  isLoading?: boolean
  className?: string
}) {
  const { t } = useTranslation()

  const data = useMemo<CategoryPoint[]>(() => {
    const map = new Map<string, number>()
    for (const tx of transactions) {
      if (tx.type === 'income') continue
      map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount)
    }
    return Array.from(map.entries())
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, amount]) => ({
        category,
        label: CATEGORY_LABELS[category] ?? category,
        amount,
      }))
  }, [transactions])

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
        <Skeleton className="mb-4 h-4 w-44" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="mt-3 flex gap-3">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-14 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
      <h3 className="mb-4 text-sm font-semibold">{t('dashboard.categorySpending')}</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('dashboard.noExpenses')}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={90}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <XAxis
              type="number"
              tickFormatter={(n: number) => `$${(n / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), t('dashboard.expensesLabel')]}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
