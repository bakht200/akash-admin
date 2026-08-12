import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import { fetchRevenueDailySeries, fetchRevenueSummary } from '../services/financials'
import { formatAdminDateTime, formatCents } from '../lib/display'
import { getErrorMessage } from '../lib/errors'

const RANGE_OPTIONS = [
  { value: 7, label: 'Last 7 Days' },
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
]

export default function Revenue() {
  const [range, setRange] = useState(30)
  const [summary, setSummary] = useState(null)
  const [seriesPayload, setSeriesPayload] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load(nextRange = range) {
    setLoading(true)
    setError(null)
    try {
      const params = { range: nextRange }
      const [sum, series] = await Promise.all([
        fetchRevenueSummary(params),
        fetchRevenueDailySeries(params),
      ])
      setSummary(sum)
      setSeriesPayload(series)
    } catch (err) {
      setError(err)
      setSummary(null)
      setSeriesPayload(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when range changes
  }, [range])

  const series = useMemo(() => seriesPayload?.series ?? [], [seriesPayload])

  const linePath = useMemo(() => buildCumulativePath(series), [series])
  const dailyBars = useMemo(() => {
    // Show last up to 14 days for the volume strip so bars stay readable
    const slice = series.slice(-14)
    return slice.map((d) => ({
      date: d.date,
      value: d.platformRevenueCents ?? 0,
    }))
  }, [series])
  const dailyMax = Math.max(1, ...dailyBars.map((d) => d.value))

  const ledgerRows = useMemo(() => [...series].reverse().slice(0, 14), [series])

  if (loading && !summary) return <LoadingState label="Loading revenue…" />
  if (error && !summary) {
    return <ErrorState message={getErrorMessage(error, 'Could not load revenue.')} onRetry={() => load(range)} />
  }

  const growth = summary?.periodGrowth
  const growthLabel =
    growth?.comparisonWindowDays === 30
      ? 'Monthly Growth'
      : growth?.comparisonWindowDays === 7
        ? 'Week-over-week Growth'
        : growth?.comparisonWindowDays === 90
          ? 'Quarter-over-period Growth'
          : 'Period Growth'
  const growthPct =
    growth?.pct == null ? 'n/a' : `${growth.pct > 0 ? '+' : ''}${Number(growth.pct).toFixed(1)}%`
  const growthTone =
    growth?.direction === 'down' ? 'neg' : growth?.direction === 'flat' ? 'flat' : 'pos'

  const breakdown = summary?.breakdown ?? {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-2xl">
            Revenue Overview
          </h1>
          <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
            Platform take: commission + platform fee + service fee − platform-funded promos.
            {summary?.range ? (
              <>
                {' '}
                {summary.range.from} → {summary.range.to} ({summary.range.days}d)
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
          <label className="flex flex-col gap-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[160px]">
            DATE RANGE
            <select
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => downloadSeriesCsv(series, summary?.range)}
            disabled={!series.length}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-[var(--figma-text-muted)]">Refreshing…</p> : null}
      {error && summary ? (
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Partial refresh failed: {getErrorMessage(error)}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Kpi
          label="Total Platform Fees"
          value={formatCents(summary?.platformRevenueCents)}
          hint="Commission + platform fee + service fee − platform-funded promos"
          delta={growthPct}
          deltaTone={growthTone}
        />
        <Kpi
          label={growthLabel}
          value={growthPct}
          hint={
            growth?.previousPeriod
              ? `vs ${growth.previousPeriod.from} → ${growth.previousPeriod.to}`
              : 'Compared to the prior window of the same length'
          }
          delta={
            growth?.previousCents != null ? `prev ${formatCents(growth.previousCents)}` : null
          }
          deltaTone={growthTone}
        />
        <Kpi
          label="Run Rate (annualized)"
          value={formatCents(summary?.runRate?.annualizedCents)}
          hint={summary?.runRate?.note || 'Arithmetic projection, not a forecast'}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="figma-card p-5 sm:p-6 lg:col-span-8">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
            CUMULATIVE PLATFORM REVENUE
          </div>
          <div className="mt-1 text-sm text-[var(--figma-text-muted)]">
            Running total for this range — final value equals the summary.
          </div>
          {series.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--figma-text-muted)]">No series data.</p>
          ) : (
            <svg viewBox={`0 0 ${linePath.w} ${linePath.h}`} className="mt-4 h-[220px] w-full" role="img" aria-label="Cumulative revenue">
              <path d={linePath.areaD} fill="rgba(27,20,100,0.10)" />
              <path d={linePath.d} fill="none" stroke="var(--figma-brand)" strokeWidth="2.5" />
            </svg>
          )}
        </div>

        <div className="figma-card p-5 sm:p-6 lg:col-span-4">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">BREAKDOWN</div>
          <ul className="mt-4 space-y-3 text-sm">
            <BreakdownRow label="Commission" value={formatCents(breakdown.commissionCents)} />
            <BreakdownRow label="Platform fee" value={formatCents(breakdown.platformFeeCents)} />
            <BreakdownRow label="Service fee" value={formatCents(breakdown.serviceFeeCents)} />
            <BreakdownRow
              label="Platform-funded promos"
              value={`−${formatCents(breakdown.platformFundedDiscountCents).replace(/^\$/, '')}`}
              muted
            />
            <li className="flex justify-between gap-2 border-t border-[var(--figma-stroke)] pt-3 font-semibold">
              <span>Platform revenue</span>
              <span className="text-[var(--figma-brand)]">{formatCents(summary?.platformRevenueCents)}</span>
            </li>
          </ul>
          <div className="mt-6 space-y-2 border-t border-[var(--figma-stroke)] pt-4 text-sm">
            <BreakdownRow label="GMV (gross processed)" value={formatCents(summary?.gmvCents)} />
            <BreakdownRow label="Refunded" value={formatCents(summary?.refundedCents)} />
            <BreakdownRow
              label="Net processed"
              value={formatCents((summary?.gmvCents ?? 0) - (summary?.refundedCents ?? 0))}
            />
          </div>
        </div>
      </section>

      <section className="figma-card p-5 sm:p-6">
        <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
          DAILY VOLUME (LAST {dailyBars.length} DAYS IN RANGE)
        </div>
        <div className="mt-4 flex h-28 items-end justify-between gap-1.5">
          {dailyBars.length === 0 ? (
            <p className="text-sm text-[var(--figma-text-muted)]">No daily data.</p>
          ) : (
            dailyBars.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${formatCents(d.value)}`}>
                <div
                  className="w-full max-w-[36px] rounded-t-[6px] bg-[var(--figma-brand)]/80"
                  style={{ height: `${Math.max(4, (d.value / dailyMax) * 96)}px` }}
                />
                <div className="text-[9px] font-semibold text-[var(--figma-text-muted)]">
                  {d.date.slice(5)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="figma-card overflow-hidden">
        <div className="border-b border-[var(--figma-stroke)] px-5 py-4 text-sm font-semibold text-[var(--figma-text-strong)]">
          Daily ledger
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {['Date', 'Commission', 'Platform fee', 'Service fee', 'Promo deduction', 'Platform revenue', 'Cumulative'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]"
                    >
                      {h.toUpperCase()}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-sm text-[var(--figma-text-muted)]">
                    No days in range.
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row) => (
                  <tr key={row.date} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                    <td className="px-4 py-3 text-sm font-medium">{formatDay(row.date)}</td>
                    <td className="px-4 py-3 text-sm">{formatCents(row.commissionCents)}</td>
                    <td className="px-4 py-3 text-sm">{formatCents(row.platformFeeCents)}</td>
                    <td className="px-4 py-3 text-sm">{formatCents(row.serviceFeeCents)}</td>
                    <td className="px-4 py-3 text-sm">{formatCents(row.platformFundedDiscountCents)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--figma-brand)]">
                      {formatCents(row.platformRevenueCents)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatCents(row.cumulativeCents)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
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
        <div className="min-w-0">
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

function BreakdownRow({ label, value, muted }) {
  return (
    <li className="flex justify-between gap-2">
      <span className={muted ? 'text-[var(--figma-text-muted)]' : 'text-[var(--figma-text)]'}>{label}</span>
      <span className="font-semibold text-[var(--figma-text-strong)]">{value}</span>
    </li>
  )
}

function buildCumulativePath(series) {
  const w = 600
  const h = 200
  const pad = 16
  const vals = series.map((d) => Number(d.cumulativeCents ?? 0))
  if (vals.length === 0) return { d: '', areaD: '', w, h }
  const max = Math.max(...vals, 1)
  const min = 0
  const step = vals.length === 1 ? 0 : (w - pad * 2) / (vals.length - 1)
  const points = vals.map((v, i) => {
    const x = pad + i * step
    const y = pad + (h - pad * 2) * (1 - (v - min) / (max - min || 1))
    return { x, y }
  })
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  const first = points[0]
  const areaD = `${d} L ${last.x.toFixed(1)} ${h - pad} L ${first.x.toFixed(1)} ${h - pad} Z`
  return { d, areaD, w, h }
}

function formatDay(isoDate) {
  if (!isoDate) return '—'
  // Dates are UTC day buckets — show calendar date without inventing a local time
  try {
    return formatAdminDateTime(`${isoDate}T12:00:00Z`).replace(/,.+$/, '') || isoDate
  } catch {
    return isoDate
  }
}

function downloadSeriesCsv(series, range) {
  const header = [
    'date',
    'commissionCents',
    'platformFeeCents',
    'serviceFeeCents',
    'platformFundedDiscountCents',
    'platformRevenueCents',
    'cumulativeCents',
  ]
  const lines = [header.join(',')]
  for (const row of series) {
    lines.push(
      [
        row.date,
        row.commissionCents ?? 0,
        row.platformFeeCents ?? 0,
        row.serviceFeeCents ?? 0,
        row.platformFundedDiscountCents ?? 0,
        row.platformRevenueCents ?? 0,
        row.cumulativeCents ?? 0,
      ].join(','),
    )
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `revenue-${range?.from ?? 'from'}-${range?.to ?? 'to'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
