import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Search,
  Inbox,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { SortOrder } from '@/lib/hooks/useDataTableState'

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const

// ─── Search input ─────────────────────────────────────────────────────────────

interface DataTableSearchProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function DataTableSearch({ value, onChange, placeholder, className }: DataTableSearchProps) {
  const { t } = useTranslation()
  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('pagination.searchPlaceholder')}
        className="pl-8"
      />
    </div>
  )
}

// ─── Sortable column header ───────────────────────────────────────────────────

interface SortableHeaderProps {
  label: string
  field: string
  active: string
  order: SortOrder
  onSort: (field: string) => void
  align?: 'left' | 'right' | 'center'
  className?: string
}

export function SortableHeader({
  label,
  field,
  active,
  order,
  onSort,
  align = 'left',
  className,
}: SortableHeaderProps) {
  const isActive = active === field
  const justify =
    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'group inline-flex w-full items-center gap-1 text-left font-medium text-muted-foreground transition-colors hover:text-foreground',
        justify,
        className
      )}
    >
      <span>{label}</span>
      {isActive ? (
        order === 'asc' ? (
          <ChevronUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        )
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 transition-opacity group-hover:opacity-80" />
      )}
    </button>
  )
}

// ─── Mobile sort dropdown ─────────────────────────────────────────────────────

export interface SortOption {
  field: string
  label: string
}

interface SortDropdownProps {
  options: SortOption[]
  sortBy: string
  order: SortOrder
  onSortChange: (sortBy: string, order: SortOrder) => void
  className?: string
}

export function SortDropdown({
  options,
  sortBy,
  order,
  onSortChange,
  className,
}: SortDropdownProps) {
  const { t } = useTranslation()
  // Encode value as "field:order" so the Radix Select can model both.
  const value = `${sortBy}:${order}`

  const handleChange = (next: string) => {
    const [field, ord] = next.split(':') as [string, SortOrder]
    onSortChange(field, ord)
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={cn('h-9 w-auto gap-1.5 text-xs sm:max-w-[200px]', className)}>
        <span className="text-muted-foreground">{t('pagination.sortBy')}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.flatMap((opt) => [
          <SelectItem key={`${opt.field}:asc`} value={`${opt.field}:asc`}>
            {opt.label} ↑
          </SelectItem>,
          <SelectItem key={`${opt.field}:desc`} value={`${opt.field}:desc`}>
            {opt.label} ↓
          </SelectItem>,
        ])}
      </SelectContent>
    </Select>
  )
}

// ─── Pagination footer (desktop) ──────────────────────────────────────────────

interface DataTablePaginationProps {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  pageSizeOptions?: readonly number[]
  className?: string
}

function buildPages(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(totalPages - 1, current + 1)
  if (start > 2) pages.push('ellipsis')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < totalPages - 1) pages.push('ellipsis')
  pages.push(totalPages)
  return pages
}

export function DataTablePagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
}: DataTablePaginationProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const pages = buildPages(page, totalPages)
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(total, page * limit)

  return (
    <div
      className={cn(
        'hidden flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-2.5 text-xs md:flex',
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>{t('pagination.rowsPerPage')}</span>
        <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
          <SelectTrigger className="h-8 w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="hidden lg:inline">{t('pagination.showing', { from, to, total })}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('pagination.previous')}</span>
        </Button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 w-8 p-0 text-xs',
                p === page &&
                  'bg-amber-500 text-white shadow-sm hover:bg-amber-500/90 dark:bg-amber-600 dark:hover:bg-amber-600/90'
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline">{t('pagination.next')}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Mobile pagination (Load More + Page X of Y) ──────────────────────────────

interface MobilePaginationProps {
  page: number
  limit: number
  total: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  onLoadMore?: () => void
  variant?: 'load-more' | 'compact'
  className?: string
}

export function MobilePagination({
  page,
  limit,
  total,
  isLoading,
  onPageChange,
  onLoadMore,
  variant = 'compact',
  className,
}: MobilePaginationProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const hasMore = page < totalPages

  if (variant === 'load-more') {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-2 border-t border-border bg-muted/20 px-4 py-3 md:hidden',
          className
        )}
      >
        {hasMore ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onLoadMore?.()}
            className="w-full border-amber-500/40 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
          >
            {isLoading ? t('pagination.loading') : t('pagination.loadMore')}
          </Button>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          {t('pagination.pageOf', { page, total: totalPages })} · {total} {t('pagination.records')}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-4 py-2 text-xs md:hidden',
        className
      )}
    >
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1 px-2 text-xs"
        disabled={page <= 1 || isLoading}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {t('pagination.previous')}
      </Button>
      <span className="font-medium text-muted-foreground">
        {t('pagination.pageOf', { page, total: totalPages })}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1 px-2 text-xs"
        disabled={!hasMore || isLoading}
        onClick={() => onPageChange(page + 1)}
      >
        {t('pagination.next')}
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

interface DataTableEmptyProps {
  message?: string
  className?: string
}

export function DataTableEmpty({ message, className }: DataTableEmptyProps) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-4 py-12 text-center',
        className
      )}
    >
      <Inbox className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message ?? t('pagination.noResults')}</p>
    </div>
  )
}
