import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import type {
  PaginatedResponseDTO,
  PaginationQueryDTO,
  TransactionResponseDTO,
  UpdateTransactionDTO,
} from '@/core/dtos'
import { transactionService, type TransactionHistoryFilter } from '@/services/TransactionService'
import { toast } from '@/lib/toast'
import { MONTHS } from '@/lib/utils'

export interface HistoryFilters {
  fromMonth: number
  fromYear: number
  toMonth: number
  toYear: number
  type: 'scheduled' | 'daily' | 'income' | 'all'
  category: string
}

export interface GroupedMonth {
  month: number
  year: number
  label: string
  scheduled: TransactionResponseDTO[]
  daily: TransactionResponseDTO[]
  income: TransactionResponseDTO[]
  totalScheduled: number
  totalDaily: number
  totalIncome: number
}

const EMPTY_PAGE: PaginatedResponseDTO<TransactionResponseDTO> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  hasMore: false,
}

function toKey(year: number, month: number) {
  return year * 100 + month
}

export function useHistory(filters: HistoryFilters, pagination: PaginationQueryDTO = {}) {
  const queryClient = useQueryClient()
  const params: TransactionHistoryFilter = { ...filters, ...pagination }

  const query = useQuery({
    queryKey: ['transactions', 'history', params],
    queryFn: () => transactionService.listHistory(params),
    placeholderData: keepPreviousData,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTransactionDTO }) =>
      transactionService.update(id, dto),
    onSuccess: () => {
      invalidate()
      toast({ title: 'Gasto actualizado' })
    },
    onError: () => toast({ title: 'Error al actualizar', variant: 'destructive' }),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => transactionService.remove(id),
    onSuccess: () => {
      invalidate()
      toast({ title: 'Gasto eliminado' })
    },
    onError: () => toast({ title: 'Error al eliminar', variant: 'destructive' }),
  })

  const data = query.data ?? EMPTY_PAGE

  // Group the current page only — server-side pagination scope.
  const monthMap = new Map<number, GroupedMonth>()
  data.data.forEach((t) => {
    const key = toKey(t.year, t.month)
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        month: t.month,
        year: t.year,
        label: `${MONTHS[t.month - 1]} ${t.year}`,
        scheduled: [],
        daily: [],
        income: [],
        totalScheduled: 0,
        totalDaily: 0,
        totalIncome: 0,
      })
    }
    const g = monthMap.get(key)!
    if (t.type === 'scheduled') {
      g.scheduled.push(t)
      g.totalScheduled += t.amount
    } else if (t.type === 'daily') {
      g.daily.push(t)
      g.totalDaily += t.amount
    } else if (t.type === 'income') {
      g.income.push(t)
      g.totalIncome += t.amount
    }
  })

  const grouped = Array.from(monthMap.values()).sort(
    (a, b) => toKey(b.year, b.month) - toKey(a.year, a.month)
  )

  return {
    transactions: data.data,
    grouped,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    hasMore: data.hasMore,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    updateTransaction: (id: string, dto: UpdateTransactionDTO) =>
      updateMutation.mutateAsync({ id, dto }),
    removeTransaction: (id: string) => removeMutation.mutateAsync(id),
  }
}
