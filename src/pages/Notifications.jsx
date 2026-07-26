import { useCallback, useEffect, useState } from 'react'
import { Download, RotateCcw } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import {
  exportNotificationsCsv,
  fetchNotificationKpis,
  fetchNotificationLogs,
  retryNotification,
} from '../services/notifications'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import { formatAdminDateTime } from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'

const CHANNEL_OPTIONS = [
  { value: 'all', label: 'All channels' },
  { value: 'in_app', label: 'In-app' },
  { value: 'push', label: 'Push' },
  { value: 'email', label: 'Email' },
]

const HORIZON_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

export default function Notifications() {
  const { canWriteNotifications } = usePermissions()
  const [qInput, setQInput] = useState('')
  const [kpis, setKpis] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [busyKey, setBusyKey] = useState(null)
  const [liveHint, setLiveHint] = useState(false)

  const fetcher = useCallback((params) => fetchNotificationLogs(params), [])
  const list = usePaginatedList(fetcher, {
    limit: 25,
    initialFilters: { channel: 'all', horizon: '30d', q: '' },
  })

  const reloadKpis = useCallback(async () => {
    try {
      setKpis(await fetchNotificationKpis({ horizon: list.filters.horizon }))
    } catch {
      setKpis(null)
    }
  }, [list.filters.horizon])

  useAdminLiveRefresh(() => {
    setLiveHint(true)
    list.reload()
    reloadKpis()
    window.setTimeout(() => setLiveHint(false), 2500)
  })

  useEffect(() => {
    const t = setTimeout(() => list.setFilters({ q: qInput.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput])

  useEffect(() => {
    reloadKpis()
  }, [reloadKpis])

  async function onExport() {
    setExporting(true)
    try {
      const { channel, horizon, q } = list.filters
      await exportNotificationsCsv({
        ...(channel && channel !== 'all' ? { channel } : {}),
        ...(horizon ? { horizon } : {}),
        ...(q ? { q } : {}),
      })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Export failed.'))
    } finally {
      setExporting(false)
    }
  }

  async function onRetry(row) {
    setBusyKey(row.rowKey ?? row.id)
    try {
      await retryNotification(row.channel, row.id)
      list.reload()
    } catch (err) {
      window.alert(getErrorMessage(err, 'Retry failed.'))
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-2xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
            In-app, push, and email delivery logs across all user activity.
          </p>
        </div>
        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 text-sm font-semibold disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Exporting…' : 'Export Logs'}
        </button>
      </div>

      {liveHint ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
          Live update received — refreshing…
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total sent" value={formatCount(kpis?.totalSent)} />
        <KpiCard label="Delivered" value={formatCount(kpis?.delivered)} />
        <KpiCard label="Failed" value={formatCount(kpis?.failed)} />
        <KpiCard
          label="Success rate"
          value={kpis?.successRatePct != null ? `${Number(kpis.successRatePct).toFixed(1)}%` : '—'}
          hint="Push + email delivery attempts"
        />
      </section>

      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search recipient name, email, or phone…"
            className="h-10 flex-1 rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-3 text-sm"
          />
          <select
            value={list.filters.channel ?? 'all'}
            onChange={(e) => list.setFilters({ channel: e.target.value })}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
          >
            {CHANNEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={list.filters.horizon ?? '30d'}
            onChange={(e) => list.setFilters({ horizon: e.target.value })}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
          >
            {HORIZON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {list.loading ? (
          <LoadingState label="Loading delivery logs…" />
        ) : list.error ? (
          <ErrorState
            message={getErrorMessage(list.error, 'Could not load notification logs.')}
            onRetry={list.reload}
          />
        ) : list.items.length === 0 ? (
          <EmptyState title="No notification logs" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                  {['Channel', 'Event', 'Status', 'Recipient', 'Detail', 'When', 'Actions'].map((h) => (
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
                {list.items.map((n) => {
                  const key = n.rowKey ?? `${n.channel}:${n.id}`
                  const busy = busyKey === (n.rowKey ?? n.id)
                  const showRetry =
                    canWriteNotifications() && n.canRetry === true && n.channel === 'push'
                  return (
                    <tr key={key} className="border-b border-[var(--figma-stroke)] last:border-0">
                      <td className="px-4 py-3 text-sm">
                        <ChannelBadge channel={n.channel} />
                      </td>
                      <td className="px-4 py-3 text-sm">{formatEvent(n.event)}</td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={n.status} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{n.recipient?.name || '—'}</div>
                        <div className="text-xs text-[var(--figma-text-muted)]">
                          {n.recipient?.email || n.recipient?.phone || ''}
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-sm">
                        {n.errorMessage ? (
                          <span className="text-rose-700">{n.errorMessage}</span>
                        ) : n.providerMessageId ? (
                          <span className="text-xs text-[var(--figma-text-muted)]">{n.providerMessageId}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {n.occurredAt ? formatAdminDateTime(n.occurredAt) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {showRetry ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onRetry(n)}
                            className="inline-flex h-8 items-center gap-1 rounded-[8px] border border-[var(--figma-stroke)] px-2.5 text-xs font-semibold disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {busy ? 'Retrying…' : 'Retry'}
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--figma-text-muted)]">—</span>
                        )}
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
          label="deliveries"
        />
      </section>
    </div>
  )
}

function ChannelBadge({ channel }) {
  const label = channel === 'in_app' ? 'In-app' : channel === 'push' ? 'Push' : channel === 'email' ? 'Email' : channel || '—'
  const tone =
    channel === 'push'
      ? 'bg-sky-50 text-sky-800'
      : channel === 'email'
        ? 'bg-violet-50 text-violet-800'
        : 'bg-slate-100 text-slate-700'
  return (
    <span className={['inline-flex rounded-[8px] px-2 py-0.5 text-[10px] font-semibold', tone].join(' ')}>
      {label}
    </span>
  )
}

function StatusBadge({ status }) {
  const tone =
    status === 'failed'
      ? 'bg-rose-50 text-rose-700'
      : status === 'read'
        ? 'bg-emerald-50 text-emerald-800'
        : 'bg-slate-100 text-slate-700'
  return (
    <span className={['inline-flex rounded-[8px] px-2 py-0.5 text-[10px] font-semibold uppercase', tone].join(' ')}>
      {status || '—'}
    </span>
  )
}

function KpiCard({ label, value, hint }) {
  return (
    <div className="figma-card p-5">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
        {label.toUpperCase()}
      </div>
      <div className="mt-2 text-2xl font-semibold text-[var(--figma-text-strong)]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-[var(--figma-text-muted)]">{hint}</div> : null}
    </div>
  )
}

function formatEvent(event) {
  if (!event) return '—'
  return String(event)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatCount(value) {
  if (value == null) return '—'
  return Number(value).toLocaleString()
}
