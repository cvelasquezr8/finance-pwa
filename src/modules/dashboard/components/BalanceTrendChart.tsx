'use client'

import { useTranslation } from 'react-i18next'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useBalanceTrend } from '../hooks/useBalanceTrend'
import { cn } from '@/lib/utils'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { Skeleton } from '@/components/ui/skeleton'

const INCOME_COLOR = 'hsl(var(--primary))'
const EXPENSE_COLOR = 'hsl(var(--muted-foreground) / 0.4)'

export function BalanceTrendChart({ className }: { className?: string }) {
  const { t } = useTranslation()
  const formatCurrency = useCurrency()
  const { data, isLoading } = useBalanceTrend(6)

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="relative h-[220px] overflow-hidden rounded-lg">
          <Skeleton className="h-full w-full" />
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute left-0 right-0 border-b border-muted-foreground/10"
              style={{ top: `${pct}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('dashboard.balanceTrend')}</h3>
        <span className="text-xs text-muted-foreground">{t('dashboard.last6Months')}</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={INCOME_COLOR} stopOpacity={0.25} />
              <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={EXPENSE_COLOR} stopOpacity={0.2} />
              <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(n: number) => `$${(n / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              name === 'income' ? t('dashboard.incomeLabel') : t('dashboard.expensesLabel'),
            ]}
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: 12,
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
          />
          <Legend
            formatter={(value) =>
              value === 'income' ? t('dashboard.incomeLabel') : t('dashboard.expensesLabel')
            }
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke={INCOME_COLOR}
            strokeWidth={2}
            fill="url(#incomeGrad)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke={EXPENSE_COLOR}
            strokeWidth={2}
            fill="url(#expenseGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
