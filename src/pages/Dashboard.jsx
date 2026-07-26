import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import {
  fetchDashboardKpis,
  fetchDashboardRecentTransactions,
  fetchDashboardRevenueTrend,
  fetchNewJoinings,
} from '../services/dashboard'
import { formatAdminDateTime, formatCents, personName } from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'
import { usePermissions } from '../hooks/usePermissions'

const TREND_PERIODS = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '12m', label: '12M' },
]

function KpiCard({ label, value, subtitle, delta, deltaTone, onClick }) {
  const deltaClasses =
    deltaTone === 'neg' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'

  return (
    <button
      type="button"
      onClick={onClick}
      className="figma-card w-full p-5 text-left transition hover:brightness-[0.99] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-wide text-[var(--figma-text-muted)]">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{value}</div>
          {subtitle ? <div className="mt-1 text-xs text-[var(--figma-text-muted)]">{subtitle}</div> : null}
        </div>
        {delta != null ? (
          <span className={['inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold', deltaClasses].join(' ')}>
            {delta}
          </span>
        ) : null}
      </div>
    </button>
  )
}

function formatDelta(pct) {
  if (pct == null || Number.isNaN(Number(pct))) return null
  const n = Number(pct)
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`
}

function normalizeTrend(data) {
  const series = data?.series ?? data?.items ?? (Array.isArray(data) ? data : [])
  return {
    points: series.map((p) => p.revenueCents ?? p.platformRevenueCents ?? p.valueCents ?? 0),
    labels: series.map((p) => {
      if (p.month) {
        const [, m] = String(p.month).split('-')
        const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return names[Number(m) - 1] ?? p.month
      }
      return p.label ?? ''
    }),
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { canReadFinancials, canReadPractitioners } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [joinings, setJoinings] = useState([])
  const [joiningCount, setJoiningCount] = useState(0)
  const [trendPeriod, setTrendPeriod] = useState('6m')
  const [trend, setTrend] = useState({ points: [], labels: [] })
  const [recentTxns, setRecentTxns] = useState([])
  const [liveHint, setLiveHint] = useState(false)

  const loadCore = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
      setError(null)
    }
    try {
      const canFin = canReadFinancials()
      const canPract = canReadPractitioners()
      const results = await Promise.allSettled([
        canFin ? fetchDashboardKpis() : Promise.resolve(null),
        canFin ? fetchDashboardRecentTransactions(8) : Promise.resolve(null),
        canPract ? fetchNewJoinings() : Promise.resolve(null),
      ])

      const [kpiRes, txnRes, joinRes] = results

      if (kpiRes.status === 'fulfilled' && kpiRes.value) setKpis(kpiRes.value)
      else if (canFin && kpiRes.status === 'rejected' && !silent) setError(kpiRes.reason)

      if (txnRes.status === 'fulfilled') {
        const d = txnRes.value
        setRecentTxns(d?.items ?? (Array.isArray(d) ? d : []))
      }

      if (joinRes.status === 'fulfilled' && joinRes.value) {
        const d = joinRes.value
        const items = d?.items ?? (Array.isArray(d) ? d : [])
        setJoinings(items)
        setJoiningCount(d?.count ?? items.length)
      } else if (!canPract) {
        setJoinings([])
        setJoiningCount(0)
      }

      if (!canFin && !canPract) {
        setError(new Error('You do not have permission to view dashboard data.'))
      }
    } catch (err) {
      if (!silent) setError(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [canReadFinancials, canReadPractitioners])

  const loadTrend = useCallback(async (period) => {
    if (!canReadFinancials()) {
      setTrend({ points: [], labels: [] })
      return
    }
    try {
      const data = await fetchDashboardRevenueTrend(period)
      setTrend(normalizeTrend(data))
    } catch {
      setTrend({ points: [], labels: [] })
    }
  }, [canReadFinancials])

  useEffect(() => {
    loadCore()
  }, [loadCore])

  useEffect(() => {
    loadTrend(trendPeriod)
  }, [loadTrend, trendPeriod])

  useAdminLiveRefresh(() => {
    setLiveHint(true)
    loadCore({ silent: true })
    loadTrend(trendPeriod)
    window.setTimeout(() => setLiveHint(false), 2500)
  })

  if (loading) return <LoadingState label="Loading dashboard…" />
  if (error && !kpis && joinings.length === 0) {
    return <ErrorState message={getErrorMessage(error, 'Could not load dashboard.')} onRetry={() => loadCore()} />
  }

  const revenue = kpis?.platformRevenue
  const totalTx = kpis?.totalTransactions
  const activeUsers = kpis?.activeUsers
  const refunds = kpis?.refunds

  const stats = canReadFinancials()
    ? [
        {
          label: 'Platform Revenue',
          value: formatCents(revenue?.valueCents ?? 0),
          subtitle: 'Last 30 days · mirrors Revenue',
          delta: formatDelta(revenue?.deltaPct),
          deltaTone: (revenue?.deltaPct ?? 0) >= 0 ? 'pos' : 'neg',
          href: '/revenue',
        },
        {
          label: 'Transactions',
          value: Number(totalTx?.value ?? 0).toLocaleString(),
          subtitle: 'Payments ∪ payouts · 30d',
          delta: formatDelta(totalTx?.deltaPct),
          deltaTone: (totalTx?.deltaPct ?? 0) >= 0 ? 'pos' : 'neg',
          href: '/transactions',
        },
        {
          label: 'Active Users',
          value: Number(activeUsers?.value ?? 0).toLocaleString(),
          subtitle: `Active in last ${activeUsers?.windowDays ?? 30} days`,
          delta: formatDelta(activeUsers?.deltaPct),
          deltaTone: 'pos',
          href: '/clients',
        },
        {
          label: 'Refunds',
          value: Number(refunds?.value ?? 0).toLocaleString(),
          subtitle: 'Refunded payments · 30d',
          delta: formatDelta(refunds?.deltaPct),
          deltaTone: (refunds?.deltaPct ?? 0) <= 0 ? 'pos' : 'neg',
          href: '/transactions',
        },
      ]
    : []

  const maxTrend = Math.max(1, ...(trend.points || []).map(Number))

  return (
    <div className="space-y-4">
      {liveHint ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
          Live update received — refreshing…
        </div>
      ) : null}

      {stats.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
          {stats.map((s) => (
            <KpiCard key={s.label} {...s} onClick={() => navigate(s.href)} />
          ))}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        {canReadFinancials() ? (
          <div className="lg:col-span-8 h-full">
            <div className="figma-card h-full rounded-[12px] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Monthly Revenue Flow</div>
                  <div className="mt-1 text-xs text-[var(--figma-text-muted)]">
                    Platform revenue by month (same aggregate as Revenue)
                  </div>
                </div>
                <div className="flex gap-1 rounded-[10px] border border-[var(--figma-stroke)] p-1">
                  {TREND_PERIODS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setTrendPeriod(p.value)}
                      className={[
                        'rounded-[8px] px-2.5 py-1 text-xs font-semibold',
                        trendPeriod === p.value
                          ? 'bg-[var(--figma-brand)] text-white'
                          : 'text-[var(--figma-text-muted)] hover:bg-[var(--figma-input-bg)]',
                      ].join(' ')}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                {(trend.points || []).length === 0 ? (
                  <p className="text-sm text-[var(--figma-text-muted)]">No trend data yet.</p>
                ) : (
                  <div
                    className="grid h-[220px] items-end gap-3 rounded-[12px] bg-[var(--figma-input-bg)] p-4 sm:h-[260px]"
                    style={{ gridTemplateColumns: `repeat(${trend.points.length}, minmax(0, 1fr))` }}
                  >
                    {trend.points.map((h, idx) => (
                      <div key={`${trend.labels[idx]}-${idx}`} className="flex flex-col items-center gap-3">
                        <div className="w-full rounded-[10px] bg-[rgba(27,20,100,0.10)]">
                          <div
                            className="w-full rounded-[10px] bg-[var(--figma-brand)]"
                            style={{ height: `${Math.max(8, (Number(h) / maxTrend) * 180)}px` }}
                            title={formatCents(h)}
                          />
                        </div>
                        <div className="text-[11px] font-semibold text-[var(--figma-text-muted)]">
                          {trend.labels?.[idx] ?? ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {canReadPractitioners() ? (
          <div className={canReadFinancials() ? 'lg:col-span-4' : 'lg:col-span-12'}>
            <div className="figma-card rounded-[12px] p-5 sm:p-6 lg:min-h-[360px]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[var(--figma-text-strong)]">New Joinings</div>
                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-600 px-2 text-[11px] font-semibold text-white">
                  {joiningCount}
                </span>
              </div>
              <div className="mt-1 text-xs text-[var(--figma-text-muted)]">Practitioners joined in the last 7 days</div>
              <div className="mt-4 space-y-3">
                {joinings.length === 0 ? (
                  <p className="text-sm text-[var(--figma-text-muted)]">No recent joinings.</p>
                ) : (
                  joinings.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => navigate(`/practitioners/${a.id}`)}
                      className="flex w-full items-center gap-3 rounded-[12px] border border-[var(--figma-stroke)] bg-white p-3 text-left hover:bg-[rgba(244,243,241,0.55)]"
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--figma-input-bg)] text-xs font-semibold">
                        {String(personName(a))
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[var(--figma-text-strong)]">{personName(a)}</div>
                        <div className="mt-0.5 truncate text-xs text-[var(--figma-text-muted)]">{a.email || ''}</div>
                      </div>
                      <div className="text-[11px] font-semibold text-[var(--figma-text-muted)]/70">
                        {a.createdAt ? formatAdminDateTime(a.createdAt) : ''}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {canReadFinancials() ? (
        <section className="figma-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--figma-stroke)] px-5 py-4 sm:px-6">
            <div>
              <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Recent Transactions</div>
              <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">Same ledger as the Transactions page</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="text-xs font-semibold text-[var(--figma-brand)]"
            >
              View all
            </button>
          </div>
          {recentTxns.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[var(--figma-text-muted)] sm:px-6">No recent transactions.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full">
                <thead>
                  <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                    {['Type', 'Entity', 'Amount', 'Status', 'When'].map((h) => (
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
                  {recentTxns.map((row) => (
                    <tr
                      key={row.rowKey ?? `${row.type}:${row.id}`}
                      className="cursor-pointer border-b border-[var(--figma-stroke)] last:border-0 hover:bg-[var(--figma-input-bg)]"
                      onClick={() => navigate('/transactions')}
                    >
                      <td className="px-4 py-3 text-sm font-medium">{formatTxnType(row.type)}</td>
                      <td className="px-4 py-3 text-sm">{personName(row.entity) || '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCents(row.amountCents)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="rounded-[8px] bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase">
                          {row.statusGroup || row.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {row.occurredAt ? formatAdminDateTime(row.occurredAt) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}

function formatTxnType(type) {
  if (type === 'session_payment') return 'Session payment'
  if (type === 'refund') return 'Refund'
  if (type === 'payout') return 'Payout'
  return type || '—'
}
