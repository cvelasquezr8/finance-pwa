import type { PaginatedResponseDTO } from '@/core/dtos'

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

interface ApplyOptions<T> {
  searchFields?: (keyof T | ((item: T) => string | undefined | null))[]
  sortAccessors?: Partial<Record<string, (item: T) => string | number | Date | null | undefined>>
  defaultSortBy?: string
  defaultOrder?: 'asc' | 'desc'
}

function getSearchValue<T>(item: T, field: keyof T | ((item: T) => string | undefined | null)) {
  const raw = typeof field === 'function' ? field(item) : (item[field] as unknown)
  return raw == null ? '' : String(raw).toLowerCase()
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

export function applyPagination<T>(
  items: T[],
  params: PaginationParams = {},
  options: ApplyOptions<T> = {}
): PaginatedResponseDTO<T> {
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.max(1, params.limit ?? 20)

  let working = items

  if (params.search && params.search.trim() && options.searchFields?.length) {
    const term = params.search.trim().toLowerCase()
    working = working.filter((item) =>
      options.searchFields!.some((f) => getSearchValue(item, f).includes(term))
    )
  }

  const sortBy = params.sortBy ?? options.defaultSortBy
  const order = params.order ?? options.defaultOrder ?? 'desc'
  if (sortBy && options.sortAccessors?.[sortBy]) {
    const accessor = options.sortAccessors[sortBy]!
    working = [...working].sort((a, b) => {
      const cmp = compareValues(accessor(a), accessor(b))
      return order === 'asc' ? cmp : -cmp
    })
  }

  const total = working.length
  const offset = (page - 1) * limit
  const data = working.slice(offset, offset + limit)
  return {
    data,
    total,
    page,
    pageSize: limit,
    hasMore: offset + data.length < total,
  }
}
