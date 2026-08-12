import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import {
  formatCents,
  personName,
  practitionerStatusClass,
  practitionerStatusLabel,
} from '../lib/display'
import { usePaginatedList } from '../hooks/usePaginatedList'
import { exportPractitionersCsv, fetchPractitioners } from '../services/practitioners'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import { getErrorMessage } from '../lib/errors'

const TABS = [
  { id: 'all', label: 'All', status: 'all' },
  { id: 'active', label: 'Active', status: 'active' },
  { id: 'onboarding', label: 'Onboarding', status: 'onboarding' },
  { id: 'pending', label: 'Pending', status: 'pending' },
  { id: 'suspended', label: 'Suspended', status: 'suspended' },
]

export default function Practitioners() {
  const navigate = useNavigate()
  const [qInput, setQInput] = useState('')
  const [exporting, setExporting] = useState(false)
  const [tabCounts, setTabCounts] = useState({})

  const fetcher = useCallback((params) => fetchPractitioners(params), [])
  const list = usePaginatedList(fetcher, {
    limit: 25,
    initialFilters: { status: 'all', q: '', sort: 'createdAt', order: 'desc' },
  })

  useEffect(() => {
    const t = setTimeout(() => list.setFilters({ q: qInput.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const entries = await Promise.all(
        TABS.filter((t) => t.status !== 'all').map(async (t) => {
          try {
            const res = await fetchPractitioners({ page: 1, limit: 1, status: t.status })
            return [t.status, res.pagination?.total ?? 0]
          } catch {
            return [t.status, null]
          }
        }),
      )
      if (!cancelled) setTabCounts(Object.fromEntries(entries))
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onExport() {
    setExporting(true)
    try {
      const { status, q, country, minRating, modality, sort, order } = list.filters
      await exportPractitionersCsv({
        ...(status && status !== 'all' ? { status } : {}),
        ...(q ? { q } : {}),
        ...(country ? { country } : {}),
        ...(minRating ? { minRating } : {}),
        ...(modality ? { modality } : {}),
        ...(sort ? { sort, order } : {}),
      })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Export failed.'))
    } finally {
      setExporting(false)
    }
  }

  const activeStatus = list.filters.status || 'all'

  return (
    <div className="space-y-4">
      <section className="figma-card overflow-hidden">
        <div className="border-b border-[var(--figma-stroke)] bg-white px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-5">
            {TABS.map((t) => {
              const count = t.status === 'all' ? list.total : tabCounts[t.status]
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => list.setFilters({ status: t.status })}
                  className={[
                    'relative pb-3 text-sm font-semibold',
                    activeStatus === t.status
                      ? 'text-[var(--figma-text-strong)]'
                      : 'text-[var(--figma-text-muted)] hover:text-[var(--figma-text)]',
                  ].join(' ')}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{t.label}</span>
                    {count != null ? (
                      <span className="text-xs font-semibold text-[var(--figma-text-muted)]">{Number(count).toLocaleString()}</span>
                    ) : null}
                  </span>
                  {activeStatus === t.status ? (
                    <span aria-hidden className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-[var(--figma-brand)]" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <input
                className="h-11 w-full rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-4 text-sm text-[var(--figma-text)] placeholder:text-[var(--figma-text-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
                placeholder="Filter by name, email or ID..."
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <select
                value={list.filters.minRating || ''}
                onChange={(e) => list.setFilters({ minRating: e.target.value || undefined })}
                className="h-10 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-semibold"
              >
                <option value="">Rating: Any</option>
                {[4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}+ stars
                  </option>
                ))}
              </select>
              <select
                value={list.filters.sort || 'createdAt'}
                onChange={(e) => list.setFilters({ sort: e.target.value })}
                className="h-10 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-semibold"
              >
                <option value="createdAt">Sort: Created</option>
                <option value="rating">Sort: Rating</option>
                <option value="sessions">Sort: Sessions</option>
              </select>
              <button
                type="button"
                disabled={exporting}
                onClick={onExport}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-semibold disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting…' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>

        {list.loading ? (
          <LoadingState label="Loading practitioners…" />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error, 'Could not load practitioners.')} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No practitioners found" />
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-[920px] w-full border-collapse">
              <thead>
                <tr className="border-y border-[var(--figma-stroke)] bg-white">
                  {['Name', 'Country', 'Status', 'Rating', 'Sessions', 'Price'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)] sm:px-6"
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.items.map((r) => {
                  const name = personName(r)
                  return (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-b border-[var(--figma-stroke)] last:border-b-0 hover:bg-[rgba(244,243,241,0.55)]"
                      tabIndex={0}
                      onClick={() => navigate(`/practitioners/${r.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/practitioners/${r.id}`)
                        }
                      }}
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-[var(--figma-text-strong)]">{name}</div>
                            <div className="truncate text-xs text-[var(--figma-text-muted)]">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">{r.countryOfPractice || '—'}</td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={[
                            'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                            practitionerStatusClass(r.status),
                          ].join(' ')}
                        >
                          {practitionerStatusLabel(r.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        {typeof r.averageRating === 'number' ? (
                          <div className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--figma-text-strong)]">
                            {r.averageRating.toFixed(1)}
                            <span className="text-sm text-[#C79A2B]">★</span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-[var(--figma-text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">
                        {r.totalSessions ?? 0}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">
                        {formatCents(r.sessionPriceCents)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          limit={list.limit}
          onPageChange={list.setPage}
          label="practitioners"
        />
      </section>
    </div>
  )
}

function Avatar({ name }) {
  const initials = String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--figma-input-bg)] text-xs font-semibold text-[var(--figma-text-muted)]">
      {initials || '—'}
    </div>
  )
}
