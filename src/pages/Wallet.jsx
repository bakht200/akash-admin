import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Building2,
  Clock,
  Lock,
  Shield,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react'

const BALANCE_BARS = [42, 55, 48, 62, 51, 72]
const BALANCE_LABELS = ['OCT 01', 'OCT 08', 'OCT 15', 'OCT 22', 'OCT 29', 'TODAY']
const CHART_H = 112
const BAR_MAX = Math.max(...BALANCE_BARS)

const MOVEMENTS = [
  {
    id: 'm1',
    title: 'Session Payment',
    detailLine: 'Oct 24, 2023 · 2:14 PM',
    subLine: 'Sarah Jenkins',
    sourceIcon: 'wallet',
    sourceMain: 'Stripe Balance',
    sourceSub: 'Client payment',
    flow: 'Inflow',
    status: 'Completed',
    amount: 245.0,
    amountTone: 'gain',
  },
  {
    id: 'm2',
    title: 'Withdrawal',
    detailLine: 'Oct 24, 2023 · 9:02 AM',
    subLine: 'External transfer',
    sourceIcon: 'bank',
    sourceMain: 'Chase Bank ·••• 4821',
    sourceSub: 'Practitioner payout',
    flow: 'Outflow',
    status: 'Processing',
    amount: -12000.0,
    amountTone: 'neutral',
  },
  {
    id: 'm3',
    title: 'Escrow Allocation',
    detailLine: 'Oct 23, 2023 · 4:45 PM',
    subLine: 'Project reserve',
    sourceIcon: 'exchange',
    sourceMain: 'Session cluster #A-204',
    sourceSub: 'Multi-party hold',
    flow: 'Hold',
    status: 'Committed',
    amount: 1450.0,
    amountTone: 'neutral',
  },
  {
    id: 'm4',
    title: 'Refund',
    detailLine: 'Oct 23, 2023 · 11:20 AM',
    subLine: 'Policy adjustment',
    sourceIcon: 'wallet',
    sourceMain: 'Stripe Balance',
    sourceSub: 'Client credit',
    flow: 'Outflow',
    status: 'Completed',
    amount: -89.5,
    amountTone: 'loss',
  },
  {
    id: 'm5',
    title: 'Top-up',
    detailLine: 'Oct 22, 2023 · 8:00 AM',
    subLine: 'Treasury',
    sourceIcon: 'bank',
    sourceMain: 'Operating account',
    sourceSub: 'Liquidity sweep',
    flow: 'Inflow',
    status: 'Completed',
    amount: 50000.0,
    amountTone: 'gain',
  },
]

function flowPill(flow) {
  const u = flow.toUpperCase()
  if (u === 'INFLOW') return 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80'
  if (u === 'OUTFLOW') return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80'
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80'
}

