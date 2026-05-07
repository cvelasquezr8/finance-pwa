import { BaseApiService, setStoredToken, clearStoredTokens } from './BaseApiService'
import { mockAuthService } from './mock/MockAdapter'
import type { LoginRequestDTO, RegisterRequestDTO, AuthResponseDTO } from '@/core/dtos'
import type { User } from '@/core/types'

const USE_MOCK = true // flip to false when real API is ready

class AuthService extends BaseApiService {
  async login(dto: LoginRequestDTO): Promise<{ user: User; token: string }> {
    let res: AuthResponseDTO

    if (USE_MOCK) {
      res = await mockAuthService.login(dto.email, dto.password)
    } else {
      // POST /api/v1/auth/login
      res = await this.post<AuthResponseDTO, LoginRequestDTO>('/auth/login', dto)
    }

    if (res.user.status === 'blocked')
      throw new Error('Tu cuenta ha sido bloqueada. Contacta al administrador.')
    if (res.user.status === 'deleted') throw new Error('Esta cuenta ya no existe.')
    setStoredToken(res.token, res.refreshToken)
    return { user: res.user, token: res.token }
  }

  async register(dto: RegisterRequestDTO): Promise<{ user: User; token: string }> {
    let res: AuthResponseDTO

    if (USE_MOCK) {
      res = await mockAuthService.register(
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.password,
        dto.alias
      )
    } else {
      // POST /api/v1/auth/register
      res = await this.post<AuthResponseDTO, RegisterRequestDTO>('/auth/register', dto)
    }

    setStoredToken(res.token, res.refreshToken)
    return { user: res.user, token: res.token }
  }

  async logout(): Promise<void> {
    if (USE_MOCK) {
      await mockAuthService.logout()
    } else {
      // POST /api/v1/auth/logout
      await this.post('/auth/logout', {})
    }
    clearStoredTokens()
  }
}

export const authService = new AuthService()
