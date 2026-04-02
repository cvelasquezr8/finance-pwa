import { TrendingDown, TrendingUp, Wallet, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { BalanceSummaryDTO } from '@/core/dtos'
import { cn } from '@/lib/utils'

interface Props {
  summary: BalanceSummaryDTO | null
  isLoading: boolean
}

function StatCard({
  title, value, subtitle, icon: Icon, trend,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn('rounded-md p-1.5',
          trend === 'up'   ? 'bg-emerald-500/15 dark:bg-emerald-500/30' :
          trend === 'down' ? 'bg-red-500/15 dark:bg-red-500/30' :
                             'bg-primary/15 dark:bg-primary/30')}>
          <Icon className={cn('h-4 w-4',
            trend === 'up'   ? 'text-emerald-500 dark:text-emerald-400' :
            trend === 'down' ? 'text-red-500 dark:text-red-400' :
                               'text-primary')} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></CardHeader>
      <CardContent><div className="h-8 w-32 rounded bg-muted animate-pulse" /></CardContent>
    </Card>
  )
}

export function SummaryCards({ summary, isLoading }: Props) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!summary) return null

  const cards = [
    {
      title: t('summary.currentBalance'),
      value: formatCurrency(summary.currentBalance),
      subtitle: t('summary.initialBalance', { amount: formatCurrency(summary.initialBalance) }),
      icon: Wallet,
      trend: summary.currentBalance >= 0 ? 'up' : 'down',
    },
    {
      title: t('summary.projectedBalance'),
      value: formatCurrency(summary.projectedBalance),
      subtitle: t('summary.expectedIncome', { amount: formatCurrency(summary.expectedIncome) }),
      icon: TrendingUp,
      trend: summary.projectedBalance >= 0 ? 'up' : 'down',
    },
    {
      title: t('summary.totalDebt'),
      value: formatCurrency(summary.totalDebt),
      subtitle: t('summary.pending', { amount: formatCurrency(summary.totalPendingScheduled) }),
      icon: TrendingDown,
      trend: 'down',
    },
    {
      title: t('summary.dailyExpense'),
      value: formatCurrency(summary.dailyAllowance),
      subtitle: t('summary.remainingDays', { days: summary.remainingDays }),
      icon: CalendarDays,
      trend: summary.dailyAllowance > 500 ? 'up' : 'neutral',
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} trend={card.trend as 'up' | 'down' | 'neutral'} />
      ))}
    </div>
  )
}
