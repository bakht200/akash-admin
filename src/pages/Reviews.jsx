import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Flag,
  MessageSquare,
  Plus,
  Star,
} from 'lucide-react'

const TOTAL_REVIEWS = 1240
const PER_PAGE = 10

const ALL_ROWS = [
  {
    id: '#REV-9821',
    client: { name: 'Sarah Jenkins', role: 'Verified Client' },
    practitioner: { name: 'Dr. James Chen', role: 'Physiotherapist' },
    rating: 5,
    comment: 'Excellent session — felt heard and the exercises helped within days.',
    date: 'Oct 24, 2023',
    time: '2:14 PM',
    status: 'Published',
    flagged: false,
    flagReason: null,
  },
  {
    id: '#REV-9820',
    client: { name: 'Marcus Webb', role: 'Verified Client' },
    practitioner: { name: 'Priya Nair', role: 'Yoga Instructor' },
    rating: 4,
    comment: 'Great energy, studio was a bit cold.',
    date: 'Oct 24, 2023',
    time: '11:02 AM',
    status: 'Published',
    flagged: false,
    flagReason: null,
  },
  {
    id: '#REV-9819',
    client: { name: 'Elena Rossi', role: 'Verified Client' },
    practitioner: { name: 'Noah Kim', role: 'Meditation Coach' },
    rating: 2,
    comment: 'Not what I expected from the listing. Waste of time.',
    date: 'Oct 23, 2023',
    time: '6:45 PM',
    status: 'Flagged',
    flagged: true,
    flagReason: 'INAPPROPRIATE LANGUAGE',
  },
  {
    id: '#REV-9818',
    client: { name: 'David Okonkwo', role: 'Verified Client' },
    practitioner: { name: 'Amelia Frost', role: 'Breathwork' },
    rating: 5,
    comment: 'Life-changing breathwork block. Already booked again.',
    date: 'Oct 23, 2023',
    time: '9:30 AM',
    status: 'Published',
    flagged: false,
    flagReason: null,
  },
  {
    id: '#REV-9817',
    client: { name: 'Rachel Green', role: 'Verified Client' },
    practitioner: { name: 'Tomás Alvarez', role: 'Reiki' },
    rating: 3,
    comment: 'Okay experience — hard to verify credentials on site.',
    date: 'Oct 22, 2023',
    time: '4:12 PM',
    status: 'Hidden',
    flagged: false,
    flagReason: null,
  },
  {
    id: '#REV-9816',
    client: { name: 'Priya Nair', role: 'Verified Client' },
    practitioner: { name: 'Sarah Miller', role: 'Counselor' },
    rating: 5,
    comment: 'Compassionate and professional. Highly recommend.',
    date: 'Oct 22, 2023',
    time: '10:00 AM',
    status: 'Published',
    flagged: false,
    flagReason: null,
  },
  {
    id: '#REV-9815',
    client: { name: 'James Chen', role: 'Verified Client' },
    practitioner: { name: 'Marcus Webb', role: 'Personal Trainer' },
    rating: 1,
    comment: 'Terrible — this person should be removed.',
    date: 'Oct 21, 2023',
    time: '8:22 PM',
    status: 'Flagged',
    flagged: true,
    flagReason: 'HARASSMENT',
  },
  {
    id: '#REV-9814',
    client: { name: 'Olivia Park', role: 'Verified Client' },
    practitioner: { name: 'Dr. James Chen', role: 'Physiotherapist' },
    rating: 4,
    comment: 'Solid follow-up plan and clear instructions.',
    date: 'Oct 21, 2023',
    time: '3:05 PM',
    status: 'Published',
    flagged: false,
    flagReason: null,
  },
  {
    id: '#REV-9813',
    client: { name: 'Noah Kim', role: 'Verified Client' },
    practitioner: { name: 'Elena Rossi', role: 'Pilates' },
    rating: 5,
    comment: 'Best class I have taken this year.',
    date: 'Oct 20, 2023',
    time: '7:40 PM',
    status: 'Published',
    flagged: false,
    flagReason: null,
  },
  {
    id: '#REV-9812',
    client: { name: 'Sofia Martins', role: 'Verified Client' },
    practitioner: { name: 'Priya Nair', role: 'Yoga Instructor' },
    rating: 4,
    comment: 'Lovely instructor, parking was difficult.',
    date: 'Oct 20, 2023',
    time: '12:18 PM',
    status: 'Published',
    flagged: false,
    flagReason: null,
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
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] text-[10px] font-semibold text-[var(--figma-text-muted)] ring-1 ring-[var(--figma-stroke)]">
      {initials.slice(0, 2) || '—'}
    </div>
  )
}

