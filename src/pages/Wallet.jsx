import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Building2, TrendingUp, Wallet as WalletIcon } from 'lucide-react'
import { formatAdminDateTime, formatMoney } from '../lib/display'

const BALANCE_AS_OF = new Date('2023-10-24T14:32:00Z')

const MOVEMENTS = [
  {
    id: 'm1',
    title: 'Charge',
    detailLine: 'Oct 24, 2023 · 2:14 PM',
    subLine: 'Sarah Jenkins',
    sourceMain: 'Stripe Balance',
    sourceSub: 'Client payment',
    type: 'charge',
    status: 'Completed',
    amount: 245.0,
  },
  {
    id: 'm2',
    title: 'Healer payout',
    detailLine: 'Oct 24, 2023 · 9:02 AM',
    subLine: 'Practitioner withdrawal',
    sourceMain: 'Stripe payout',
    sourceSub: 'Transfer',
    type: 'transfer',
    status: 'Processing',
    amount: -12000.0,
  },
  {
    id: 'm4',
    title: 'Refund',
    detailLine: 'Oct 23, 2023 · 11:20 AM',
    subLine: 'Client credit',
    sourceMain: 'Stripe Balance',
    sourceSub: 'Refund',
    type: 'refund',
    status: 'Completed',
    amount: -89.5,
  },
  {
    id: 'm5',
    title: 'Company sweep',
    detailLine: 'Oct 22, 2023 · 8:00 AM',
    subLine: 'Platform sweep',
    sourceMain: 'Stripe payout',
    sourceSub: 'Company sweep',
    type: 'payout',
    status: 'Completed',
    amount: -50000.0,
  },
]

function movementStatusPill(s) {
  const u = s.toUpperCase()
  if (u === 'COMPLETED') return 'bg-emerald-50 text-emerald-800'
  if (u === 'PROCESSING') return 'bg-amber-50 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

function formatAmount(n) {
  const prefix = n >= 0 ? '+' : ''
  const color = n >= 0 ? 'text-emerald-700' : 'text-rose-700'
  return <span className={`text-sm font-bold tabular-nums ${color}`}>{prefix}{formatMoney(n)}</span>
}

export default function Wallet() {
  const [typeFilter, setTypeFilter] = useState('all')
  const asOfLabel = useMemo(() => formatAdminDateTime(BALANCE_AS_OF), [])

  const filteredMovements = useMemo(() => {
    if (typeFilter === 'all') return MOVEMENTS
    return MOVEMENTS.filter((m) => m.type === typeFilter)
  }, [typeFilter])

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[12px] border border-[rgba(27,20,100,0.35)] bg-[var(--figma-brand)] p-6 text-white shadow-[0_12px_40px_rgba(27,20,100,0.22)] sm:p-7">
          <WalletIcon className="pointer-events-none absolute -right-2 bottom-0 h-36 w-36 text-white/10" strokeWidth={1} aria-hidden />
          <div className="relative">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-white/80">AVAILABLE BALANCE</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight sm:text-[2rem]">{formatMoney(842010.15)}</div>
            <div className="mt-4 text-xs text-white/75">As of {asOfLabel}</div>
          </div>
        </div>

        <div className="figma-card flex flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-amber-50 text-amber-800">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">PENDING</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-[1.75rem]">{formatMoney(442582.27)}</div>
          <div className="mt-auto pt-6 text-xs text-[var(--figma-text-muted)]">As of {asOfLabel}</div>
        </div>

        <div className="figma-card flex flex-col p-6 sm:p-7">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[var(--figma-input-bg)] text-[var(--figma-brand)]">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">RESERVED (HEALER LIABILITY)</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-[1.75rem]">{formatMoney(310200)}</div>
          <div className="mt-6 text-sm text-[var(--figma-text-muted)]">Sum of healer pending balances</div>
        </div>
      </section>

      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-sm font-semibold text-[var(--figma-text-strong)]">Recent Wallet Movements</h2>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)]"
          >
            <option value="all">All types</option>
            <option value="charge">Charge / payment</option>
            <option value="refund">Refund</option>
            <option value="transfer">Healer payout</option>
            <option value="payout">Company sweep</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {['Transaction Details', 'Source', 'Type', 'Status', 'Amount'].map((h) => (
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
              {filteredMovements.map((m) => (
                <tr key={m.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="font-semibold text-[var(--figma-text-strong)]">{m.title}</div>
                    <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">{m.detailLine}</div>
                    <div className="mt-1 text-sm text-[var(--figma-text)]">{m.subLine}</div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{m.sourceMain}</div>
                    <div className="text-xs text-[var(--figma-text-muted)]">{m.sourceSub}</div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {m.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', movementStatusPill(m.status)].join(' ')}>
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right sm:px-6">{formatAmount(m.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[var(--figma-stroke)] bg-white px-4 py-5 text-center sm:px-6">
          <Link to="/transactions" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--figma-brand)] hover:opacity-90">
            View all wallet history
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
