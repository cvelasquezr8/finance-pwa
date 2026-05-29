'use client'

import { useState } from 'react'
import { PartyPopper, Plus, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEvents } from '../hooks/useEvents'
import { EventCard } from './EventCard'
import { CreateEventModal } from './CreateEventModal'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import type { CreateEventDTO } from '@/core/dtos'

export function EventsPage() {
  const { t } = useTranslation()
  const { events, allLinkedTransactions, isLoading, createEvent } = useEvents()
  const [createOpen, setCreateOpen] = useState(false)

  const handleCreate = async (dto: CreateEventDTO) => {
    await createEvent(dto)
    toast({ title: t('events.createSuccess') })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header — wraps on very small screens */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t('events.title')}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('events.subtitle')}</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="shrink-0 gap-2 bg-amber-500 text-white hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          <span className="xs:inline hidden">{t('events.createEvent')}</span>
          <span className="xs:hidden">{t('events.create')}</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          <p className="font-medium">{t('events.noEvents')}</p>
          <p className="text-sm text-muted-foreground">{t('events.noEvents')}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="mt-1 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('events.createEvent')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, idx) => (
            <EventCard
              key={event.id}
              event={event}
              linkedTransactions={allLinkedTransactions}
              staggerIndex={idx}
            />
          ))}
        </div>
      )}

      <CreateEventModal open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
    </div>
  )
}
