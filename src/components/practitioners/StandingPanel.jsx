import { Link } from 'react-router-dom'
import { AlertTriangle, MessageSquare } from 'lucide-react'
import {
  changeReasonLabel,
  formatAdminDateTime,
  formatShortUuid,
  standingLevelClass,
  standingLevelLabel,
} from '../../lib/display'

/**
 * Practitioner standing: the rolling-90-day count of late session changes plus
 * the history behind it.
 *
 * Two things are deliberate here. The history shows non-counting rows as well,
 * because the pattern is what an admin is judging and a run of "emergencies" is
 * exactly what a counting-only table would hide. And `CLIENT_REQUESTED` rows
 * link to the pair's chat thread, since that claim is the practitioner's own
 * and the thread is the only place to check it.
 *
 * Resolving a review records the decision and nothing else — suspension stays a
 * separate, deliberate action, because v2 has no automated enforcement.
 *
 * @param {object} props
 * @param {object|null} props.standing - Summary from GET /admin/practitioners/:id/standing
 * @param {Array} props.lateChanges - Late-change history rows
 * @param {boolean} props.loading
 * @param {string} [props.error]
 * @param {boolean} [props.canWrite] - Whether the admin may resolve a review
 * @param {boolean} [props.busy]
 * @param {() => void} [props.onResolve]
 */
export default function StandingPanel({
  standing,
  lateChanges = [],
  loading,
  error,
  canWrite = false,
  busy = false,
  onResolve,
}) {
  if (loading) {
    return (
      <div className="figma-card p-6 text-sm text-[var(--figma-text-muted)]">Loading standing…</div>
    )
  }

  if (error) {
    return <div className="figma-card p-6 text-sm text-rose-700">{error}</div>
  }

  if (!standing) return null

  const { countingCount, warnThreshold, reviewThreshold, windowDays, level, reviewOpen } = standing
  const progress = Math.min(100, Math.round((countingCount / reviewThreshold) * 100))

  return (
    <div className="figma-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--figma-stroke)] px-5 py-4 sm:px-6">
        <div>
          <div className="text-sm font-semibold text-[var(--figma-text-strong)]">Standing</div>
          <div className="text-xs text-[var(--figma-text-muted)]">
            Late session changes over the last {windowDays} days
          </div>
        </div>
        <span
          className={['inline-flex rounded-full px-3 py-1 text-[11px] font-semibold', standingLevelClass(level)].join(
            ' ',
          )}
        >
          {standingLevelLabel(level).toUpperCase()}
        </span>
      </div>

      {reviewOpen ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--figma-stroke)] bg-rose-50/70 px-5 py-4 sm:px-6">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" />
            <div className="text-sm text-rose-900">
              <div className="font-semibold">Standing review open</div>
              <div className="mt-1 text-rose-800">
                Flagged {standing.reviewFlaggedAt ? formatAdminDateTime(standing.reviewFlaggedAt) : '—'} at{' '}
                {countingCount} counting late changes. Resolving records your decision; it does not suspend the
                account.
              </div>
            </div>
          </div>
          {canWrite ? (
            <button
              type="button"
              onClick={onResolve}
              disabled={busy}
              className="inline-flex h-9 items-center rounded-[10px] bg-[var(--figma-brand)] px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              Resolve review
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
        <Metric label="Counting late changes" value={countingCount} />
        <Metric label="Warn / review at" value={`${warnThreshold} / ${reviewThreshold}`} />
        <Metric
          label="Non-counting late changes"
          value={`${standing.exemptCount} of ${standing.exemptAllowance} allowed`}
        />
      </div>

      <div className="px-5 pb-5 sm:px-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--figma-stroke)]">
          <div
            className={[
              'h-full rounded-full',
              level === 'review' ? 'bg-rose-500' : level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500',
            ].join(' ')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {standing.reviewedAt ? (
        <div className="border-t border-[var(--figma-stroke)] px-5 py-4 text-sm text-[var(--figma-text-muted)] sm:px-6">
          Last reviewed {formatAdminDateTime(standing.reviewedAt)}
          {standing.reviewNote ? ` — “${standing.reviewNote}”` : ''}
        </div>
      ) : null}

      <div className="border-t border-[var(--figma-stroke)]">
        <div className="px-5 py-4 text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)] sm:px-6">
          LATE CHANGES ({windowDays}D)
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="min-w-[860px] w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--figma-stroke)]">
                {['Session', 'Change', 'Original time', 'New time', 'Reason', 'Counts'].map((h) => (
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
              {lateChanges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-sm text-[var(--figma-text-muted)] sm:px-6">
                    No late changes in the last {windowDays} days.
                  </td>
                </tr>
              ) : (
                lateChanges.map((row) => (
                  <tr key={row.sessionId} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                    <td className="px-5 py-4 text-sm sm:px-6">
                      <Link
                        to={`/sessions/${encodeURIComponent(row.sessionId)}`}
                        className="font-semibold text-[var(--figma-brand)] hover:underline"
                      >
                        {formatShortUuid(row.sessionId)}
                      </Link>
                      <div className="text-xs text-[var(--figma-text-muted)]">{row.client?.name || '—'}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                      <div className="capitalize">{row.changeType}</div>
                      <div className="text-xs text-[var(--figma-text-muted)]">
                        {row.changedAt ? formatAdminDateTime(row.changedAt) : '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                      {row.originalStartUtc ? formatAdminDateTime(row.originalStartUtc) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                      {row.changeType === 'cancel'
                        ? '—'
                        : row.newStartUtc
                          ? formatAdminDateTime(row.newStartUtc)
                          : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                      <div>{row.reasonLabel || changeReasonLabel(row.reasonCode)}</div>
                      {row.reasonText ? (
                        <div className="mt-0.5 text-xs text-[var(--figma-text-muted)]">{row.reasonText}</div>
                      ) : null}
                      {/* This claim is the practitioner's own and skips client
                          approval, so point the reviewer at the session, where
                          the chat thread id is shown. */}
                      {row.reasonCode === 'CLIENT_REQUESTED' ? (
                        <Link
                          to={`/sessions/${encodeURIComponent(row.sessionId)}`}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--figma-brand)] hover:underline"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Verify claim
                        </Link>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <span
                        className={[
                          'inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold',
                          row.countsAgainstStanding
                            ? 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80'
                            : 'bg-slate-100 text-slate-700',
                        ].join(' ')}
                      >
                        {row.countsAgainstStanding ? 'YES' : 'NO'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-[12px] border border-[var(--figma-stroke)] p-4">
      <div className="text-xs text-[var(--figma-text-muted)]">{label}</div>
      <div className="mt-1 text-xl font-semibold text-[var(--figma-text-strong)]">{value}</div>
    </div>
  )
}
