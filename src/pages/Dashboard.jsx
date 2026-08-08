import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import { fetchDashboardKpis, fetchNewJoinings, fetchDashboardRevenueTrend } from '../services/dashboard'
import { formatMoney } from '../lib/display'

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
        <span className={['inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold', deltaClasses].join(' ')}>
          {delta}
        </span>
      </div>
    </button>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [joinings, setJoinings] = useState([])
  const [trend, setTrend] = useState({ points: [], labels: [] })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [kpiData, joiningData, trendData] = await Promise.all([
          fetchDashboardKpis(),
          fetchNewJoinings(),
          fetchDashboardRevenueTrend(6),
        ])
        if (!cancelled) {
          setKpis(kpiData)
          setJoinings(joiningData)
          setTrend(trendData)
        }
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <LoadingState label="Loading dashboard…" />
  if (error) return <ErrorState message="Could not load dashboard." onRetry={() => window.location.reload()} />

  const stats = [
    {
      label: 'Platform Revenue',
      value: formatMoney(kpis.platformRevenue.value),
      subtitle: 'Last 30 days',
      delta: `${kpis.platformRevenue.deltaPct > 0 ? '+' : ''}${kpis.platformRevenue.deltaPct}%`,
      deltaTone: kpis.platformRevenue.deltaPct >= 0 ? 'pos' : 'neg',
      href: '/revenue',
    },
    {
      label: 'Transactions',
      value: kpis.transactions.value.toLocaleString(),
      subtitle: 'Last 30 days',
      delta: `+${kpis.transactions.deltaPct}%`,
      deltaTone: 'pos',
      href: '/transactions',
    },
    {
      label: 'Active Users',
      value: kpis.activeUsers.value.toLocaleString(),
      subtitle: kpis.activeUsers.accumulating ? 'Data accumulating' : 'Last 30 days',
      delta: `+${kpis.activeUsers.deltaPct}%`,
      deltaTone: 'pos',
      href: '/clients?status=active',
    },
    {
      label: 'Refunds (30d)',
      value: String(kpis.refunds30d.value),
      subtitle: 'Last 30 days',
      delta: `${kpis.refunds30d.deltaPct}%`,
      deltaTone: 'neg',
      href: '/transactions?type=refunds',
    },
  ]

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        {stats.map((s) => (
          <KpiCard key={s.label} {...s} onClick={() => navigate(s.href)} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-8 h-full">
          <div className="figma-card h-full rounded-[12px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Platform Revenue Flow</div>
                <div className="mt-1 text-xs text-[var(--figma-text-muted)]">Commission + platform fee + client service fee</div>
              </div>
              <div className="rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 py-2 text-xs font-semibold text-[var(--figma-text)]">
                Last 6m
              </div>
            </div>

            <div className="mt-5">
              <div className="grid h-[220px] grid-cols-6 items-end gap-3 rounded-[12px] bg-[var(--figma-input-bg)] p-4 sm:h-[260px]">
                {trend.points.map((h, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-3">
                    <div className="w-full rounded-[10px] bg-[rgba(27,20,100,0.10)]">
                      <div className="w-full rounded-[10px] bg-[var(--figma-brand)]" style={{ height: `${h * 2}px` }} />
                    </div>
                    <div className="text-[11px] font-semibold text-[var(--figma-text-muted)]">{trend.labels[idx]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="figma-card rounded-[12px] p-5 sm:p-6 lg:min-h-[360px]">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-[var(--figma-text-strong)]">New Joinings</div>
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-600 px-2 text-[11px] font-semibold text-white">
                {joinings.length}
              </span>
            </div>
            <div className="mt-1 text-xs text-[var(--figma-text-muted)]">Newly joined this week</div>
            <div className="mt-4 space-y-3">
              {joinings.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => navigate(`/practitioners/${a.id}`)}
                  className="flex w-full items-center gap-3 rounded-[12px] border border-[var(--figma-stroke)] bg-white p-3 text-left hover:bg-[rgba(244,243,241,0.55)]"
                >
                  <div className="h-9 w-9 rounded-full bg-[var(--figma-input-bg)]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[var(--figma-text-strong)]">{a.name}</div>
                    <div className="mt-0.5 truncate text-xs text-[var(--figma-text-muted)]">{a.specialization}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--figma-text-muted)]/70">{a.time}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
