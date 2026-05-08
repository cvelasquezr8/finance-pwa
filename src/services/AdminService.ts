import { BaseApiService } from './BaseApiService'
import { mockAdminService } from './mock/MockAdapter'
import { useMock } from './api-config'
import { API_ROUTES } from './api-routes'
import type {
  AdminUserDTO,
  PaginatedResponseDTO,
  PaginationQueryDTO,
  UpdateUserRoleDTO,
} from '@/core/dtos'

class AdminService extends BaseApiService {
  async listUsers(query: PaginationQueryDTO = {}): Promise<PaginatedResponseDTO<AdminUserDTO>> {
    if (useMock()) return mockAdminService.listUsers(query)
    return this.get(API_ROUTES.admin.users, { params: query })
  }

  async updateRole(dto: UpdateUserRoleDTO): Promise<AdminUserDTO> {
    if (useMock()) return mockAdminService.updateRole(dto)
    return this.patch(API_ROUTES.admin.userRole(dto.userId), { role: dto.role })
  }

  async blockUser(userId: string): Promise<AdminUserDTO> {
    if (useMock()) return mockAdminService.updateStatus({ userId, status: 'blocked' })
    return this.patch(API_ROUTES.admin.userStatus(userId), { status: 'blocked' })
  }

  async deleteUser(userId: string): Promise<AdminUserDTO> {
    if (useMock()) return mockAdminService.updateStatus({ userId, status: 'deleted' })
    return this.patch(API_ROUTES.admin.userStatus(userId), { status: 'deleted' })
  }

  async restoreUser(userId: string): Promise<AdminUserDTO> {
    if (useMock()) return mockAdminService.updateStatus({ userId, status: 'active' })
    return this.patch(API_ROUTES.admin.userStatus(userId), { status: 'active' })
  }

  async toggleRole(userId: string, currentRole: AdminUserDTO['role']): Promise<AdminUserDTO> {
    const role = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    return this.updateRole({ userId, role })
  }
}

export const adminService = new AdminService()
