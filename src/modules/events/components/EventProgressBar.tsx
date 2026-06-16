import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/lib/hooks/useCurrency'

interface Props {
  contributed: number
  goal: number
}

export function EventProgressBar({ contributed, goal }: Props) {
  const { t } = useTranslation()
  const fmt = useCurrency()
  const pct = goal > 0 ? Math.min(100, (contributed / goal) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('events.progress')}</span>
        <span>
          <span className="font-medium text-foreground">{fmt(contributed)}</span> {t('events.of')}{' '}
          {fmt(goal)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-amber-500 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs font-medium text-amber-600 dark:text-amber-400">
        {pct.toFixed(0)}%
      </p>
    </div>
  )
}
