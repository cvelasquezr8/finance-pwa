import { useEffect, useState } from 'react'
import { balanceService } from '@/services/TransactionService'
import type { MonthlyTrendDTO } from '@/core/dtos'

export function useBalanceTrend(months = 6): { data: MonthlyTrendDTO[]; isLoading: boolean } {
  const [data, setData] = useState<MonthlyTrendDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    balanceService
      .getMonthlyTrend(months)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [months])

  return { data, isLoading }
}
