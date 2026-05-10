import { useState } from 'react'
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Mail, Smartphone } from 'lucide-react'

const TOTAL_LOGS = 12842
const PER_PAGE = 50

const LOG_ROWS = [
  {
    id: '1',
    ts: 'Oct 24, 2023',
    tsTime: '14:32:01 UTC',
    recipient: { name: 'Sarah Jenkins', detail: 'sarah.j@email.com', initials: 'SJ', tone: 'bg-sky-100 text-sky-800' },
    channel: 'Email',
    event: 'Booking Confirmation',
    eventTone: 'brand',
    status: 'Read',
    deliveryTone: 'read',
  },
  {
    id: '2',
    ts: 'Oct 24, 2023',
    tsTime: '13:05:44 UTC',
    recipient: { name: 'Dr. James Chen', detail: '+1 (415) 555-0192', initials: 'JC', tone: 'bg-violet-100 text-violet-800' },
    channel: 'SMS',
    event: 'Reminder',
    eventTone: 'amber',
    status: 'Sent',
    deliveryTone: 'sent',
  },
  {
    id: '3',
    ts: 'Oct 24, 2023',
    tsTime: '09:12:18 UTC',
    recipient: { name: 'Marcus Webb', detail: 'Device token · iOS', initials: 'MW', tone: 'bg-emerald-100 text-emerald-800' },
    channel: 'Push',
    event: 'Policy Update',
    eventTone: 'slate',
    status: 'Failed',
    deliveryTone: 'failed',
  },
  {
    id: '4',
    ts: 'Oct 23, 2023',
    tsTime: '22:40:00 UTC',
    recipient: { name: 'Priya Nair', detail: 'priya.n@email.com', initials: 'PN', tone: 'bg-rose-100 text-rose-800' },
    channel: 'Email',
    event: 'Booking Confirmation',
    eventTone: 'brand',
    status: 'Sent',
    deliveryTone: 'sent',
  },
  {
    id: '5',
    ts: 'Oct 23, 2023',
    tsTime: '16:18:33 UTC',
    recipient: { name: 'Elena Rossi', detail: 'elena.r@email.com', initials: 'ER', tone: 'bg-amber-100 text-amber-900' },
    channel: 'Email',
    event: 'Reminder',
    eventTone: 'amber',
    status: 'Read',
    deliveryTone: 'read',
  },
  {
    id: '6',
    ts: 'Oct 23, 2023',
    tsTime: '08:55:12 UTC',
    recipient: { name: 'David Okonkwo', detail: '+44 7700 900123', initials: 'DO', tone: 'bg-slate-200 text-slate-800' },
    channel: 'SMS',
    event: 'Policy Update',
    eventTone: 'slate',
    status: 'Failed',
    deliveryTone: 'failed',
  },
]

function eventTagClass(tone) {
  if (tone === 'brand') return 'bg-[rgba(27,20,100,0.12)] text-[var(--figma-brand)] ring-1 ring-[rgba(27,20,100,0.2)]'
  if (tone === 'amber') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80'
}

function deliveryPill(tone) {
  if (tone === 'read') return 'bg-emerald-50 text-emerald-800'
  if (tone === 'sent') return 'bg-emerald-50/80 text-emerald-900'
  if (tone === 'failed') return 'bg-rose-50 text-rose-800'
  return 'bg-slate-100 text-slate-700'
}

function ChannelIcon({ channel }) {
  const cls = 'h-4 w-4 shrink-0 text-[var(--figma-text-muted)]'
  if (channel === 'SMS') return <Smartphone className={cls} />
  if (channel === 'Push') return <Bell className={cls} />
  return <Mail className={cls} />
}

export default function Notifications() {
  const [page, setPage] = useState(1)
  const [horizon, setHorizon] = useState('7d')

  const totalPages = Math.max(1, Math.ceil(TOTAL_LOGS / PER_PAGE))
  const rangeStart = (page - 1) * PER_PAGE + 1
  const rangeEnd = Math.min(page * PER_PAGE, TOTAL_LOGS)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="figma-card p-5 shadow-sm sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TOTAL SENT</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-2xl font-semibold text-[var(--figma-text-strong)] sm:text-3xl">12,842</span>
            <span className="mb-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">+8.4%</span>
          </div>
        </div>
        <div className="figma-card p-5 shadow-sm sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">SUCCESS RATE</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-2xl font-semibold text-[var(--figma-text-strong)] sm:text-3xl">99.2%</span>
            <span className="mb-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Above benchmark</span>
          </div>
        </div>
        <div className="figma-card p-5 shadow-sm sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">FAILED DELIVERY</div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <span className="text-2xl font-semibold text-rose-700 sm:text-3xl">104</span>
            <span className="mb-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">Needs review</span>
          </div>
        </div>
        <div className="figma-card flex flex-col justify-between p-5 sm:p-6">
          <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">TIME HORIZON</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] p-1">
              {[
                { id: '24h', label: '24 Hours' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
              ].map((seg) => (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => setHorizon(seg.id)}
                  className={[
                    'rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold',
                    horizon === seg.id
                      ? 'bg-white text-[var(--figma-text-strong)] shadow-sm ring-1 ring-[var(--figma-stroke)]'
                      : 'text-[var(--figma-text-muted)] hover:text-[var(--figma-text)]',
                  ].join(' ')}
                >
                  {seg.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-[var(--figma-stroke)] bg-white text-[var(--figma-text-muted)] hover:bg-[var(--figma-input-bg)]"
              aria-label="Pick date range"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="figma-card overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[140px] flex-col gap-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">
              TYPE
              <select className="h-11 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
                <option>All</option>
                <option>Email</option>
                <option>SMS</option>
                <option>Push</option>
              </select>
            </label>
            <label className="flex min-w-[160px] flex-col gap-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">
              EVENT
              <select className="h-11 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium text-[var(--figma-text-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]">
                <option>All</option>
                <option>Booking Confirmation</option>
                <option>Reminder</option>
                <option>Policy Update</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="min-w-[1100px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                {['Timestamp', 'Recipient', 'Type', 'Event', 'Delivery Status', 'Action'].map((h) => (
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
              {LOG_ROWS.map((r) => (
                <tr key={r.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="font-medium text-[var(--figma-text-strong)]">{r.ts}</div>
                    <div className="text-xs text-[var(--figma-text-muted)]">{r.tsTime}</div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-semibold',
                          r.recipient.tone,
                        ].join(' ')}
                      >
                        {r.recipient.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[var(--figma-text-strong)]">{r.recipient.name}</div>
                        <div className="truncate text-xs text-[var(--figma-text-muted)]">{r.recipient.detail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <ChannelIcon channel={r.channel} />
                      <span className="font-medium text-[var(--figma-text)]">{r.channel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', eventTagClass(r.eventTone)].join(' ')}>
                      {r.event.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', deliveryPill(r.deliveryTone)].join(' ')}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    {r.status === 'Failed' ? (
                      <button
                        type="button"
                        className="text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-brand)] underline underline-offset-2 hover:opacity-90"
                      >
                        RETRY
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--figma-text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs font-medium text-[var(--figma-text-muted)]">
            Showing {rangeStart} – {rangeEnd} of {TOTAL_LOGS.toLocaleString()} logs
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
                'flex h-9 min-w-[40px] items-center justify-center rounded-[8px] px-2 text-sm font-semibold',
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
    </div>
  )
}
