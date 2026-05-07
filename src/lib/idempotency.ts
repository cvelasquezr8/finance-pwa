const TTL_MS = 5 * 60 * 1_000 // 5 minutes

interface IdempotencyEntry {
  result: unknown
  expiresAt: number
}

const store = new Map<string, IdempotencyEntry>()

export function generateKey(): string {
  return crypto.randomUUID()
}

export function getIdempotentResult<T>(key: string): T | undefined {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.result as T
}

export function setIdempotentResult(key: string, result: unknown): void {
  store.set(key, { result, expiresAt: Date.now() + TTL_MS })
}

export function purgeExpired(): void {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key)
  }
}
