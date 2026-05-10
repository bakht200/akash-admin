import {
  Activity,
  ArrowRight,
  Ban,
  BarChart3,
  Brain,
  Leaf,
  Music,
  Pencil,
  Sparkles,
  Wind,
} from 'lucide-react'

const MODALITIES = [
  {
    key: 'yoga',
    name: 'Yoga',
    description: 'Movement, breath, and alignment practices spanning vinyasa, restorative, and therapeutic formats.',
    practitioners: 128,
    demandPct: 94,
    demandLabel: 'HIGH',
    demandTone: 'high',
    icon: Activity,
  },
  {
    key: 'reiki',
    name: 'Reiki',
    description: 'Hands-on and distance energy balancing aligned with traditional Usui and integrative frameworks.',
    practitioners: 42,
    demandPct: 68,
    demandLabel: 'MODERATE',
    demandTone: 'moderate',
    icon: Sparkles,
  },
  {
    key: 'meditation',
    name: 'Meditation',
    description: 'Guided stillness, mindfulness, and concentration protocols for stress regulation and focus.',
    practitioners: 215,
    demandPct: 42,
    demandLabel: 'LOW',
    demandTone: 'low',
    icon: Brain,
  },
  {
    key: 'sound',
    name: 'Sound Healing',
    description: 'Vibrational therapy using bowls, tuning forks, and voice to support nervous system regulation.',
    practitioners: 56,
    demandPct: 81,
    demandLabel: 'EMERGING',
    demandTone: 'emerging',
    icon: Music,
  },
  {
    key: 'ayurveda',
    name: 'Ayurveda',
    description: 'Constitution-based lifestyle, nutrition, and seasonal routines rooted in classical Ayurvedic texts.',
    practitioners: 73,
    demandPct: 55,
    demandLabel: 'STEADY',
    demandTone: 'steady',
    icon: Leaf,
  },
  {
    key: 'breathwork',
    name: 'Breathwork',
    description: 'Conscious breathing patterns for performance, trauma release, and autonomic balance.',
    practitioners: 91,
    demandPct: 89,
    demandLabel: 'TRENDING',
    demandTone: 'trending',
    icon: Wind,
  },
]

function demandPillClass(tone) {
  if (tone === 'high' || tone === 'emerging' || tone === 'trending') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
  if (tone === 'moderate' || tone === 'steady') return 'bg-sky-50 text-sky-900 ring-1 ring-sky-200/80'
  return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
}

const MATRIX = [
  { label: 'Physical Well-being', pct: 74 },
  { label: 'Energy Work', pct: 28 },
  { label: 'Mental Performance', pct: 91 },
]

export default function Modalities() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--figma-text-muted)]">
          Directory <span className="px-1 text-[var(--figma-stroke)]">›</span> Modalities
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--figma-text-muted)]">
          Govern the core disciplines offered within the marketplace. Monitor demand cycles and practitioner density per modality.
        </p>
      </div>

      {/* Modality cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODALITIES.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.key} className="figma-card flex flex-col p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-[var(--figma-input-bg)] text-[var(--figma-brand)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-[8px] border border-transparent text-[var(--figma-text-muted)] hover:border-[var(--figma-stroke)] hover:bg-[var(--figma-input-bg)]"
                    aria-label={`Edit ${m.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-[8px] border border-transparent text-[var(--figma-text-muted)] hover:border-[var(--figma-stroke)] hover:bg-[var(--figma-input-bg)]"
                    aria-label={`Disable ${m.name}`}
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[var(--figma-text-strong)]">{m.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--figma-text-muted)]">{m.description}</p>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--figma-stroke)] pt-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">Practitioners</div>
                  <div className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--figma-text-strong)]">{m.practitioners}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">Market demand</div>
                  <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
                    <span className="text-sm font-semibold tabular-nums text-[var(--figma-text-strong)]">{m.demandPct}%</span>
                    <span
                      className={['inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide', demandPillClass(m.demandTone)].join(
                        ' ',
                      )}
                    >
                      {m.demandLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* Bottom grid */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[12px] border border-[rgba(27,20,100,0.35)] bg-[var(--figma-brand)] p-6 text-white shadow-md sm:p-7">
            <BarChart3 className="pointer-events-none absolute -right-2 bottom-0 h-28 w-28 text-white/10" strokeWidth={1} aria-hidden />
            <div className="relative">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-white/75">GLOBAL DEMAND FORECAST</div>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                Predictive analysis suggests a 14% increase in energy-based modalities for Q3.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:opacity-90"
              >
                View full report
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">RECENT ACTIVITY</div>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3 border-l-4 border-amber-700/60 pl-4">
                <p className="text-sm text-[var(--figma-text)]">
                  <span className="font-semibold text-[var(--figma-text-strong)]">Sound Healing</span> updated by Admin Smith ·{' '}
                  <span className="text-[var(--figma-text-muted)]">2h ago</span>
                </p>
              </li>
              <li className="flex gap-3 border-l-4 border-[var(--figma-brand)] pl-4">
                <p className="text-sm text-[var(--figma-text)]">
                  <span className="font-semibold text-[var(--figma-text-strong)]">New modality proposed:</span> Somatic Experiencing ·{' '}
                  <span className="text-[var(--figma-text-muted)]">5h ago</span>
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="figma-card p-6 shadow-sm sm:p-7">
          <h3 className="text-sm font-semibold text-[var(--figma-text-strong)]">Modality Performance Matrix</h3>
          <p className="mt-1 text-xs text-[var(--figma-text-muted)]">Capacity utilization across wellness pillars (rolling 30 days).</p>
          <div className="mt-6 space-y-5">
            {MATRIX.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-[var(--figma-text-strong)]">{row.label}</span>
                  <span className="tabular-nums text-[var(--figma-text-muted)]">{row.pct}% Capacity</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--figma-input-bg)]">
                  <div
                    className="h-full rounded-full bg-[var(--figma-brand)] transition-[width]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--figma-stroke)] pt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">
            <span>
              14 <span className="font-normal text-[var(--figma-text)]">total categories</span>
            </span>
            <span>
              892 <span className="font-normal text-[var(--figma-text)]">total practitioners</span>
            </span>
            <span>
              3.2k <span className="font-normal text-[var(--figma-text)]">monthly sessions</span>
            </span>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>© 2024 Akash Marketplace Systems</span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" className="hover:text-[var(--figma-text)]">
            Documentation
          </button>
          <button type="button" className="hover:text-[var(--figma-text)]">
            Compliance
          </button>
          <button type="button" className="hover:text-[var(--figma-text)]">
            API Access
          </button>
        </div>
      </footer>
    </div>
  )
}
