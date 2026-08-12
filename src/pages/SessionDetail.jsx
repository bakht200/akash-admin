import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Eye, RotateCcw, Video } from 'lucide-react'
import ReasonModal from '../components/modals/ReasonModal'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import {
  formatAdminDateTime,
  formatCents,
  formatShortUuid,
  personName,
  sessionStatusClass,
  sessionStatusLabel,
} from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'
import { fetchSession, refundSession } from '../services/sessions'

function Avatar({ name, className = 'h-12 w-12 text-sm' }) {
  const parts = String(name || '')
    .replace(/Dr\.\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
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

export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const perms = usePermissions()
  const [d, setD] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refundOpen, setRefundOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setD(await fetchSession(id))
    } catch (err) {
      setError(err)
      setD(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading session…" />
  if (error) return <ErrorState message={getErrorMessage(error, 'Could not load session.')} onRetry={load} />
  if (!d) return <ErrorState message="Session not found." />

  const status = d.status ?? d.overviewStatus
  const client = d.client ?? {}
  const healer = d.healer ?? d.practitioner ?? {}
  const video = d.video ?? {}
  const financials = d.financials ?? {}
  const charge = financials.charge ?? {}
  const healerFin = financials.healer ?? {}
  const interactionLog = d.interactionLog ?? d.timeline ?? []
  const canRefundAction = status === 'confirmed' && perms.canRefund()

  async function onRefund(reason) {
    setBusy(true)
    setActionError('')
    try {
      await refundSession(id, reason)
      setRefundOpen(false)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--figma-text-muted)]">
            <Link to="/sessions" className="hover:text-[var(--figma-text)]">
              Sessions
            </Link>{' '}
            <span>›</span> <span className="text-[var(--figma-text-strong)]">#{formatShortUuid(d.id)}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">Session Detail</h1>
        </div>
      </div>

      {actionError ? (
        <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <ReasonModal
        open={refundOpen}
        title="Refund session"
        message="Cancels the confirmed session and issues a full refund via the standard pipeline."
        reasonLabel="Reason (optional)"
        reasonRequired={false}
        confirmLabel={busy ? 'Refunding…' : 'Refund'}
        onCancel={() => setRefundOpen(false)}
        onConfirm={onRefund}
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="figma-card overflow-hidden p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">OVERVIEW</div>
                <p className="mt-1 text-sm text-[var(--figma-text-muted)]">Session metadata, participants, and video join audit.</p>
              </div>
              <span className={['inline-flex rounded-full px-3 py-1 text-[11px] font-semibold', sessionStatusClass(status)].join(' ')}>
                {sessionStatusLabel(status).toUpperCase()}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Meta label="Session ID" value={formatShortUuid(d.id)} />
              <Meta label="Duration" value={d.durationMinutes != null ? `${d.durationMinutes} Minutes` : '—'} />
              <Meta
                label="Start"
                value={d.scheduledStartUtc ? formatAdminDateTime(d.scheduledStartUtc) : '—'}
              />
              <Meta label="End" value={d.scheduledEndUtc ? formatAdminDateTime(d.scheduledEndUtc) : '—'} />
              <Meta label="Modality" value={d.modality?.name || d.modality || '—'} />
            </div>
            {d.healerTimezone ? (
              <div className="mt-3 text-xs text-[var(--figma-text-muted)]">Healer timezone: {d.healerTimezone}</div>
            ) : null}

            <div className="mt-6 rounded-[12px] border border-[rgba(27,20,100,0.15)] bg-[rgba(27,20,100,0.06)] p-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-white text-[var(--figma-brand)] shadow-sm">
                  <Video className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-2 text-xs text-[var(--figma-text-muted)]">
                  <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Agora Video Room</div>
                  <div>
                    <span className="font-semibold">Room ID:</span>{' '}
                    <span className="font-mono text-[var(--figma-text)]">{video.roomId || '—'}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Healer joined:</span>{' '}
                    {video.healerJoinedAt ? formatAdminDateTime(video.healerJoinedAt) : '—'}
                  </div>
                  <div>
                    <span className="font-semibold">Client joined:</span>{' '}
                    {video.clientJoinedAt ? formatAdminDateTime(video.clientJoinedAt) : '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PersonCard
                label="CLIENT"
                person={client}
                onView={client.id ? () => navigate(`/clients/${encodeURIComponent(client.id)}`) : null}
              />
              <PersonCard
                label="PRACTITIONER"
                person={healer}
                onView={healer.id ? () => navigate(`/practitioners/${encodeURIComponent(healer.id)}`) : null}
              />
            </div>

            <div className="mt-8 border-t border-[var(--figma-stroke)] pt-6">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">INTERACTION LOG</div>
              <ul className="relative mt-4 space-y-0 border-l border-[var(--figma-stroke)] pl-6">
                {interactionLog.length === 0 ? (
                  <li className="text-sm text-[var(--figma-text-muted)]">No events.</li>
                ) : (
                  interactionLog.map((t, idx) => (
                    <li key={`${t.type || t.label}-${idx}`} className="relative pb-6 last:pb-0">
                      <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--figma-brand)]" />
                      <div className="text-sm font-semibold text-[var(--figma-text-strong)]">
                        {t.label || t.type || 'Event'}
                      </div>
                      <div className="text-xs text-[var(--figma-text-muted)]">
                        {t.at || t.when || t.createdAt ? formatAdminDateTime(t.at || t.when || t.createdAt) : '—'}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {d.cancellation ? (
              <div className="mt-6 rounded-[12px] border border-[var(--figma-stroke)] p-4 text-sm">
                <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">CANCELLATION</div>
                <div className="mt-2 text-[var(--figma-text)]">
                  Actor: <span className="font-semibold">{d.cancellation.actor || '—'}</span>
                  {d.cancellation.reason ? ` · ${d.cancellation.reason}` : ''}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="overflow-hidden rounded-[14px] bg-[var(--figma-brand)] p-6 text-white shadow-[0_12px_32px_rgba(27,20,100,0.18)]">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-white/75">FINANCIAL LEDGER</div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-2 border-b border-white/15 pb-2">
                <span className="text-white/80">Charged</span>
                <span className="font-semibold">{formatCents(charge.amountCents ?? d.totalChargedCents ?? d.feeCents)}</span>
              </div>
              {(healerFin.breakdown || []).map((row, idx) => (
                <div key={idx} className="flex justify-between gap-2 border-b border-white/15 pb-2">
                  <span className="text-white/80">{row.label || row.key}</span>
                  <span className="font-semibold">{formatCents(row.amountCents ?? row.cents)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[12px] bg-white/10 p-4">
              <div className="text-xs text-white/75">Healer net</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{formatCents(healerFin.netAmountCents)}</div>
              <div className="mt-2 text-xs text-white/75">
                Wallet: {healerFin.walletState || '—'}
              </div>
            </div>
          </div>

          <div className="figma-card p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">ADMINISTRATIVE ACTIONS</div>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                disabled={!canRefundAction || busy}
                onClick={() => setRefundOpen(true)}
                className="flex w-full items-center gap-3 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 py-3 text-left text-sm font-semibold text-[var(--figma-text-strong)] hover:bg-[var(--figma-input-bg)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4 text-[var(--figma-brand)]" />
                Refund Session
              </button>
              {!perms.canRefund() ? (
                <p className="text-xs text-[var(--figma-text-muted)]">Refunds require payments:refund (Finance / Super Admin).</p>
              ) : status !== 'confirmed' ? (
                <p className="text-xs text-[var(--figma-text-muted)]">Only confirmed, not-yet-started sessions can be refunded.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-wide text-[var(--figma-text-muted)]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--figma-text-strong)]">{value}</div>
    </div>
  )
}

function PersonCard({ label, person, onView }) {
  const name = personName(person)
  return (
    <div className="rounded-[12px] border border-[var(--figma-stroke)] bg-white p-4">
      <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">{label}</div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={name} />
          <div>
            <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{name}</div>
            <div className="text-xs text-[var(--figma-text-muted)]">{person.email || formatShortUuid(person.id)}</div>
          </div>
        </div>
        {onView ? (
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)]"
            aria-label={`View ${label.toLowerCase()}`}
            onClick={onView}
          >
            <Eye className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
