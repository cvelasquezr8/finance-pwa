'use client'

import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventParticipant } from '@/core/types'

const STATUS_CONFIG = {
  CONFIRMED: {
    icon: CheckCircle2,
    cls: 'text-success',
    badge: 'bg-success/15 text-success',
  },
  PENDING_CONFIRMATION: {
    icon: Clock,
    cls: 'text-warning',
    badge: 'bg-warning/15 text-warning',
  },
  DECLINED: {
    icon: XCircle,
    cls: 'text-destructive',
    badge: 'bg-destructive/15 text-destructive',
  },
} as const

interface Props {
  participants: EventParticipant[]
  currentUserId: string
  isCreator: boolean
  onRespond?: (status: 'CONFIRMED' | 'DECLINED') => void
  onInvite?: () => void
}

export function ParticipantList({
  participants,
  currentUserId,
  isCreator,
  onRespond,
  onInvite,
}: Props) {
  const { t } = useTranslation()

  if (participants.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('events.noParticipants')}</p>
        {isCreator && (
          <button onClick={onInvite} className="text-sm font-medium text-primary hover:underline">
            + {t('events.invite')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {participants.map((p) => {
        const cfg = STATUS_CONFIG[p.status]
        const StatusIcon = cfg.icon
        const isCurrentUser = p.userId === currentUserId

        return (
          <div
            key={p.userId}
            className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <StatusIcon className={cn('h-4 w-4 shrink-0', cfg.cls)} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.alias}</p>
                <p className="text-xs text-muted-foreground">{p.assignedPct}%</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cfg.badge)}>
                {t(`events.status.${p.status}`)}
              </span>
              {isCurrentUser && p.status === 'PENDING_CONFIRMATION' && onRespond && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onRespond('CONFIRMED')}
                    className="rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success hover:bg-success/25"
                  >
                    {t('events.confirmAttendance')}
                  </button>
                  <button
                    onClick={() => onRespond('DECLINED')}
                    className="rounded-md bg-destructive/15 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/25"
                  >
                    {t('events.declineAttendance')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
      {isCreator && (
        <button
          onClick={onInvite}
          className="mt-1 text-sm font-medium text-primary hover:underline"
        >
          + {t('events.invite')}
        </button>
      )}
    </div>
  )
}
