import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchWalletMovements, fetchWalletOverview } from '../services/financials'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import { formatAdminDateTime, formatCents } from '../lib/display'
import { getErrorMessage } from '../lib/errors'

const MOVEMENT_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'charge', label: 'Charge' },
  { value: 'refund', label: 'Refund' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'payout', label: 'Payout' },
  { value: 'stripe_fee', label: 'Stripe fee' },
]

const STRIPE_OBJECT_BASE = import.meta.env.VITE_STRIPE_DASHBOARD_BASE?.replace(/\/connect\/transfers$/, '') || 'https://dashboard.stripe.com'

const LIMIT = 25

export default function Wallet() {
  const [overview, setOverview] = useState(null)
  const [overviewError, setOverviewError] = useState(null)
  const [overviewLoading, setOverviewLoading] = useState(true)

  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [movementsLoading, setMovementsLoading] = useState(true)
  const [movementsError, setMovementsError] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [type, setType] = useState('all')

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true)
    setOverviewError(null)
    try {
      setOverview(await fetchWalletOverview())
    } catch (err) {
      setOverviewError(err)
      setOverview(null)
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  const loadMovements = useCallback(
    async ({ append = false, startingAfter = null } = {}) => {
      if (append) setLoadingMore(true)
      else {
        setMovementsLoading(true)
        setMovementsError(null)
      }
      try {
        const res = await fetchWalletMovements({
          limit: LIMIT,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
          ...(type && type !== 'all' ? { type } : {}),
        })
        const nextItems = res?.items ?? []
        setItems((prev) => (append ? [...prev, ...nextItems] : nextItems))
        setHasMore(Boolean(res?.pagination?.hasMore))
        setCursor(res?.pagination?.nextCursor ?? null)
      } catch (err) {
        if (!append) {
          setMovementsError(err)
          setItems([])
          setHasMore(false)
          setCursor(null)
        } else {
          window.alert(getErrorMessage(err, 'Could not load more movements.'))
        }
      } finally {
        setMovementsLoading(false)
        setLoadingMore(false)
      }
    },
    [type],
  )

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  useEffect(() => {
    loadMovements({ append: false })
  }, [loadMovements])

  const total = overview?.totalPlatformBalance
  const available = overview?.availableForPayout
  const reserved = overview?.reservedFunds
  const isDrift = total?.status === 'drift'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-2xl">
          Wallet Overview
        </h1>
        <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
          Platform-level Stripe liquidity — not per-healer wallets. Reserved funds are a liability claim
          against the balance, not a separate bucket.
        </p>
      </div>

      {overviewLoading ? (
        <LoadingState label="Loading wallet overview…" />
      ) : overviewError ? (
        <ErrorState message={getErrorMessage(overviewError, 'Could not load wallet overview.')} onRetry={loadOverview} />
      ) : overview ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BalanceCard
            label="Total platform balance"
            primary={formatCents(total?.totalCents)}
            badge={
              <SyncBadge status={total?.status} deltaCents={total?.reconciliationDeltaCents} syncedAt={total?.syncedAt} />
            }
            lines={[
              { label: 'Available', value: formatCents(total?.availableCents) },
              { label: 'Pending', value: formatCents(total?.pendingCents) },
            ]}
            hint={overview.asOf ? `As of ${formatAdminDateTime(overview.asOf)}` : null}
            warn={isDrift}
          />
          <BalanceCard
            label="Available for payout"
            primary={formatCents(available?.cents)}
            lines={[
              {
                label: 'Sweepable (conservative)',
                value: formatCents(available?.sweepableConservativeCents),
              },
            ]}
            hint={
              available?.payoutSchedule
                ? `Next automatic payout: ${formatSchedule(available.payoutSchedule)}`
                : 'Platform account is manual — no automatic Stripe payout schedule'
            }
          />
          <BalanceCard
            label="Reserved funds (liability)"
            primary={formatCents(reserved?.totalCents)}
            lines={[
              { label: 'Active sessions', value: formatCents(reserved?.activeSessionsCents) },
              { label: 'Refund exposure', value: formatCents(reserved?.refundExposureCents) },
              {
                label: 'Practitioner available liability',
                value: formatCents(reserved?.practitionerAvailableLiabilityCents),
              },
            ]}
            hint="Liability against the platform balance — not a cash bucket"
          />
        </section>
      ) : null}

      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="text-base font-semibold text-[var(--figma-text-strong)]">Platform movements</div>
            <div className="text-xs text-[var(--figma-text-muted)]">
              Live Stripe balance-transactions (cursor pagination — no total count).
            </div>
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
          >
            {MOVEMENT_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {movementsLoading ? (
          <LoadingState label="Loading movements…" />
        ) : movementsError ? (
          <ErrorState
            message={getErrorMessage(movementsError, 'Could not load wallet movements.')}
            onRetry={() => loadMovements({ append: false })}
          />
        ) : items.length === 0 ? (
          <EmptyState title="No movements" description="Try a different type filter." />
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-[960px] w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                  {['When', 'Type', 'Description', 'Gross', 'Fee', 'Net', 'Status', 'Source'].map((h) => (
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
                {items.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                    <td className="px-4 py-3 text-sm">{m.createdAt ? formatAdminDateTime(m.createdAt) : '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{m.type || '—'}</td>
                    <td className="px-4 py-3 text-sm text-[var(--figma-text)]">{m.description || '—'}</td>
                    <td
                      className={[
                        'px-4 py-3 text-sm font-semibold',
                        m.direction === 'outflow' || Number(m.amountCents) < 0
                          ? 'text-rose-700'
                          : 'text-[var(--figma-brand)]',
                      ].join(' ')}
                    >
                      {formatSignedCents(m.amountCents)}
                    </td>
                    <td className="px-4 py-3 text-sm">{formatCents(m.feeCents)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{formatSignedCents(m.netCents)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={m.status} label={m.statusLabel} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {m.source ? (
                        <a
                          href={stripeObjectUrl(m.source)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--figma-brand)] hover:underline"
                        >
                          {m.source}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[var(--figma-stroke)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link to="/transactions" className="text-sm font-semibold text-[var(--figma-brand)] hover:underline">
            View all wallet history → Transactions
          </Link>
          {hasMore ? (
            <button
              type="button"
              disabled={loadingMore || !cursor}
              onClick={() => loadMovements({ append: true, startingAfter: cursor })}
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--figma-stroke)] bg-white px-4 text-sm font-semibold disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          ) : items.length > 0 ? (
            <span className="text-xs text-[var(--figma-text-muted)]">End of feed</span>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function BalanceCard({ label, primary, lines = [], hint, badge, warn }) {
  return (
    <div
      className={[
        'figma-card p-5 sm:p-6',
        warn ? 'ring-1 ring-amber-300' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">
          {label.toUpperCase()}
        </div>
        {badge}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{primary}</div>
      {lines.length ? (
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.label} className="flex justify-between gap-2">
              <span className="text-[var(--figma-text-muted)]">{l.label}</span>
              <span className="font-semibold">{l.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {hint ? <div className="mt-3 text-xs text-[var(--figma-text-muted)]">{hint}</div> : null}
    </div>
  )
}

function SyncBadge({ status, deltaCents, syncedAt }) {
  const ok = status === 'synchronized'
  return (
    <div className="text-right">
      <span
        className={[
          'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
          ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900',
        ].join(' ')}
      >
        {ok ? 'Synchronized' : 'Drift'}
      </span>
      {!ok && deltaCents != null ? (
        <div className="mt-1 text-[10px] text-amber-800">Δ {formatSignedCents(deltaCents)}</div>
      ) : null}
      {syncedAt ? (
        <div className="mt-1 text-[10px] text-[var(--figma-text-muted)]">{formatAdminDateTime(syncedAt)}</div>
      ) : null}
    </div>
  )
}

function StatusPill({ status, label }) {
  const key = status || label
  const tone =
    key === 'available' || key === 'completed'
      ? 'bg-emerald-50 text-emerald-800'
      : key === 'pending' || key === 'processing'
        ? 'bg-amber-50 text-amber-900'
        : 'bg-slate-100 text-slate-700'
  return (
    <span className={['inline-flex rounded-[10px] px-2.5 py-1 text-[11px] font-semibold', tone].join(' ')}>
      {(label || status || '—').replace(/_/g, ' ').toUpperCase()}
    </span>
  )
}

function formatSignedCents(cents) {
  const n = Number(cents)
  if (!Number.isFinite(n)) return '—'
  const abs = formatCents(Math.abs(n))
  if (n < 0) return `−${abs}`
  if (n > 0) return `+${abs}`
  return abs
}

function formatSchedule(schedule) {
  if (!schedule) return '—'
  if (typeof schedule === 'string') return schedule
  return schedule.interval || schedule.nextPayoutAt || JSON.stringify(schedule)
}

function stripeObjectUrl(source) {
  if (!source) return STRIPE_OBJECT_BASE
  // Stripe dashboard deep-links vary by object prefix; send admins to a search-friendly URL.
  return `${STRIPE_OBJECT_BASE}/search?query=${encodeURIComponent(source)}`
}