function movementStatusPill(s) {
  const u = s.toUpperCase()
  if (u === 'COMPLETED' || u === 'COMMITTED') return 'bg-emerald-50 text-emerald-800'
  if (u === 'PROCESSING') return 'bg-amber-50 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

function SourceIcon({ kind }) {
  const cls =
    'grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)]'
  if (kind === 'bank') {
    return (
      <div className={cls}>
        <Building2 className="h-4 w-4" />
      </div>
    )
  }
  if (kind === 'exchange') {
    return (
      <div className={cls}>
        <ArrowUpRight className="h-4 w-4" />
      </div>
    )
  }
  return (
    <div className={cls}>
      <WalletIcon className="h-4 w-4" />
    </div>
  )
}

function formatAmount(n, tone) {
  const abs = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const prefix = n >= 0 ? '+' : '-'
  const color =
    tone === 'gain' ? 'text-emerald-700' : tone === 'loss' ? 'text-rose-700' : 'text-[var(--figma-text-strong)]'
  return <span className={`text-sm font-bold tabular-nums ${color}`}>{prefix}${abs}</span>
}

export default function Wallet() {
  const [range, setRange] = useState('1m')

  const barSlice = useMemo(() => {
    if (range === '1m') return BALANCE_BARS
    if (range === '3m') return BALANCE_BARS.map((v) => v * 0.92)
    return BALANCE_BARS.map((v) => v * 1.08)
  }, [range])

  const maxBar = Math.max(...barSlice, 1)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[12px] border border-[rgba(27,20,100,0.35)] bg-[var(--figma-brand)] p-6 text-white shadow-[0_12px_40px_rgba(27,20,100,0.22)] sm:p-7">
          <WalletIcon
            className="pointer-events-none absolute -right-2 bottom-0 h-36 w-36 text-white/10"
            strokeWidth={1}
            aria-hidden
          />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/15">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-white/80">TOTAL PLATFORM BALANCE</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight sm:text-[2rem]">$1,284,592.42</div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-4 text-xs font-medium text-white/85">
              <span>
                CURRENCY: <span className="text-white">USD (Stripe)</span>
              </span>
              <span className="flex items-center gap-2">
                STATUS:{' '}
                <span className="inline-flex items-center gap-1.5 text-white">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Synchronized
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="figma-card flex flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-emerald-800">
              LIQUID
            </span>
          </div>
          <div className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">AVAILABLE FOR PAYOUT</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-[1.75rem]">$842,010.15</div>
          <div className="mt-auto flex items-center gap-2 pt-6 text-sm text-[var(--figma-text-muted)]">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Next automatic payout: Tomorrow</span>
          </div>
        </div>

        <div className="figma-card flex flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-amber-50 text-amber-800">
              <Lock className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-amber-900">
              ESCROW
            </span>
          </div>
          <div className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">RESERVED FUNDS</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-[1.75rem]">$442,582.27</div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--figma-stroke)] pt-4 text-sm">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">ACTIVE SESSIONS</div>
              <div className="mt-1 font-semibold text-[var(--figma-text-strong)]">$310.2k</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">REFUND RESERVE</div>
              <div className="mt-1 font-semibold text-[var(--figma-text-strong)]">$132.3k</div>
            </div>
          </div>
        </div>
      </section>

      {/* Balance trend */}
      <section className="figma-card p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--figma-text-strong)]">Balance Trend</h2>
            <p className="mt-1 text-sm text-[var(--figma-text-muted)]">Daily platform liquidity over the last 30 days</p>
          </div>
          <div className="inline-flex rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] p-1">
            {[
              { id: '1m', label: '1 Month' },
              { id: '3m', label: '3 Months' },
              { id: '1y', label: '1 Year' },
            ].map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setRange(seg.id)}
                className={[
                  'rounded-[8px] px-3 py-1.5 text-xs font-semibold transition',
                  range === seg.id
                    ? 'bg-white text-[var(--figma-text-strong)] shadow-sm ring-1 ring-[var(--figma-stroke)]'
                    : 'text-[var(--figma-text-muted)] hover:text-[var(--figma-text)]',
                ].join(' ')}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div
            className="relative rounded-[8px] border border-[var(--figma-stroke)] bg-white px-2 pt-2"
            style={{
              backgroundImage: `repeating-linear-gradient(
                to bottom,
                transparent,
                transparent calc(${CHART_H / 4}px - 1px),
                rgba(200,197,210,0.35) calc(${CHART_H / 4}px - 1px),
                rgba(200,197,210,0.35) ${CHART_H / 4}px
              )`,
              backgroundSize: `100% ${CHART_H / 4}px`,
              backgroundPosition: '0 0',
            }}
          >
            <div className="flex items-end justify-between gap-1 px-1" style={{ height: CHART_H }}>
              {barSlice.map((h, i) => {
                const isLast = i === barSlice.length - 1
                const barH = Math.max(6, (h / maxBar) * (CHART_H - 8))
                return (
                  <div key={i} className="flex min-h-0 min-w-0 flex-1 flex-col justify-end">
                    <div
                      className={[
                        'w-full rounded-t-[3px]',
                        isLast ? 'bg-[var(--figma-brand)]' : 'bg-[rgba(200,197,210,0.55)]',
                      ].join(' ')}
                      style={{ height: barH }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-3 flex justify-between gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--figma-text-muted)]">
            {BALANCE_LABELS.map((lab) => (
              <span key={lab} className="min-w-0 flex-1 text-center first:text-left last:text-right">
                {lab}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Recent movements */}
      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-sm font-semibold text-[var(--figma-text-strong)]">Recent Wallet Movements</h2>
          <button type="button" className="text-left text-sm font-semibold text-[var(--figma-brand)] underline underline-offset-2 hover:opacity-90 sm:text-right">
            Filter by type
          </button>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {['Transaction Details', 'Source / Destination', 'Type', 'Status', 'Amount'].map((h) => (
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
              {MOVEMENTS.map((m) => (
                <tr key={m.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="font-semibold text-[var(--figma-text-strong)]">{m.title}</div>
                    <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">{m.detailLine}</div>
                    <div className="mt-1 text-sm text-[var(--figma-text)]">{m.subLine}</div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <SourceIcon kind={m.sourceIcon} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{m.sourceMain}</div>
                        <div className="text-xs text-[var(--figma-text-muted)]">{m.sourceSub}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', flowPill(m.flow)].join(' ')}>
                      {m.flow.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', movementStatusPill(m.status)].join(' ')}>
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right sm:px-6">{formatAmount(m.amount, m.amountTone)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[var(--figma-stroke)] bg-white px-4 py-5 text-center sm:px-6">
          <Link to="/transactions" className="text-sm font-semibold text-[var(--figma-brand)] underline underline-offset-2 hover:opacity-90">
            View all wallet history
          </Link>
        </div>
      </section>

      {/* Security banner */}
      <div className="flex flex-col gap-4 rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-[var(--figma-brand)] text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Bank-Grade Security</div>
            <p className="mt-0.5 text-sm text-[var(--figma-text-muted)]">All transactions are encrypted and processed via Stripe Connect.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pl-4">
          <div className="h-9 w-12 rounded-[6px] bg-[rgba(200,197,210,0.45)]" title="" aria-hidden />
          <div className="h-9 w-12 rounded-[6px] bg-[rgba(200,197,210,0.45)]" title="" aria-hidden />
        </div>
      </div>
    </div>
  )
}
