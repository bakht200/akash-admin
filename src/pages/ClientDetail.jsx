import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calendar,
  CircleSlash,
  Download,
  Hash,
  Heart,
  Mail,
  Pencil,
  Power,
  SlidersHorizontal,
  TrendingUp,
  X,
} from 'lucide-react'
import { getClientRecordOrFallback } from '../data/clientData'

function Avatar({ name, className = 'h-16 w-16 text-lg' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div
      className={[
        'grid shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] font-semibold text-[var(--figma-text-muted)] ring-2 ring-white',
        className,
      ].join(' ')}
    >
      {initials || '—'}
    </div>
  )
}

function sessionStatusClass(s) {
  switch (s) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700'
    case 'In Progress':
      return 'bg-sky-50 text-sky-700'
    case 'Pending':
      return 'bg-amber-50 text-amber-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function ClientDetail() {
  const { id } = useParams()
  const c = useMemo(() => getClientRecordOrFallback(id), [id])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--figma-text-muted)]">
            <Link to="/clients" className="hover:text-[var(--figma-text)]">
              Clients
            </Link>{' '}
            <span className="text-[var(--figma-text-muted)]">›</span> Client Profile
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar name={c.name} />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{c.name}</h1>
              <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--figma-text-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="text-[var(--figma-text)]">{c.email}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="font-medium text-[var(--figma-text-strong)]">{c.id}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Joined: {c.joined}</span>
                </span>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-[var(--figma-text-muted)]">Phone: </span>
                <span className="font-medium text-[var(--figma-text)]">{c.phone}</span>
              </div>
              <div className="mt-1 text-sm">
                <span className="text-[var(--figma-text-muted)]">Last active: </span>
                <span className="text-[var(--figma-text)]">{c.lastActive}</span>
              </div>
              <div className="mt-2">
                <span
                  className={[
                    'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                    c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                  ].join(' ')}
                >
                  {c.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#E3E2E0] px-4 text-[11px] font-semibold tracking-[0.12em] text-[#1A1C1B] hover:brightness-[0.98]"
          >
            <Pencil className="h-4 w-4" />
            EDIT INFO
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-rose-200 bg-white px-4 text-[11px] font-semibold tracking-[0.12em] text-rose-700 hover:bg-rose-50"
          >
            <CircleSlash className="h-4 w-4" />
            SUSPEND
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.12em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:brightness-[0.98]"
          >
            <Power className="h-4 w-4" />
            DEACTIVATE
          </button>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="figma-card p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">LIFETIME VALUE</div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold text-[var(--figma-brand)]">
                ${c.lifetimeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {c.topPercentile ? (
                <div className="mt-2 inline-flex items-center gap-1 rounded-[8px] bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                  <TrendingUp className="h-3.5 w-3.5" />
                  TOP 5% CLIENT
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="figma-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TOTAL SESSIONS</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--figma-brand)]">{c.sessions}</div>
            </div>
            <Calendar className="h-8 w-8 text-[var(--figma-text-muted)]/40" />
          </div>
        </div>
        <div className="figma-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">CANCELLATIONS</div>
              <div className="mt-2 text-2xl font-semibold text-rose-600">{c.cancellations}</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-rose-50 text-rose-500">
              <X className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Session history */}
        <div className="lg:col-span-8">
          <div className="figma-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--figma-stroke)] bg-white px-5 py-4 sm:px-6">
              <div className="text-base font-semibold text-[var(--figma-text-strong)]">Session History</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text-muted)] hover:bg-[var(--figma-input-bg)]"
                  aria-label="Filter sessions"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text-muted)] hover:bg-[var(--figma-input-bg)]"
                  aria-label="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="min-w-[720px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                    {['Date & time', 'Practitioner', 'Modality', 'Status', 'Amount'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:px-6"
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.sessionHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--figma-text-muted)] sm:px-6">
                        No sessions yet.
                      </td>
                    </tr>
                  ) : (
                    c.sessionHistory.map((s, idx) => (
                      <tr key={`${s.date}-${idx}`} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                        <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">{s.date}</td>
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <Avatar name={s.practitioner} className="h-8 w-8 text-[10px]" />
                            <span className="text-sm font-semibold text-[var(--figma-text-strong)]">{s.practitioner}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">{s.modality}</td>
                        <td className="px-5 py-4 sm:px-6">
                          <span
                            className={[
                              'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                              sessionStatusClass(s.status),
                            ].join(' ')}
                          >
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[var(--figma-brand)] sm:px-6">
                          ${s.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          <div className="figma-card p-5 sm:p-6">
            <div className="text-base font-semibold text-[var(--figma-text-strong)]">Favorite Practitioners</div>
            <ul className="mt-4 space-y-4">
              {c.favorites.length === 0 ? (
                <li className="text-sm text-[var(--figma-text-muted)]">No favorites yet.</li>
              ) : (
                c.favorites.map((f) => (
                  <li key={f.name} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{f.name}</div>
                      <div className="text-xs text-[var(--figma-text-muted)]">{f.specialty}</div>
                    </div>
                    <Heart className="h-4 w-4 shrink-0 fill-rose-100 text-rose-500" />
                  </li>
                ))
              )}
            </ul>
            <button
              type="button"
              className="mt-4 w-full rounded-[10px] border border-[var(--figma-stroke)] bg-white py-2.5 text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)]"
            >
              View All Favorites
            </button>
          </div>

          <div className="figma-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="text-base font-semibold text-[var(--figma-text-strong)]">Internal Notes</div>
              <button type="button" className="text-xs font-semibold text-[var(--figma-brand)] hover:brightness-95">
                + Add Note
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {c.notes.length === 0 ? (
                <p className="text-sm text-[var(--figma-text-muted)]">No notes.</p>
              ) : (
                c.notes.map((n, idx) => (
                  <div key={idx} className="border-b border-[var(--figma-stroke)] pb-4 last:border-b-0 last:pb-0">
                    <div className="text-[11px] font-bold tracking-wide text-[var(--figma-text-strong)]">
                      {n.date} — {n.author}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--figma-text)]">{n.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
