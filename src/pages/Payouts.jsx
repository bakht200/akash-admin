import { useMemo, useState } from 'react'
import { ArrowDownUp, Building2, ChevronLeft, ChevronRight, Filter, MoreVertical } from 'lucide-react'

const TOTAL_PAYOUTS = 248
const PER_PAGE = 10

const ROWS = [
  {
    id: '#PAY-99281',
    name: 'Dr. James Chen',
    amount: 1450.0,
    status: 'Completed',
    scheduled: 'Oct 24, 2023',
    actual: 'Oct 24, 2023',
    actualVariant: 'date',
  },
  {
    id: '#PAY-99280',
    name: 'Sarah Miller',
    amount: 820.5,
    status: 'Processing',
    scheduled: 'Oct 24, 2023',
    actual: 'Pending…',
    actualVariant: 'muted',
  },
  {
    id: '#PAY-99279',
    name: 'Priya Nair',
    amount: 2100.0,
    status: 'Pending',
    scheduled: 'Oct 23, 2023',
    actual: 'Pending…',
    actualVariant: 'muted',
  },
  {
    id: '#PAY-99278',
    name: 'Marcus Webb',
    amount: 675.25,
    status: 'Completed',
    scheduled: 'Oct 23, 2023',
    actual: 'Oct 23, 2023',
    actualVariant: 'date',
  },
  {
    id: '#PAY-99277',
    name: 'Elena Rossi',
    amount: 1890.0,
    status: 'Failed',
    scheduled: 'Oct 22, 2023',
    actual: 'Rejection',
    actualVariant: 'rejection',
  },
  {
    id: '#PAY-99276',
    name: 'David Okonkwo',
    amount: 432.0,
    status: 'Completed',
    scheduled: 'Oct 22, 2023',
    actual: 'Oct 22, 2023',
    actualVariant: 'date',
  },
  {
    id: '#PAY-99275',
    name: 'Amelia Frost',
    amount: 3105.75,
    status: 'Processing',
    scheduled: 'Oct 21, 2023',
    actual: 'Pending…',
    actualVariant: 'muted',
  },
  {
    id: '#PAY-99274',
    name: 'Noah Kim',
    amount: 540.0,
    status: 'Pending',
    scheduled: 'Oct 21, 2023',
    actual: 'Pending…',
    actualVariant: 'muted',
  },
  {
    id: '#PAY-99273',
    name: 'Rachel Green',
    amount: 1288.0,
    status: 'Completed',
    scheduled: 'Oct 20, 2023',
    actual: 'Oct 20, 2023',
    actualVariant: 'date',
  },
  {
    id: '#PAY-99272',
    name: 'Tomás Alvarez',
    amount: 915.4,
    status: 'Failed',
    scheduled: 'Oct 20, 2023',
    actual: 'Rejection',
    actualVariant: 'rejection',
  },
]

const PENDING_AVATARS = ['SM', 'JC', 'PN']

function Avatar({ name }) {
  const initials = name
    .replace(/Dr\.\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-[10px] font-semibold text-[var(--figma-text-muted)] ring-2 ring-white">
      {initials.slice(0, 2) || '—'}
    </div>
  )
}

function payoutStatusPill(s) {
  const u = s.toUpperCase()
  if (u === 'COMPLETED') return 'bg-emerald-50 text-emerald-800'
  if (u === 'PROCESSING') return 'bg-sky-50 text-sky-800'
  if (u === 'PENDING') return 'bg-amber-50 text-amber-900'
  if (u === 'FAILED') return 'bg-rose-50 text-rose-800'
  return 'bg-slate-100 text-slate-700'
}

export default function Payouts() {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(TOTAL_PAYOUTS / PER_PAGE))

  const rangeLabel = useMemo(() => {
    const start = (page - 1) * PER_PAGE + 1
    const end = Math.min(page * PER_PAGE, TOTAL_PAYOUTS)
    return { start, end }
  }, [page])

  return (
    <div className="space-y-6">
      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="figma-card relative overflow-hidden p-6 sm:p-7">
          <Building2
            className="pointer-events-none absolute -right-4 bottom-0 h-32 w-32 text-[var(--figma-input-bg)] opacity-[0.55] sm:h-40 sm:w-40"
            strokeWidth={1}
            aria-hidden
          />
          <div className="relative">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TOTAL PAYOUTS THIS MONTH</div>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-semibold tracking-tight text-[var(--figma-brand)] sm:text-[2rem]">$142,850.00</span>
              <span className="mb-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">+12.4%</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-[var(--figma-text-muted)]">
              Across 1,248 successful transactions since Oct 1st.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[12px] border border-[rgba(27,20,100,0.35)] bg-gradient-to-br from-[var(--figma-brand)] via-[#2a2468] to-[#12102e] p-6 text-white shadow-[0_12px_40px_rgba(27,20,100,0.25)] sm:p-7">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-white/80">PENDING VOLUME</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2rem]">$32,412.50</div>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              {PENDING_AVATARS.map((label, i) => (
                <div
                  key={label}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#2a2468] bg-white/15 text-[10px] font-semibold text-white"
                  style={{ zIndex: 3 - i }}
                >
                  {label}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-white/90">42 practitioners waiting</p>
          </div>
        </div>
      </section>

      {/* Payout ledger */}
      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-sm font-semibold text-[var(--figma-text-strong)]">Payout Ledger</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text-muted)] hover:bg-[var(--figma-input-bg)]"
              aria-label="Filter"
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text-muted)] hover:bg-[var(--figma-input-bg)]"
              aria-label="Sort"
            >
              <ArrowDownUp className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-[1000px] w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {[
                  'Payout ID',
                  'Practitioner Name',
                  'Amount',
                  'Status',
                  'Scheduled Date',
                  'Actual Date',
                  'Action',
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
                  <td className="px-4 py-4 text-sm text-[var(--figma-text-muted)] sm:px-6">{r.id}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} />
                      <span className="text-sm font-semibold text-[var(--figma-text-strong)]">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-[var(--figma-text-strong)] sm:px-6">
                    ${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span
                      className={['inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold', payoutStatusPill(r.status)].join(' ')}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">{r.scheduled}</td>
                  <td className="px-4 py-4 text-sm sm:px-6">
                    {r.actualVariant === 'rejection' ? (
                      <span className="font-medium text-rose-600">{r.actual}</span>
                    ) : r.actualVariant === 'muted' ? (
                      <span className="text-[var(--figma-text-muted)]">{r.actual}</span>
                    ) : (
                      <span className="text-[var(--figma-text)]">{r.actual}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    {r.status === 'Failed' ? (
                      <button type="button" className="text-sm font-semibold text-[var(--figma-brand)] underline underline-offset-2 hover:opacity-90">
                        Retry
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)] hover:bg-[rgba(244,243,241,0.9)]"
                        aria-label="Row actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-medium text-[var(--figma-text-muted)]">
            Showing {rangeLabel.start}-{rangeLabel.end} of {TOTAL_PAYOUTS} Payouts
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

      <footer className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>© 2023 Akash Network — Practitioner Marketplace Ledger</span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" className="hover:text-[var(--figma-text)]">
            Support Center
          </button>
          <button type="button" className="hover:text-[var(--figma-text)]">
            Security Policy
          </button>
          <button type="button" className="hover:text-[var(--figma-text)]">
            Compliance
          </button>
        </div>
      </footer>
    </div>
  )
}
