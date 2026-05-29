import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import type { BalanceSummaryDTO, AdjustBalanceDTO } from '@/core/dtos'
import { balanceService } from '@/services/TransactionService'
import { toast } from '@/lib/toast'

export function dashboardQueryKey(filter: MonthFilter & { quincena?: QuincenaFilter }) {
  return ['dashboard', filter.month, filter.year, filter.quincena ?? 'mensual'] as const
}

export function useDashboard(filter: MonthFilter & { quincena?: QuincenaFilter }) {
  const queryClient = useQueryClient()

  const { data: summary, refetch } = useSuspenseQuery<BalanceSummaryDTO>({
    queryKey: dashboardQueryKey(filter),
    queryFn: () => balanceService.getSummary(filter),
    staleTime: 30_000,
  })

  const adjustMutation = useMutation({
    mutationFn: (dto: AdjustBalanceDTO) => balanceService.adjust(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardQueryKey(filter), data)
      toast({
        title: 'Balance ajustado',
        description: `Nuevo saldo: $${data.currentBalance.toLocaleString('es-MX')}`,
      })
    },
    onError: () => toast({ title: 'Error al ajustar balance', variant: 'destructive' }),
  })

  const incomeMutation = useMutation({
    mutationFn: ({ description, amount }: { description: string; amount: number }) =>
      balanceService.addIncome({ description, amount }),
    onSuccess: (data) => {
      queryClient.setQueryData(dashboardQueryKey(filter), data)
      toast({ title: 'Saldo agregado' })
    },
    onError: () => toast({ title: 'Error al agregar saldo', variant: 'destructive' }),
  })

  return {
    summary,
    isLoading: false,
    adjustBalance: (dto: AdjustBalanceDTO) => adjustMutation.mutateAsync(dto),
    addIncome: (description: string, amount: number) =>
      incomeMutation.mutateAsync({ description, amount }),
    refetch,
  }
}
