/**
 * Production stub for the mock adapter.
 *
 * In production builds that target the real API, `next.config.ts` swaps the real
 * `MockAdapter.ts` (which contains seed users, hardcoded demo credentials and an
 * in-memory data store) for this file via webpack's NormalModuleReplacementPlugin.
 * That guarantees mock data/credentials are **never shipped to production**.
 *
 * The exports mirror the real module's named exports so imports keep resolving,
 * but every method throws — they are unreachable at runtime because callers only
 * invoke them when `useMock()` is true, which never happens in a real-API build.
 */

const disabledHandler: ProxyHandler<Record<string, never>> = {
  get() {
    return () => {
      throw new Error('Mock services are disabled in this build (production / real API).')
    }
  },
}

const stub = () => new Proxy({} as Record<string, never>, disabledHandler) as never

export const mockAuthService = stub()
export const mockTransactionService = stub()
export const mockBalanceService = stub()
export const mockCardService = stub()
export const mockEventService = stub()
export const mockAdminService = stub()
