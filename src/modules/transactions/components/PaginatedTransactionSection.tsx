'use client'

import { useTranslation } from 'react-i18next'
import { TransactionTable } from './TransactionTable'
import {
  DataTablePagination,
  DataTableSearch,
  MobilePagination,
  SortDropdown,
  type SortOption,
} from '@/components/ui/data-table'
import { useDataTableState } from '@/lib/hooks/useDataTableState'
import { useTransactionsQuery } from '../hooks/useTransactions'
import type { CardDTO, UpdateTransactionDTO } from '@/core/dtos'
import type { MonthFilter, QuincenaFilter } from '@/core/types'

interface Props {
  title: string
  filter: MonthFilter & { quincena?: QuincenaFilter }
  type: 'scheduled' | 'daily' | 'income'
  cardFilter: string
  cards: CardDTO[]
  showConfirmColumn?: boolean
  showReceiptColumn?: boolean
  onConfirm?: (id: string, confirmed: boolean) => Promise<void>
  onMutated?: () => void
  hideWhenEmpty?: boolean
}

export function PaginatedTransactionSection({
  title,
  filter,
  type,
  cardFilter,
  cards,
  showConfirmColumn = false,
  showReceiptColumn = false,
  onConfirm,
  onMutated,
  hideWhenEmpty = false,
}: Props) {
  const { t } = useTranslation()
  const tableState = useDataTableState({
    defaultSortBy: 'date',
    defaultOrder: 'asc',
    defaultLimit: 10,
  })

  const {
    transactions,
    total,
    isLoading,
    isFetching,
    confirmTransaction,
    removeTransaction,
    updateTransaction,
  } = useTransactionsQuery({
    ...filter,
    type,
    cardId: cardFilter === 'all' ? undefined : cardFilter,
    ...tableState.query,
  })

  const handleConfirm = async (id: string, confirmed: boolean) => {
    if (onConfirm) await onConfirm(id, confirmed)
    else await confirmTransaction(id, confirmed)
    onMutated?.()
  }

  const handleDelete = async (id: string) => {
    await removeTransaction(id)
    onMutated?.()
  }

  const handleEdit = async (id: string, dto: UpdateTransactionDTO) => {
    const result = await updateTransaction(id, dto)
    onMutated?.()
    return result
  }

  if (hideWhenEmpty && !isLoading && total === 0 && !tableState.debouncedSearch) {
    return null
  }

  const sortOptions: SortOption[] = [
    { field: 'date', label: t('transactions.date') },
    { field: 'amount', label: t('transactions.amount') },
    { field: 'description', label: t('transactions.description') },
    { field: 'category', label: t('transactions.category') },
  ]

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DataTableSearch
            value={tableState.search}
            onChange={tableState.setSearch}
            className="sm:w-64"
          />
          <div className="md:hidden">
            <SortDropdown
              options={sortOptions}
              sortBy={tableState.sortBy}
              order={tableState.order}
              onSortChange={tableState.setSort}
            />
          </div>
        </div>
      </div>

      <TransactionTable
        title=""
        transactions={transactions}
        cards={cards}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
        onEdit={handleEdit}
        showConfirmColumn={showConfirmColumn}
        showReceiptColumn={showReceiptColumn}
        sortBy={tableState.sortBy}
        order={tableState.order}
        onSort={tableState.toggleSort}
      />

      <div className="-mt-3 overflow-hidden rounded-b-lg border-x border-b border-border">
        <DataTablePagination
          page={tableState.page}
          limit={tableState.limit}
          total={total}
          onPageChange={tableState.setPage}
          onLimitChange={tableState.setLimit}
          className="border-t-0"
        />
        <MobilePagination
          page={tableState.page}
          limit={tableState.limit}
          total={total}
          isLoading={isFetching}
          onPageChange={tableState.setPage}
          onLoadMore={() => tableState.setPage(tableState.page + 1)}
          variant="compact"
          className="border-t-0"
        />
      </div>
    </section>
  )
}
