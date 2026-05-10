import { useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Upload } from 'lucide-react'

const TOTAL_CASES = 48
const PER_PAGE = 10

const DISPUTE_ROWS = [
  {
    id: '#DSP-10482',
    sessionId: 'SES-92831',
    reasonTitle: 'Chargeback — service not delivered',
    reasonDetail: 'Client claims session was cancelled without refund.',
    status: 'Open',
    initiator: { name: 'Sarah Jenkins', role: 'Client', initials: 'SJ' },
    date: 'Oct 24, 2023',
  },
  {
    id: '#DSP-10481',
    sessionId: 'SES-92802',
    reasonTitle: 'Quality of care dispute',
    reasonDetail: 'Reported unsafe guidance during breathwork segment.',
    status: 'Under Investigation',
    initiator: { name: 'Dr. James Chen', role: 'Practitioner', initials: 'JC' },
    date: 'Oct 24, 2023',
  },
  {
    id: '#DSP-10480',
    sessionId: 'SES-92788',
    reasonTitle: 'Double billing',
    reasonDetail: 'Stripe shows two captures for the same booking.',
    status: 'Open',
    initiator: { name: 'Marcus Webb', role: 'Client', initials: 'MW' },
    date: 'Oct 23, 2023',
  },
  {
    id: '#DSP-10479',
    sessionId: 'SES-92750',
    reasonTitle: 'No-show fee waiver',
    reasonDetail: 'Practitioner requests reversal of late-cancel fee.',
    status: 'Resolved',
    initiator: { name: 'Priya Nair', role: 'Practitioner', initials: 'PN' },
    date: 'Oct 23, 2023',
  },
  {
    id: '#DSP-10478',
    sessionId: 'SES-92712',
    reasonTitle: 'Policy violation',
    reasonDetail: 'Session exceeded advertised modality scope.',
    status: 'Under Investigation',
    initiator: { name: 'Elena Rossi', role: 'Client', initials: 'ER' },
    date: 'Oct 22, 2023',
  },
  {
    id: '#DSP-10477',
    sessionId: 'SES-92690',
    reasonTitle: 'Refund timing',
    reasonDetail: 'Payout still pending after approved refund.',
    status: 'Dismissed',
    initiator: { name: 'David Okonkwo', role: 'Client', initials: 'DO' },
    date: 'Oct 22, 2023',
  },
  {
    id: '#DSP-10476',
    sessionId: 'SES-92655',
    reasonTitle: 'Harassment report',
    reasonDetail: 'Inappropriate messages after session booking.',
    status: 'Open',
    initiator: { name: 'Amelia Frost', role: 'Client', initials: 'AF' },
    date: 'Oct 21, 2023',
  },
  {
    id: '#DSP-10475',
    sessionId: 'SES-92620',
    reasonTitle: 'Escrow release',
    reasonDetail: 'Disagreement on milestone completion for package.',
    status: 'Resolved',
    initiator: { name: 'Noah Kim', role: 'Practitioner', initials: 'NK' },
    date: 'Oct 21, 2023',
  },
]

function disputeStatusPill(s) {
  const u = s.toUpperCase()
  if (u === 'OPEN') return 'bg-rose-50 text-rose-900 ring-1 ring-rose-200/80'
  if (u === 'UNDER INVESTIGATION') return 'bg-sky-50 text-sky-900 ring-1 ring-sky-200/80'
  if (u === 'RESOLVED') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
  if (u === 'DISMISSED') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
  return 'bg-slate-100 text-slate-700'
}

function Avatar({ initials }) {
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-[10px] font-semibold text-[var(--figma-text-muted)] ring-1 ring-[var(--figma-stroke)]">
      {initials}
    </div>
  )
}

