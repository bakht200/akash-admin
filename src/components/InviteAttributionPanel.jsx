import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReasonModal from './modals/ReasonModal'
import {
  attributionLaneClass,
  attributionLaneLabel,
  attributionStatusClass,
  attributionStatusLabel,
  formatAdminDateTime,
  formatShortUuid,
  inviteAttemptReasonLabel,
  personName,
} from '../lib/display'

/**
 * Shows practitioner ↔ client invite attribution (Lane 1 / Lane 2).
 *
 * @param {'client' | 'practitioner'} props.perspective
 *   - client: who invited this client
 *   - practitioner: clients who used this practitioner's invite code
 * @param {Array} props.attributions
 * @param {Array} [props.rejectedAttempts] — only relevant on client perspective
 * @param {boolean} props.loading
 * @param {string} [props.error]
 * @param {boolean} [props.canWrite]
 * @param {boolean} [props.busy]
 * @param {(id: string, lane: 1 | 2, reason: string) => Promise<void>} [props.onChangeLane]
 */
export default function InviteAttributionPanel({
  perspective = 'client',
  attributions = [],
  rejectedAttempts = [],
  loading,
  error,
  canWrite = false,
  busy = false,
  onChangeLane,
}) {
  const [laneModal, setLaneModal] = useState(null) // { id, nextLane }

  if (loading) {
    return (
      <div className="figma-card p-6 text-sm text-[var(--figma-text-muted)]">Loading invite attribution…</div>
    )
  }

  if (error) {
    return <div className="figma-card p-6 text-sm text-rose-700">{error}</div>
  }

  const isClientView = perspective === 'client'
  const title = isClientView ? 'Invite attribution' : 'Invited clients'
  const subtitle = isClientView
    ? 'Practitioner this client signed up with via invite code'
    : 'Clients who applied this practitioner’s invite code'
  const counterpartyHeader = isClientView ? 'Practitioner' : 'Client'

  return (
    <div className="figma-card overflow-hidden">
      <div className="border-b border-[var(--figma-stroke)] px-5 py-4 sm:px-6">
        <div className="text-sm font-semibold text-[var(--figma-text-strong)]">{title}</div>
        <div className="text-xs text-[var(--figma-text-muted)]">{subtitle}</div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="min-w-[720px] w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--figma-stroke)]">
              {[counterpartyHeader, 'Code', 'Lane', 'Status', 'Applied', ...(canWrite ? [''] : [])].map((h, i) => (
                <th
                  key={`${h}-${i}`}
                  className="px-5 py-3 text-left text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)] sm:px-6"
                >
                  {h ? h.toUpperCase() : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributions.length === 0 ? (
              <tr>
                <td
                  colSpan={canWrite ? 6 : 5}
                  className="px-5 py-8 text-sm text-[var(--figma-text-muted)] sm:px-6"
                >
                  {isClientView
                    ? 'No invite code applied — this client is not attributed to a practitioner.'
                    : 'No clients have used this practitioner’s invite code yet.'}
                </td>
              </tr>
            ) : (
              attributions.map((row) => {
                const person = isClientView ? row.practitioner : row.client
                const personId = isClientView ? row.practitionerId : row.clientId
                const href = isClientView
                  ? `/practitioners/${encodeURIComponent(personId)}`
                  : `/clients/${encodeURIComponent(personId)}`
                const nextLane = row.lane === 1 ? 2 : 1

                return (
                  <tr key={row.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                    <td className="px-5 py-4 text-sm sm:px-6">
                      <Link
                        to={href}
                        className="font-semibold text-[var(--figma-brand)] hover:underline"
                      >
                        {personName(person)}
                      </Link>
                      <div className="text-xs text-[var(--figma-text-muted)]">
                        {person?.email || formatShortUuid(personId)}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-[var(--figma-text-strong)] sm:px-6">
                      {row.referralCodeUsed || '—'}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <span
                        className={[
                          'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                          attributionLaneClass(row.lane),
                        ].join(' ')}
                      >
                        {attributionLaneLabel(row.lane)}
                      </span>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <span
                        className={[
                          'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                          attributionStatusClass(row.status),
                        ].join(' ')}
                      >
                        {attributionStatusLabel(row.status)}
                      </span>
                      {row.reassignmentReason ? (
                        <div className="mt-1 max-w-[220px] text-xs text-[var(--figma-text-muted)]">
                          {row.reassignmentReason}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                      {row.createdAt ? formatAdminDateTime(row.createdAt) : '—'}
                    </td>
                    {canWrite ? (
                      <td className="px-5 py-4 text-right sm:px-6">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setLaneModal({ id: row.id, nextLane })}
                          className="text-xs font-semibold text-[var(--figma-brand)] hover:underline disabled:opacity-50"
                        >
                          Move to Lane {nextLane}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {isClientView && rejectedAttempts.length > 0 ? (
        <div className="border-t border-[var(--figma-stroke)]">
          <div className="px-5 py-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)] sm:px-6">
            REJECTED CODE ATTEMPTS
          </div>
          <div className="overflow-x-auto bg-white">
            <table className="min-w-[520px] w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)]">
                  {['Code tried', 'Reason', 'When'].map((h) => (
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
                {rejectedAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                    <td className="px-5 py-3 font-mono text-sm sm:px-6">{attempt.codeAttempted}</td>
                    <td className="px-5 py-3 text-sm text-[var(--figma-text)] sm:px-6">
                      {inviteAttemptReasonLabel(attempt.reason)}
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--figma-text-muted)] sm:px-6">
                      {attempt.createdAt ? formatAdminDateTime(attempt.createdAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <ReasonModal
        key={laneModal ? `lane-${laneModal.id}-${laneModal.nextLane}` : 'lane-closed'}
        open={Boolean(laneModal)}
        title={`Move to Lane ${laneModal?.nextLane ?? ''}`}
        message={
          laneModal?.nextLane === 1
            ? 'Sets this client–practitioner pair to Lane 1 (invite commission). Requires a reason for the audit log.'
            : 'Sets this client–practitioner pair to Lane 2 (Akash commission). Requires a reason for the audit log.'
        }
        confirmLabel={busy ? 'Saving…' : `Move to Lane ${laneModal?.nextLane ?? ''}`}
        onCancel={() => setLaneModal(null)}
        onConfirm={async (reason) => {
          if (!laneModal || !onChangeLane) return
          await onChangeLane(laneModal.id, laneModal.nextLane, reason)
          setLaneModal(null)
        }}
      />
    </div>
  )
}
