'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CalendarDays, Loader2, UserPlus, XCircle, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useEventDetail } from '../hooks/useEventDetail'
import { EventProgressBar } from './EventProgressBar'
import { ParticipantList } from './ParticipantList'
import { ShoppingList } from './ShoppingList'
import { InviteParticipantModal } from './InviteParticipantModal'
import { AddTransactionModal } from '@/modules/transactions/components/AddTransactionModal'
import { useCards } from '@/modules/cards/hooks/useCards'
import { transactionService } from '@/services/TransactionService'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { cn, getQuincena } from '@/lib/utils'
import {
  DataTablePagination,
  DataTableSearch,
  MobilePagination,
  SortableHeader,
  SortDropdown,
} from '@/components/ui/data-table'
import { useDataTableState } from '@/lib/hooks/useDataTableState'
import type { AddTransactionFormValues } from '@/modules/transactions/schemas/transactionSchemas'
import type { MonthFilter, QuincenaFilter } from '@/core/types'

const dispatchDataChanged = () => window.dispatchEvent(new CustomEvent('financeDataChanged'))

export function EventDetailPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const { t } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [txModalOpen, setTxModalOpen] = useState(false)

  const { cards } = useCards()

  const tableState = useDataTableState({
    defaultSortBy: 'createdAt',
    defaultOrder: 'desc',
    defaultLimit: 10,
  })

  const {
    event,
    linkedTransactions,
    transactionsTotal,
    isLoading,
    isFetchingTransactions,
    error,
    inviteParticipant,
    respondInvitation,
    addShoppingItem,
    toggleShoppingItem,
  } = useEventDetail(id ?? '', tableState.query)

  const now = new Date()
  const currentFilter: MonthFilter & { quincena: QuincenaFilter } = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    quincena: getQuincena(now),
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center gap-3 p-6">
        <XCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error ?? t('events.noEvents')}</p>
        <Button variant="outline" onClick={() => router.push('/events')}>
          {t('events.navLabel')}
        </Button>
      </div>
    )
  }

  const isCreator = event.createdBy === user?.id
  const contributed = linkedTransactions
    .filter((tx) => tx.status === 'confirmed')
    .reduce((s, tx) => s + tx.amount, 0)

  const usedPct = event.participants.reduce(
    (s, p) => s + (p.status !== 'DECLINED' ? p.assignedPct : 0),
    0
  )

  const participantAliases: Record<string, string> = {}
  event.participants.forEach((p) => {
    participantAliases[p.userId] = p.alias
  })
  if (user) participantAliases[user.id] = user.alias

  const handleInvite = async (dto: Parameters<typeof inviteParticipant>[0]) => {
    try {
      await inviteParticipant(dto)
      toast({ title: t('events.inviteSuccess') })
    } catch (e) {
      toast({ title: (e as Error).message, variant: 'destructive' })
      throw e
    }
  }

  const handleRespond = async (status: 'CONFIRMED' | 'DECLINED') => {
    try {
      await respondInvitation(status)
      toast({ title: t('events.respondSuccess') })
    } catch (e) {
      toast({ title: (e as Error).message, variant: 'destructive' })
    }
  }

  const handleRegisterExpense = async (
    _mode: 'income' | 'egreso',
    description: string,
    amount: number,
    category: AddTransactionFormValues['category'],
    isCC: boolean,
    receipt: File | null,
    f: MonthFilter & { quincena: QuincenaFilter },
    cardId?: string | null,
    eventId?: string | null
  ) => {
    try {
      const quincena =
        f.quincena === 'mensual' ? (now.getDate() <= 15 ? 'primera' : 'segunda') : f.quincena
      const tx = await transactionService.create({
        description,
        amount,
        category: category ?? 'otros',
        type: 'daily',
        quincena,
        dueDay: now.getDate(),
        month: f.month,
        year: f.year,
        isRecurring: false,
        isCC: isCC,
        cardId: cardId ?? null,
        eventId: eventId ?? null,
        userId: user?.id ?? null,
      })
      if (receipt) {
        try {
          await transactionService.uploadReceipt(tx.id, receipt)
        } catch {
          /* best effort */
        }
      }
      toast({ title: t('events.expenseRegistered'), description })
      dispatchDataChanged()
    } catch {
      toast({ title: t('events.expenseError'), variant: 'destructive' })
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(n)

  const sortOptions = [
    { field: 'createdAt', label: t('transactions.date') },
    { field: 'description', label: t('events.columnDescription') },
    { field: 'amount', label: t('events.columnAmount') },
  ]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/events')}
          className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('events.navLabel')}
        </button>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{event.title}</h1>
            {event.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
              event.status === 'ACTIVE' && 'bg-success/15 text-success',
              event.status === 'CANCELLED' && 'bg-destructive/15 text-destructive',
              event.status === 'COMPLETED' && 'bg-primary/15 text-primary'
            )}
          >
            {t(`events.eventStatus.${event.status}`)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{t('events.goal')}:</span>{' '}
            {fmt(event.goalAmount)}
          </span>
          <span>
            <span className="font-medium text-foreground">{t('events.createdBy')}:</span>{' '}
            {participantAliases[event.createdBy] ?? event.createdBy}
          </span>
          {event.deadline && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(event.deadline).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t('events.progress')}</h2>
          {event.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-amber-500/40 text-xs text-amber-600 hover:bg-amber-50/50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
              onClick={() => setTxModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('events.registerExpense')}
            </Button>
          )}
        </div>
        <EventProgressBar contributed={contributed} goal={event.goalAmount} />
      </div>

      {/* Expense History */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">{t('events.expenseHistory')}</h2>

        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DataTableSearch value={tableState.search} onChange={tableState.setSearch} />
          <div className="md:hidden">
            <SortDropdown
              options={sortOptions}
              sortBy={tableState.sortBy}
              order={tableState.order}
              onSortChange={tableState.setSort}
            />
          </div>
        </div>

        {transactionsTotal === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {tableState.debouncedSearch ? t('pagination.noResults') : t('events.noExpensesYet')}
          </p>
        ) : (
          <>
            {/* Mobile: rich cards */}
            <div className="flex flex-col gap-2 md:hidden">
              {linkedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tx.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {fmt(tx.amount)}
                    </p>
                    <span className="mt-0.5 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-2xs font-medium text-amber-700 dark:text-amber-400">
                      {tx.userId
                        ? (participantAliases[tx.userId] ?? tx.userId)
                        : t('events.unknownUser')}
                    </span>
                  </div>
                </div>
              ))}
              <MobilePagination
                page={tableState.page}
                limit={tableState.limit}
                total={transactionsTotal}
                isLoading={isFetchingTransactions}
                onPageChange={tableState.setPage}
                onLoadMore={() => tableState.setPage(tableState.page + 1)}
                variant="load-more"
                className="rounded-lg"
              />
            </div>

            {/* Desktop: compact table */}
            <div className="hidden overflow-hidden rounded-lg border border-border md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      <SortableHeader
                        label={t('events.columnDate')}
                        field="createdAt"
                        active={tableState.sortBy}
                        order={tableState.order}
                        onSort={tableState.toggleSort}
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      {t('events.columnUser')}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                      <SortableHeader
                        label={t('events.columnDescription')}
                        field="description"
                        active={tableState.sortBy}
                        order={tableState.order}
                        onSort={tableState.toggleSort}
                      />
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                      <SortableHeader
                        label={t('events.columnAmount')}
                        field="amount"
                        active={tableState.sortBy}
                        order={tableState.order}
                        onSort={tableState.toggleSort}
                        align="right"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {linkedTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                          {tx.userId
                            ? (participantAliases[tx.userId] ?? tx.userId)
                            : t('events.unknownUser')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{tx.description}</td>
                      <td className="px-3 py-2 text-right text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {fmt(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <DataTablePagination
                page={tableState.page}
                limit={tableState.limit}
                total={transactionsTotal}
                onPageChange={tableState.setPage}
                onLimitChange={tableState.setLimit}
              />
            </div>
          </>
        )}
      </div>

      {/* Participants */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t('events.participants')}</h2>
          {isCreator && event.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t('events.invite')}
            </Button>
          )}
        </div>
        <ParticipantList
          participants={event.participants}
          currentUserId={user?.id ?? ''}
          isCreator={isCreator}
          onRespond={handleRespond}
          onInvite={() => setInviteOpen(true)}
        />
      </div>

      {/* Shopping list */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">{t('events.shoppingList')}</h2>
        <ShoppingList
          items={event.shoppingItems}
          eventId={event.id}
          onAddItem={async (dto) => {
            await addShoppingItem(dto)
            toast({ title: t('events.addItemSuccess') })
          }}
          onToggleItem={async (dto) => {
            await toggleShoppingItem(dto)
          }}
          participantAliases={participantAliases}
        />
      </div>

      <InviteParticipantModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        eventId={event.id}
        usedPct={usedPct}
        onInvite={handleInvite}
      />

      <AddTransactionModal
        filter={currentFilter}
        cards={cards}
        events={[event]}
        defaultEventId={event.id}
        onAdd={handleRegisterExpense}
        open={txModalOpen}
        onOpenChange={(o) => !o && setTxModalOpen(false)}
      />
    </div>
  )
}
