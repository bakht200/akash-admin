import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import {
  formatAdminDateTime,
  formatCents,
  formatShortUuid,
  normalizeSessionStatus,
  personName,
  sessionStatusClass,
  sessionStatusLabel,
  SESSION_STATUS_OPTIONS,
} from '../lib/display'
import { usePaginatedList } from '../hooks/usePaginatedList'
import { exportSessionsCsv, fetchSessions, fetchSessionStats } from '../services/sessions'
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
    .map((p) => p.replace(/^Dr\./, '').trim()[0]?.toUpperCase())
    .filter(Boolean)
    .join('')
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-[10px] font-semibold text-[var(--figma-text-muted)]">
      {initials.slice(0, 2) || '—'}
    </div>
  )
}

function rangeToFromTo(range) {
  const now = new Date()
  const to = now.toISOString()
  if (range === '7d') {
    const from = new Date(now)
    from.setDate(from.getDate() - 7)
    return { from: from.toISOString(), to }
  }
  if (range === '90d') {
    const from = new Date(now)
    from.setDate(from.getDate() - 90)
    return { from: from.toISOString(), to }
  }
  const from = new Date(now)
  from.setDate(from.getDate() - 30)
  return { from: from.toISOString(), to }
}

export default function Sessions() {
  const navigate = useNavigate()
  const [range, setRange] = useState('30d')
  const [qInput, setQInput] = useState('')
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState(null)

  const initialRange = useMemo(() => rangeToFromTo('30d'), [])
  const fetcher = useCallback((params) => fetchSessions(params), [])
  const list = usePaginatedList(fetcher, {
    limit: 25,
    initialFilters: { status: 'all', q: '', ...initialRange },
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
        const s = await fetchSessionStats({
          from: list.filters.from,
          to: list.filters.to,
          modality: list.filters.modality,
        })
        if (!cancelled) setStats(s)
      } catch {
        if (!cancelled) setStats(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [list.filters.from, list.filters.to, list.filters.modality])

  function onRangeChange(value) {
    setRange(value)
    list.setFilters(rangeToFromTo(value))
  }

  function clearFilters() {
    setRange('30d')
    setQInput('')
    list.replaceFilters({ status: 'all', q: '', ...rangeToFromTo('30d') })
  }

  async function onExport() {
    setExporting(true)
    try {
      const { status, from, to, modality, q } = list.filters
      await exportSessionsCsv({
        ...(status && status !== 'all' ? { status } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(modality ? { modality } : {}),
        ...(q ? { q } : {}),
      })
    } catch (err) {
      window.alert(getErrorMessage(err, 'Export failed.'))
    } finally {
      setExporting(false)
    }
  }

  const statusMix = useMemo(() => {
    const mix = stats?.statusMix
    if (!mix) return []
    if (Array.isArray(mix)) return mix
    const total = Object.values(mix).reduce((a, b) => a + Number(b || 0), 0) || 1
    return Object.entries(mix).map(([label, count]) => ({
      label,
      count: Number(count),
      pct: Math.round((Number(count) / total) * 100),
    }))
  }, [stats])

  const volume = useMemo(() => {
    const v = stats?.volume
    if (!v) return []
    if (Array.isArray(v)) return v.map((p) => (typeof p === 'number' ? p : p.count ?? p.value ?? 0))
    return []
  }, [stats])
  const maxVolume = Math.max(1, ...volume)

  return (
    <div className="space-y-6">
      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex flex-col gap-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[140px]">
              DATE RANGE
              <select
                value={range}
                onChange={(e) => onRangeChange(e.target.value)}
                className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)]"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[140px]">
              STATUS
              <select
                value={list.filters.status || 'all'}
                onChange={(e) => list.setFilters({ status: e.target.value })}
                className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
              >
                <option value="all">All Statuses</option>
                {SESSION_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {sessionStatusLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[200px]">
              SEARCH
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Name, email, or session id"
                className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={clearFilters} className="text-sm font-semibold text-[var(--figma-brand)]">
              Clear All Filters
            </button>
            <button
              type="button"
              disabled={exporting}
              onClick={onExport}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-semibold disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>

        {list.loading ? (
          <LoadingState label="Loading sessions…" />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error, 'Could not load sessions.')} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No sessions found" />
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-[1100px] w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                  {['Session ID', 'Date/Time', 'Client', 'Practitioner', 'Modality', 'Status', 'Fee', 'Total'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:px-6"
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.items.map((r) => {
                  const clientName = personName(r.client)
                  const healerName = personName(r.healer ?? r.practitioner)
                  return (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-b border-[var(--figma-stroke)] last:border-b-0 hover:bg-[rgba(244,243,241,0.55)]"
                      tabIndex={0}
                      onClick={() => navigate(`/sessions/${encodeURIComponent(r.id)}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/sessions/${encodeURIComponent(r.id)}`)
                        }
                      }}
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-brand)] sm:px-6">
                        {formatShortUuid(r.id)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                        {r.scheduledStartUtc ? formatAdminDateTime(r.scheduledStartUtc) : '—'}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <Avatar name={clientName} />
                          <span className="text-sm font-medium text-[var(--figma-text-strong)]">{clientName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <Avatar name={healerName} />
                          <span className="text-sm font-medium text-[var(--figma-text-strong)]">{healerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                        {r.modality?.name || r.modality || '—'}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={[
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                            sessionStatusClass(r.status),
                          ].join(' ')}
                        >
                          {normalizeSessionStatus(r.status) === 'in_progress' ? (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                          ) : null}
                          {sessionStatusLabel(r.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium sm:px-6">{formatCents(r.feeCents)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-brand)] sm:px-6">
                        {formatCents(r.totalChargedCents)}
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
          label="sessions"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="figma-card p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">VOLUME OVERVIEW</div>
          <div className="mt-4 flex h-40 items-end justify-between gap-2">
            {(volume.length ? volume : [0]).map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end">
                <div
                  className={[
                    'w-full max-w-[44px] rounded-t-[6px]',
                    i === Math.floor(volume.length / 2) ? 'bg-[var(--figma-brand)]' : 'bg-[var(--figma-input-bg)]',
                  ].join(' ')}
                  style={{ height: `${Math.max(4, (Number(h) / maxVolume) * 140)}px` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-[var(--figma-text-muted)]">Total in range: {(stats?.total ?? list.total).toLocaleString()}</div>
        </div>

        <div className="figma-card p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">STATUS MIX</div>
          <div className="mt-4 space-y-4">
            {statusMix.length === 0 ? (
              <p className="text-sm text-[var(--figma-text-muted)]">No stats for this range.</p>
            ) : (
              statusMix.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-sm font-medium text-[var(--figma-text-strong)]">
                    <span>{sessionStatusLabel(s.label)}</span>
                    <span>{s.pct ?? 0}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--figma-input-bg)]">
                    <div className="h-full rounded-full bg-[var(--figma-brand)]" style={{ width: `${s.pct ?? 0}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
