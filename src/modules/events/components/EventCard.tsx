'use client'

import { useRouter } from 'next/navigation'
import { CalendarDays, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EventProgressBar } from './EventProgressBar'
import { cn } from '@/lib/utils'
import type { BudgetEventDTO } from '@/core/dtos'
import type { TransactionResponseDTO } from '@/core/dtos'

const STATUS_STYLES = {
  ACTIVE: 'bg-success/15 text-success border-l-success',
  COMPLETED: 'bg-primary/15 text-primary border-l-primary',
  CANCELLED: 'bg-destructive/15 text-destructive border-l-destructive',
} as const

interface Props {
  event: BudgetEventDTO
  linkedTransactions: TransactionResponseDTO[]
  staggerIndex?: number
}

export function EventCard({ event, linkedTransactions, staggerIndex = 0 }: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  const contributed = linkedTransactions
    .filter((tx) => tx.eventId === event.id && tx.status === 'confirmed')
    .reduce((s, tx) => s + tx.amount, 0)

  const confirmedCount = event.participants.filter((p) => p.status === 'CONFIRMED').length

  const deadlineDate = event.deadline ? new Date(event.deadline) : null
  const isNearDeadline =
    deadlineDate !== null &&
    deadlineDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
    event.status === 'ACTIVE'

  const staggerClasses = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5']
  const staggerClass = staggerClasses[staggerIndex % staggerClasses.length]

  return (
    <button
      onClick={() => router.push(`/events/${event.id}`)}
      className={cn(
        'w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm',
        'transition-all duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]',
        'animate-fade-in-up',
        staggerClass
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-snug">{event.title}</p>
          {event.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{event.description}</p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full border-l-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            STATUS_STYLES[event.status]
          )}
        >
          {t(`events.eventStatus.${event.status}`)}
        </span>
      </div>

      <EventProgressBar contributed={contributed} goal={event.goalAmount} />

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {confirmedCount} {t('events.participants')}
        </span>
        {deadlineDate && (
          <span
            className={cn(
              'flex items-center gap-1',
              isNearDeadline && 'animate-pulse font-medium text-amber-500 dark:text-amber-400'
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {deadlineDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
      </div>
    </button>
  )
}
