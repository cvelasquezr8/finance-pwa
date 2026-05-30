'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { TrendingDown, TrendingUp, Wallet, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { useCountUp } from '@/lib/hooks/useCountUp'
import type { BalanceSummaryDTO } from '@/core/dtos'
import { cn } from '@/lib/utils'

/**
 * Shrinks font-size from `max` down to `min` until the text fits its container.
 * Runs synchronously before paint so there is no visible jump.
 */
function useAutoFontSize(text: string, max: number, min: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(max)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    let s = max
    el.style.fontSize = `${s}px`
    while (el.scrollWidth > el.clientWidth && s > min) {
      s -= 0.5
      el.style.fontSize = `${s}px`
    }
    setSize(s)
  }, [text, max, min])

  return { ref, size }
}

interface StatCardProps {
  title: string
  rawValue: number
  subtitle?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  hero?: boolean
  staggerClass?: string
}

function StatCard({
  title,
  rawValue,
  subtitle,
  icon: Icon,
  trend,
  hero,
  staggerClass,
}: StatCardProps) {
  const animated = useCountUp(rawValue)
  const formatted = formatCurrency(animated)

  // Hero card: shrink from 28px down to 13px. Regular: from 24px to 13px.
  const { ref, size } = useAutoFontSize(formatted, hero ? 28 : 24, 13)

  return (
    <Card
      className={cn(
        'animate-fade-in-up',
        staggerClass,
        hero && 'from-primary/8 dark:from-primary/12 bg-gradient-to-br to-transparent'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={cn(
            'rounded-md p-1.5',
            trend === 'up'
              ? 'bg-emerald-500/15 dark:bg-emerald-500/30'
              : trend === 'down'
                ? 'bg-red-500/15 dark:bg-red-500/30'
                : 'bg-primary/15 dark:bg-primary/30'
          )}
        >
          <Icon
            className={cn(
              'h-4 w-4',
              trend === 'up'
                ? 'text-emerald-500 dark:text-emerald-400'
                : trend === 'down'
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-primary'
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={ref}
          style={{ fontSize: size }}
          className={cn(
            'overflow-hidden whitespace-nowrap font-bold tabular-nums tracking-tight',
            hero ? 'text-primary' : ''
          )}
        >
          {formatted}
        </div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

function SkeletonCard({ staggerClass }: { staggerClass?: string }) {
  return (
    <Card className={cn('animate-fade-in-up', staggerClass)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

export function SummaryCards({
  summary,
  isLoading,
  animationKey,
}: {
  summary: BalanceSummaryDTO | null
  isLoading: boolean
  animationKey?: string
}) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4'] as const).map((s) => (
          <SkeletonCard key={s} staggerClass={s} />
        ))}
      </div>
    )
  }

  if (!summary) return null

  const staggerClasses = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4'] as const

  const cards = [
    {
      title: t('summary.currentBalance'),
      rawValue: summary.currentBalance,
      subtitle: t('summary.initialBalance', { amount: formatCurrency(summary.initialBalance) }),
      icon: Wallet,
      trend: summary.currentBalance >= 0 ? ('up' as const) : ('down' as const),
      hero: true,
    },
    {
      title: t('summary.projectedBalance'),
      rawValue: summary.projectedBalance,
      subtitle: t('summary.expectedIncome', { amount: formatCurrency(summary.expectedIncome) }),
      icon: TrendingUp,
      trend: summary.projectedBalance >= 0 ? ('up' as const) : ('down' as const),
    },
    {
      title: t('summary.totalDebt'),
      rawValue: summary.totalDebt,
      subtitle: t('summary.pending', { amount: formatCurrency(summary.totalPendingScheduled) }),
      icon: TrendingDown,
      trend: 'down' as const,
    },
    {
      title: t('summary.dailyExpense'),
      rawValue: summary.dailyAllowance,
      subtitle: t('summary.remainingDays', { days: summary.remainingDays }),
      icon: CalendarDays,
      trend: summary.dailyAllowance > 500 ? ('up' as const) : ('neutral' as const),
    },
  ]

  return (
    <div key={animationKey} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <StatCard key={card.title} {...card} staggerClass={staggerClasses[idx]} />
      ))}
    </div>
  )
}
