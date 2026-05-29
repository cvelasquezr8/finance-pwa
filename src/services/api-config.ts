/**
 * Hybrid API mode resolver.
 *
 * When NEXT_PUBLIC_API_HOST is defined at build/runtime the app targets the real
 * backend; otherwise services fall back to in-memory mocks. A force flag
 * (NEXT_PUBLIC_FORCE_MOCK=true) lets developers stay on mocks even when a host
 * is configured — useful for local UI work against an unstable backend.
 */

const rawHost = (process.env.NEXT_PUBLIC_API_HOST ?? '').trim()
const forceMock = String(process.env.NEXT_PUBLIC_FORCE_MOCK ?? '').toLowerCase() === 'true'

export const API_HOST: string = rawHost
export const USE_MOCK: boolean = forceMock || rawHost.length === 0

/**
 * Resolves the base URL for the axios instance. Falls back to a local
 * dev URL when running fully on mocks so axios can still be instantiated.
 */
export function resolveBaseUrl(): string {
  if (rawHost.length > 0) return rawHost.replace(/\/+$/, '')
  return 'http://localhost:3000/api/v1'
}

/**
 * Tiny helper so call sites read like `if (useMock()) ...` instead of
 * importing the constant directly. Lets us swap implementations later
 * (e.g. per-feature flags) without touching every service.
 */
export function useMock(): boolean {
  return USE_MOCK
}
