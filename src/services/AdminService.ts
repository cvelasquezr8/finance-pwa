import { BaseApiService } from './BaseApiService'
import { mockAdminService } from './mock/MockAdapter'
import type { AdminUserDTO, UpdateUserRoleDTO } from '@/core/dtos'

const USE_MOCK = true

class AdminService extends BaseApiService {
  async listUsers(): Promise<AdminUserDTO[]> {
    if (USE_MOCK) return mockAdminService.listUsers()
    return this.get('/admin/users')
  }

  async updateRole(dto: UpdateUserRoleDTO): Promise<AdminUserDTO> {
    if (USE_MOCK) return mockAdminService.updateRole(dto)
    return this.patch(`/admin/users/${dto.userId}/role`, { role: dto.role })
  }

  async blockUser(userId: string): Promise<AdminUserDTO> {
    if (USE_MOCK) return mockAdminService.updateStatus({ userId, status: 'blocked' })
    return this.patch(`/admin/users/${userId}/status`, { status: 'blocked' })
  }

  async deleteUser(userId: string): Promise<AdminUserDTO> {
    if (USE_MOCK) return mockAdminService.updateStatus({ userId, status: 'deleted' })
    return this.patch(`/admin/users/${userId}/status`, { status: 'deleted' })
  }

  async restoreUser(userId: string): Promise<AdminUserDTO> {
    if (USE_MOCK) return mockAdminService.updateStatus({ userId, status: 'active' })
    return this.patch(`/admin/users/${userId}/status`, { status: 'active' })
  }

  async toggleRole(userId: string, currentRole: AdminUserDTO['role']): Promise<AdminUserDTO> {
    const role = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    return this.updateRole({ userId, role })
  }
}

export const adminService = new AdminService()
