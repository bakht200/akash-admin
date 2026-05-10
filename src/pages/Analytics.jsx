import { useMemo, useState } from 'react'
import { Filter, TrendingUp } from 'lucide-react'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MODALITY_ROWS = ['MEDITATION', 'BREATHWORK', 'SOMATIC', 'AYURVEDA', 'YOGA', 'THERAPY']

/** Deterministic pseudo-random 0.15–1 for heatmap cells */
function cellIntensity(row, col) {
  const n = Math.sin(row * 12 + col * 7) * 43758.5453
  return 0.15 + (n - Math.floor(n)) * 0.85
}

const FUNNEL = [
  { label: 'ONBOARDING', value: 12482, width: 100, pct: null },
  { label: 'BOOKING INTENT', value: 8921, width: 71.5, pct: '71.5%' },
  { label: 'PAYMENT INITIATED', value: 4102, width: 46.0, pct: '46.0%' },
  { label: 'COMPLETED SESSIONS', value: 3894, width: 31.2, pct: '95.1%' },
]

const LEADERBOARD = [
  { rank: '01', name: 'Dr. Sarah Jenkins', role: 'Breathwork Specialist', cos: '9.8', sessions: '412', spark: [40, 55, 48, 62, 58, 72, 68, 75] },
  { rank: '02', name: 'James Chen', role: 'Somatic therapy', cos: '9.6', sessions: '388', spark: [35, 42, 50, 48, 55, 60, 58, 65] },
  { rank: '03', name: 'Priya Nair', role: 'Energy work', cos: '9.5', sessions: '355', spark: [50, 45, 52, 48, 50, 55, 62, 60] },
]

function Sparkline({ values }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex h-8 max-w-[120px] items-end gap-px">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-1.5 flex-1 rounded-t-[1px] bg-[var(--figma-brand)]/70"
          style={{ height: `${(v / max) * 100}%`, minHeight: '3px' }}
        />
      ))}
    </div>
  )
}

