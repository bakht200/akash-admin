import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  TrendingUp,
  Users,
} from 'lucide-react'
import { clientListRows } from '../data/clientData'

const TOTAL_CLIENTS = 1248

const MOCK_CLIENTS = clientListRows

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-xs font-semibold text-[var(--figma-text-muted)] ring-2 ring-white">
      {initials || '—'}
    </div>
  )
}

function statusPill(status) {
  return status === 'Active'
    ? 'bg-emerald-50 text-emerald-700'

    : 'bg-rose-50 text-rose-700'
}

export default function Clients() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const perPage = 10
  const totalPages = Math.ceil(TOTAL_CLIENTS / perPage)

  return (
    <div className="space-y-6">
      {/* Main list card */}
      <section className="figma-card overflow-hidden">
        {/* Filters + total summary */}
        <div className="border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--figma-text-muted)]"
                  fill="none"
                >
                  <path
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  className="h-11 w-full rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] pl-10 pr-4 text-sm text-[var(--figma-text)] placeholder:text-[var(--figma-text-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
                  placeholder="Filter by Name, Email or Phone"
                />
              </div>
              <div className="shrink-0 sm:min-w-[200px]">
                <label className="sr-only" htmlFor="client-status">
                  Status
                </label>
                <select
                  id="client-status"
                  defaultValue="all"
                  className="h-11 w-full rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
                >
                  <option value="all">STATUS: All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-4 py-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[rgba(27,20,100,0.12)] text-[var(--figma-brand)]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TOTAL CLIENTS</div>
                <div className="text-lg font-semibold text-[var(--figma-text-strong)]">{TOTAL_CLIENTS.toLocaleString()}</div>
              </div>
              <div className="ml-1 flex -space-x-2 pl-2">
                {['MC', 'EV', 'JB', 'PN'].map((x) => (
                  <div
                    key={x}
                    className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[var(--figma-input-bg)] text-[10px] font-semibold text-[var(--figma-text-muted)]"
                  >
                    {x}
                  </div>
                ))}
                <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[var(--figma-brand)] text-[10px] font-semibold text-white">
                  +24
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white">
          <table className="min-w-[1000px] w-full border-collapse">
            <thead>
              <tr className="border-y border-[var(--figma-stroke)] bg-white">
                {[
                  'Client name',
                  'Contact details',
                  'Sessions',
                  'Total spent',
                  'Last active',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)] sm:px-6"
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CLIENTS.map((c) => (
                <tr
                  key={c.id + c.email}
                  className="cursor-pointer border-b border-[var(--figma-stroke)] last:border-b-0 hover:bg-[rgba(244,243,241,0.55)]"
                  tabIndex={0}
                  onClick={() => navigate(`/clients/${encodeURIComponent(c.id)}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/clients/${encodeURIComponent(c.id)}`)
                    }
                  }}
                >
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[var(--figma-brand)]">{c.name}</div>
                        <div className="truncate text-xs text-[var(--figma-text-muted)]">ID: {c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="text-sm font-medium text-[var(--figma-text-strong)]">{c.email}</div>
                    <div className="text-xs text-[var(--figma-text-muted)]">{c.phone}</div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">{c.sessions}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className="text-sm font-semibold text-[var(--figma-brand)]">
                      ${c.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">{c.lastActive}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <span
                      className={['inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold', statusPill(c.status)].join(
                        ' ',
                      )}
                    >
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)] hover:bg-[rgba(244,243,241,0.9)]"
                      aria-label={`View ${c.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/clients/${encodeURIComponent(c.id)}`)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-medium text-[var(--figma-text-muted)]">
            SHOWING {(page - 1) * perPage + 1} TO {Math.min(page * perPage, TOTAL_CLIENTS)} OF {TOTAL_CLIENTS.toLocaleString()}{' '}
            CLIENTS.
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text)] disabled:opacity-40"
              aria-label="Previous page"
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
                  page === n
                    ? 'bg-[var(--figma-brand)] text-white'
                    : 'border border-transparent text-[var(--figma-text)] hover:bg-[var(--figma-input-bg)]',
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
                page === totalPages
                  ? 'bg-[var(--figma-brand)] text-white'
                  : 'border border-transparent text-[var(--figma-text)] hover:bg-[var(--figma-input-bg)]',
              ].join(' ')}
            >
              {totalPages}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text)] disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom analytics */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[14px] bg-[var(--figma-brand)] p-6 text-white shadow-[0_12px_32px_rgba(27,20,100,0.18)]">
          <TrendingUp
            className="pointer-events-none absolute bottom-4 right-4 h-24 w-24 text-white/10"
            strokeWidth={1.25}
            aria-hidden
          />
          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.16em] text-white/70">NEW THIS MONTH</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">+128</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.16em] text-white/70">CHURN RATE</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">2.4%</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.16em] text-white/70">LIFETIME VALUE</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">$1,142</div>
            </div>
          </div>
        </div>

        <div className="figma-card p-5 sm:p-6">
          <div className="text-base font-semibold text-[var(--figma-text-strong)]">Activity Feed</div>
          <div className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">RECENT INTERACTIONS</div>
          <ul className="mt-4 space-y-4">
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <div>
                <div className="text-sm font-medium text-[var(--figma-text-strong)]">Marcus Chen booked a Yoga Session</div>
                <div className="text-xs text-[var(--figma-text-muted)]">2 minutes ago</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--figma-brand)]" />
              <div>
                <div className="text-sm font-medium text-[var(--figma-text-strong)]">Elena Rodriguez updated profile photo</div>
                <div className="text-xs text-[var(--figma-text-muted)]">1 hour ago</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              <div>
                <div className="text-sm font-medium text-[var(--figma-text-strong)]">System flagged 1 dispute</div>
                <div className="text-xs text-[var(--figma-text-muted)]">3 hours ago</div>
              </div>
            </li>
          </ul>
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-[var(--figma-brand)] hover:brightness-95"
          >
            VIEW ALL LOGS →
          </button>
        </div>
      </section>
    </div>
  )
}
