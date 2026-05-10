import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, GraduationCap, CheckCircle2 } from 'lucide-react'
import { getPractitionerListName, getPractitionerProfile } from '../data/practitionerData'

function pillClass(kind) {
  switch (kind) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700'
    case 'pending':
      return 'bg-amber-50 text-amber-800'
    case 'cancelled':
      return 'bg-rose-50 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function AvatarCard({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className="relative overflow-hidden rounded-[14px] bg-[rgba(27,20,100,0.10)]">
      <div className="aspect-[4/3] w-full">
        <div className="grid h-full w-full place-items-center bg-[rgba(27,20,100,0.12)]">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white/70 text-lg font-semibold text-[var(--figma-text-strong)]">
            {initials || '—'}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/35 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-white">
        Practitioner Profile
      </div>
    </div>
  )
}

function KeyPill({ children, tone }) {
  return (
    <span className={['inline-flex items-center rounded-[10px] px-2.5 py-1 text-[11px] font-semibold', pillClass(tone)].join(' ')}>
      {children}
    </span>
  )
}

export default function PractitionerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const data = useMemo(() => getPractitionerProfile(id), [id])
  const displayName = getPractitionerListName(id) ?? data.name

  return (
    <div className="space-y-4">
      {/* Breadcrumb + header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--figma-text-muted)]">
            <button
              type="button"
              onClick={() => navigate('/practitioners')}
              className="hover:text-[var(--figma-text)]"
            >
              Practitioners
            </button>{' '}
            <span className="text-[var(--figma-text-muted)]">›</span>{' '}
            <span className="text-[var(--figma-text-strong)]">{displayName}</span>
          </div>

          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{displayName}</div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--figma-text-muted)]">
            <span>
              <span className="font-semibold text-[var(--figma-text-muted)]">ID:</span> {data.idLabel}
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--figma-stroke)]" />
            <span>
              <span className="font-semibold text-[var(--figma-text-muted)]">Joined:</span> {data.joined}
            </span>
            <KeyPill tone={data.status === 'Pending' ? 'pending' : data.status === 'Suspended' ? 'cancelled' : 'active'}>
              {data.status.toUpperCase()}
            </KeyPill>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          <button
            type="button"
            className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-strong)] hover:bg-[rgba(244,243,241,0.7)]"
          >
            EDIT PROFILE
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main card */}
        <div className="lg:col-span-8">
          <div className="figma-card p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <div className="md:col-span-5">
                <AvatarCard name={displayName} />
              </div>
              <div className="md:col-span-7">
                <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Professional Biography</div>
                <div className="mt-2 text-sm leading-relaxed text-[var(--figma-text)]">{data.bio}</div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">SPECIALTIES</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.specialties.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-[10px] bg-[var(--figma-input-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--figma-text)]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">PRICING</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--figma-text-strong)]">
                      ${data.price.toFixed(2)} <span className="text-xs font-semibold text-[var(--figma-text-muted)]">/ session</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Education + Certifications (aligned like screenshot) */}
            <div className="mt-8 border-t border-[var(--figma-stroke)] pt-6">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-[var(--figma-brand)]">
                    <GraduationCap className="h-5 w-5" />
                    <span>Education</span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {data.education.length ? (
                      data.education.map((e) => (
                        <div key={e.title}>
                          <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{e.title}</div>
                          <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">{e.meta}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-[var(--figma-text-muted)]">—</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-[var(--figma-brand)]">
                    <BadgeCheck className="h-5 w-5" />
                    <span>Certifications</span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {data.certifications.length ? (
                      data.certifications.map((c) => (
                        <div key={c} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                          <div className="text-sm text-[var(--figma-text-strong)]">{c}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-[var(--figma-text-muted)]">—</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent sessions */}
          <div className="mt-6 figma-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 bg-white px-5 py-4 sm:px-6">
              <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Recent Sessions</div>
              <button type="button" className="text-xs font-semibold text-[var(--figma-brand)] hover:brightness-95">
                View All
              </button>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="min-w-[720px] w-full border-collapse">
                <thead>
                  <tr className="border-y border-[var(--figma-stroke)]">
                    {['Client', 'Date', 'Type', 'Fee', 'Status'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)] sm:px-6"
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentSessions.map((s) => (
                    <tr key={`${s.client}-${s.date}`} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">{s.client}</td>
                      <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">{s.date}</td>
                      <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">{s.type}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">${s.fee.toFixed(2)}</td>
                      <td className="px-5 py-4 sm:px-6">
                        <span
                          className={[
                            'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                            pillClass(s.status.toLowerCase() === 'completed' ? 'active' : 'cancelled'),
                          ].join(' ')}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.recentSessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-sm text-[var(--figma-text-muted)] sm:px-6">
                        No recent sessions.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6 lg:col-span-4">
          {/* Performance ledger */}
          <div className="overflow-hidden rounded-[14px] bg-[var(--figma-brand)] p-6 text-white shadow-[0_12px_32px_rgba(27,20,100,0.18)]">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-white/75">PERFORMANCE LEDGER</div>
            <div className="mt-5 rounded-[12px] bg-white/10 p-4">
              <div className="text-xs text-white/70">Total Lifetime Earnings</div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="text-2xl font-semibold tracking-tight">
                  ${data.performance.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-white/15">💳</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-[12px] bg-white/10 p-4">
                <div className="text-xs text-white/70">Total Sessions</div>
                <div className="mt-1 text-lg font-semibold">{data.performance.sessions}</div>
              </div>
              <div className="rounded-[12px] bg-white/10 p-4">
                <div className="text-xs text-white/70">Avg Rating</div>
                <div className="mt-1 text-lg font-semibold">
                  {data.performance.rating.toFixed(1)} <span className="text-[#F3E7C4]">★</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification vault */}
          <div className="figma-card p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--figma-text-muted)]">VERIFICATION VAULT</div>
            <div className="mt-4 space-y-3">
              {data.vault.map((v) => (
                <div key={v.name} className="flex items-center justify-between gap-3 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--figma-text-strong)]">{v.name}</div>
                    <div className="truncate text-xs text-[var(--figma-text-muted)]">{v.meta}</div>
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-[10px] bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    VERIFIED
                  </span>
                </div>
              ))}
              {data.vault.length === 0 ? <div className="text-sm text-[var(--figma-text-muted)]">No documents.</div> : null}
            </div>
          </div>

          {/* Recent reviews */}
          <div className="figma-card p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--figma-text-muted)]">RECENT REVIEWS</div>
            <div className="mt-4 space-y-3">
              {data.reviews.map((rv, idx) => (
                <div key={idx} className="rounded-[12px] border border-[var(--figma-stroke)] bg-white px-4 py-3">
                  <div className="text-sm text-[#C79A2B]">{'★'.repeat(rv.stars)}</div>
                  <div className="mt-2 text-sm text-[var(--figma-text)]">“{rv.quote}”</div>
                  <div className="mt-2 text-xs font-semibold text-[var(--figma-text-muted)]">{rv.meta}</div>
                </div>
              ))}
              <button type="button" className="w-full rounded-[12px] bg-[var(--figma-input-bg)] px-4 py-3 text-sm font-semibold text-[var(--figma-text-strong)] hover:brightness-[0.98]">
                See All Reviews
              </button>
            </div>
          </div>

          {/* Administrative control */}
          <div className="figma-card p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--figma-text-muted)]">ADMINISTRATIVE CONTROL</div>
            <div className="mt-4 space-y-3">
              <Link
                to={`/practitioners/${id}/verification`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--figma-brand)] hover:bg-[rgba(244,243,241,0.7)]"
              >
                Open verification review
              </Link>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[var(--figma-stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[rgba(244,243,241,0.7)]"
              >
                Suspend Account
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:brightness-[0.98]"
              >
                Block Access
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

