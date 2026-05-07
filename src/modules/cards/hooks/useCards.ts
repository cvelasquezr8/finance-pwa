import { useCallback, useEffect, useReducer } from 'react'
import type { CardDTO, CreateCardDTO } from '@/core/dtos'
import { cardService } from '@/services/CardService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/lib/toast'

interface State {
  cards: CardDTO[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; cards: CardDTO[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'ADD_CARD'; card: CardDTO }
  | { type: 'REMOVE_CARD'; id: string }
  | { type: 'UPDATE_CARD'; card: CardDTO }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { cards: action.cards, isLoading: false, error: null }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.error }
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.card] }
    case 'REMOVE_CARD':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.id) }
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.card.id ? action.card : c)),
      }
  }
}

export function useCards() {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, { cards: [], isLoading: false, error: null })

  const fetchCards = useCallback(async () => {
    if (!user?.id) return
    dispatch({ type: 'FETCH_START' })
    try {
      const cards = await cardService.listCards(user.id)
      dispatch({ type: 'FETCH_SUCCESS', cards })
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', error: e instanceof Error ? e.message : 'Error' })
    }
  }, [user?.id])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const addCard = useCallback(
    async (dto: CreateCardDTO) => {
      if (!user?.id) return
      try {
        const card = await cardService.createCard(user.id, dto)
        dispatch({ type: 'ADD_CARD', card })
        toast({ title: 'Tarjeta guardada' })
        return card
      } catch {
        toast({
          title: 'Error',
          description: 'No se pudo guardar la tarjeta',
          variant: 'destructive',
        })
      }
    },
    [user?.id]
  )

  const removeCard = useCallback(async (id: string) => {
    try {
      await cardService.deleteCard(id)
      dispatch({ type: 'REMOVE_CARD', id })
      toast({ title: 'Tarjeta eliminada' })
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la tarjeta',
        variant: 'destructive',
      })
    }
  }, [])

  const updateCard = useCallback(async (id: string, dto: Partial<CreateCardDTO>) => {
    try {
      const card = await cardService.updateCard(id, dto)
      dispatch({ type: 'UPDATE_CARD', card })
      toast({ title: 'Tarjeta actualizada' })
      return card
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la tarjeta',
        variant: 'destructive',
      })
    }
  }, [])

  return { ...state, fetchCards, addCard, removeCard, updateCard }
}
