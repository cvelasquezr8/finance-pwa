import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import type {
  AdminUserDTO,
  InviteUserDTO,
  PaginatedResponseDTO,
  PaginationQueryDTO,
} from '@/core/dtos'
import { adminService } from '@/services/AdminService'

const EMPTY_PAGE: PaginatedResponseDTO<AdminUserDTO> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  hasMore: false,
}

export function useAdminUsers(query: PaginationQueryDTO = {}) {
  const queryClient = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: () => adminService.listUsers(query),
    placeholderData: keepPreviousData,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'], exact: false })

  const toggleRoleMutation = useMutation({
    mutationFn: (user: AdminUserDTO) => adminService.toggleRole(user.id, user.role),
    onSuccess: invalidate,
  })

  const blockMutation = useMutation({
    mutationFn: (userId: string) => adminService.blockUser(userId),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: invalidate,
  })

  const restoreMutation = useMutation({
    mutationFn: (userId: string) => adminService.restoreUser(userId),
    onSuccess: invalidate,
  })

  const inviteMutation = useMutation({
    mutationFn: (dto: InviteUserDTO) => adminService.inviteUser(dto),
    onSuccess: invalidate,
  })

  const data = usersQuery.data ?? EMPTY_PAGE
  const error = usersQuery.error
    ? (usersQuery.error as Error).message
    : ((toggleRoleMutation.error as Error | null)?.message ??
      (blockMutation.error as Error | null)?.message ??
      (deleteMutation.error as Error | null)?.message ??
      (restoreMutation.error as Error | null)?.message ??
      null)

  return {
    users: data.data,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
    hasMore: data.hasMore,
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    error,
    fetchUsers: () => usersQuery.refetch(),
    toggleRole: (user: AdminUserDTO) => toggleRoleMutation.mutateAsync(user),
    blockUser: (userId: string) => blockMutation.mutateAsync(userId),
    deleteUser: (userId: string) => deleteMutation.mutateAsync(userId),
    restoreUser: (userId: string) => restoreMutation.mutateAsync(userId),
    inviteUser: (dto: InviteUserDTO) => inviteMutation.mutateAsync(dto),
  }
}
