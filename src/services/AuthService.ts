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
    setStoredToken(res.token, res.refreshToken)
    return { user: res.user, token: res.token }
  }

  async register(dto: RegisterRequestDTO): Promise<{ user: User; token: string }> {
    const res: AuthResponseDTO = useMock()
      ? await mockAuthService.register(
          dto.firstName,
          dto.lastName,
          dto.email,
          dto.password,
          dto.alias
        )
      : await this.post<AuthResponseDTO, RegisterRequestDTO>(API_ROUTES.auth.register, dto)

    setStoredToken(res.token, res.refreshToken)
    return { user: res.user, token: res.token }
  }

  async logout(): Promise<void> {
    if (useMock()) {
      await mockAuthService.logout()
    } else {
      await this.post(API_ROUTES.auth.logout, {})
    }
    clearStoredTokens()
  }
}

export const authService = new AuthService()
