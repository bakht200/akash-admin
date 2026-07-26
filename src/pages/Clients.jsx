import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Eye, TrendingUp, Users } from 'lucide-react'
import {
  clientStatusClass,
  clientStatusLabel,
  formatAdminDateTime,
  formatCents,
  formatShortUuid,
  personName,
  CLIENT_STATUS_OPTIONS,
} from '../lib/display'
import { usePaginatedList } from '../hooks/usePaginatedList'
import { exportClientsCsv, fetchClientMetrics, fetchClients } from '../services/clients'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import { getErrorMessage } from '../lib/errors'

function Avatar({ name }) {
  const initials = String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-xs font-semibold text-[var(--figma-text-muted)] ring-2 ring-white">
      {initials || '—'}
    </div>
  )
}

export default function Clients() {
  const navigate = useNavigate()
  const [qInput, setQInput] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [metricsError, setMetricsError] = useState(null)
  const [exporting, setExporting] = useState(false)

  const fetcher = useCallback((params) => fetchClients(params), [])
  const list = usePaginatedList(fetcher, { limit: 25, initialFilters: { status: 'all', q: '' } })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const m = await fetchClientMetrics()
        if (!cancelled) setMetrics(m)
      } catch (err) {
        if (!cancelled) setMetricsError(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => list.setFilters({ q: qInput.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search only
  }, [qInput])

  async function onExport() {
    setExporting(true)
    try {
      await exportClientsCsv({
        ...(list.filters.status && list.filters.status !== 'all' ? { status: list.filters.status } : {}),
        ...(list.filters.q ? { q: list.filters.q } : {}),
      })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Export failed.'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="figma-card overflow-hidden">
        <div className="border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <input
                  className="h-11 w-full rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-4 text-sm text-[var(--figma-text)] placeholder:text-[var(--figma-text-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
                  placeholder="Filter by Name, Email or Phone"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                />
              </div>
              <div className="shrink-0 sm:min-w-[200px]">
                <label className="sr-only" htmlFor="client-status">
                  Status
                </label>
                <select
                  id="client-status"
                  value={list.filters.status || 'all'}
                  onChange={(e) => list.setFilters({ status: e.target.value })}
                  className="h-11 w-full rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
                >
                  <option value="all">STATUS: All Statuses</option>
                  {CLIENT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {clientStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={exporting}
                onClick={onExport}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-4 text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)] disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting…' : 'Export CSV'}
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-4 py-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[rgba(27,20,100,0.12)] text-[var(--figma-brand)]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TOTAL CLIENTS</div>
                <div className="text-lg font-semibold text-[var(--figma-text-strong)]">
                  {(metrics?.totalClients ?? list.total).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {list.loading ? (
          <LoadingState label="Loading clients…" />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error, 'Could not load clients.')} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No clients found" description="Try a different search or status filter." />
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-[1000px] w-full border-collapse">
              <thead>
                <tr className="border-y border-[var(--figma-stroke)] bg-white">
                  {['Client name', 'Contact details', 'Last active', 'Status', 'Actions'].map((h) => (
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
                {list.items.map((c) => {
                  const name = personName(c)
                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer border-b border-[var(--figma-stroke)] last:border-b-0 hover:bg-[rgba(244,243,241,0.55)]"
                      tabIndex={0}
                      onClick={() => navigate(`/clients/${encodeURIComponent(c.id)}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/clients/${encodeURIComponent(c.id)}`)
                        }
                      }}
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-[var(--figma-brand)]">{name}</div>
                            <div className="truncate text-xs text-[var(--figma-text-muted)]">ID: {formatShortUuid(c.id)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="text-sm font-medium text-[var(--figma-text-strong)]">{c.email}</div>
                        <div className="text-xs text-[var(--figma-text-muted)]">
                          {[c.phoneCountryCode, c.phone].filter(Boolean).join(' ') || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                        {c.lastActiveAt ? formatAdminDateTime(c.lastActiveAt) : '—'}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={[
                            'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                            clientStatusClass(c.status),
                          ].join(' ')}
                        >
                          {clientStatusLabel(c.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)] hover:bg-[rgba(244,243,241,0.9)]"
                          aria-label={`View ${name}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/clients/${encodeURIComponent(c.id)}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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
          label="clients"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[14px] bg-[var(--figma-brand)] p-6 text-white shadow-[0_12px_32px_rgba(27,20,100,0.18)]">
          <TrendingUp className="pointer-events-none absolute bottom-4 right-4 h-24 w-24 text-white/10" strokeWidth={1.25} aria-hidden />
          {metricsError ? (
            <p className="text-sm text-white/80">Could not load client metrics.</p>
          ) : !metrics ? (
            <p className="text-sm text-white/80">Loading metrics…</p>
          ) : (
            <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.16em] text-white/70">DORMANT CLIENTS</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{(metrics.dormantCount ?? 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.16em] text-white/70" title="Share of clients inactive 30+ days">
                  CHURN RATE
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">
                  {((metrics.churnRate ?? 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.16em] text-white/70" title="Average total client spend">
                  AVG. LTV
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{formatCents(metrics.avgLtvCents)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="figma-card p-5 sm:p-6">
          <div className="text-base font-semibold text-[var(--figma-text-strong)]">Client metrics</div>
          <div className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
            {metrics?.source === 'live' ? 'LIVE COMPUTE' : 'DAILY SNAPSHOT'}
            {metrics?.snapshotDate ? ` · ${formatAdminDateTime(metrics.snapshotDate)}` : ''}
          </div>
          <ul className="mt-4 space-y-3 text-sm text-[var(--figma-text)]">
            <li className="flex justify-between gap-2">
              <span className="text-[var(--figma-text-muted)]">Paying clients</span>
              <span className="font-semibold">{(metrics?.payingClients ?? 0).toLocaleString()}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-[var(--figma-text-muted)]">Total spend</span>
              <span className="font-semibold">{formatCents(metrics?.totalSpendCents)}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-[var(--figma-text-muted)]">Dormant threshold</span>
              <span className="font-semibold">{metrics?.dormantThresholdDays ?? 30} days</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
