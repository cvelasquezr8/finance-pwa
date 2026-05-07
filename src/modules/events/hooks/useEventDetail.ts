import { useCallback, useEffect, useReducer } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { eventService } from '@/services/EventService'
import type {
  BudgetEventDTO,
  InviteParticipantDTO,
  RespondInvitationDTO,
  AddShoppingItemDTO,
  ToggleShoppingItemDTO,
} from '@/core/dtos'
import type { TransactionResponseDTO } from '@/core/dtos'

type Action =
  | { type: 'FETCH_START' }
  | { type: 'SUCCESS'; event: BudgetEventDTO; transactions: TransactionResponseDTO[] }
  | { type: 'ERROR'; error: string }
  | { type: 'UPDATE_EVENT'; event: BudgetEventDTO }

interface State {
  event: BudgetEventDTO | null
  linkedTransactions: TransactionResponseDTO[]
  isLoading: boolean
  error: string | null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'SUCCESS':
      return {
        event: action.event,
        linkedTransactions: action.transactions,
        isLoading: false,
        error: null,
      }
    case 'ERROR':
      return { ...state, isLoading: false, error: action.error }
    case 'UPDATE_EVENT':
      return { ...state, event: action.event }
  }
}

export function useEventDetail(eventId: string) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, {
    event: null,
    linkedTransactions: [],
    isLoading: false,
    error: null,
  })

  const fetchEvent = useCallback(async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      const [event, transactions] = await Promise.all([
        eventService.getEvent(eventId),
        eventService.getLinkedTransactions(eventId),
      ])
      dispatch({ type: 'SUCCESS', event, transactions })
    } catch (e) {
      dispatch({ type: 'ERROR', error: (e as Error).message })
    }
  }, [eventId])

  const inviteParticipant = async (dto: InviteParticipantDTO) => {
    const event = await eventService.inviteParticipant(dto)
    dispatch({ type: 'UPDATE_EVENT', event })
  }

  const respondInvitation = async (status: RespondInvitationDTO['status']) => {
    if (!user) return
    const event = await eventService.respondInvitation({ eventId, status }, user.id)
    dispatch({ type: 'UPDATE_EVENT', event })
  }

  const addShoppingItem = async (dto: AddShoppingItemDTO) => {
    const event = await eventService.addShoppingItem(dto)
    dispatch({ type: 'UPDATE_EVENT', event })
  }

  const toggleShoppingItem = async (dto: ToggleShoppingItemDTO) => {
    if (!user) return
    const event = await eventService.toggleShoppingItem(dto, user.id)
    dispatch({ type: 'UPDATE_EVENT', event })
  }

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  useEffect(() => {
    const handler = () => fetchEvent()
    window.addEventListener('financeDataChanged', handler)
    return () => window.removeEventListener('financeDataChanged', handler)
  }, [fetchEvent])

  return {
    ...state,
    fetchEvent,
    inviteParticipant,
    respondInvitation,
    addShoppingItem,
    toggleShoppingItem,
  }
}
