import { BaseApiService, setStoredToken, clearStoredTokens } from './BaseApiService'
import { mockAuthService } from './mock/MockAdapter'
import { useMock } from './api-config'
import { API_ROUTES } from './api-routes'
import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '@/core/dtos'
import type { User } from '@/core/types'

class AuthService extends BaseApiService {
  async login(dto: LoginRequestDTO): Promise<{ user: User; token: string }> {
    const res: AuthResponseDTO = useMock()
      ? await mockAuthService.login(dto.email, dto.password)
      : await this.post<AuthResponseDTO, LoginRequestDTO>(API_ROUTES.auth.login, dto)

    if (res.user.status === 'blocked')
      throw new Error('Tu cuenta ha sido bloqueada. Contacta al administrador.')
    if (res.user.status === 'deleted') throw new Error('Esta cuenta ya no existe.')
    setStoredToken(res.token)
    return { user: res.user, token: res.token }
  }

  async register(dto: RegisterRequestDTO): Promise<void> {
    if (useMock()) {
      await mockAuthService.register(
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.password,
        dto.alias
      )
      return
    }
    await this.post<{ message: string }, RegisterRequestDTO>(API_ROUTES.auth.register, dto)
  }

  async logout(): Promise<void> {
    if (useMock()) {
      await mockAuthService.logout()
    } else {
      await this.post(API_ROUTES.auth.logout, {})
    }
    clearStoredTokens()
  }

  /**
   * Persists profile changes. In mock mode there is no server session, so it
   * returns null and the caller keeps the optimistic local merge.
   */
  async updateProfile(updates: Partial<User>): Promise<User | null> {
    if (useMock()) return null
    return this.patch<User, Partial<User>>(API_ROUTES.users.me, updates)
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (useMock()) return
    await this.post(API_ROUTES.auth.changePassword, { currentPassword, newPassword })
  }

  async deleteMyAccount(): Promise<void> {
    if (useMock()) return
    await this.delete(API_ROUTES.users.deleteMe)
    clearStoredTokens()
  }
}

export const authService = new AuthService()
