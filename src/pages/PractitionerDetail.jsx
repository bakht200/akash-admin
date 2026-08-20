import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  Calendar,
  CircleSlash,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  Power,
  Star,
} from 'lucide-react'
import ReasonModal from '../components/modals/ReasonModal'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import IdentityVerificationPanel from '../components/practitioners/IdentityVerificationPanel'
import PractitionerAvatar from '../components/practitioners/PractitionerAvatar'
import { hasIdentityDocuments } from '../lib/identityVerification'
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
import {
  flattenPractitionerDetail,
  modalityLabel,
  collectCertifications,
  collectTraining,
  credentialLabel,
  credentialImageUrl,
} from '../lib/practitionerDetail'
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
  const { canWritePractitioners, canSuspendUsers, canOverrideCommission } = usePermissions()

  const [data, setData] = useState(null)
  const [override, setOverride] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [commissionOpen, setCommissionOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) setRefreshing(true)
      else {
        setLoading(true)
        setError(null)
      }
      try {
        const [detail, commission] = await Promise.all([
          fetchPractitioner(id),
          fetchCommissionOverride(id).catch(() => null),
        ])
        setData(detail)
        setOverride(commission)
      } catch (err) {
        if (!silent) {
          setError(err)
          setData(null)
        }
      } finally {
        if (silent) setRefreshing(false)
        else setLoading(false)
      }
    },
    [id],
  )

  useEffect(() => {
    load()
  }, [load])

  const identity = data?.identityVerification
  const expiresAt = identity?.documentUrlsExpireAt

  useEffect(() => {
    if (!expiresAt || !hasIdentityDocuments(identity)) return undefined

    const msUntilExpiry = new Date(expiresAt).getTime() - Date.now()
    if (msUntilExpiry <= 0) {
      load({ silent: true })
      return undefined
    }

    const refreshIn = Math.max(msUntilExpiry - 60_000, 5_000)
    const timer = window.setTimeout(() => load({ silent: true }), refreshIn)
    return () => window.clearTimeout(timer)
  }, [expiresAt, identity, load])

  if (loading) return <LoadingState label="Loading practitioner…" />
  if (error) return <ErrorState message={getErrorMessage(error, 'Could not load practitioner.')} onRetry={() => load()} />
  if (!data) return <ErrorState message="Practitioner not found." />

  const { profile, modalities, displayName: name } = flattenPractitionerDetail(data)
  const status = profile.status ?? data.status
  const trainingItems = collectTraining(data)
  const certifications = collectCertifications(data)
  const ledger = data.performanceLedger ?? {}
  const recentSessions = data.recentSessions ?? []
  const reviews = data.reviews ?? []
  const isSuspended = status === 'suspended'
  const rating = ledger.averageRating ?? profile.averageRating
  const totalSessions = ledger.totalSessions ?? ledger.sessions ?? profile.totalSessions ?? 0

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-[var(--figma-text-muted)]">
            <Link to="/practitioners" className="hover:text-[var(--figma-text)]">
              Practitioners
            </Link>{' '}
            <span>›</span> Practitioner Profile
          </div>

          <div className="figma-card mt-4 overflow-hidden">
            <div className="bg-gradient-to-br from-[rgba(27,20,100,0.04)] via-white to-[rgba(244,243,241,0.6)] p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                <PractitionerAvatar name={name} avatarUrl={profile.avatarUrl} className="h-24 w-24 text-2xl" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{name}</h1>
                    <span
                      className={[
                        'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                        practitionerStatusClass(status),
                      ].join(' ')}
                    >
                      {practitionerStatusLabel(status).toUpperCase()}
                    </span>
                    {identity?.status ? (
                      <span className="inline-flex rounded-[10px] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--figma-brand)] ring-1 ring-[var(--figma-stroke)]">
                        ID: {String(identity.status).replace(/_/g, ' ')}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-[var(--figma-text-muted)] sm:grid-cols-2">
                    <InfoRow icon={Mail} label={profile.email || '—'} />
                    <InfoRow
                      icon={Phone}
                      label={[profile.phoneCountryCode, profile.phone].filter(Boolean).join(' ') || '—'}
                    />
                    <InfoRow icon={MapPin} label={profile.countryOfPractice || profile.country || '—'} />
                    <InfoRow
                      icon={Hash}
                      label={formatShortUuid(profile.id ?? id)}
                      mono
                    />
                    <InfoRow
                      icon={Calendar}
                      label={`Joined ${profile.createdAt ? formatAdminDateTime(profile.createdAt) : '—'}`}
                    />
                    {(profile.lastActiveAt || data.lastActiveAt) ? (
                      <InfoRow
                        icon={Calendar}
                        label={`Last active ${formatAdminDateTime(profile.lastActiveAt || data.lastActiveAt)}`}
                      />
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
                      MODALITIES
                    </div>
                    <ModalityPills items={modalities} className="mt-2" />
                  </div>
                </div>

                <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3 lg:min-w-[240px]">
                  <QuickStat label="Session" value={formatCents(profile.sessionPriceCents)} />
                  <QuickStat
                    label="Rating"
                    value={
                      typeof rating === 'number' ? (
                        <span className="inline-flex items-center gap-1">
                          {rating.toFixed(1)}
                          <Star className="h-3.5 w-3.5 fill-[#C79A2B] text-[#C79A2B]" />
                        </span>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <QuickStat label="Sessions" value={Number(totalSessions ?? 0).toLocaleString()} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:pt-8">
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
        specialties={modalities}
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
        <div className="space-y-6 lg:col-span-8">
          <IdentityVerificationPanel
            identity={identity}
            refreshing={refreshing}
            onRefresh={() => load({ silent: true })}
          />

          <div className="figma-card p-5 sm:p-6">
            <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Professional Biography</div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--figma-text)]">{profile.bio || '—'}</p>

            <div className="mt-8 grid grid-cols-1 gap-8 border-t border-[var(--figma-stroke)] pt-6 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-base font-semibold text-[var(--figma-brand)]">
                  <GraduationCap className="h-5 w-5" />
                  <span>Training</span>
                </div>
                <div className="mt-4 space-y-3">
                  {trainingItems.length ? (
                    trainingItems.map((e, idx) => (
                      <CredentialCard
                        key={e.id || e.title || idx}
                        item={e}
                        fallbackLabel="Training"
                      />
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
                <div className="mt-4 space-y-3">
                  {certifications.length ? (
                    certifications.map((c, idx) => (
                      <CredentialCard
                        key={c.id || c.name || idx}
                        item={c}
                        fallbackLabel="Certification"
                      />
                    ))
                  ) : (
                    <div className="text-sm text-[var(--figma-text-muted)]">—</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="figma-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--figma-stroke)] bg-white px-5 py-4 sm:px-6">
              <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Recent Sessions</div>
              <Link to="/sessions" className="text-xs font-semibold text-[var(--figma-brand)] hover:brightness-95">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="min-w-[720px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--figma-stroke)]">
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
                    <tr
                      key={s.id || `${s.client}-${s.scheduledStartUtc}`}
                      className="border-b border-[var(--figma-stroke)] last:border-b-0"
                    >
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
                <div className="mt-1 text-lg font-semibold">
                  {ledger.totalSessions ?? ledger.sessions ?? profile.totalSessions ?? 0}
                </div>
              </div>
              <div className="rounded-[12px] bg-white/10 p-4">
                <div className="text-xs text-white/70">Reviews</div>
                <div className="mt-1 text-lg font-semibold">{profile.reviewCount ?? reviews.length ?? 0}</div>
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

function CredentialCard({ item, fallbackLabel }) {
  const [imgFailed, setImgFailed] = useState(false)
  const label = credentialLabel(item) || fallbackLabel
  const imageUrl = credentialImageUrl(item)
  const meta =
    typeof item === 'object'
      ? item.meta || item.institution || item.issuer || item.details || item.year || item.issuedAt
      : null

  return (
    <div className="overflow-hidden rounded-[12px] border border-[var(--figma-stroke)] bg-white">
      {imageUrl && !imgFailed ? (
        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block bg-[var(--figma-input-bg)]">
          <img
            src={imageUrl}
            alt={label}
            className="max-h-48 w-full object-contain object-center p-2"
            onError={() => setImgFailed(true)}
          />
        </a>
      ) : null}
      <div className="px-3 py-2.5">
        <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{label}</div>
        {meta ? <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">{String(meta)}</div> : null}
        {imageUrl && imgFailed ? (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold text-[var(--figma-brand)]">
            Open certificate
          </a>
        ) : null}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, mono = false }) {
  const IconComponent = icon
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <IconComponent className="h-4 w-4 shrink-0 text-[var(--figma-brand)]" />
      <span className={['truncate', mono ? 'font-mono text-xs text-[var(--figma-text-strong)]' : 'text-[var(--figma-text)]'].join(' ')}>
        {label}
      </span>
    </span>
  )
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded-[12px] border border-[var(--figma-stroke)] bg-white/90 px-3 py-2.5 text-center backdrop-blur-sm">
      <div className="text-[9px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)]">{label.toUpperCase()}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--figma-text-strong)]">{value}</div>
    </div>
  )
}

function ModalityPills({ items, className = '' }) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) {
    return <span className="text-sm text-[var(--figma-text-muted)]">—</span>
  }
  return (
    <div className={['flex flex-wrap gap-2', className].join(' ')}>
      {list.map((s) => {
        const label = modalityLabel(s)
        if (!label) return null
        const key = typeof s === 'string' ? s : s.id || s.specializationId || label
        return (
          <span
            key={key}
            className="inline-flex items-center rounded-full bg-[var(--figma-brand)]/10 px-3 py-1 text-[11px] font-semibold text-[var(--figma-brand)]"
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}

function ModerateModal({ open, profile, specialties, busy, onCancel, onSave }) {
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '')
  const [unassignSpecializationId, setUnassignSpecializationId] = useState('')

  if (!open) return null

  const specs = (Array.isArray(specialties) ? specialties : []).filter(
    (s) => typeof s === 'object' && (s.id || s.specializationId),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Moderate profile</h2>
        <p className="mt-1 text-sm text-[var(--figma-text-muted)]">Bio, avatar, or unassign a modality. Never price.</p>
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
              Unassign modality
              <select value={unassignSpecializationId} onChange={(e) => setUnassignSpecializationId(e.target.value)} className="mt-1 h-10 w-full rounded-[10px] border px-3 text-sm font-normal">
                <option value="">—</option>
                {specs.map((s) => (
                  <option key={s.id || s.specializationId} value={s.specializationId || s.id}>
                    {modalityLabel(s)}
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
