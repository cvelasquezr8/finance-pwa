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
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const INCOME_COLOR = '#f59e0b'
const EXPENSE_COLOR = '#78716c'

export function BalanceTrendChart({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { data, isLoading } = useBalanceTrend(6)

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-[220px] animate-pulse rounded bg-muted" />
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
