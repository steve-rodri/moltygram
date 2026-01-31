import { PaginatedResult } from "../types"

export const PAGE_SIZE = 50

interface PaginationConfig<TRaw, TMapped> {
  data: TRaw[] | null
  mapper: (item: TRaw) => TMapped
  getCursor: (item: TRaw) => string
}

export function processPaginatedResult<TRaw, TMapped>(
  config: PaginationConfig<TRaw, TMapped>,
): PaginatedResult<TMapped> {
  const { data, mapper, getCursor } = config

  if (!data || data.length === 0) {
    return { data: [], nextCursor: null, hasMore: false }
  }

  const hasMore = data.length > PAGE_SIZE
  const items = data.slice(0, PAGE_SIZE).map(mapper)
  const nextCursor = hasMore ? getCursor(data[PAGE_SIZE - 1]) : null

  return { data: items, nextCursor, hasMore }
}
