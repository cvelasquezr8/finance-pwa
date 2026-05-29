/**
 * Centralized API endpoint registry.
 * All services consume routes from here so the contract with the backend
 * lives in one place. When NEXT_PUBLIC_API_HOST is set the hybrid client targets
 * these paths against the real host; otherwise the in-memory mocks resolve
 * the same operations.
 */

export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  transactions: {
    list: '/transactions',
    create: '/transactions',
    history: '/transactions/history',
    byId: (id: string) => `/transactions/${id}`,
    confirm: (id: string) => `/transactions/${id}/confirm`,
    receipt: (id: string) => `/transactions/${id}/receipt`,
  },
  balance: {
    summary: '/balance',
    adjust: '/balance/adjust',
    income: '/balance/income',
    trend: '/balance/trend',
  },
  cards: {
    list: '/cards',
    byId: (id: string) => `/cards/${id}`,
  },
  admin: {
    users: '/admin/users',
    userRole: (userId: string) => `/admin/users/${userId}/role`,
    userStatus: (userId: string) => `/admin/users/${userId}/status`,
  },
  events: {
    list: '/events',
    byId: (id: string) => `/events/${id}`,
    invite: (id: string) => `/events/${id}/invite`,
    respond: (id: string) => `/events/${id}/respond`,
    items: (id: string) => `/events/${id}/items`,
    item: (eventId: string, itemId: string) => `/events/${eventId}/items/${itemId}`,
    cancel: (id: string) => `/events/${id}/cancel`,
    transactions: (id: string) => `/events/${id}/transactions`,
  },
} as const

export type ApiRoutes = typeof API_ROUTES
