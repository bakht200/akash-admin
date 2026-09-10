import { useCallback, useEffect, useMemo, useState } from 'react'
import { LifeBuoy, RotateCcw, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePaginatedList } from '../hooks/usePaginatedList'
import {
  exportNotificationsCsv,
  fetchAdminActionNotifications,
  fetchNotificationKpis,
  fetchNotificationLogs,
  markAdminActionNotificationRead,
  retryNotification,
} from '../services/notifications'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import { formatAdminDateTime, practitionerCopy } from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { useRegisterPageActions } from '../hooks/usePageActions'

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
  const navigate = useNavigate()
  const { canWriteNotifications } = usePermissions()
  const [qInput, setQInput] = useState('')
  const [kpis, setKpis] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [busyKey, setBusyKey] = useState(null)
  const [liveHint, setLiveHint] = useState(false)
  const [actionItems, setActionItems] = useState([])
  const [actionUnreadCount, setActionUnreadCount] = useState(0)
  const [actionLoading, setActionLoading] = useState(true)
  const [tab, setTab] = useState('log')
  const [tabReady, setTabReady] = useState(false)

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

  const reloadActionItems = useCallback(async () => {
    try {
      const result = await fetchAdminActionNotifications({ limit: 50 })
      setActionItems(result?.items ?? [])
      setActionUnreadCount(result?.unreadCount ?? 0)
    } finally {
      setActionLoading(false)
    }
  }, [])

  useAdminLiveRefresh(() => {
    setLiveHint(true)
    list.reload()
    reloadKpis()
    reloadActionItems()
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

  useEffect(() => {
    reloadActionItems()
  }, [reloadActionItems])

  useEffect(() => {
    if (actionLoading || tabReady) return
    setTab(actionUnreadCount > 0 ? 'inbox' : 'log')
    setTabReady(true)
  }, [actionLoading, actionUnreadCount, tabReady])

  async function openActionItem(item) {
    if (!item.isRead) {
      try {
        await markAdminActionNotificationRead(item.id)
        setActionItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? { ...entry, isRead: true, readAt: new Date().toISOString() }
              : entry,
          ),
        )
        setActionUnreadCount((count) => Math.max(0, count - 1))
        window.dispatchEvent(new Event('admin-action-notification-read'))
      } catch (err) {
        window.alert(getErrorMessage(err, 'Could not mark notification as read.'))
        return
      }
    }
    navigate(item.targetUrl)
  }

  const onExport = useCallback(async () => {
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
  }, [list.filters])

  const topbarActions = useMemo(
    () => ({
      secondary: {
        label: exporting ? 'Exporting…' : 'Export Logs',
        icon: 'download',
        variant: 'outline',
        disabled: exporting,
        onClick: onExport,
      },
    }),
    [exporting, onExport],
  )
  useRegisterPageActions(topbarActions)

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
      {liveHint ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
          Live update received — refreshing…
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-[12px] bg-[var(--figma-input-bg)] p-1">
          <button
            type="button"
            onClick={() => setTab('inbox')}
            className={[
              'inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold',
              tab === 'inbox' ? 'bg-white text-[var(--figma-text-strong)] shadow-sm' : 'text-[var(--figma-text-muted)]',
            ].join(' ')}
          >
            Needs attention
            {actionUnreadCount > 0 ? (
              <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                {actionUnreadCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setTab('log')}
            className={[
              'rounded-[10px] px-3 py-2 text-sm font-semibold',
              tab === 'log' ? 'bg-white text-[var(--figma-text-strong)] shadow-sm' : 'text-[var(--figma-text-muted)]',
            ].join(' ')}
          >
            Delivery log
          </button>
        </div>
        {tab === 'inbox' ? (
          <p className="text-xs text-[var(--figma-text-muted)]">
            Support requests and identity reviews waiting for an admin.
          </p>
        ) : null}
      </div>

      {tab === 'inbox' ? (
      <section className="figma-card overflow-hidden">
        {actionLoading ? (
          <LoadingState label="Loading action notifications…" />
        ) : actionItems.length === 0 ? (
          <EmptyState title="You are caught up" description="New support tickets and identity reviews will appear here." />
        ) : (
          <div className="divide-y divide-[var(--figma-stroke)]">
            {actionItems.map((item) => {
              const Icon =
                item.type === 'support_ticket_submitted' || item.type === 'support_ticket_replied'
                  ? LifeBuoy
                  : UserCheck
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openActionItem(item)}
                  className={[
                    'flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-[rgba(244,243,241,0.65)] sm:px-6',
                    item.isRead ? 'bg-white' : 'bg-violet-50/60',
                  ].join(' ')}
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[var(--figma-brand)] ring-1 ring-[var(--figma-stroke)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--figma-text-strong)]">{practitionerCopy(item.title)}</span>
                      {!item.isRead ? <span className="h-2 w-2 rounded-full bg-rose-600" aria-label="Unread" /> : null}
                    </span>
                    {item.body ? (
                      <span className="mt-1 block text-sm text-[var(--figma-text-muted)]">{practitionerCopy(item.body)}</span>
                    ) : null}
                    <span className="mt-1 block text-xs text-[var(--figma-text-muted)]">
                      {formatAdminDateTime(item.createdAt)}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>
      ) : (
      <>
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
      </>
      )}
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
  return practitionerCopy(String(event).replace(/_/g, ' ')).replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatCount(value) {
  if (value == null) return '—'
  return Number(value).toLocaleString()
}
