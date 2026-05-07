import { useCallback, useReducer } from 'react'
import type { AdminUserDTO } from '@/core/dtos'
import { adminService } from '@/services/AdminService'

interface State {
  users: AdminUserDTO[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; users: AdminUserDTO[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'UPDATE_USER'; user: AdminUserDTO }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, users: action.users }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.error }
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.user.id ? action.user : u)),
      }
  }
}

export function useAdminUsers() {
  const [state, dispatch] = useReducer(reducer, { users: [], isLoading: false, error: null })

  const fetchUsers = useCallback(async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      const users = await adminService.listUsers()
      dispatch({ type: 'FETCH_SUCCESS', users })
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', error: e instanceof Error ? e.message : 'Error desconocido' })
    }
  }, [])

  const toggleRole = useCallback(async (user: AdminUserDTO) => {
    try {
      const updated = await adminService.toggleRole(user.id, user.role)
      dispatch({ type: 'UPDATE_USER', user: updated })
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', error: e instanceof Error ? e.message : 'Error desconocido' })
    }
  }, [])

  const blockUser = useCallback(async (userId: string) => {
    try {
      const updated = await adminService.blockUser(userId)
      dispatch({ type: 'UPDATE_USER', user: updated })
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', error: e instanceof Error ? e.message : 'Error desconocido' })
    }
  }, [])

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const updated = await adminService.deleteUser(userId)
      dispatch({ type: 'UPDATE_USER', user: updated })
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', error: e instanceof Error ? e.message : 'Error desconocido' })
    }
  }, [])

  const restoreUser = useCallback(async (userId: string) => {
    try {
      const updated = await adminService.restoreUser(userId)
      dispatch({ type: 'UPDATE_USER', user: updated })
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', error: e instanceof Error ? e.message : 'Error desconocido' })
    }
  }, [])

  return { ...state, fetchUsers, toggleRole, blockUser, deleteUser, restoreUser }
}
