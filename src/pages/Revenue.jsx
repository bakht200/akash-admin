import { useMemo } from 'react'
import { Download, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

/** Week view: Mon–Sun; index 3 = Thursday highlight */
const DAILY_BARS = [32, 44, 38, 72, 48, 56, 40]
const DAILY_MAX = Math.max(...DAILY_BARS)
const DAILY_CHART_PX = 80

const LEDGER_PREVIEW = [
  { date: 'Oct 24, 2023', sessions: 142, fees: 4280.5, status: 'Settled' },
  { date: 'Oct 23, 2023', sessions: 138, fees: 4120.25, status: 'Settled' },
  { date: 'Oct 22, 2023', sessions: 131, fees: 3890.0, status: 'Processing' },
  { date: 'Oct 21, 2023', sessions: 128, fees: 3755.75, status: 'Settled' },
]

function ledgerStatusClass(s) {
  return s === 'Settled' ? 'bg-emerald-50 text-emerald-800' : 'bg-sky-50 text-sky-800'
}

export default function Revenue() {
  const linePath = useMemo(() => {
    const w = 600
    const h = 200
    const pad = 16
    const vals = [18, 22, 20, 32, 38, 42, 48, 46, 55, 68, 78]
    const max = Math.max(...vals)
    const min = 0
    const step = (w - pad * 2) / (vals.length - 1)
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
  }, [])

  return (
    <div className="space-y-6">
      {/* Title + controls on one line */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-2xl">Revenue Overview</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
          <label className="flex flex-col gap-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[160px]">
            DATE RANGE
            <select className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
          </label>
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:brightness-[0.98]"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="figma-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TOTAL PLATFORM FEES</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">$142,500</div>
              <div className="mt-1 text-xs text-[var(--figma-text-muted)]">Net processing revenue after gas fees.</div>
            </div>
            <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              +12.4%
            </span>
          </div>
        </div>
        <div className="figma-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">MONTHLY GROWTH</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">18.2%</div>
              <div className="mt-1 text-xs text-[var(--figma-text-muted)]">Month-over-month active volume delta.</div>
            </div>
            <span className="inline-flex shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
              -2.1%
            </span>
          </div>
        </div>
        <div className="figma-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">PROJECTED REVENUE</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">$1.8M</div>
              <div className="mt-1 text-xs text-[var(--figma-text-muted)]">Based on current run-rate active volume.</div>
            </div>
            <span className="inline-flex shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-800">
              ANNUAL
            </span>
          </div>
        </div>
      </section>

      {/* Line + donut */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="figma-card p-5 sm:p-6 lg:col-span-8">
          <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Cumulative Revenue Curve</div>
          <div className="mt-1 text-xs text-[var(--figma-text-muted)]">Trailing twelve months (indexed)</div>
          <div className="mt-4 w-full overflow-x-auto">
            <svg viewBox={`0 0 ${linePath.w} ${linePath.h}`} className="h-[220px] w-full min-w-[520px]" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(27, 20, 100, 0.22)" />
                  <stop offset="100%" stopColor="rgba(27, 20, 100, 0)" />
                </linearGradient>
              </defs>
              <path d={linePath.areaD} fill="url(#revFill)" />
              <path d={linePath.d} fill="none" stroke="var(--figma-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-semibold text-[var(--figma-text-muted)]">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        <div className="figma-card flex min-h-0 min-w-0 flex-col overflow-hidden p-5 sm:p-6 lg:col-span-4">
          <div className="shrink-0 text-sm font-semibold text-[var(--figma-text-strong)]">Revenue by Modality</div>
          <div className="mt-4 flex min-h-0 w-full flex-1 flex-col gap-6 sm:min-h-[220px]">
            <div className="flex shrink-0 justify-center">
              <div className="relative aspect-square w-full max-w-[200px]">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'conic-gradient(var(--figma-brand) 0deg 162deg, rgba(27,20,100,0.45) 162deg 252deg, rgba(27,20,100,0.28) 252deg 360deg)',
                  }}
                />
                <div className="absolute inset-[18%] rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(200,197,210,0.25)]" />
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-2.5 text-sm">
              <li className="flex min-w-0 items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--figma-brand)]" />
                  <span className="min-w-0 break-words leading-snug">Yoga &amp; Breathwork</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-[var(--figma-text-strong)]">45%</span>
              </li>
              <li className="flex min-w-0 items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[rgba(27,20,100,0.45)]" />
                  <span className="min-w-0 break-words leading-snug">Meditation</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-[var(--figma-text-strong)]">25%</span>
              </li>
              <li className="flex min-w-0 items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[rgba(27,20,100,0.28)]" />
                  <span className="min-w-0 break-words leading-snug">Reiki</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-[var(--figma-text-strong)]">30%</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Daily volume + ledger — two cards (design reference) */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="figma-card flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--figma-text-strong)]">Daily Revenue Volume</h2>
            <button
              type="button"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)]"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 w-full min-w-0">
            <div
              className="flex w-full items-end gap-0 border-b border-[var(--figma-stroke)]"
              style={{ height: DAILY_CHART_PX }}
            >
              {DAILY_BARS.map((h, i) => {
                const barH = Math.max(4, (h / DAILY_MAX) * DAILY_CHART_PX)
                return (
                  <div key={i} className="flex min-h-0 min-w-0 flex-1 flex-col justify-end">
                    <div
                      className={[
                        'w-full rounded-t-[2px]',
                        i === 3 ? 'bg-[var(--figma-brand)]' : 'bg-[rgba(200,197,210,0.45)]',
                      ].join(' ')}
                      style={{ height: barH }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--figma-text-strong)]">
              <span>Monday</span>
              <span>Sunday</span>
            </div>
          </div>
        </div>

        <div className="figma-card flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--figma-text-strong)]">Daily Performance Ledger</h2>
            <Link
              to="/transactions"
              className="shrink-0 text-xs font-semibold text-[var(--figma-brand)] underline underline-offset-[3px] decoration-[var(--figma-brand)] hover:opacity-90"
            >
              View All
            </Link>
          </div>
          <div className="mt-5 min-w-0 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="pb-4 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">
                    Date
                  </th>
                  <th className="pb-4 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">
                    Sessions
                  </th>
                  <th className="pb-4 pr-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">
                    Net Platform Fees
                  </th>
                  <th className="pb-4 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {LEDGER_PREVIEW.map((r) => (
                  <tr key={r.date}>
                    <td className="py-4 pr-4 align-middle text-sm font-semibold text-[var(--figma-brand)]">{r.date}</td>
                    <td className="py-4 pr-4 align-middle text-sm font-normal text-[var(--figma-text)]">{r.sessions}</td>
                    <td className="py-4 pr-4 align-middle text-sm font-bold text-[var(--figma-text-strong)]">
                      ${r.fees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 align-middle text-right">
                      <span
                        className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', ledgerStatusClass(r.status)].join(
                          ' ',
                        )}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
