import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * The api-config module captures process.env (NEXT_PUBLIC_*) at evaluation time.
 * To test both branches we re-import after stubbing env values.
 */

async function loadConfig() {
  vi.resetModules()
  return import('@/services/api-config')
}

describe('api-config (hybrid mode)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('falls back to mocks when NEXT_PUBLIC_API_HOST is unset', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_HOST', '')
    vi.stubEnv('NEXT_PUBLIC_FORCE_MOCK', '')
    const cfg = await loadConfig()
    expect(cfg.useMock()).toBe(true)
    expect(cfg.resolveBaseUrl()).toContain('localhost')
  })

  it('uses real API when NEXT_PUBLIC_API_HOST is provided', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_HOST', 'https://api.finance.test/v1')
    vi.stubEnv('NEXT_PUBLIC_FORCE_MOCK', '')
    const cfg = await loadConfig()
    expect(cfg.useMock()).toBe(false)
    expect(cfg.resolveBaseUrl()).toBe('https://api.finance.test/v1')
  })

  it('strips trailing slashes from the host', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_HOST', 'https://api.finance.test/v1////')
    const cfg = await loadConfig()
    expect(cfg.resolveBaseUrl()).toBe('https://api.finance.test/v1')
  })

  it('NEXT_PUBLIC_FORCE_MOCK keeps mocks even when host is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_HOST', 'https://api.finance.test/v1')
    vi.stubEnv('NEXT_PUBLIC_FORCE_MOCK', 'true')
    const cfg = await loadConfig()
    expect(cfg.useMock()).toBe(true)
  })
})
