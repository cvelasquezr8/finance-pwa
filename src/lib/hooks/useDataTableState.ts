import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue'

export type SortOrder = 'asc' | 'desc'

export interface DataTableState {
  page: number
  limit: number
  search: string
  debouncedSearch: string
  sortBy: string
  order: SortOrder
}

export interface DataTableQuery {
  page: number
  limit: number
  search: string
  sortBy: string
  order: SortOrder
}

interface UseDataTableStateOptions {
  defaultLimit?: number
  defaultSortBy: string
  defaultOrder?: SortOrder
  searchDebounceMs?: number
}

interface UseDataTableStateReturn extends DataTableState {
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  setSort: (sortBy: string, order?: SortOrder) => void
  toggleSort: (sortBy: string) => void
  resetPage: () => void
  query: DataTableQuery
}

export function useDataTableState({
  defaultLimit = 10,
  defaultSortBy,
  defaultOrder = 'desc',
  searchDebounceMs = 300,
}: UseDataTableStateOptions): UseDataTableStateReturn {
  const [page, setPageState] = useState(1)
  const [limit, setLimitState] = useState(defaultLimit)
  const [search, setSearchState] = useState('')
  const [sortBy, setSortByState] = useState(defaultSortBy)
  const [order, setOrderState] = useState<SortOrder>(defaultOrder)

  const debouncedSearch = useDebouncedValue(search, searchDebounceMs)

  const setPage = useCallback((p: number) => setPageState(Math.max(1, p)), [])

  const setLimit = useCallback((l: number) => {
    setLimitState(l)
    setPageState(1)
  }, [])

  const setSearch = useCallback((s: string) => {
    setSearchState(s)
    setPageState(1)
  }, [])

  const setSort = useCallback((field: string, ord?: SortOrder) => {
    setSortByState(field)
    if (ord) setOrderState(ord)
    setPageState(1)
  }, [])

  const toggleSort = useCallback((field: string) => {
    setSortByState((prevField) => {
      if (prevField === field) {
        setOrderState((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'))
        return prevField
      }
      setOrderState('asc')
      return field
    })
    setPageState(1)
  }, [])

  const resetPage = useCallback(() => setPageState(1), [])

  const query: DataTableQuery = useMemo(
    () => ({ page, limit, search: debouncedSearch, sortBy, order }),
    [page, limit, debouncedSearch, sortBy, order]
  )

  return {
    page,
    limit,
    search,
    debouncedSearch,
    sortBy,
    order,
    setPage,
    setLimit,
    setSearch,
    setSort,
    toggleSort,
    resetPage,
    query,
  }
}
