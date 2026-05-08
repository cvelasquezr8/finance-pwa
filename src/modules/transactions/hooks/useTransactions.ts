import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import type {
  CreateTransactionDTO,
  PaginatedResponseDTO,
  PaginationQueryDTO,
  TransactionResponseDTO,
  UpdateTransactionDTO,
} from '@/core/dtos'
import { transactionService, type TransactionListFilter } from '@/services/TransactionService'
import { toast } from '@/lib/toast'

const EMPTY_PAGE: PaginatedResponseDTO<TransactionResponseDTO> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  hasMore: false,
}

export type TransactionsQueryArgs = MonthFilter & {
  quincena?: QuincenaFilter
  type?: 'scheduled' | 'daily' | 'income' | 'all'
  cardId?: string | null
} & PaginationQueryDTO

export function useTransactionsQuery(args: TransactionsQueryArgs) {
  const queryClient = useQueryClient()
  const filter: TransactionListFilter = args

  const query = useQuery({
    queryKey: ['transactions', 'list', filter],
    queryFn: () => transactionService.list(filter),
    placeholderData: keepPreviousData,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false })

  const addMutation = useMutation({
    mutationFn: (dto: CreateTransactionDTO) => transactionService.create(dto),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['balance'], exact: false })
      toast({ title: 'Gasto agregado' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo agregar el gasto', variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTransactionDTO }) =>
      transactionService.update(id, dto),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['balance'], exact: false })
      toast({ title: 'Gasto actualizado' })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el gasto',
        variant: 'destructive',
      })
    },
  })

  const confirmMutation = useMutation({
    mutationFn: ({ id, confirmed }: { id: string; confirmed: boolean }) =>
      transactionService.confirm({ transactionId: id, confirmed }),
    onSuccess: (_, vars) => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['balance'], exact: false })
      toast({ title: vars.confirmed ? 'Gasto confirmado' : 'Confirmación removida' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => transactionService.remove(id),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['balance'], exact: false })
      toast({ title: 'Gasto eliminado' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    },
  })

  const data = query.data ?? EMPTY_PAGE

  return {
    transactions: data.data,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    hasMore: data.hasMore,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
    addTransaction: (dto: CreateTransactionDTO) => addMutation.mutateAsync(dto),
    updateTransaction: (id: string, dto: UpdateTransactionDTO) =>
      updateMutation.mutateAsync({ id, dto }),
    confirmTransaction: (id: string, confirmed: boolean) =>
      confirmMutation.mutateAsync({ id, confirmed }),
    removeTransaction: (id: string) => removeMutation.mutateAsync(id),
  }
}

// Backward compatible signature for components that fetch the entire month
export function useTransactions(filter: MonthFilter & { quincena?: QuincenaFilter }) {
  const result = useTransactionsQuery({ ...filter, page: 1, limit: 500 })
  const scheduled = result.transactions.filter((t) => t.type === 'scheduled')
  const daily = result.transactions.filter((t) => t.type === 'daily')
  const income = result.transactions.filter((t) => t.type === 'income')
  return { ...result, scheduled, daily, income }
}
