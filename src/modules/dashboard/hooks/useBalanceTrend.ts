import { useSuspenseQuery } from '@tanstack/react-query'
import { balanceService } from '@/services/TransactionService'
import type { MonthlyTrendDTO } from '@/core/dtos'

export function useBalanceTrend(months = 6): { data: MonthlyTrendDTO[]; isLoading: false } {
  const { data } = useSuspenseQuery<MonthlyTrendDTO[]>({
    queryKey: ['balance-trend', months],
    queryFn: () => balanceService.getMonthlyTrend(months),
    staleTime: 5 * 60_000,
  })
  return { data, isLoading: false }
}
