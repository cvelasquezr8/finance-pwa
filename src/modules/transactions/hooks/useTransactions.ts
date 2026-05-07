import { useCallback, useEffect, useReducer } from 'react'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import type {
  TransactionResponseDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO,
} from '@/core/dtos'
import { transactionService } from '@/services/TransactionService'
import { toast } from '@/lib/toast'

interface State {
  transactions: TransactionResponseDTO[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; data: TransactionResponseDTO[] }
  | { type: 'ERROR'; error: string }
  | { type: 'UPDATE_ONE'; tx: TransactionResponseDTO }
  | { type: 'ADD_ONE'; tx: TransactionResponseDTO }
  | { type: 'REMOVE_ONE'; id: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true, error: null }
    case 'SUCCESS':
      return { transactions: action.data, isLoading: false, error: null }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.error }
    case 'UPDATE_ONE':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.tx.id ? action.tx : t)),
      }
    case 'ADD_ONE':
      return { ...state, transactions: [action.tx, ...state.transactions] }
    case 'REMOVE_ONE':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) }
  }
}

export function useTransactions(filter: MonthFilter & { quincena?: QuincenaFilter }) {
  const [state, dispatch] = useReducer(reducer, { transactions: [], isLoading: true, error: null })

  const fetchTransactions = useCallback(async () => {
    dispatch({ type: 'LOADING' })
    try {
      const res = await transactionService.list(filter)
      dispatch({ type: 'SUCCESS', data: res.data })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar transacciones'
      dispatch({ type: 'ERROR', error: msg })
    }
  }, [filter.month, filter.year, filter.quincena])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (dto: CreateTransactionDTO) => {
    try {
      const tx = await transactionService.create(dto)
      dispatch({ type: 'ADD_ONE', tx })
      toast({ title: 'Gasto agregado', description: dto.description })
      return tx
    } catch {
      toast({ title: 'Error', description: 'No se pudo agregar el gasto', variant: 'destructive' })
    }
  }

  const updateTransaction = async (id: string, dto: UpdateTransactionDTO) => {
    try {
      const tx = await transactionService.update(id, dto)
      dispatch({ type: 'UPDATE_ONE', tx })
      toast({ title: 'Gasto actualizado' })
      return tx
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el gasto',
        variant: 'destructive',
      })
    }
  }

  const confirmTransaction = async (id: string, confirmed: boolean) => {
    try {
      const tx = await transactionService.confirm({ transactionId: id, confirmed })
      dispatch({ type: 'UPDATE_ONE', tx })
      toast({ title: confirmed ? 'Gasto confirmado' : 'Confirmación removida' })
      return tx
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' })
    }
  }

  const removeTransaction = async (id: string) => {
    try {
      await transactionService.remove(id)
      dispatch({ type: 'REMOVE_ONE', id })
      toast({ title: 'Gasto eliminado' })
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' })
    }
  }

  const scheduled = state.transactions.filter((t) => t.type === 'scheduled')
  const daily = state.transactions.filter((t) => t.type === 'daily')
  const income = state.transactions.filter((t) => t.type === 'income')

  return {
    ...state,
    scheduled,
    daily,
    income,
    addTransaction,
    updateTransaction,
    confirmTransaction,
    removeTransaction,
    refetch: fetchTransactions,
  }
}
