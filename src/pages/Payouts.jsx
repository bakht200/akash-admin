import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Eye, MoreVertical, RotateCcw, X } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import {
  exportPayoutsCsv,
  fetchPayout,
  fetchPayoutKpis,
  fetchPayouts,
  retryPayout,
} from '../services/financials'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import ReasonModal from '../components/modals/ReasonModal'
import { formatAdminDateTime, formatCents, formatShortUuid, personName } from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
]

const STRIPE_DASHBOARD_BASE =
  import.meta.env.VITE_STRIPE_DASHBOARD_BASE || 'https://dashboard.stripe.com/connect/transfers'

export default function Payouts() {
  const navigate = useNavigate()
  const { canRetryPayout } = usePermissions()
  const [qInput, setQInput] = useState('')
  const [kpis, setKpis] = useState(null)
  const [kpisError, setKpisError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [menuId, setMenuId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [retryTarget, setRetryTarget] = useState(null)
  const [retryBusy, setRetryBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const menuRef = useRef(null)

  const fetcher = useCallback((params) => fetchPayouts(params), [])
  const list = usePaginatedList(fetcher, {
    limit: 25,
    initialFilters: { status: 'all', q: '' },
  })

  useEffect(() => {
    const t = setTimeout(() => list.setFilters({ q: qInput.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchPayoutKpis()
        if (!cancelled) setKpis(data)
      } catch (err) {
        if (!cancelled) setKpisError(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  async function onExport() {
    setExporting(true)
    try {
      const { status, q, from, to, healerId } = list.filters
      await exportPayoutsCsv({
        ...(status && status !== 'all' ? { status } : {}),
        ...(q ? { q } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(healerId ? { healerId } : {}),
      })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Export failed.'))
    } finally {
      setExporting(false)
    }
  }

  async function openDetail(id) {
    setMenuId(null)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    try {
      setDetail(await fetchPayout(id))
    } catch (err) {
      setDetailError(getErrorMessage(err, 'Could not load payout.'))
      setDetail({ id })
    } finally {
      setDetailLoading(false)
    }
  }

  async function onRetry(reason) {
    if (!retryTarget) return
    setRetryBusy(true)
    setActionError('')
    try {
      await retryPayout(retryTarget.id, reason)
      setRetryTarget(null)
      list.reload()
      // Refresh KPIs after a successful retry
      fetchPayoutKpis()
        .then(setKpis)
        .catch(() => {})
    } catch (err) {
      setActionError(getErrorMessage(err, 'Retry failed.'))
    } finally {
      setRetryBusy(false)
    }
  }

  const mom = kpis?.totalThisMonth?.monthOverMonthPct
  const momLabel = mom == null ? 'n/a' : `${mom > 0 ? '+' : ''}${Number(mom).toFixed(1)}%`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-2xl">
            Payouts
          </h1>
          <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
            Practitioner withdrawals via Stripe Connect. Failed rows can be retried (Finance / Super Admin).
          </p>
        </div>
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting…' : 'Download Payout Report'}
        </button>
      </div>

      {actionError ? (
        <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {kpisError ? (
          <div className="figma-card p-5 md:col-span-2 text-sm text-rose-700">
            {getErrorMessage(kpisError, 'Could not load payout KPIs.')}
          </div>
        ) : !kpis ? (
          <div className="figma-card p-5 md:col-span-2 text-sm text-[var(--figma-text-muted)]">Loading KPIs…</div>
        ) : (
          <>
            <Kpi
              label="Total this month"
              value={formatCents(kpis.totalThisMonth?.totalCents)}
              hint={`${(kpis.totalThisMonth?.count ?? 0).toLocaleString()} payouts`}
              delta={momLabel}
              deltaTone={mom == null ? 'flat' : mom >= 0 ? 'pos' : 'neg'}
            />
            <Kpi
              label="Pending volume"
              value={formatCents(kpis.pendingVolume?.totalCents)}
              hint={`${kpis.pendingVolume?.waitingPractitioners ?? 0} practitioners waiting`}
            />
          </>
        )}
      </section>

      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search payout id or practitioner…"
            className="h-10 flex-1 rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-3 text-sm"
          />
          <select
            value={list.filters.status || 'all'}
            onChange={(e) => list.setFilters({ status: e.target.value })}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {list.loading ? (
          <LoadingState label="Loading payouts…" />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error, 'Could not load payouts.')} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No payouts" />
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-[1100px] w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                  {[
                    'Practitioner',
                    'Amount',
                    'Status',
                    'Requested',
                    'Completed',
                    'Method',
                    'Stripe',
                    '',
                  ].map((h) => (
                    <th
                      key={h || 'actions'}
                      className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:px-6"
                    >
                      {h ? h.toUpperCase() : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.items.map((p) => {
                  const pract = p.practitioner ?? p.healer
                  const name = personName(pract)
                  return (
                    <tr key={p.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                      <td className="px-4 py-4 sm:px-6">
                        <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{name}</div>
                        <div className="text-xs text-[var(--figma-text-muted)]">{formatShortUuid(pract?.id)}</div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-brand)] sm:px-6">
                        {formatCents(p.amountCents)}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <StatusPill group={p.statusGroup || p.status} status={p.status} />
                        {p.status === 'failed' && p.failureReason ? (
                          <div className="mt-1 max-w-[200px] truncate text-xs text-rose-700" title={p.failureReason}>
                            {p.failureReason}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-sm sm:px-6">
                        {p.requestedAt ? formatAdminDateTime(p.requestedAt) : '—'}
                      </td>
                      <td className="px-4 py-4 text-sm sm:px-6">
                        {p.completedAt ? formatAdminDateTime(p.completedAt) : '—'}
                      </td>
                      <td className="px-4 py-4 text-sm sm:px-6">
                        {(p.payoutMethod || 'stripe_connect').replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs sm:px-6">
                        {p.stripeTransferId ? (
                          <a
                            href={`${STRIPE_DASHBOARD_BASE}/${encodeURIComponent(p.stripeTransferId)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--figma-brand)] hover:underline"
                          >
                            {p.stripeTransferId}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="relative px-4 py-4 sm:px-6" ref={menuId === p.id ? menuRef : null}>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openDetail(p.id)}
                            className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)]"
                            aria-label="View payout"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setMenuId((id) => (id === p.id ? null : p.id))}
                            className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text-muted)]"
                            aria-label="More actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                        {menuId === p.id ? (
                          <div className="absolute right-6 z-20 mt-1 w-52 rounded-[10px] border border-[var(--figma-stroke)] bg-white py-1 shadow-lg">
                            {pract?.id ? (
                              <button
                                type="button"
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--figma-input-bg)]"
                                onClick={() => {
                                  setMenuId(null)
                                  navigate(`/practitioners/${pract.id}`)
                                }}
                              >
                                View practitioner
                              </button>
                            ) : null}
                            {p.stripeTransferId ? (
                              <a
                                href={`${STRIPE_DASHBOARD_BASE}/${encodeURIComponent(p.stripeTransferId)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--figma-input-bg)]"
                                onClick={() => setMenuId(null)}
                              >
                                Open in Stripe
                              </a>
                            ) : null}
                            {p.status === 'failed' && canRetryPayout() ? (
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                                onClick={() => {
                                  setMenuId(null)
                                  setRetryTarget(p)
                                }}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Retry payout
                              </button>
                            ) : null}
                          </div>
                        ) : null}
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
          label="payouts"
        />
      </section>

      <ReasonModal
        open={Boolean(retryTarget)}
        title="Retry failed payout"
        message="Creates a fresh withdrawal of the same amount. The failed row stays as history. Optional reason is audited."
        reasonLabel="Reason (optional)"
        reasonRequired={false}
        confirmLabel={retryBusy ? 'Retrying…' : 'Retry'}
        onCancel={() => setRetryTarget(null)}
        onConfirm={onRetry}
      />

      <PayoutDetailDrawer
        open={Boolean(detail) || detailLoading}
        loading={detailLoading}
        error={detailError}
        data={detail}
        canRetry={canRetryPayout()}
        onRetry={(payout) => {
          setDetail(null)
          setRetryTarget(payout)
        }}
        onClose={() => {
          setDetail(null)
          setDetailError(null)
        }}
      />
    </div>
  )
}

function Kpi({ label, value, hint, delta, deltaTone }) {
  const deltaClass =
    deltaTone === 'neg'
      ? 'bg-rose-50 text-rose-700'
      : deltaTone === 'flat'
        ? 'bg-slate-100 text-slate-700'
        : 'bg-emerald-50 text-emerald-700'

  return (
    <div className="figma-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
            {label.toUpperCase()}
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{value}</div>
          {hint ? <div className="mt-1 text-xs text-[var(--figma-text-muted)]">{hint}</div> : null}
        </div>
        {delta != null ? (
          <span className={['inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', deltaClass].join(' ')}>
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function StatusPill({ group, status }) {
  const key = group || status
  const tone = {
    success: 'bg-emerald-50 text-emerald-800',
    completed: 'bg-emerald-50 text-emerald-800',
    in_progress: 'bg-sky-50 text-sky-800',
    processing: 'bg-sky-50 text-sky-800',
    pending: 'bg-amber-50 text-amber-900',
    failed: 'bg-rose-50 text-rose-800',
  }[key] || 'bg-slate-100 text-slate-700'

  return (
    <span className={['inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold', tone].join(' ')}>
      {(status || group || '—').replace(/_/g, ' ').toUpperCase()}
    </span>
  )
}

function PayoutDetailDrawer({ open, loading, error, data, canRetry, onRetry, onClose }) {
  if (!open) return null
  const payout = data?.payout ?? data
  const pract = data?.practitioner ?? data?.healer ?? payout?.practitioner

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button type="button" className="flex-1 cursor-default" aria-label="Close" onClick={onClose} />
      <aside className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--figma-stroke)] px-5 py-4">
          <div>
            <div className="text-xs font-semibold text-[var(--figma-text-muted)]">PAYOUT DETAIL</div>
            <div className="mt-1 text-lg font-semibold">{formatCents(payout?.amountCents)}</div>
            <div className="mt-1 font-mono text-xs text-[var(--figma-text-muted)]">
              {formatShortUuid(payout?.id)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--figma-input-bg)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? <LoadingState label="Loading payout…" /> : null}
          {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
          {!loading && payout?.id ? (
            <div className="space-y-4 text-sm">
              <Section title="Payout">
                <Row label="Status" value={payout.status || '—'} />
                <Row label="Method" value={(payout.payoutMethod || '—').replace(/_/g, ' ')} />
                <Row label="Requested" value={payout.requestedAt ? formatAdminDateTime(payout.requestedAt) : '—'} />
                <Row label="Completed" value={payout.completedAt ? formatAdminDateTime(payout.completedAt) : '—'} />
                <Row label="Retried" value={payout.retriedAt ? formatAdminDateTime(payout.retriedAt) : '—'} />
                <Row label="Stripe transfer" value={payout.stripeTransferId || '—'} mono />
                {payout.failureReason ? <Row label="Failure" value={payout.failureReason} /> : null}
              </Section>
              <Section title="Practitioner">
                <Row label="Name" value={personName(pract)} />
                <Row label="ID" value={formatShortUuid(pract?.id)} mono />
              </Section>
              {payout.status === 'failed' && canRetry ? (
                <button
                  type="button"
                  onClick={() => onRetry(payout)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry payout
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-[12px] border border-[var(--figma-stroke)] p-4">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">{title.toUpperCase()}</div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[var(--figma-text-muted)]">{label}</span>
      <span className={['text-right font-semibold text-[var(--figma-text-strong)]', mono ? 'font-mono text-xs' : ''].join(' ')}>
        {value}
      </span>
    </div>
  )
}
