import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Eye, MessageSquare, RotateCcw, Video } from 'lucide-react'
import ReasonModal from '../components/modals/ReasonModal'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import {
  changeReasonLabel,
  formatAdminDateTime,
  formatCents,
  formatShortUuid,
  personName,
  sessionStatusLabel,
  v2StatusClass,
  v2StatusLabel,
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
              {/* v2 status names who acted; the coarse v1 status is kept
                  underneath because filters and older tooling still speak it. */}
              <div className="text-right">
                <span
                  className={['inline-flex rounded-full px-3 py-1 text-[11px] font-semibold', v2StatusClass(d.v2Status, status)].join(' ')}
                >
                  {v2StatusLabel(d.v2Status, status).toUpperCase()}
                </span>
                {d.v2Status ? (
                  <div className="mt-1 text-[11px] text-[var(--figma-text-muted)]">{sessionStatusLabel(status)}</div>
                ) : null}
              </div>
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
            {/* Only set once a session has been moved, so it doubles as the
                signal that the Start above is not where this began. */}
            {d.originalStartUtc ? (
              <div className="mt-3 text-xs text-[var(--figma-text-muted)]">
                Originally scheduled for {formatAdminDateTime(d.originalStartUtc)}
              </div>
            ) : null}
            {d.healerTimezone ? (
              <div className="mt-1 text-xs text-[var(--figma-text-muted)]">Practitioner timezone: {d.healerTimezone}</div>
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
                    <span className="font-semibold">Practitioner joined:</span>{' '}
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
                        {t.label || eventLabel(t.type)}
                        {t.by ? <span className="font-normal text-[var(--figma-text-muted)]"> · {t.by}</span> : null}
                      </div>
                      <div className="text-xs text-[var(--figma-text-muted)]">
                        {t.at || t.when || t.createdAt ? formatAdminDateTime(t.at || t.when || t.createdAt) : '—'}
                      </div>
                      {t.reasonCode || t.lateChange || t.respondByUtc ? (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          {t.reasonCode ? (
                            <span className="rounded-[8px] bg-slate-100 px-2 py-0.5 text-slate-700">
                              {changeReasonLabel(t.reasonCode)}
                            </span>
                          ) : null}
                          {/* A change inside 12h of start is the whole reason
                              the reason code exists — call it out. */}
                          {t.lateChange ? (
                            <span className="rounded-[8px] bg-amber-50 px-2 py-0.5 text-amber-800">Inside 12h</span>
                          ) : null}
                          {t.countsAgainstStanding ? (
                            <span className="rounded-[8px] bg-rose-50 px-2 py-0.5 text-rose-800">Counts against standing</span>
                          ) : null}
                          {t.respondByUtc ? (
                            <span className="text-[var(--figma-text-muted)]">
                              Respond by {formatAdminDateTime(t.respondByUtc)}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      {t.reason ? (
                        <div className="mt-1 text-xs text-[var(--figma-text-muted)]">{t.reason}</div>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Covers reschedules as well as cancellations, and is the only
                place the reason code and standing verdict are shown. Clients
                never see any of this. */}
            {d.lastChange ? (
              <div className="mt-6 rounded-[12px] border border-[var(--figma-stroke)] p-4 text-sm">
                <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
                  LAST CHANGE (NOT VISIBLE TO CLIENT)
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <AuditRow label="Type" value={d.lastChange.type === 'cancel' ? 'Cancellation' : 'Reschedule'} />
                  <AuditRow label="By" value={d.lastChange.by || '—'} />
                  <AuditRow label="At" value={d.lastChange.at ? formatAdminDateTime(d.lastChange.at) : '—'} />
                  <AuditRow
                    label="Reason"
                    value={d.lastChange.reasonLabel || changeReasonLabel(d.lastChange.reasonCode)}
                  />
                  <AuditRow label="Inside 12h" value={d.lastChange.lateChange ? 'Yes' : 'No'} />
                  <AuditRow label="Counts against standing" value={d.lastChange.countsAgainstStanding ? 'Yes' : 'No'} />
                </div>
                {d.lastChange.reasonText ? (
                  <div className="mt-3 rounded-[10px] bg-slate-50 p-3 text-[var(--figma-text)]">
                    {d.lastChange.reasonText}
                  </div>
                ) : null}
                {/* "The client asked me to" is the one claim a practitioner can
                    make that skips client approval, and the chat thread is the
                    only place to check it. Admin has no message viewer yet, so
                    surface the thread id rather than link somewhere that 404s. */}
                {d.lastChange.reasonCode === 'CLIENT_REQUESTED' ? (
                  <div className="mt-3 flex items-start gap-1.5 text-xs text-[var(--figma-text-muted)]">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Practitioner claims the client asked for this. Verify in their chat thread
                      {d.conversationId ? (
                        <>
                          {' '}
                          (<span className="font-mono text-[var(--figma-text)]">{d.conversationId}</span>)
                        </>
                      ) : (
                        ' — no thread exists between them'
                      )}
                      .
                    </span>
                  </div>
                ) : null}
              </div>
            ) : d.cancellation ? (
              <div className="mt-6 rounded-[12px] border border-[var(--figma-stroke)] p-4 text-sm">
                <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">CANCELLATION</div>
                <div className="mt-2 text-[var(--figma-text)]">
                  Actor: <span className="font-semibold">{d.cancellation.actor || d.cancellation.by || '—'}</span>
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
              <div className="text-xs text-white/75">Practitioner net</div>
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

function AuditRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-[var(--figma-text-muted)]">{label}:</span>
      <span className="font-semibold text-[var(--figma-text)]">{value}</span>
    </div>
  )
}

const EVENT_LABELS = {
  booked: 'Booked',
  healer_joined: 'Practitioner joined',
  client_joined: 'Client joined',
  started: 'Started',
  healer_left: 'Practitioner left',
  client_left: 'Client left',
  ended: 'Ended',
  abandoned: 'Abandoned',
  cancelled: 'Cancelled',
  reschedule_requested: 'Reschedule requested',
  reschedule_approved: 'Reschedule accepted',
  reschedule_rejected: 'Reschedule declined',
  // The client never answered a late request, so the session auto-cancelled at
  // its original start time with a full refund.
  reschedule_expired: 'Reschedule expired — auto-cancelled',
}

function eventLabel(type) {
  if (!type) return 'Event'
  return EVENT_LABELS[type] ?? String(type).replace(/_/g, ' ').replace(/\b\w/, (c) => c.toUpperCase())
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