export default function Analytics() {
  const [demandMode, setDemandMode] = useState(true)

  const heatmap = useMemo(() => {
    return MODALITY_ROWS.map((_, r) => MONTHS.map((_, c) => cellIntensity(r, c + (demandMode ? 0 : 3))))
  }, [demandMode])

  return (
    <div className="space-y-6">
      {/* Row 1: heatmap + funnel */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="figma-card overflow-hidden p-5 shadow-sm sm:p-6 xl:col-span-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--figma-text-strong)]">Modality Demand vs Supply</h2>
              <p className="mt-0.5 text-xs text-[var(--figma-text-muted)]">Regional saturation and gap analysis.</p>
            </div>
            <div className="inline-flex rounded-full border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] p-0.5">
              <button
                type="button"
                onClick={() => setDemandMode(true)}
                className={[
                  'rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em]',
                  demandMode ? 'bg-white text-[var(--figma-text-strong)] shadow-sm' : 'text-[var(--figma-text-muted)]',
                ].join(' ')}
              >
                DEMAND
              </button>
              <button
                type="button"
                onClick={() => setDemandMode(false)}
                className={[
                  'rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em]',
                  !demandMode ? 'bg-white text-[var(--figma-text-strong)] shadow-sm' : 'text-[var(--figma-text-muted)]',
                ].join(' ')}
              >
                SUPPLY
              </button>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="mb-2 grid grid-cols-[100px_repeat(12,minmax(0,1fr))] gap-1 text-[9px] font-semibold tracking-wide text-[var(--figma-text-muted)]">
                <div />
                {MONTHS.map((m) => (
                  <div key={m} className="text-center">
                    {m}
                  </div>
                ))}
              </div>
              {MODALITY_ROWS.map((row, ri) => (
                <div key={row} className="mb-1 grid grid-cols-[100px_repeat(12,minmax(0,1fr))] gap-1">
                  <div className="flex items-center pr-2 text-[9px] font-semibold tracking-wide text-[var(--figma-text-strong)]">{row}</div>
                  {heatmap[ri].map((intensity, ci) => (
                    <div
                      key={ci}
                      className="aspect-square min-h-[22px] rounded-[3px] bg-[var(--figma-brand)]"
                      style={{ opacity: intensity }}
                      title={`${row} ${MONTHS[ci]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-[12px] border border-[rgba(27,20,100,0.35)] bg-[var(--figma-brand)] p-6 text-white shadow-md sm:p-7 xl:col-span-5">
          <h2 className="text-sm font-semibold">Matching Funnel</h2>
          <p className="mt-1 text-xs text-white/75">User journey conversion efficiency.</p>
          <div className="mt-6 flex flex-1 flex-col items-center gap-3">
            {FUNNEL.map((step, i) => (
              <div key={step.label} className="w-full max-w-[320px]">
                <div
                  className="mx-auto rounded-[6px] bg-white/20 py-3 text-center transition-all"
                  style={{ width: `${step.width}%` }}
                >
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/85">{step.label}</div>
                  <div className="mt-1 text-lg font-semibold tabular-nums">{step.value.toLocaleString()}</div>
                  {step.pct ? <div className="mt-0.5 text-[11px] text-white/70">{step.pct} conversion</div> : null}
                </div>
                {i < FUNNEL.length - 1 ? <div className="mx-auto h-2 w-px bg-white/25" /> : null}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 border-t border-white/20 pt-4 text-sm text-white/90">
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-300" />
            <span>+14.2% efficiency vs last quarter</span>
          </div>
        </div>
      </section>

      {/* Sankey-style card */}
      <section className="figma-card overflow-hidden p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--figma-text-strong)]">Modality Migration Pathways</h2>
            <p className="mt-0.5 text-xs text-[var(--figma-text-muted)]">User flow between therapy types (Sankey Analysis).</p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[var(--figma-stroke)] bg-white px-3 text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)]"
          >
            <Filter className="h-3.5 w-3.5" />
            FILTER MODALITIES
          </button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <svg viewBox="0 0 640 200" className="h-[200px] w-full min-w-[560px]" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="flowA" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(180, 174, 220, 0.9)" />
                <stop offset="100%" stopColor="rgba(27, 20, 100, 0.95)" />
              </linearGradient>
            </defs>
            <rect x="8" y="20" width="128" height="36" rx="6" fill="rgba(27,20,100,0.08)" stroke="rgba(27,20,100,0.2)" />
            <text x="72" y="42" textAnchor="middle" fill="#1b1464" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
              MEDITATION
            </text>
            <rect x="8" y="82" width="128" height="36" rx="6" fill="rgba(27,20,100,0.08)" stroke="rgba(27,20,100,0.2)" />
            <text x="72" y="104" textAnchor="middle" fill="#1b1464" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
              CBT
            </text>
            <rect x="8" y="144" width="128" height="36" rx="6" fill="rgba(27,20,100,0.08)" stroke="rgba(27,20,100,0.2)" />
            <text x="72" y="166" textAnchor="middle" fill="#1b1464" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
              YOGA
            </text>
            <rect x="500" y="32" width="132" height="52" rx="6" fill="#1b1464" />
            <text x="566" y="58" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">
              INTEGRATED
            </text>
            <text x="566" y="72" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">
              SOMATICS
            </text>
            <rect x="500" y="108" width="132" height="52" rx="6" fill="rgba(27,20,100,0.65)" />
            <text x="566" y="142" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="system-ui, sans-serif">
              ENERGY WORK
            </text>
            <path
              d="M136 38 C280 38 360 48 500 56"
              fill="none"
              stroke="url(#flowA)"
              strokeWidth="16"
              opacity="0.55"
            />
            <path
              d="M136 100 C300 100 380 78 500 56"
              fill="none"
              stroke="url(#flowA)"
              strokeWidth="14"
              opacity="0.45"
            />
            <path
              d="M136 162 C290 150 400 132 500 132"
              fill="none"
              stroke="url(#flowA)"
              strokeWidth="18"
              opacity="0.5"
            />
          </svg>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-[11px] font-medium text-[var(--figma-text-muted)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[rgba(180,174,220,0.95)]" />
              Initial modality
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--figma-brand)]" />
              High adoption pathway
            </span>
          </div>
        </div>
      </section>

      {/* Leaderboard + side metrics */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="figma-card p-5 shadow-sm sm:p-6 lg:col-span-7">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--figma-text-strong)]">Practitioner Outcome Leaderboard</h2>
              <p className="mt-1 text-xs text-[var(--figma-text-muted)]">Top performers by clinical outcome scoring (COS).</p>
            </div>
            <button
              type="button"
              className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--figma-brand)] underline underline-offset-2 hover:opacity-90"
            >
              View full rank
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {LEADERBOARD.map((row) => (
              <div
                key={row.rank}
                className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-7 shrink-0 text-sm font-bold text-[var(--figma-text-muted)]">{row.rank}</span>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-xs font-semibold text-[var(--figma-text-muted)]">
                    {row.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[var(--figma-text-strong)]">{row.name}</div>
                    <div className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--figma-text-muted)]">
                      {row.role}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">COS score</div>
                    <div className="text-lg font-semibold tabular-nums text-[var(--figma-text-strong)]">{row.cos}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">Sessions</div>
                    <div className="text-lg font-semibold tabular-nums text-[var(--figma-text-strong)]">{row.sessions}</div>
                  </div>
                  <Sparkline values={row.spark} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="figma-card p-5 shadow-sm sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">REGIONAL HEALTH</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-semibold text-[var(--figma-brand)]">88</span>
              <span className="text-lg font-semibold text-[var(--figma-text-strong)]">Excellent</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--figma-input-bg)]">
              <div className="h-full w-[88%] rounded-full bg-emerald-500" />
            </div>
            <p className="mt-3 text-sm text-[var(--figma-text-muted)]">New York &amp; London lead in session completion rates.</p>
          </div>
          <div className="figma-card p-5 shadow-sm sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">RISK INDEX</div>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-semibold text-amber-700">12%</span>
              <span className="text-lg font-semibold text-[var(--figma-text-strong)]">Moderate</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--figma-input-bg)]">
              <div className="h-full w-[12%] rounded-full bg-amber-500" />
            </div>
            <p className="mt-3 text-sm text-[var(--figma-text-muted)]">Practitioner churn in Energy Work modality is rising.</p>
          </div>
          <div className="rounded-[12px] border border-sky-200/80 bg-sky-50/80 p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-sky-900/80">AI RECOMMENDATION</div>
            <p className="mt-3 text-sm leading-relaxed text-sky-950/90">
              Increase supply for &apos;Breathwork&apos; in the Pacific region; waitlists are outpacing certified practitioners by 18%.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-[8px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white shadow-sm hover:brightness-[1.05]"
            >
              ACTION PLAN
            </button>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>Akash Intelligence Ledger — v2.4.0</span>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>System nominal · Updated 2m ago</span>
        </div>
      </footer>
    </div>
  )
}
