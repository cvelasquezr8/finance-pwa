import { useCallback, useEffect, useState } from 'react'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import type { BalanceSummaryDTO, AdjustBalanceDTO } from '@/core/dtos'
import { balanceService } from '@/services/TransactionService'
import { toast } from '@/components/ui/use-toast'

export function useDashboard(filter: MonthFilter & { quincena?: QuincenaFilter }) {
  const [summary, setSummary] = useState<BalanceSummaryDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await balanceService.getSummary(filter)
      setSummary(data)
    } catch {
      toast({ title: 'Error al cargar el resumen', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [filter.month, filter.year, filter.quincena])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  const adjustBalance = async (dto: AdjustBalanceDTO) => {
    try {
      const data = await balanceService.adjust(dto)
      setSummary(data)
      toast({ title: 'Balance ajustado', description: `Nuevo saldo: $${dto.newBalance.toLocaleString('es-MX')}` })
    } catch {
      toast({ title: 'Error al ajustar balance', variant: 'destructive' })
    }
  }

  const addIncome = async (description: string, amount: number) => {
    try {
      const data = await balanceService.addIncome({ description, amount })
      setSummary(data)
      toast({ title: 'Saldo agregado', description: `+${amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}` })
    } catch {
      toast({ title: 'Error al agregar saldo', variant: 'destructive' })
    }
  }

  return { summary, isLoading, adjustBalance, addIncome, refetch: fetchSummary }
}
