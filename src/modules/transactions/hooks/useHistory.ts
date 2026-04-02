import { useCallback, useEffect, useReducer } from 'react'
import type { TransactionResponseDTO, UpdateTransactionDTO } from '@/core/dtos'
import { transactionService } from '@/services/TransactionService'
import { toast } from '@/components/ui/use-toast'
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

interface State {
  transactions: TransactionResponseDTO[]
  isLoading: boolean
}

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; data: TransactionResponseDTO[] }
  | { type: 'UPDATE_ONE'; tx: TransactionResponseDTO }
  | { type: 'REMOVE_ONE'; id: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING': return { ...state, isLoading: true }
    case 'SUCCESS': return { transactions: action.data, isLoading: false }
    case 'UPDATE_ONE': return { ...state, transactions: state.transactions.map((t) => t.id === action.tx.id ? action.tx : t) }
    case 'REMOVE_ONE': return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) }
  }
}

// Converts month+year to a single comparable integer YYYYMM
function toKey(year: number, month: number) { return year * 100 + month }

export function useHistory(filters: HistoryFilters) {
  const [state, dispatch] = useReducer(reducer, { transactions: [], isLoading: true })

  const fetch = useCallback(async () => {
    dispatch({ type: 'LOADING' })
    try {
      // Fetch the widest possible year range then filter client-side by month
      const years = new Set<number>()
      for (let y = filters.fromYear; y <= filters.toYear; y++) years.add(y)

      const results = await Promise.all(
        Array.from(years).map((year) =>
          transactionService.listHistory({ year, type: filters.type, category: filters.category })
        )
      )

      const fromKey = toKey(filters.fromYear, filters.fromMonth)
      const toKey2   = toKey(filters.toYear, filters.toMonth)

      const all = results.flatMap((r) => r.data).filter((t) => {
        const k = toKey(t.year, t.month)
        return k >= fromKey && k <= toKey2
      })

      all.sort((a, b) => toKey(a.year, a.month) - toKey(b.year, b.month) || a.dueDay - b.dueDay)
      dispatch({ type: 'SUCCESS', data: all })
    } catch {
      toast({ title: 'Error al cargar el historial', variant: 'destructive' })
      dispatch({ type: 'SUCCESS', data: [] })
    }
  }, [filters.fromMonth, filters.fromYear, filters.toMonth, filters.toYear, filters.type, filters.category])

  useEffect(() => { fetch() }, [fetch])

  const updateTransaction = async (id: string, dto: UpdateTransactionDTO) => {
    try {
      const tx = await transactionService.update(id, dto)
      dispatch({ type: 'UPDATE_ONE', tx })
      toast({ title: 'Gasto actualizado' })
      return tx
    } catch {
      toast({ title: 'Error al actualizar', variant: 'destructive' })
    }
  }

  const removeTransaction = async (id: string) => {
    try {
      await transactionService.remove(id)
      dispatch({ type: 'REMOVE_ONE', id })
      toast({ title: 'Gasto eliminado' })
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' })
    }
  }

  // Group by month descending
  const monthMap = new Map<number, GroupedMonth>()
  state.transactions.forEach((t) => {
    const key = toKey(t.year, t.month)
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        month: t.month, year: t.year,
        label: `${MONTHS[t.month - 1]} ${t.year}`,
        scheduled: [], daily: [], income: [],
        totalScheduled: 0, totalDaily: 0, totalIncome: 0,
      })
    }
    const g = monthMap.get(key)!
    if (t.type === 'scheduled') { g.scheduled.push(t); g.totalScheduled += t.amount }
    else if (t.type === 'daily')  { g.daily.push(t);    g.totalDaily    += t.amount }
    else if (t.type === 'income') { g.income.push(t);   g.totalIncome   += t.amount }
  })

  const grouped = Array.from(monthMap.values())
    .sort((a, b) => toKey(a.year, a.month) - toKey(b.year, b.month))

  return { ...state, grouped, updateTransaction, removeTransaction, refetch: fetch }
}
