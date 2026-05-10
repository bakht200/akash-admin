import { useState } from 'react'
import { Building2, ChevronLeft, ChevronRight, Eye, RefreshCw, Zap } from 'lucide-react'

const TOTAL_TX = 240

const ROWS = [
  {
    id: 'TXN-92831-1',
    stripeId: 'pi_3Oa2bK8xK9...',
    entityName: 'Sarah Miller',
    entityRole: 'Client',
    type: 'Session Payment',
    date: 'Oct 24, 2023',
    amount: 165.0,
    status: 'Success',
  },
  {
    id: 'TXN-92831-2',
    stripeId: 'po_1LmN2...',
    entityName: 'Dr. James Chen',
    entityRole: 'Practitioner',
    type: 'Payout',
    date: 'Oct 24, 2023',
    amount: 1240.5,
    status: 'In Progress',
  },
  {
    id: 'TXN-92831-3',
    stripeId: 're_3N9...',
    entityName: 'Sarah Miller',
    entityRole: 'Client',
    type: 'Refund',
    date: 'Oct 23, 2023',
    amount: -45.0,
    status: 'Failed',
  },
  {
    id: 'TXN-92831-4',
    stripeId: 'pi_3Oa2cM1...',
    entityName: 'Priya Nair',
    entityRole: 'Client',
    type: 'Session Payment',
    date: 'Oct 23, 2023',
    amount: 210.0,
    status: 'Pending',
  },
]

function Avatar({ name }) {
  const initials = name
    .replace(/Dr\.\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-[10px] font-semibold text-[var(--figma-text-muted)]">
      {initials.slice(0, 2) || '—'}
    </div>
  )
}

function typePill(t) {
  const u = t.toUpperCase()
  if (u.includes('SESSION')) return 'bg-[rgba(27,20,100,0.12)] text-[var(--figma-brand)] ring-1 ring-[rgba(27,20,100,0.2)]'
  if (u.includes('PAYOUT')) return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
  if (u.includes('REFUND')) return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80'
  return 'bg-slate-100 text-slate-700'
}

function statusPill(s) {
  const u = s.toUpperCase()
  if (u === 'SUCCESS') return 'bg-emerald-50 text-emerald-800'
  if (u === 'IN PROGRESS') return 'bg-sky-50 text-sky-800'
  if (u === 'FAILED') return 'bg-rose-50 text-rose-800'
  if (u === 'PENDING') return 'bg-amber-50 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

export default function Transactions() {
  const [page, setPage] = useState(1)
  const perPage = 4
  const totalPages = Math.max(1, Math.ceil(TOTAL_TX / perPage))

  return (
    <div className="space-y-6">
      <section className="figma-card overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">
            STRIPE ID
            <input
              placeholder="Search stripe id…"
              className="h-11 w-full rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-4 text-sm font-medium text-[var(--figma-text)] placeholder:text-[var(--figma-text-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
            />
          </div>
          <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[160px]">
            STATUS
            <select className="h-11 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
              <option>All Statuses</option>
              <option>Success</option>
              <option>In Progress</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[220px]">
            DATE RANGE
            <div className="flex h-11 items-center rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm text-[var(--figma-text-muted)]">
              Start Date — End Date
            </div>
          </label>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {[
                  'Transaction ID',
                  'Stripe ID',
                  'Entity involved',
                  'Type',
                  'Date',
                  'Amount',
                  'Status',
                  'Actions',
                ].map((h) => (
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
              {ROWS.map((r) => (
                <tr key={r.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                  <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">{r.id}</td>
                  <td className="px-4 py-4 font-mono text-xs text-[var(--figma-text)] sm:px-6">{r.stripeId}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.entityName} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[var(--figma-text-strong)]">{r.entityName}</div>
                        <div className="truncate text-xs text-[var(--figma-text-muted)]">{r.entityRole}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', typePill(r.type)].join(' ')}>
                      {r.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">{r.date}</td>
                  <td className="px-4 py-4 text-sm font-bold text-[var(--figma-text-strong)] sm:px-6">
                    {r.amount < 0 ? '-' : ''}${Math.abs(r.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', statusPill(r.status)].join(' ')}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)] hover:bg-[rgba(244,243,241,0.9)]"
                      aria-label="View transaction"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-medium text-[var(--figma-text-muted)]">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, TOTAL_TX)} of {TOTAL_TX} transactions
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white disabled:opacity-40"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={[
                  'flex h-9 min-w-[36px] items-center justify-center rounded-[8px] px-2 text-sm font-semibold',
                  page === n ? 'bg-[var(--figma-brand)] text-white' : 'text-[var(--figma-text)] hover:bg-[var(--figma-input-bg)]',
                ].join(' ')}
              >
                {n}
              </button>
            ))}
            <span className="px-1 text-sm text-[var(--figma-text-muted)]">…</span>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className={[
                'flex h-9 min-w-[36px] items-center justify-center rounded-[8px] px-2 text-sm font-semibold',
                page === totalPages ? 'bg-[var(--figma-brand)] text-white' : 'text-[var(--figma-text)] hover:bg-[var(--figma-input-bg)]',
              ].join(' ')}
            >
              {totalPages}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white disabled:opacity-40"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="figma-card flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-emerald-50 text-emerald-700">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">STRIPE VOLUME (30D)</div>
            <div className="mt-1 text-xl font-semibold text-[var(--figma-text-strong)]">$14,290.45</div>
          </div>
        </div>
        <div className="figma-card flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-[rgba(27,20,100,0.1)] text-[var(--figma-brand)]">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">PENDING SETTLEMENTS</div>
            <div className="mt-1 text-xl font-semibold text-[var(--figma-text-strong)]">$2,840.10</div>
          </div>
        </div>
        <div className="figma-card flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-rose-50 text-rose-600">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">FAILED RATE</div>
            <div className="mt-1 text-xl font-semibold text-[var(--figma-text-strong)]">0.12%</div>
          </div>
        </div>
      </section>

      {/* System status (in-page reference to mock) */}
      <div className="figma-card flex items-center gap-4 p-5">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <div>
          <div className="text-sm font-semibold text-[var(--figma-text-strong)]">System Status</div>
          <div className="text-sm text-[var(--figma-text-muted)]">All services operational</div>
        </div>
      </div>
    </div>
  )
}
