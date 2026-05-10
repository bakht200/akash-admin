import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, CheckCircle2, Flag, AlertTriangle, MinusCircle } from 'lucide-react'
import { getPractitionerVerification } from '../data/practitionerData'

function RiskStatusLine({ risk }) {
  const tone = risk.statusTone ?? 'warning'
  const textClass =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'danger'
        ? 'text-rose-700'
        : tone === 'muted'
          ? 'text-slate-600'
          : 'text-amber-700'

  const Icon =
    tone === 'success' ? CheckCircle2 : tone === 'muted' ? MinusCircle : AlertTriangle

  return (
    <div className={['mt-1 inline-flex items-center gap-2 font-semibold', textClass].join(' ')}>
      <Icon className="h-4 w-4 shrink-0" />
      {risk.autoStatus}
    </div>
  )
}

export default function PractitionerVerification() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [decision, setDecision] = useState('approve')
  const [rejectionReason, setRejectionReason] = useState('')

  const data = useMemo(() => getPractitionerVerification(id), [id])

  return (
    <div className="space-y-6">
      {/* Sub-header: back + verification ref (matches design) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold tracking-wide text-[var(--figma-text-muted)]">
          <button
            type="button"
            onClick={() => navigate('/practitioners')}
            className="inline-flex items-center gap-2 text-[var(--figma-text-strong)] hover:text-[var(--figma-brand)]"
          >
            <ArrowLeft className="h-4 w-4" />
            BACK TO LIST
          </button>
          <span className="hidden text-[var(--figma-stroke)] sm:inline">|</span>
          <span className="uppercase tracking-[0.12em] text-[var(--figma-text-muted)]">
            Verification review: <span className="text-[var(--figma-text-strong)]">#{data.refId}</span>
          </span>
        </div>
      </div>

      {/* Title row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">
            Reviewing {data.listName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-[8px] bg-[rgba(27,20,100,0.08)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[var(--figma-brand)]">
              {data.tier}
            </span>
            <span className="text-sm text-[var(--figma-text-muted)]">{data.submittedAt}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#E3E2E0] px-4 text-[11px] font-semibold tracking-[0.14em] text-[#1A1C1B] hover:brightness-[0.98]"
          >
            Request More Info
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.14em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:brightness-[0.98]"
          >
            Complete Review
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Identity comparison */}
        <div className="lg:col-span-8">
          <div className="figma-card overflow-hidden p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-base font-semibold text-[var(--figma-text-strong)]">Identity Comparison</div>
              <span className="inline-flex items-center rounded-[10px] bg-[var(--figma-input-bg)] px-3 py-1 text-[11px] font-semibold tracking-wide text-[var(--figma-text-muted)]">
                SIMILARITY:{' '}
                <span className="ml-1 text-[var(--figma-text-strong)]">{data.similarityPct}%</span>
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                <div className="border-b border-[var(--figma-stroke)] bg-white px-3 py-2 text-center text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
                  {data.idImageLabel}
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 p-4">
                  <div className="h-full w-full rounded-lg bg-white p-3 shadow-sm">
                    <div className="flex gap-3">
                      <div className="h-20 w-16 shrink-0 rounded bg-slate-300" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="h-2 w-[75%] rounded bg-slate-200" />
                        <div className="h-2 w-1/2 rounded bg-slate-200" />
                        <div className="h-2 w-[66%] rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded bg-slate-100" />
                    <div className="mt-2 h-2 w-4/5 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
              <div className="overflow-hidden rounded-[12px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                <div className="border-b border-[var(--figma-stroke)] bg-white px-3 py-2 text-center text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
                  {data.selfieLabel}
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-[rgba(27,20,100,0.08)] to-[rgba(27,20,100,0.02)] p-6">
                  <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-white text-5xl shadow-[0_8px_24px_rgba(27,20,100,0.12)]">
                    <span aria-hidden>{data.selfieEmoji}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-[12px] border border-[var(--figma-stroke)]">
              <table className="min-w-[640px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                    {['Attribute', 'On Document', 'In Profile', 'Match'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]"
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.comparisonRows.map((row) => (
                    <tr key={row.attribute} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                      <td className="px-4 py-3 font-semibold text-[var(--figma-text-strong)]">{row.attribute}</td>
                      <td className="px-4 py-3 text-[var(--figma-text)]">{row.onDocument}</td>
                      <td
                        className={[
                          'px-4 py-3',
                          row.profileHighlight ? 'font-semibold text-rose-600' : 'text-[var(--figma-text)]',
                        ].join(' ')}
                      >
                        {row.inProfile}
                      </td>
                      <td className="px-4 py-3">
                        {row.match ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label="Match" />
                        ) : (
                          <span className="text-[var(--figma-text-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6 lg:col-span-4">
          <div className="figma-card p-5 sm:p-6">
            <div className="text-base font-semibold text-[var(--figma-text-strong)]">Final Assessment</div>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => setDecision('approve')}
                className={[
                  'flex w-full items-start gap-3 rounded-[12px] border px-4 py-3 text-left transition',
                  decision === 'approve'
                    ? 'border-emerald-300 bg-emerald-50/60 ring-2 ring-emerald-200/80'
                    : 'border-[var(--figma-stroke)] bg-white hover:bg-[rgba(244,243,241,0.6)]',
                ].join(' ')}
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Approve Identity</div>
                  <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">Profile will be marked as verified.</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDecision('flag')}
                className={[
                  'flex w-full items-start gap-3 rounded-[12px] border px-4 py-3 text-left transition',
                  decision === 'flag'
                    ? 'border-amber-300 bg-amber-50/70 ring-2 ring-amber-200/80'
                    : 'border-[var(--figma-stroke)] bg-white hover:bg-[rgba(244,243,241,0.6)]',
                ].join(' ')}
              >
                <Flag className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Flag for Audit</div>
                  <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">Escalate to Senior Compliance Manager.</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDecision('reject')}
                className={[
                  'flex w-full items-start gap-3 rounded-[12px] border px-4 py-3 text-left transition',
                  decision === 'reject'
                    ? 'border-rose-300 bg-rose-50/70 ring-2 ring-rose-200/80'
                    : 'border-[var(--figma-stroke)] bg-white hover:bg-[rgba(244,243,241,0.6)]',
                ].join(' ')}
              >
                <Ban className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Reject Application</div>
                  <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">Practitioner must resubmit documents.</div>
                </div>
              </button>
            </div>

            <div className="mt-5">
              <label className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
                REJECTION REASON
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2 h-11 w-full rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm text-[var(--figma-text)] focus:outline-none focus:ring-2 focus:ring-[rgba(27,20,100,0.12)]"
              >
                <option value="">Select a reason…</option>
                <option value="blurry">Document unreadable / blurry</option>
                <option value="mismatch">Information mismatch</option>
                <option value="expired">Expired document</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              type="button"
              className="mt-4 flex h-12 w-full items-center justify-center rounded-[10px] bg-[var(--figma-brand)] text-sm font-semibold tracking-wide text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:brightness-[0.98]"
            >
              Submit Final Decision
            </button>
            <p className="mt-3 text-center text-[11px] text-[var(--figma-text-muted)]">
              By submitting, this action will be logged under Admin: Akash.
            </p>
          </div>

          <div className="figma-card p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--figma-text-muted)]">RISK ASSESSMENT</div>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-[var(--figma-text-muted)]">Auto-verification status</div>
                <RiskStatusLine risk={data.risk} />
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--figma-text-muted)]">IP Location</div>
                <div className="mt-1 font-medium text-[var(--figma-text-strong)]">{data.risk.ip}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--figma-text-muted)]">Device fingerprint</div>
                <div className="mt-1 font-medium text-[var(--figma-text-strong)]">{data.risk.device}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
