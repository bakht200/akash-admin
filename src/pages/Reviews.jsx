import { useCallback, useEffect, useState } from 'react'
import { Download, Eye, EyeOff, Flag, FlagOff } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import {
  exportReviewsCsv,
  fetchReviewKpis,
  fetchReviews,
  flagReview,
  hideReview,
  resolveReviewFlags,
  unhideReview,
} from '../services/reviews'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import { formatAdminDateTime, personName } from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'

export default function Reviews() {
  const { canFlagReviews, canHideReviews } = usePermissions()
  const [qInput, setQInput] = useState('')
  const [kpis, setKpis] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const fetcher = useCallback((params) => {
    const next = { ...params }
    if (next.flaggedOnly === 'true') next.flaggedOnly = true
    else if (next.flaggedOnly === 'false' || next.flaggedOnly === 'all') delete next.flaggedOnly
    if (next.rating === 'all' || next.rating === '') delete next.rating
    else if (next.rating != null) next.rating = Number(next.rating)
    return fetchReviews(next)
  }, [])

  const list = usePaginatedList(fetcher, {
    limit: 25,
    initialFilters: { q: '', rating: 'all', flaggedOnly: 'all' },
  })

  useEffect(() => {
    const t = setTimeout(() => list.setFilters({ q: qInput.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput])

  const reloadKpis = useCallback(async () => {
    try {
      setKpis(await fetchReviewKpis())
    } catch {
      setKpis(null)
    }
  }, [])

  useEffect(() => {
    reloadKpis()
  }, [reloadKpis])

  async function onExport() {
    setExporting(true)
    try {
      const { q, rating, flaggedOnly } = list.filters
      await exportReviewsCsv({
        ...(q ? { q } : {}),
        ...(rating && rating !== 'all' ? { rating: Number(rating) } : {}),
        ...(flaggedOnly === 'true' ? { flaggedOnly: true } : {}),
      })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Export failed.'))
    } finally {
      setExporting(false)
    }
  }

  async function runAction(id, fn) {
    setBusyId(id)
    try {
      await fn()
      list.reload()
      reloadKpis()
    } catch (err) {
      window.alert(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  function onFlag(row) {
    const reason = window.prompt('Flag reason (optional)')
    if (reason === null) return
    runAction(row.id, () => flagReview(row.id, reason.trim() || undefined))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-2xl">
            Reviews
          </h1>
          <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
            Moderate ratings, resolve flags, and control publication visibility.
          </p>
        </div>
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 text-sm font-semibold disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting…' : 'Export'}
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Average rating" value={formatRating(kpis?.averageRating)} />
        <KpiCard label="Visible reviews" value={formatCount(kpis?.visibleReviews)} />
        <KpiCard label="Pending flags" value={formatCount(kpis?.pendingFlags)} />
        <KpiCard label="Flags today" value={formatCount(kpis?.flagsToday)} />
      </section>

      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search client, practitioner, or comment…"
            className="h-10 flex-1 rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-3 text-sm"
          />
          <select
            value={list.filters.rating ?? 'all'}
            onChange={(e) => list.setFilters({ rating: e.target.value })}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
          >
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={String(n)}>
                {n} stars
              </option>
            ))}
          </select>
          <select
            value={list.filters.flaggedOnly ?? 'all'}
            onChange={(e) => list.setFilters({ flaggedOnly: e.target.value })}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
          >
            <option value="all">All reviews</option>
            <option value="true">Flagged only</option>
          </select>
        </div>

        {list.loading ? (
          <LoadingState label="Loading reviews…" />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error, 'Could not load reviews.')} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No reviews found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                  {['Client', 'Practitioner', 'Rating', 'Comment', 'Status', 'When', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold tracking-wide text-[var(--figma-text-muted)]"
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.items.map((r) => {
                  const busy = busyId === r.id
                  const status = normalizeStatus(r)
                  const specs = r.healer?.specializations
                  return (
                    <tr key={r.id} className="border-b border-[var(--figma-stroke)] last:border-0">
                      <td className="px-4 py-3 text-sm font-medium">{personName(r.client)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{personName(r.healer ?? r.practitioner)}</div>
                        {Array.isArray(specs) && specs.length > 0 ? (
                          <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">{specs.join(', ')}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{r.healerRating ?? r.rating ?? '—'}</td>
                      <td className="max-w-xs px-4 py-3 text-sm">
                        <div className="line-clamp-2">{r.comment || r.body || '—'}</div>
                        {r.flagReason ? (
                          <div className="mt-1 text-xs font-semibold text-amber-800">Flag: {r.flagReason}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={status} openFlagCount={r.openFlagCount} />
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {r.createdAt ? formatAdminDateTime(r.createdAt) : '—'}
                        {r.flaggedAt ? (
                          <div className="text-xs text-[var(--figma-text-muted)]">
                            Flagged {formatAdminDateTime(r.flaggedAt)}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {canFlagReviews() && status !== 'HIDDEN' ? (
                            status === 'FLAGGED' || (r.openFlagCount ?? 0) > 0 ? (
                              <ActionBtn
                                disabled={busy}
                                onClick={() => runAction(r.id, () => resolveReviewFlags(r.id))}
                                icon={FlagOff}
                                label="Resolve"
                              />
                            ) : (
                              <ActionBtn disabled={busy} onClick={() => onFlag(r)} icon={Flag} label="Flag" />
                            )
                          ) : null}
                          {canHideReviews() ? (
                            r.isVisible === false || status === 'HIDDEN' ? (
                              <ActionBtn
                                disabled={busy}
                                onClick={() => runAction(r.id, () => unhideReview(r.id))}
                                icon={Eye}
                                label="Unhide"
                              />
                            ) : (
                              <ActionBtn
                                disabled={busy}
                                onClick={() => runAction(r.id, () => hideReview(r.id))}
                                icon={EyeOff}
                                label="Hide"
                              />
                            )
                          ) : null}
                        </div>
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
          label="reviews"
        />
      </section>
    </div>
  )
}

function normalizeStatus(r) {
  if (r.status) return String(r.status).toUpperCase()
  if (r.isVisible === false) return 'HIDDEN'
  if ((r.openFlagCount ?? 0) > 0) return 'FLAGGED'
  return 'PUBLISHED'
}

function StatusBadge({ status, openFlagCount }) {
  const tone =
    status === 'HIDDEN'
      ? 'bg-slate-100 text-slate-700'
      : status === 'FLAGGED'
        ? 'bg-amber-50 text-amber-900'
        : 'bg-emerald-50 text-emerald-800'
  return (
    <span className={['inline-flex items-center gap-1 rounded-[8px] px-2 py-0.5 text-[10px] font-semibold', tone].join(' ')}>
      {status}
      {status === 'FLAGGED' && openFlagCount > 0 ? ` · ${openFlagCount}` : ''}
    </span>
  )
}

function KpiCard({ label, value }) {
  return (
    <div className="figma-card p-5">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
        {label.toUpperCase()}
      </div>
      <div className="mt-2 text-2xl font-semibold text-[var(--figma-text-strong)]">{value}</div>
    </div>
  )
}

function ActionBtn({ disabled, onClick, icon, label }) {
  const Icon = icon
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-[var(--figma-stroke)] px-2.5 text-xs font-semibold disabled:opacity-50"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function formatRating(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(2)
}

function formatCount(value) {
  if (value == null) return '—'
  return Number(value).toLocaleString()
}
