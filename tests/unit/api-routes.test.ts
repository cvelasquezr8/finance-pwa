import { describe, it, expect } from 'vitest'
import { API_ROUTES } from '@/services/api-routes'

describe('api-routes registry', () => {
  it('exposes all auth endpoints', () => {
    expect(API_ROUTES.auth.login).toBe('/auth/login')
    expect(API_ROUTES.auth.register).toBe('/auth/register')
    expect(API_ROUTES.auth.logout).toBe('/auth/logout')
  })

  it('builds parametric transaction URLs', () => {
    expect(API_ROUTES.transactions.byId('abc')).toBe('/transactions/abc')
    expect(API_ROUTES.transactions.confirm('abc')).toBe('/transactions/abc/confirm')
    expect(API_ROUTES.transactions.receipt('abc')).toBe('/transactions/abc/receipt')
  })

  it('builds nested event URLs', () => {
    expect(API_ROUTES.events.byId('e1')).toBe('/events/e1')
    expect(API_ROUTES.events.invite('e1')).toBe('/events/e1/invite')
    expect(API_ROUTES.events.item('e1', 'i1')).toBe('/events/e1/items/i1')
  })

  it('exposes admin role/status URLs', () => {
    expect(API_ROUTES.admin.userRole('u1')).toBe('/admin/users/u1/role')
    expect(API_ROUTES.admin.userStatus('u1')).toBe('/admin/users/u1/status')
  })
})
