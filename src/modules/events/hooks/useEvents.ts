import { useCallback, useEffect, useReducer } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { eventService } from '@/services/EventService'
import type { BudgetEventDTO, CreateEventDTO } from '@/core/dtos'
import type { TransactionResponseDTO } from '@/core/dtos'

type Action =
  | { type: 'FETCH_START' }
  | { type: 'SUCCESS'; events: BudgetEventDTO[]; transactions: TransactionResponseDTO[] }
  | { type: 'ERROR'; error: string }
  | { type: 'ADD_EVENT'; event: BudgetEventDTO }
  | { type: 'REMOVE_EVENT'; id: string }

interface State {
  events: BudgetEventDTO[]
  allLinkedTransactions: TransactionResponseDTO[]
  isLoading: boolean
  error: string | null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'SUCCESS':
      return {
        events: action.events,
        allLinkedTransactions: action.transactions,
        isLoading: false,
        error: null,
      }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.error }
    case 'ADD_EVENT':
      return { ...state, events: [action.event, ...state.events] }
    case 'REMOVE_EVENT':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) }
  }
}

export function useEvents() {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, {
    events: [],
    allLinkedTransactions: [],
    isLoading: false,
    error: null,
  })

  const fetchEvents = useCallback(async () => {
    if (!user) return
    dispatch({ type: 'FETCH_START' })
    try {
      const events = await eventService.listEvents(user.id)
      const txArrays = await Promise.all(
        events.map((e) => eventService.getLinkedTransactions(e.id))
      )
      const transactions = txArrays.flat()
      dispatch({ type: 'SUCCESS', events, transactions })
    } catch (e) {
      dispatch({ type: 'ERROR', error: (e as Error).message })
    }
  }, [user])

  const createEvent = async (dto: CreateEventDTO): Promise<BudgetEventDTO | undefined> => {
    if (!user) return
    const event = await eventService.createEvent(dto, user.id)
    dispatch({ type: 'ADD_EVENT', event })
    return event
  }

  const cancelEvent = async (id: string) => {
    await eventService.cancelEvent(id)
    dispatch({ type: 'REMOVE_EVENT', id })
  }

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { ...state, fetchEvents, createEvent, cancelEvent }
}
