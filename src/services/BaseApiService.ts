import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { resolveBaseUrl } from './api-config'

const BASE_URL = resolveBaseUrl()
const TOKEN_KEY = 'finance_token'
const REFRESH_KEY = 'finance_refresh'

// localStorage is browser-only; guard every access so these helpers are safe to
// import/evaluate during SSR or in a Server Component without crashing.
const isBrowser = typeof window !== 'undefined'

export function getStoredToken(): string | null {
  if (!isBrowser) return null
  return localStorage.getItem(TOKEN_KEY)
}

// SECURITY: only the (short-lived) access token is persisted. The refresh token is
// NOT stored — it is currently unused, and keeping a long-lived credential in
// localStorage needlessly widens the XSS blast radius. Reintroduce it via an
// httpOnly cookie (backend) if/when a refresh flow is implemented.
export function setStoredToken(token: string): void {
  if (!isBrowser) return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.removeItem(REFRESH_KEY) // drop any legacy value
}

export function clearStoredTokens(): void {
  if (!isBrowser) return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  // Send/receive the httpOnly refresh cookie (set by the backend on login).
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach Bearer token
axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Single-flight refresh so concurrent 401s trigger only one /auth/refresh call.
let refreshInFlight: Promise<string | null> | null = null

async function attemptRefresh(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<{ token: string }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true, timeout: 10_000 }
      )
      .then((res) => {
        const token = res.data?.token ?? null
        if (token) setStoredToken(token)
        return token
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

// Response interceptor — on 401, try a silent refresh once, then retry; else logout.
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status
    const url: string = original?.url ?? ''
    const isAuthCall = url.includes('/auth/refresh') || url.includes('/auth/login')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      const token = await attemptRefresh()
      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` }
        return axiosInstance(original)
      }
      clearStoredTokens()
      // Auth route is /auth (see src/app/(auth)/auth/page.tsx); /login does not exist.
      if (isBrowser) window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export abstract class BaseApiService {
  protected readonly http: AxiosInstance = axiosInstance

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.http.get(url, config)
    return res.data
  }

  protected async post<T, B = unknown>(
    url: string,
    body: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res: AxiosResponse<T> = await this.http.post(url, body, config)
    return res.data
  }

  protected async put<T, B = unknown>(
    url: string,
    body: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res: AxiosResponse<T> = await this.http.put(url, body, config)
    return res.data
  }

  protected async patch<T, B = unknown>(
    url: string,
    body: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res: AxiosResponse<T> = await this.http.patch(url, body, config)
    return res.data
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res: AxiosResponse<T> = await this.http.delete(url, config)
    return res.data
  }
}
