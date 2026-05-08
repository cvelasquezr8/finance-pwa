import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { eventService } from '@/services/EventService'
import type {
  AddShoppingItemDTO,
  BudgetEventDTO,
  InviteParticipantDTO,
  PaginatedResponseDTO,
  PaginationQueryDTO,
  RespondInvitationDTO,
  ToggleShoppingItemDTO,
  TransactionResponseDTO,
} from '@/core/dtos'

const EMPTY_PAGE: PaginatedResponseDTO<TransactionResponseDTO> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  hasMore: false,
}

export function useEventDetail(eventId: string, txQuery: PaginationQueryDTO = {}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const eventQuery = useQuery<BudgetEventDTO>({
    queryKey: ['events', 'detail', eventId],
    queryFn: () => eventService.getEvent(eventId),
    enabled: !!eventId,
  })

  const transactionsQuery = useQuery({
    queryKey: ['events', 'detail', eventId, 'transactions', txQuery],
    queryFn: () => eventService.getLinkedTransactions(eventId, txQuery),
    enabled: !!eventId,
    placeholderData: keepPreviousData,
  })

  const inviteMutation = useMutation({
    mutationFn: (dto: InviteParticipantDTO) => eventService.inviteParticipant(dto),
    onSuccess: (event) => {
      queryClient.setQueryData(['events', 'detail', eventId], event)
    },
  })

  const respondMutation = useMutation({
    mutationFn: (status: RespondInvitationDTO['status']) => {
      if (!user) throw new Error('Not authenticated')
      return eventService.respondInvitation({ eventId, status }, user.id)
    },
    onSuccess: (event) => {
      queryClient.setQueryData(['events', 'detail', eventId], event)
    },
  })

  const addItemMutation = useMutation({
    mutationFn: (dto: AddShoppingItemDTO) => eventService.addShoppingItem(dto),
    onSuccess: (event) => {
      queryClient.setQueryData(['events', 'detail', eventId], event)
    },
  })

  const toggleItemMutation = useMutation({
    mutationFn: (dto: ToggleShoppingItemDTO) => {
      if (!user) throw new Error('Not authenticated')
      return eventService.toggleShoppingItem(dto, user.id)
    },
    onSuccess: (event) => {
      queryClient.setQueryData(['events', 'detail', eventId], event)
    },
  })

  // Refetch on global "financeDataChanged" events (e.g. expense registration).
  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'detail', eventId] })
    }
    window.addEventListener('financeDataChanged', handler)
    return () => window.removeEventListener('financeDataChanged', handler)
  }, [eventId, queryClient])

  const txData = transactionsQuery.data ?? EMPTY_PAGE

  return {
    event: eventQuery.data ?? null,
    linkedTransactions: txData.data,
    transactionsTotal: txData.total,
    transactionsPage: txData.page,
    transactionsPageSize: txData.pageSize,
    transactionsHasMore: txData.hasMore,
    isLoading: eventQuery.isLoading || transactionsQuery.isLoading,
    isFetchingTransactions: transactionsQuery.isFetching,
    error: eventQuery.error ? (eventQuery.error as Error).message : null,
    fetchEvent: () => {
      eventQuery.refetch()
      transactionsQuery.refetch()
    },
    inviteParticipant: (dto: InviteParticipantDTO) => inviteMutation.mutateAsync(dto),
    respondInvitation: (status: RespondInvitationDTO['status']) =>
      respondMutation.mutateAsync(status),
    addShoppingItem: (dto: AddShoppingItemDTO) => addItemMutation.mutateAsync(dto),
    toggleShoppingItem: (dto: ToggleShoppingItemDTO) => toggleItemMutation.mutateAsync(dto),
  }
}
