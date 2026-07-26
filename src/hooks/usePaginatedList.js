import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_LIMIT = 25

/**
 * Paginated list hook for the admin list envelope:
 * `{ items, pagination: { page, limit, total, totalPages } }`
 */
export function usePaginatedList(fetcher, { initialFilters = {}, limit = DEFAULT_LIMIT } = {}) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const queryParams = useMemo(() => {
    const params = { page, limit, ...filters }
    if (sort?.field) {
      params.sort = sort.field
      params.order = sort.order ?? 'desc'
    }
    // Drop empty filter values so the API sees clean query strings
    Object.keys(params).forEach((key) => {
      const v = params[key]
      if (v === '' || v === null || v === undefined || v === 'all') delete params[key]
    })
    return params
  }, [page, limit, filters, sort])

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher(queryParams)
      if (id !== requestId.current) return
      setData(result)
    } catch (err) {
      if (id !== requestId.current) return
      setError(err)
      setData(null)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [fetcher, queryParams])

  useEffect(() => {
    load()
  }, [load])

  const updateFilters = useCallback((next) => {
    setFilters((prev) => ({ ...prev, ...next }))
    setPage(1)
  }, [])

  const replaceFilters = useCallback((next) => {
    setFilters(next)
    setPage(1)
  }, [])

  const pagination = data?.pagination
  const total = pagination?.total ?? data?.total ?? 0
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit) || 1)

  return {
    items: data?.items ?? [],
    meta: data?.meta,
    total,
    page,
    limit,
    filters,
    sort,
    loading,
    error,
    setPage,
    setFilters: updateFilters,
    replaceFilters,
    setSort,
    reload: load,
    totalPages,
  }
}
