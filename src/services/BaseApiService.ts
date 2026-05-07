import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
const TOKEN_KEY = 'finance_token'
const REFRESH_KEY = 'finance_refresh'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearStoredTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach Bearer token
axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle 401 / token refresh
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      clearStoredTokens()
      window.location.href = '/login'
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