export default function Disputes() {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(TOTAL_CASES / PER_PAGE))
  const rangeStart = (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, TOTAL_CASES)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="figma-card p-5 shadow-sm sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TOTAL ACTIVE</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-3xl font-semibold text-[var(--figma-text-strong)]">12</span>
            <span className="mb-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">+2 New</span>
          </div>
        </div>
        <div className="figma-card p-5 shadow-sm sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">UNDER INVESTIGATION</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-3xl font-semibold text-[var(--figma-text-strong)]">05</span>
            <span className="mb-1 text-xs font-medium text-[var(--figma-text-muted)]">AVG 4.2h</span>
          </div>
        </div>
        <div className="figma-card relative overflow-hidden border-l-4 border-l-rose-500 p-5 shadow-sm sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">ESCALATED</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-3xl font-semibold text-rose-700">03</span>
            <span className="mb-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">Urgent</span>
          </div>
        </div>
        <div className="figma-card p-5 shadow-sm sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">RESOLUTION RATE</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-3xl font-semibold text-[var(--figma-text-strong)]">98.2%</span>
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              <TrendingUp className="h-3 w-3" />
              0.4%
            </span>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="figma-card overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[140px] flex-col gap-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">
              STATUS
              <select className="h-11 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
                <option>All Statuses</option>
                <option>Open</option>
                <option>Under Investigation</option>
                <option>Resolved</option>
                <option>Dismissed</option>
              </select>
            </label>
            <label className="flex min-w-[140px] flex-col gap-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">
              INITIATOR
              <select className="h-11 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
                <option>Anyone</option>
                <option>Client</option>
                <option>Practitioner</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <p className="text-sm font-medium text-[var(--figma-text-muted)]">
              Viewing {rangeStart}-{rangeEnd} of {TOTAL_CASES} cases
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white disabled:opacity-40"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
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
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-[1050px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {['Dispute ID', 'Session ID', 'Reason', 'Status', 'Initiator', 'Date', 'Actions'].map((h) => (
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
              {DISPUTE_ROWS.map((r) => (
                <tr key={r.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                  <td className="px-4 py-4 font-mono text-xs text-[var(--figma-text-muted)] sm:px-6">{r.id}</td>
                  <td className="px-4 py-4 font-mono text-xs text-[var(--figma-text)] sm:px-6">{r.sessionId}</td>
                  <td className="max-w-[280px] px-4 py-4 sm:px-6">
                    <div className="font-semibold text-[var(--figma-text-strong)]">{r.reasonTitle}</div>
                    <div className="mt-1 text-xs leading-snug text-[var(--figma-text-muted)]">{r.reasonDetail}</div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={['inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold', disputeStatusPill(r.status)].join(' ')}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar initials={r.initiator.initials} />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[var(--figma-text-strong)]">{r.initiator.name}</div>
                        <div className="text-xs text-[var(--figma-text-muted)]">{r.initiator.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">{r.date}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      className="text-xs font-semibold text-[var(--figma-brand)] underline underline-offset-2 hover:opacity-90"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-stretch gap-3 border-t border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)] disabled:opacity-40"
          >
            Previous page
          </button>
          <div className="flex flex-wrap items-center justify-center gap-1">
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
          </div>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--figma-text-muted)] disabled:opacity-40 sm:text-right"
          >
            Next page
          </button>
        </div>
      </section>

      {/* Bottom cards */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-brand)]">
              <Upload className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[var(--figma-text-strong)]">Bulk Dispute Settlement</h3>
              <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
                Upload a CSV of approved settlements to apply credits and close cases in batch.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white shadow-sm hover:brightness-[0.98]"
                >
                  Upload settlement
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[var(--figma-brand)] bg-white px-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-brand)] hover:bg-[rgba(27,20,100,0.04)]"
                >
                  Download template
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[12px] border border-[rgba(27,20,100,0.35)] bg-[var(--figma-brand)] p-6 text-white shadow-md sm:p-7">
          <div className="relative">
            <h3 className="text-sm font-semibold">Compliance Review</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              Updated dispute and refund policies are in effect. Ensure your team acknowledges the new SLA windows.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4 hover:opacity-90"
            >
              Read updated policies
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