function StarRow({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={[
            'h-3.5 w-3.5',
            i <= value ? 'fill-amber-400 text-amber-400' : 'fill-none text-[var(--figma-stroke)]',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

function reviewStatusPill(s) {
  const u = s.toUpperCase()
  if (u === 'PUBLISHED') return 'bg-emerald-50 text-emerald-800'
  if (u === 'FLAGGED') return 'bg-rose-50 text-rose-800'
  if (u === 'HIDDEN') return 'bg-slate-100 text-slate-700'
  return 'bg-slate-100 text-slate-700'
}

export default function Reviews() {
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState('all')
  const [flaggedOnly, setFlaggedOnly] = useState(false)

  const filteredRows = useMemo(() => {
    let rows = ALL_ROWS
    if (flaggedOnly) rows = rows.filter((r) => r.flagged)
    if (ratingFilter !== 'all') {
      const n = Number(ratingFilter)
      rows = rows.filter((r) => r.rating === n)
    }
    return rows
  }, [ratingFilter, flaggedOnly])

  const totalPages = Math.max(1, Math.ceil(TOTAL_REVIEWS / PER_PAGE))
  const rangeStart = (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, TOTAL_REVIEWS)

  function clearFilters() {
    setRatingFilter('all')
    setFlaggedOnly(false)
    setPage(1)
  }

  return (
    <div className="relative space-y-6 pb-20">
      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="figma-card p-6 sm:p-7">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">AVG. RATING</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-[var(--figma-text-strong)]">4.8</div>
          <div className="mt-3 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={[
                  'h-5 w-5',
                  i <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/35 text-amber-400/50',
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        <div className="figma-card p-6 sm:p-7">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">PENDING FLAGS</div>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="text-4xl font-semibold tracking-tight text-rose-600">12</span>
            <span className="mb-1 inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-rose-700 ring-1 ring-rose-200/80">
              +3 TODAY
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[12px] border border-[rgba(27,20,100,0.35)] bg-gradient-to-br from-indigo-950 via-[var(--figma-brand)] to-[#12102e] p-6 text-white shadow-[0_12px_40px_rgba(27,20,100,0.2)] sm:p-7">
          <BadgeCheck
            className="pointer-events-none absolute -right-4 bottom-0 h-40 w-40 text-white/10"
            strokeWidth={1}
            aria-hidden
          />
          <div className="relative">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-white/75">SYSTEM HEALTH</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">94% Positive Sentiment</div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
              Automated NLP scan of recent reviews; excludes hidden and draft entries.
            </p>
          </div>
        </div>
      </section>

      {/* Ledger table */}
      <section className="figma-card overflow-hidden">
        <div className="border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 rounded-[12px] bg-[var(--figma-input-bg)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:max-w-[260px] sm:flex-none">
                <Filter className="h-4 w-4 shrink-0 text-[var(--figma-text-muted)]" aria-hidden />
                <select
                  value={ratingFilter}
                  onChange={(e) => {
                    setRatingFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent py-0 pr-7 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-0"
                  aria-label="Filter by rating"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--figma-text-muted)]" aria-hidden />
              </div>

              <button
                type="button"
                onClick={() => {
                  setFlaggedOnly((v) => !v)
                  setPage(1)
                }}
                className={[
                  'inline-flex h-[42px] shrink-0 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition',
                  flaggedOnly
                    ? 'border-rose-200 bg-white text-rose-900 ring-1 ring-rose-200/80'
                    : 'border-[var(--figma-stroke)] bg-white text-[var(--figma-text-strong)] hover:bg-[rgba(255,255,255,0.95)]',
                ].join(' ')}
              >
                <Flag className="h-4 w-4 text-rose-600" aria-hidden />
                Flagged Only
              </button>

              <div className="hidden h-6 w-px shrink-0 bg-[var(--figma-stroke)] sm:block" aria-hidden />

              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 text-left text-sm font-medium text-[var(--figma-text-muted)] hover:text-[var(--figma-text)] sm:pl-1"
              >
                Clear all filters
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:shrink-0">
              <p className="text-sm font-medium text-[var(--figma-text-muted)]">
                Showing {rangeStart}-{rangeEnd} of {TOTAL_REVIEWS.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4 text-[var(--figma-text-strong)]" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="grid h-9 w-9 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4 text-[var(--figma-text-strong)]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-[1100px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {['Review ID', 'Client', 'Practitioner', 'Rating & Comment', 'Date', 'Status', 'Actions'].map((h) => (
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
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[var(--figma-text-muted)] sm:px-6">
                    No reviews match your filters.
                  </td>
                </tr>
              ) : null}
              {filteredRows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                  <td className="px-5 py-3 text-sm text-[var(--figma-text-muted)] sm:px-6">{r.id}</td>
                  <td className="px-5 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.client.name} />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[var(--figma-text-strong)]">{r.client.name}</div>
                        <div className="truncate text-xs text-[var(--figma-text-muted)]">{r.client.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.practitioner.name} />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[var(--figma-text-strong)]">{r.practitioner.name}</div>
                        <div className="truncate text-xs text-[var(--figma-text-muted)]">{r.practitioner.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[320px] px-5 py-3 sm:px-6">
                    <StarRow value={r.rating} />
                    <p className="mt-2 text-sm leading-snug text-[var(--figma-text)]">{r.comment}</p>
                    {r.flagged && r.flagReason ? (
                      <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-rose-600">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>FLAGGED FOR: {r.flagReason}</span>
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 sm:px-6">
                    <div className="text-sm font-medium text-[var(--figma-text-strong)]">{r.date}</div>
                    <div className="text-xs text-[var(--figma-text-muted)]">{r.time}</div>
                  </td>
                  <td className="px-5 py-3 sm:px-6">
                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', reviewStatusPill(r.status)].join(' ')}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 sm:px-6">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)] hover:bg-[rgba(244,243,241,0.9)]"
                        aria-label="Reply"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)] hover:bg-[rgba(244,243,241,0.9)]"
                        aria-label="Visibility"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button
        type="button"
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[var(--figma-brand)] text-white shadow-[0_8px_24px_rgba(27,20,100,0.35)] transition hover:brightness-[1.05] sm:bottom-8 sm:right-8"
        aria-label="Manual entry"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
