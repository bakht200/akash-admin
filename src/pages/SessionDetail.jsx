import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Clock,
  Copy,
  Eye,
  FileWarning,
  MessageSquare,
  Pencil,
  RotateCcw,
  Stethoscope,
  StickyNote,
} from 'lucide-react'
import { getSessionDetail } from '../data/sessionData'

function Avatar({ name, className = 'h-12 w-12 text-sm' }) {
  const parts = name.replace(/Dr\.\s*/i, '').split(/\s+/).filter(Boolean)
  const initials = [parts[0]?.[0], parts[1]?.[0]].filter(Boolean).join('').toUpperCase() || '—'
  return (
    <div
      className={[
        'grid shrink-0 place-items-center rounded-full bg-[var(--figma-input-bg)] font-semibold text-[var(--figma-text-muted)] ring-2 ring-white',
        className,
      ].join(' ')}
    >
      {initials.slice(0, 2)}
    </div>
  )
}

function overviewStatusClass(s) {
  const u = String(s).toUpperCase()
  if (u === 'COMPLETED') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
  if (u === 'UPCOMING') return 'bg-sky-50 text-sky-800 ring-1 ring-sky-200'
  if (u === 'ACTIVE') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
  if (u === 'DISPUTED') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
  if (u === 'CANCELLED') return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'
  return 'bg-slate-100 text-slate-700'
}

export default function SessionDetail() {
  const { id } = useParams()
  const d = useMemo(() => getSessionDetail(id), [id])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--figma-text-muted)]">
            <Link to="/sessions" className="hover:text-[var(--figma-text)]">
              Sessions
            </Link>{' '}
            <span className="text-[var(--figma-text-muted)]">›</span>{' '}
            <span className="text-[var(--figma-text-strong)]">#{d.id}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">Session Detail</h1>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--figma-brand)] bg-white px-4 text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-brand)] hover:bg-[rgba(27,20,100,0.04)]"
          >
            Audit Log
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[var(--figma-brand)] px-4 text-[11px] font-semibold tracking-[0.12em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:brightness-[0.98]"
          >
            <Pencil className="h-4 w-4" />
            Edit Session
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {/* Overview */}
          <div className="figma-card overflow-hidden p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">OVERVIEW</div>
                <p className="mt-1 text-sm text-[var(--figma-text-muted)]">Primary session metadata and connection links.</p>
              </div>
              <span
                className={['inline-flex rounded-full px-3 py-1 text-[11px] font-semibold', overviewStatusClass(d.overviewStatus)].join(
                  ' ',
                )}
              >
                {String(d.overviewStatus).toUpperCase()}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <div className="text-[10px] font-semibold tracking-wide text-[var(--figma-text-muted)]">SESSION ID</div>
                <div className="mt-1 text-sm font-semibold text-[var(--figma-text-strong)]">{d.id}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-wide text-[var(--figma-text-muted)]">DURATION</div>
                <div className="mt-1 text-sm font-semibold text-[var(--figma-text-strong)]">{d.durationMinutes} Minutes</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-wide text-[var(--figma-text-muted)]">DATE</div>
                <div className="mt-1 text-sm font-semibold text-[var(--figma-text-strong)]">{d.dateLabel}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold tracking-wide text-[var(--figma-text-muted)]">TIME</div>
                <div className="mt-1 text-sm font-semibold text-[var(--figma-text-strong)]">{d.timeLabel}</div>
              </div>
              {d.listRow ? (
                <div>
                  <div className="text-[10px] font-semibold tracking-wide text-[var(--figma-text-muted)]">MODALITY</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--figma-text-strong)]">{d.listRow.modality}</div>
                </div>
              ) : null}
            </div>

            <div className="mt-6 rounded-[12px] border border-[rgba(27,20,100,0.15)] bg-[rgba(27,20,100,0.06)] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-white text-[var(--figma-brand)] shadow-sm">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{d.video.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--figma-text-muted)]">
                    <span className="truncate font-mono text-[var(--figma-text)]">{d.video.url}</span>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-1 rounded-[6px] border border-[var(--figma-stroke)] bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--figma-brand)] hover:bg-white"
                      onClick={() => navigator.clipboard?.writeText(d.video.url)}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-[12px] border border-[var(--figma-stroke)] bg-white p-4">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">CLIENT</div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={d.client.name} />
                    <div>
                      <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{d.client.name}</div>
                      <div className="text-xs text-[var(--figma-text-muted)]">{d.client.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)]"
                      aria-label="Message client"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)]"
                      aria-label="View client"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-[12px] border border-[var(--figma-stroke)] bg-white p-4">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">PRACTITIONER</div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={d.practitioner.name} />
                    <div>
                      <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{d.practitioner.name}</div>
                      <div className="text-xs text-[var(--figma-text-muted)]">{d.practitioner.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)]"
                      aria-label="Message practitioner"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)]"
                      aria-label="View practitioner"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction log */}
            <div className="mt-8 border-t border-[var(--figma-stroke)] pt-6">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">INTERACTION LOG</div>
              <ul className="relative mt-4 space-y-0 border-l border-[var(--figma-stroke)] pl-6">
                {d.timeline.map((t, idx) => (
                  <li key={`${t.label}-${idx}`} className="relative pb-6 last:pb-0">
                    <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--figma-brand)]" />
                    <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{t.label}</div>
                    <div className="text-xs text-[var(--figma-text-muted)]">{t.when}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-4">
          <div className="overflow-hidden rounded-[14px] bg-[var(--figma-brand)] p-6 text-white shadow-[0_12px_32px_rgba(27,20,100,0.18)]">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-white/75">FINANCIAL LEDGER</div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-2 border-b border-white/15 pb-2">
                <span className="text-white/80">Gross Session Price</span>
                <span className="font-semibold">${d.financial.gross.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-white/15 pb-2">
                <span className="text-white/80">Platform Fee (Fixed)</span>
                <span className="font-semibold">${d.financial.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-white/15 pb-2">
                <span className="text-white/80">Processing Fee ({d.financial.processingPct}%)</span>
                <span className="font-semibold">${d.financial.processingFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-5 rounded-[12px] bg-white/10 p-4">
              <div className="text-xs text-white/75">Practitioner Payout</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">${d.financial.payout.toFixed(2)}</div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/75">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Payout scheduled for {d.financial.payoutDate}</span>
            </div>
          </div>

          <div className="figma-card p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">ADMINISTRATIVE ACTIONS</div>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)]"
              >
                <RotateCcw className="h-4 w-4 text-[var(--figma-brand)]" />
                Refund Session
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)]"
              >
                <FileWarning className="h-4 w-4 text-amber-600" />
                Mark as Disputed
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)]"
              >
                <StickyNote className="h-4 w-4 text-[var(--figma-brand)]" />
                Add Admin Note
              </button>
            </div>
          </div>

          <div className="figma-card bg-[var(--figma-input-bg)] p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">INTERNAL NOTES</div>
            <blockquote className="mt-3 border-l-2 border-[var(--figma-brand)] pl-4 text-sm leading-relaxed text-[var(--figma-text)]">
              “{d.adminNote}”
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  )
}
