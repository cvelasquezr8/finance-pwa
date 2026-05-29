'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, History, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useHistory, type HistoryFilters, type GroupedMonth } from '../hooks/useHistory'
import { TransactionTable } from './TransactionTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DataTablePagination,
  DataTableSearch,
  MobilePagination,
  SortDropdown,
  type SortOption,
} from '@/components/ui/data-table'
import { useDataTableState } from '@/lib/hooks/useDataTableState'
import { formatCurrency, CATEGORY_LABELS } from '@/lib/utils'
import type { UpdateTransactionDTO } from '@/core/dtos'

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

function MonthYearPicker({
  label,
  month,
  year,
  onChange,
}: {
  label: string
  month: number
  year: number
  onChange: (month: number, year: number) => void
}) {
  const { t } = useTranslation()
  const months = t('months', { returnObjects: true }) as string[]

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex gap-1.5">
        <Select value={month.toString()} onValueChange={(v) => onChange(Number(v), year)}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year.toString()} onValueChange={(v) => onChange(month, Number(v))}>
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function FilterBar({
  filters,
  onChange,
}: {
  filters: HistoryFilters
  onChange: (f: HistoryFilters) => void
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(filters)

  const apply = () => {
    const fromKey = draft.fromYear * 100 + draft.fromMonth
    const toKey = draft.toYear * 100 + draft.toMonth
    if (fromKey > toKey) {
      onChange({
        ...draft,
        fromMonth: draft.toMonth,
        fromYear: draft.toYear,
        toMonth: draft.fromMonth,
        toYear: draft.fromYear,
      })
    } else {
      onChange(draft)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <MonthYearPicker
          label={t('history.from')}
          month={draft.fromMonth}
          year={draft.fromYear}
          onChange={(m, y) => setDraft((d) => ({ ...d, fromMonth: m, fromYear: y }))}
        />
        <ArrowRight className="mb-1.5 hidden h-4 w-4 text-muted-foreground sm:block" />
        <MonthYearPicker
          label={t('history.to')}
          month={draft.toMonth}
          year={draft.toYear}
          onChange={(m, y) => setDraft((d) => ({ ...d, toMonth: m, toYear: y }))}
        />
        <Button size="sm" className="mb-0.5" onClick={apply}>
          {t('history.search')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border p-0.5">
          {(
            [
              ['all', t('history.all')],
              ['scheduled', t('history.scheduledFilter')],
              ['daily', t('history.dailyFilter')],
              ['income', t('history.incomeFilter')],
            ] as const
          ).map(([v, lbl]) => (
            <button
              key={v}
              onClick={() => onChange({ ...filters, type: v })}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filters.type === v
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        <Select
          value={filters.category}
          onValueChange={(v) => onChange({ ...filters, category: v })}
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder={t('history.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('history.allCategories')}</SelectItem>
            {Object.keys(CATEGORY_LABELS).map((k) => (
              <SelectItem key={k} value={k}>
                {t(`categories.${k}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function MonthGroup({
  group,
  onEdit,
  onDelete,
}: {
  group: GroupedMonth
  onEdit: (id: string, dto: UpdateTransactionDTO) => Promise<unknown>
  onDelete: (id: string) => Promise<void>
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const total = group.totalScheduled + group.totalDaily

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-muted/40 px-5 py-3.5 transition-colors hover:bg-muted/60"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">{group.label}</span>
          <Badge variant="outline" className="text-xs">
            {t('history.transactions', {
              count: group.scheduled.length + group.daily.length + group.income.length,
            })}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-muted-foreground">{t('history.total')}</p>
            <p className="font-mono text-sm font-bold text-red-600 dark:text-red-400">
              {formatCurrency(total)}
            </p>
          </div>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="animate-fade-in space-y-5 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">{t('history.incomeLabel')}</p>
              <p className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(group.totalIncome)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">{t('history.scheduledLabel')}</p>
              <p className="font-mono text-sm font-semibold text-red-600 dark:text-red-400">
                -{formatCurrency(group.totalScheduled)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">{t('history.dailyLabel')}</p>
              <p className="font-mono text-sm font-semibold text-orange-600 dark:text-orange-400">
                -{formatCurrency(group.totalDaily)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">{t('history.net')}</p>
              <p
                className={`font-mono text-sm font-semibold ${total >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {formatCurrency(group.totalIncome - group.totalScheduled - group.totalDaily)}
              </p>
            </div>
          </div>

          {group.income.length > 0 && (
            <TransactionTable
              title={t('dashboard.income')}
              transactions={group.income}
              isLoading={false}
              onConfirm={async () => {}}
              onDelete={onDelete}
              onEdit={onEdit}
              showConfirmColumn={false}
              showReceiptColumn={false}
            />
          )}

          {group.scheduled.length > 0 && (
            <TransactionTable
              title={t('dashboard.scheduledExpenses')}
              transactions={group.scheduled}
              isLoading={false}
              onConfirm={async () => {}}
              onDelete={onDelete}
              onEdit={onEdit}
              showConfirmColumn={false}
              showReceiptColumn
            />
          )}

          {group.daily.length > 0 && (
            <TransactionTable
              title={t('dashboard.dailyExpenses')}
              transactions={group.daily}
              isLoading={false}
              onConfirm={async () => {}}
              onDelete={onDelete}
              onEdit={onEdit}
              showConfirmColumn={false}
              showReceiptColumn
            />
          )}
        </div>
      )}
    </div>
  )
}

function defaultFilters(): HistoryFilters {
  const now = new Date()
  return {
    fromMonth: now.getMonth() === 0 ? 12 : now.getMonth(),
    fromYear: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    toMonth: now.getMonth() + 1,
    toYear: now.getFullYear(),
    type: 'all',
    category: 'all',
  }
}

export function HistoryPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<HistoryFilters>(defaultFilters)
  const tableState = useDataTableState({
    defaultSortBy: 'date',
    defaultOrder: 'desc',
    defaultLimit: 20,
  })

  const { grouped, total, isLoading, isFetching, updateTransaction, removeTransaction } =
    useHistory(filters, tableState.query)

  const months = t('months', { returnObjects: true }) as string[]

  const grandIncome = grouped.reduce((s, g) => s + g.totalIncome, 0)
  const grandScheduled = grouped.reduce((s, g) => s + g.totalScheduled, 0)
  const grandDaily = grouped.reduce((s, g) => s + g.totalDaily, 0)
  const grandTotal = grandIncome - grandScheduled - grandDaily

  const rangeLabel = `${months[filters.fromMonth - 1]} ${filters.fromYear} — ${months[filters.toMonth - 1]} ${filters.toYear}`

  const sortOptions: SortOption[] = [
    { field: 'date', label: t('transactions.date') },
    { field: 'amount', label: t('transactions.amount') },
    { field: 'description', label: t('transactions.description') },
    { field: 'category', label: t('transactions.category') },
  ]

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <History className="h-6 w-6" /> {t('history.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{rangeLabel}</p>
      </div>

      <FilterBar
        filters={filters}
        onChange={(f) => {
          setFilters(f)
          tableState.resetPage()
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      {!isLoading && total > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: t('history.incomeLabel'),
              value: grandIncome,
              color: 'text-emerald-600 dark:text-emerald-400',
              prefix: '+',
            },
            {
              label: t('history.scheduledLabel'),
              value: grandScheduled,
              color: 'text-red-600 dark:text-red-400',
              prefix: '-',
            },
            {
              label: t('history.dailyLabel'),
              value: grandDaily,
              color: 'text-orange-600 dark:text-orange-400',
              prefix: '-',
            },
            {
              label: t('history.net'),
              value: grandTotal,
              color:
                grandTotal >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              prefix: grandTotal >= 0 ? '+' : '',
            },
          ].map(({ label, value, color, prefix }) => (
            <Card key={label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs uppercase text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`font-mono text-lg font-bold ${color}`}>
                  {prefix}
                  {formatCurrency(Math.abs(value))}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-muted/20" />
        ))
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <History className="h-10 w-10 opacity-30" />
          <p>{tableState.debouncedSearch ? t('pagination.noResults') : t('history.empty')}</p>
          <p className="text-xs">{rangeLabel}</p>
        </div>
      ) : (
        <>
          {grouped.map((g) => (
            <MonthGroup
              key={`${g.year}-${g.month}`}
              group={g}
              onEdit={updateTransaction}
              onDelete={removeTransaction}
            />
          ))}

          <div className="overflow-hidden rounded-xl border border-border bg-card">
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
              variant="load-more"
              className="border-t-0"
            />
          </div>
        </>
      )}
    </div>
  )
}
