import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SESSION_LIST_ROWS, SESSION_TOTAL } from '../data/sessionData'

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.replace(/^Dr\./, '').trim()[0]?.toUpperCase())
    .filter(Boolean)
    .join('')
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-[10px] font-semibold text-[var(--figma-text-muted)]">
      {initials.slice(0, 2) || '—'}
    </div>
  )
}

function statusPill(status) {
  const u = status.toUpperCase()
  switch (u) {
    case 'UPCOMING':
      return 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80'
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
    case 'DISPUTED':
      return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80'
    case 'COMPLETED':
      return 'bg-teal-50 text-teal-800 ring-1 ring-teal-200/80'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function Sessions() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const perPage = 5
  const totalPages = Math.max(1, Math.ceil(SESSION_TOTAL / perPage))

  const rows = SESSION_LIST_ROWS

  return (
    <div className="space-y-6">
      <section className="figma-card overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex flex-col gap-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[140px]">
              DATE RANGE
              <select className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last 90 Days</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[140px]">
              STATUS
              <select className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
                <option>All Statuses</option>
                <option>Upcoming</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Disputed</option>
                <option>Cancelled</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:min-w-[160px]">
              MODALITY
              <select className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
                <option>All Modalities</option>
                <option>Somatic Therapy</option>
                <option>Acupuncture</option>
                <option>CBT Therapy</option>
                <option>Yoga</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            className="self-start text-sm font-semibold text-[var(--figma-brand)] hover:brightness-95 sm:self-center"
          >
            Clear All Filters
          </button>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {['Session ID', 'Date/Time', 'Client', 'Practitioner', 'Modality', 'Status', 'Fee', 'Total'].map((h) => (
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
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-b border-[var(--figma-stroke)] last:border-b-0 hover:bg-[rgba(244,243,241,0.55)]"
                  tabIndex={0}
                  onClick={() => navigate(`/sessions/${encodeURIComponent(r.id)}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/sessions/${encodeURIComponent(r.id)}`)
                    }
                  }}
                >
                  <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-brand)] sm:px-6">{r.id}</td>
                  <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">{r.dateTime}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.clientName} />
                      <span className="text-sm font-medium text-[var(--figma-text-strong)]">{r.clientName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.practitionerName} />
                      <span className="text-sm font-medium text-[var(--figma-text-strong)]">{r.practitionerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">{r.modality}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <span
                      className={[
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        statusPill(r.status),
                      ].join(' ')}
                    >
                      {r.status === 'Active' ? (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                      ) : null}
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-[var(--figma-text)] sm:px-6">
                    ${r.fee.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-brand)] sm:px-6">
                    ${r.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-medium text-[var(--figma-text-muted)]">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, SESSION_TOTAL)} of {SESSION_TOTAL.toLocaleString()}{' '}
            sessions.
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

      {/* Analytics */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="figma-card p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">VOLUME OVERVIEW</div>
          <div className="mt-4 flex h-40 items-end justify-between gap-2">
            {[28, 40, 36, 88, 24, 52, 44].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end">
                <div
                  className={[
                    'w-full max-w-[44px] rounded-t-[6px]',
                    i === 3 ? 'bg-[var(--figma-brand)]' : 'bg-[var(--figma-input-bg)]',
                  ].join(' ')}
                  style={{ height: `${h}px` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="figma-card p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">STATUS MIX</div>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Completed', pct: 72, tone: 'bg-teal-600' },
              { label: 'Cancelled', pct: 14, tone: 'bg-slate-400' },
              { label: 'Disputed', pct: 4, tone: 'bg-amber-500' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm font-medium text-[var(--figma-text-strong)]">
                  <span>{s.label}</span>
                  <span>{s.pct}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--figma-input-bg)]">
                  <div className={['h-full rounded-full', s.tone].join(' ')} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="text-xs text-[var(--figma-text-muted)]">Other statuses: 10%</div>
          </div>
        </div>
      </section>
    </div>
  )
}
