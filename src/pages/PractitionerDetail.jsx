import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, CircleSlash, GraduationCap, Power } from 'lucide-react'
import ReasonModal from '../components/modals/ReasonModal'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import {
  formatAdminDateTime,
  formatCents,
  formatShortUuid,
  personName,
  practitionerStatusClass,
  practitionerStatusLabel,
  sessionStatusClass,
  sessionStatusLabel,
} from '../lib/display'
import { getErrorMessage } from '../lib/errors'
import { usePermissions } from '../hooks/usePermissions'
import {
  clearCommissionOverride,
  fetchCommissionOverride,
  fetchPractitioner,
  moderatePractitioner,
  reactivatePractitioner,
  setCommissionOverride,
  suspendPractitioner,
} from '../services/practitioners'

export default function PractitionerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canWritePractitioners, canSuspendUsers, canOverrideCommission } = usePermissions()

  const [data, setData] = useState(null)
  const [override, setOverride] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [commissionOpen, setCommissionOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [detail, commission] = await Promise.all([
        fetchPractitioner(id),
        fetchCommissionOverride(id).catch(() => null),
      ])
      setData(detail)
      setOverride(commission)
    } catch (err) {
      setError(err)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingState label="Loading practitioner…" />
  if (error) return <ErrorState message={getErrorMessage(error, 'Could not load practitioner.')} onRetry={load} />
  if (!data) return <ErrorState message="Practitioner not found." />

  const profile = data.profile ?? data
  const name = personName(profile)
  const status = profile.status ?? data.status
  const training = data.trainingAndCertifications ?? {}
  const trainingItems = training.training ?? training.items ?? (Array.isArray(training) ? training : [])
  const certifications = training.certifications ?? []
  const ledger = data.performanceLedger ?? {}
  const recentSessions = data.recentSessions ?? []
  const reviews = data.reviews ?? []
  const specialties = profile.specializations ?? profile.specialties ?? []
  const isSuspended = status === 'suspended'

  async function onSuspend(reason) {
    setBusy(true)
    setActionError('')
    try {
      await suspendPractitioner(id, reason)
      setSuspendOpen(false)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onReactivate(reason) {
    setBusy(true)
    setActionError('')
    try {
      await reactivatePractitioner(id, reason)
      setReactivateOpen(false)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onModerate(payload) {
    setBusy(true)
    setActionError('')
    try {
      await moderatePractitioner(id, payload)
      setEditOpen(false)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onSaveCommission({ overrideRate, overrideExpiresAt }) {
    setBusy(true)
    setActionError('')
    try {
      await setCommissionOverride(id, { overrideRate, overrideExpiresAt })
      setCommissionOpen(false)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onClearCommission() {
    if (!window.confirm('Clear commission override?')) return
    setBusy(true)
    try {
      await clearCommissionOverride(id)
      await load()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--figma-text-muted)]">
            <button type="button" onClick={() => navigate('/practitioners')} className="hover:text-[var(--figma-text)]">
              Practitioners
            </button>{' '}
            <span>›</span> <span className="text-[var(--figma-text-strong)]">{name}</span>
          </div>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{name}</div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--figma-text-muted)]">
            <span>
              <span className="font-semibold">ID:</span> {formatShortUuid(profile.id ?? id)}
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--figma-stroke)]" />
            <span>
              <span className="font-semibold">Joined:</span>{' '}
              {profile.createdAt ? formatAdminDateTime(profile.createdAt) : '—'}
            </span>
            <span
              className={[
                'inline-flex items-center rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                practitionerStatusClass(status),
              ].join(' ')}
            >
              {practitionerStatusLabel(status).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {canWritePractitioners() ? (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-strong)] hover:bg-[rgba(244,243,241,0.7)]"
            >
              MODERATE
            </button>
          ) : null}
          {canOverrideCommission() ? (
            <button
              type="button"
              onClick={() => setCommissionOpen(true)}
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 text-[11px] font-semibold tracking-[0.14em]"
            >
              COMMISSION
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? (
        <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <ReasonModal
        open={suspendOpen}
        title="Suspend practitioner"
        message="Locks the account, refunds future confirmed sessions, and freezes payouts."
        confirmLabel={busy ? 'Suspending…' : 'Suspend'}
        onCancel={() => setSuspendOpen(false)}
        onConfirm={onSuspend}
      />
      <ReasonModal
        open={reactivateOpen}
        title="Reactivate practitioner"
        message="Restores access and unfreezes payouts. Reason is optional."
        reasonLabel="Reason (optional)"
        reasonRequired={false}
        confirmLabel={busy ? 'Reactivating…' : 'Reactivate'}
        onCancel={() => setReactivateOpen(false)}
        onConfirm={onReactivate}
      />
      <ModerateModal
        key={editOpen ? `mod-${id}` : 'mod-closed'}
        open={editOpen}
        profile={profile}
        specialties={specialties}
        busy={busy}
        onCancel={() => setEditOpen(false)}
        onSave={onModerate}
      />
      <CommissionModal
        key={commissionOpen ? `com-${id}` : 'com-closed'}
        open={commissionOpen}
        current={override}
        busy={busy}
        onCancel={() => setCommissionOpen(false)}
        onSave={onSaveCommission}
        onClear={onClearCommission}
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="figma-card p-5 sm:p-6">
            <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Professional Biography</div>
            <div className="mt-2 text-sm leading-relaxed text-[var(--figma-text)]">{profile.bio || '—'}</div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">SPECIALTIES</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Array.isArray(specialties) ? specialties : []).map((s) => {
                    const label = typeof s === 'string' ? s : s.name || s.title
                    const key = typeof s === 'string' ? s : s.id || label
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center rounded-[10px] bg-[var(--figma-input-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--figma-text)]"
                      >
                        {label}
                      </span>
                    )
                  })}
                  {!specialties?.length ? <span className="text-sm text-[var(--figma-text-muted)]">—</span> : null}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">PRICING</div>
                <div className="mt-2 text-lg font-semibold text-[var(--figma-text-strong)]">
                  {formatCents(profile.sessionPriceCents)}{' '}
                  <span className="text-xs font-semibold text-[var(--figma-text-muted)]">/ session</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[var(--figma-stroke)] pt-6">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-[var(--figma-brand)]">
                    <GraduationCap className="h-5 w-5" />
                    <span>Training</span>
                  </div>
                  <div className="mt-4 space-y-4">
                    {trainingItems.length ? (
                      trainingItems.map((e, idx) => (
                        <div key={e.id || e.title || idx}>
                          <div className="text-sm font-semibold text-[var(--figma-text-strong)]">
                            {e.title || e.name || e.program || 'Training'}
                          </div>
                          <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">
                            {e.meta || e.institution || e.details || ''}
                          </div>
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
                    {certifications.length ? (
                      certifications.map((c, idx) => (
                        <div key={c.id || c.name || idx} className="text-sm text-[var(--figma-text-strong)]">
                          {typeof c === 'string' ? c : c.name || c.title}
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

          <div className="figma-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 bg-white px-5 py-4 sm:px-6">
              <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Recent Sessions</div>
              <Link to="/sessions" className="text-xs font-semibold text-[var(--figma-brand)] hover:brightness-95">
                View All
              </Link>
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
                  {recentSessions.map((s) => (
                    <tr key={s.id || `${s.client}-${s.scheduledStartUtc}`} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--figma-text-strong)] sm:px-6">
                        {s.client?.id ? (
                          <Link to={`/clients/${s.client.id}`} className="text-[var(--figma-brand)] hover:underline">
                            {personName(s.client)}
                          </Link>
                        ) : (
                          personName(s.client) || s.clientName || '—'
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                        {s.scheduledStartUtc ? formatAdminDateTime(s.scheduledStartUtc) : s.date || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                        {s.modality?.name || s.modality || s.type || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold sm:px-6">
                        {formatCents(s.feeCents ?? s.totalChargedCents)}
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <span
                          className={[
                            'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                            sessionStatusClass(s.status),
                          ].join(' ')}
                        >
                          {sessionStatusLabel(s.status).toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentSessions.length === 0 ? (
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

        <div className="space-y-6 lg:col-span-4">
          <div className="overflow-hidden rounded-[14px] bg-[var(--figma-brand)] p-6 text-white shadow-[0_12px_32px_rgba(27,20,100,0.18)]">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-white/75">PERFORMANCE LEDGER</div>
            <div className="mt-5 rounded-[12px] bg-white/10 p-4">
              <div className="text-xs text-white/70">Practitioner Earnings</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">
                {formatCents(ledger.earningsCents ?? ledger.totalEarningsCents ?? ledger.earnings)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-[12px] bg-white/10 p-4">
                <div className="text-xs text-white/70">Total Sessions</div>
                <div className="mt-1 text-lg font-semibold">{ledger.totalSessions ?? ledger.sessions ?? profile.totalSessions ?? 0}</div>
              </div>
              <div className="rounded-[12px] bg-white/10 p-4">
                <div className="text-xs text-white/70">Avg Rating</div>
                <div className="mt-1 text-lg font-semibold">
                  {typeof (ledger.averageRating ?? profile.averageRating) === 'number'
                    ? (ledger.averageRating ?? profile.averageRating).toFixed(1)
                    : '—'}{' '}
                  <span className="text-[#F3E7C4]">★</span>
                </div>
              </div>
            </div>
            {override?.overrideRate != null ? (
              <div className="mt-4 rounded-[12px] bg-white/10 p-4 text-xs">
                Commission override: {(override.overrideRate * 100).toFixed(0)}% until{' '}
                {override.overrideExpiresAt ? formatAdminDateTime(override.overrideExpiresAt) : '—'}
              </div>
            ) : null}
          </div>

          <div className="figma-card p-5 sm:p-6">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--figma-text-muted)]">RECENT REVIEWS</div>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-[var(--figma-text-muted)]">No reviews.</p>
              ) : (
                reviews.map((rv, idx) => (
                  <div key={rv.id || idx} className="rounded-[12px] border border-[var(--figma-stroke)] bg-white px-4 py-3">
                    <div className="text-sm text-[#C79A2B]">{'★'.repeat(rv.rating ?? rv.stars ?? 0)}</div>
                    <div className="mt-2 text-sm text-[var(--figma-text)]">"{rv.body || rv.quote || rv.comment}"</div>
                    <div className="mt-2 text-xs font-semibold text-[var(--figma-text-muted)]">
                      {rv.client?.id ? (
                        <Link to={`/clients/${rv.client.id}`} className="text-[var(--figma-brand)] hover:underline">
                          {personName(rv.client)}
                        </Link>
                      ) : (
                        personName(rv.client) || rv.clientName || 'Client'
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {canSuspendUsers() ? (
            <div className="figma-card p-5 sm:p-6">
              <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--figma-text-muted)]">ADMINISTRATIVE CONTROL</div>
              <div className="mt-4 space-y-3">
                {!isSuspended ? (
                  <button
                    type="button"
                    onClick={() => setSuspendOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <CircleSlash className="h-4 w-4" />
                    Suspend Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReactivateOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                  >
                    <Power className="h-4 w-4" />
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function ModerateModal({ open, profile, specialties, busy, onCancel, onSave }) {
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '')
  const [unassignSpecializationId, setUnassignSpecializationId] = useState('')

  if (!open) return null

  const specs = (Array.isArray(specialties) ? specialties : []).filter((s) => typeof s === 'object' && s.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Moderate profile</h2>
        <p className="mt-1 text-sm text-[var(--figma-text-muted)]">Bio, avatar, or unassign a specialization. Never price.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold">
            Bio
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 h-24 w-full rounded-[10px] border px-3 py-2 text-sm font-normal" />
          </label>
          <label className="block text-sm font-semibold">
            Avatar URL
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal" placeholder="Leave blank to keep; type clear to remove" />
          </label>
          {specs.length ? (
            <label className="block text-sm font-semibold">
              Unassign specialization
              <select value={unassignSpecializationId} onChange={(e) => setUnassignSpecializationId(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal">
                <option value="">—</option>
                {specs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-[8px] px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const payload = { bio }
              if (avatarUrl === 'clear') payload.avatarUrl = null
              else if (avatarUrl !== (profile?.avatarUrl ?? '')) payload.avatarUrl = avatarUrl || undefined
              if (unassignSpecializationId) payload.unassignSpecializationId = unassignSpecializationId
              onSave(payload)
            }}
            className="rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CommissionModal({ open, current, busy, onCancel, onSave, onClear }) {
  const [ratePct, setRatePct] = useState(
    current?.overrideRate != null ? String(current.overrideRate * 100) : '20',
  )
  const [expires, setExpires] = useState(
    current?.overrideExpiresAt ? current.overrideExpiresAt.slice(0, 16) : '',
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Commission override</h2>
        <p className="mt-1 text-sm text-[var(--figma-text-muted)]">Rate must be greater than 0 and at most 28%. Expiry must be in the future.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold">
            Override rate (%)
            <input type="number" min="0.01" max="28" step="0.01" value={ratePct} onChange={(e) => setRatePct(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal" />
          </label>
          <label className="block text-sm font-semibold">
            Expires at
            <input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal" />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {current?.overrideRate != null ? (
            <button type="button" onClick={onClear} className="mr-auto rounded-[8px] px-4 py-2 text-sm font-semibold text-rose-700">
              Clear override
            </button>
          ) : null}
          <button type="button" onClick={onCancel} className="rounded-[8px] px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !ratePct || !expires}
            onClick={() =>
              onSave({
                overrideRate: Number(ratePct) / 100,
                overrideExpiresAt: new Date(expires).toISOString(),
              })
            }
            className="rounded-[8px] bg-[var(--figma-brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
