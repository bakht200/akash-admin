import { useNavigate } from 'react-router-dom'
import { practitionerListRows } from '../data/practitionerData'

export default function Practitioners() {
  const rows = practitionerListRows

  const kpis = [
    { label: 'Total active', value: '1,284', delta: '+12%' },
    { label: 'Avg. rating', value: '4.8', delta: '★' },
    { label: 'Total revenue', value: '$128.4K', delta: '' },
    { label: 'Pending verification', value: '42', delta: 'Urgent' },
  ]

  const tabs = [
    { id: 'all', label: 'All', count: 1402 },
    { id: 'active', label: 'Active', count: 1284 },
    { id: 'pending', label: 'Pending', count: 42 },
    { id: 'suspended', label: 'Suspended', count: 18 },
    { id: 'inactive', label: 'Inactive', count: 58 },
  ]

  return (
    <div className="space-y-4">
      {/* KPI tiles */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0">
        {kpis.map((k) => (
          <KpiTile key={k.label} {...k} />
        ))}
      </section>

      {/* List surface */}
      <section className="figma-card overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-[var(--figma-stroke)] bg-white px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-5">
            {tabs.map((t) => (
              <Tab key={t.id} active={t.id === 'all'} label={t.label} count={t.count} />
            ))}
          </div>
          <div className="mt-3 h-[1px] bg-transparent" />
        </div>

        {/* Filters */}
        <div className="bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
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
                placeholder="Filter by name, email or ID..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <FilterPill label="Modality" value="All" />
              <FilterPill label="Country" value="Global" />
              <FilterPill label="Rating" value="Any" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white">
          <table className="min-w-[920px] w-full border-collapse">
            <thead>
              <tr className="border-y border-[var(--figma-stroke)] bg-white">
                {['Name', 'Modalities', 'Status', 'Rating', 'Sessions', 'Earnings', 'Price'].map((h) => (
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
              {rows.map((r) => (
                <Row key={r.email} r={r} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function KpiTile({ label, value, delta }) {
  const isUrgent = label === 'Pending verification'
  const isRating = label === 'Avg. rating'

  return (
    <div className="figma-card p-5 sm:p-6">
      <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--figma-text-muted)]">{label.toUpperCase()}</div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{value}</div>
        {isRating ? <span className="text-sm text-[#C79A2B]">★</span> : null}
        {!isRating && delta ? (
          <span className="pb-[2px] text-xs font-semibold text-emerald-700">{delta}</span>
        ) : null}
        {isUrgent ? (
          <span className="ml-1 inline-flex items-center rounded-[8px] bg-[#F3E7C4] px-2 py-1 text-[11px] font-semibold text-[#6D4B00]">
            Urgent
          </span>
        ) : null}
      </div>
    </div>
  )
}

function Tab({ label, count, active }) {
  return (
    <button
      type="button"
      className={[
        'relative pb-3 text-sm font-semibold',
        active ? 'text-[var(--figma-text-strong)]' : 'text-[var(--figma-text-muted)] hover:text-[var(--figma-text)]',
      ].join(' ')}
    >
      <span className="inline-flex items-center gap-2">
        <span>{label}</span>
        <span className="text-xs font-semibold text-[var(--figma-text-muted)]">{count.toLocaleString()}</span>
      </span>
      {active ? <span aria-hidden className="absolute -bottom-[1px] left-0 h-[2px] w-full bg-[var(--figma-brand)]" /> : null}
    </button>
  )
}

function FilterPill({ label, value }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-3 text-sm text-[var(--figma-text)] hover:bg-[rgba(244,243,241,0.7)]"
    >
      <span className="text-xs font-semibold text-[var(--figma-text-muted)]">{label}:</span>
      <span className="text-sm font-semibold text-[var(--figma-text-strong)]">{value}</span>
      <svg aria-hidden viewBox="0 0 20 20" className="ml-1 h-4 w-4 text-[var(--figma-text-muted)]" fill="none">
        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function statusPill(status) {
  switch (status) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-700'
    case 'Pending':
      return 'bg-amber-50 text-amber-800'
    case 'Suspended':
      return 'bg-rose-50 text-rose-700'
    case 'Inactive':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function Row({ r }) {
  const navigate = useNavigate()

  return (
    <tr
      className="cursor-pointer border-b border-[var(--figma-stroke)] last:border-b-0 hover:bg-[rgba(244,243,241,0.55)]"
      tabIndex={0}
      onClick={() => navigate(`/practitioners/${r.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/practitioners/${r.id}`)
        }
      }}
    >
      <td className="px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[var(--figma-text-strong)]">{r.name}</div>
            <div className="truncate text-xs text-[var(--figma-text-muted)]">{r.email}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {r.modalities.map((m) => (
            <span
              key={m}
              className="inline-flex items-center rounded-[10px] bg-[var(--figma-input-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--figma-text)]"
            >
              {m.toUpperCase()}
            </span>
          ))}
        </div>
      </td>

      <td className="px-4 py-4 sm:px-6">
        <span className={['inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold', statusPill(r.status)].join(' ')}>
          {r.status.toUpperCase()}
        </span>
      </td>

      <td className="px-4 py-4 sm:px-6">
        {typeof r.rating === 'number' ? (
          <div className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--figma-text-strong)]">
            {r.rating.toFixed(1)}
            <span className="text-sm text-[#C79A2B]">★</span>
          </div>
        ) : (
          <span className="text-sm font-semibold text-[var(--figma-text-muted)]">—</span>
        )}
      </td>

      <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">{r.sessions}</td>

      <td className="px-4 py-4 sm:px-6">
        <span className="text-sm font-semibold text-[var(--figma-brand)]">${r.earnings.toLocaleString()}</span>
      </td>

      <td className="px-4 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">${r.price}/</td>
    </tr>
  )
}

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--figma-input-bg)] text-xs font-semibold text-[var(--figma-text-muted)]">
      {initials || '—'}
    </div>
  )
}

