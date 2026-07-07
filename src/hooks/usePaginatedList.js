import { useCallback, useEffect, useMemo, useState } from 'react'

const DEFAULT_LIMIT = 25

export function usePaginatedList(fetcher, { initialFilters = {}, limit = DEFAULT_LIMIT } = {}) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...filters,
      ...(sort ? { sort: sort.field, order: sort.order } : {}),
    }),
    [page, limit, filters, sort],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher(queryParams)
      setData(result)
    } catch (err) {
      setError(err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [fetcher, queryParams])

  useEffect(() => {
    load()
  }, [load])

  const updateFilters = useCallback((next) => {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }, [])

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    limit,
    filters,
    sort,
    loading,
    error,
    setPage,
    setFilters: updateFilters,
    setSort,
    reload: load,
    totalPages: Math.max(1, Math.ceil((data?.total ?? 0) / limit)),
  }
}
