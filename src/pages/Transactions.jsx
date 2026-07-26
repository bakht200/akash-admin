import { useCallback, useEffect, useState } from 'react'
import { Eye, X } from 'lucide-react'
import { usePaginatedList } from '../hooks/usePaginatedList'
import {
  fetchTransactionDetail,
  fetchTransactionKpis,
  fetchTransactions,
} from '../services/financials'
import LoadingState from '../components/states/LoadingState'
import ErrorState from '../components/states/ErrorState'
import EmptyState from '../components/states/EmptyState'
import Pagination from '../components/Pagination'
import { formatAdminDateTime, formatCents, formatShortUuid, personName } from '../lib/display'
import { getErrorMessage } from '../lib/errors'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'session_payment', label: 'Session payment' },
  { value: 'refund', label: 'Refund' },
  { value: 'payout', label: 'Payout' },
]

const STATUS_GROUP_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'success', label: 'Success' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

const RAW_STATUS_OPTIONS = [
  { value: '', label: 'Any raw status' },
  { value: 'succeeded', label: 'succeeded' },
  { value: 'completed', label: 'completed' },
  { value: 'refunded', label: 'refunded' },
  { value: 'partially_refunded', label: 'partially_refunded' },
  { value: 'refund_failed', label: 'refund_failed' },
  { value: 'pending', label: 'pending' },
  { value: 'processing', label: 'processing' },
  { value: 'failed', label: 'failed' },
]

export default function Transactions() {
  const [qInput, setQInput] = useState('')
  const [kpis, setKpis] = useState(null)
  const [kpisError, setKpisError] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const fetcher = useCallback((params) => fetchTransactions(params), [])
  const list = usePaginatedList(fetcher, {
    limit: 25,
    initialFilters: { type: 'all', statusGroup: 'all', status: '', q: '' },
  })

  useEffect(() => {
    const t = setTimeout(() => list.setFilters({ q: qInput.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchTransactionKpis()
        if (!cancelled) setKpis(data)
      } catch (err) {
        if (!cancelled) setKpisError(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function openDetail(row) {
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    try {
      const data = await fetchTransactionDetail(row.type, row.id)
      setDetail({ row, data })
    } catch (err) {
      setDetailError(getErrorMessage(err, 'Could not load transaction detail.'))
      setDetail({ row, data: null })
    } finally {
      setDetailLoading(false)
    }
  }

  function clearFilters() {
    setQInput('')
    list.replaceFilters({ type: 'all', statusGroup: 'all', status: '', q: '' })
  }

  const failedPct =
    kpis?.failedRate?.pct != null ? `${Number(kpis.failedRate.pct).toFixed(2)}%` : '—'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--figma-text-strong)] sm:text-2xl">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-[var(--figma-text-muted)]">
          Chronological ledger of session payments, refunds, and payouts. Amounts are signed (payments +,
          refunds/payouts −).
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpisError ? (
          <div className="figma-card p-5 md:col-span-3">
            <p className="text-sm text-rose-700">{getErrorMessage(kpisError, 'Could not load KPIs.')}</p>
          </div>
        ) : !kpis ? (
          <div className="figma-card p-5 md:col-span-3 text-sm text-[var(--figma-text-muted)]">Loading KPIs…</div>
        ) : (
          <>
            <Kpi
              label={`Stripe volume (${kpis.windowDays ?? 30}d)`}
              value={formatCents(kpis.stripeVolume30dCents)}
              hint="Gross succeeded client payments"
            />
            <Kpi
              label="Pending settlements"
              value={formatCents(kpis.pendingSettlementsCents)}
              hint="Payouts still pending / processing"
            />
            <Kpi
              label="Failed rate (30d)"
              value={failedPct}
              hint={`${kpis.failedRate?.failedCount ?? 0} / ${kpis.failedRate?.totalCount ?? 0} payments`}
            />
          </>
        )}
      </section>

      <section className="figma-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--figma-stroke)] bg-white px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search Stripe id, name, or id…"
              className="h-10 flex-1 rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] px-3 text-sm"
            />
            <select
              value={list.filters.type || 'all'}
              onChange={(e) => list.setFilters({ type: e.target.value })}
              className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={list.filters.statusGroup || 'all'}
              onChange={(e) => list.setFilters({ statusGroup: e.target.value })}
              className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
            >
              {STATUS_GROUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={list.filters.status || ''}
              onChange={(e) => list.setFilters({ status: e.target.value || undefined })}
              className="h-10 rounded-[10px] border border-[var(--figma-stroke)] bg-white px-3 text-sm font-medium"
            >
              {RAW_STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'any'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={clearFilters} className="text-sm font-semibold text-[var(--figma-brand)]">
              Clear
            </button>
          </div>
        </div>

        {list.loading ? (
          <LoadingState label="Loading transactions…" />
        ) : list.error ? (
          <ErrorState message={getErrorMessage(list.error, 'Could not load transactions.')} onRetry={list.reload} />
        ) : list.items.length === 0 ? (
          <EmptyState title="No transactions" description="Try adjusting filters or search." />
        ) : (
          <div className="overflow-x-auto bg-white">
            <table className="min-w-[1000px] w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--figma-stroke)] bg-[var(--figma-input-bg)]">
                  {['When', 'Type', 'Entity', 'Stripe ID', 'Amount', 'Status', ''].map((h) => (
                    <th
                      key={h || 'actions'}
                      className="px-4 py-3 text-left text-[11px] font-semibold tracking-[0.12em] text-[var(--figma-text-muted)] sm:px-6"
                    >
                      {h ? h.toUpperCase() : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.items.map((t) => (
                  <tr key={t.rowKey || `${t.type}:${t.id}`} className="border-b border-[var(--figma-stroke)] last:border-b-0">
                    <td className="px-4 py-4 text-sm text-[var(--figma-text)] sm:px-6">
                      {t.occurredAt ? formatAdminDateTime(t.occurredAt) : '—'}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium sm:px-6">{typeLabel(t.type)}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <div className="text-sm font-semibold text-[var(--figma-text-strong)]">
                        {personName(t.entity) || '—'}
                      </div>
                      <div className="text-xs text-[var(--figma-text-muted)]">{t.entity?.role || ''}</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-[var(--figma-text)] sm:px-6">
                      {t.stripeId || '—'}
                    </td>
                    <td
                      className={[
                        'px-4 py-4 text-sm font-semibold sm:px-6',
                        Number(t.amountCents) < 0 ? 'text-rose-700' : 'text-[var(--figma-brand)]',
                      ].join(' ')}
                    >
                      {formatSignedCents(t.amountCents)}
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <StatusPill group={t.statusGroup} status={t.status} />
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <button
                        type="button"
                        onClick={() => openDetail(t)}
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-[var(--figma-stroke)] bg-[var(--figma-input-bg)] text-[var(--figma-text-muted)] hover:bg-white"
                        aria-label="View transaction"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          limit={list.limit}
          onPageChange={list.setPage}
          label="transactions"
        />
      </section>

      <TransactionDetailDrawer
        open={Boolean(detail) || detailLoading}
        loading={detailLoading}
        error={detailError}
        detail={detail}
        onClose={() => {
          setDetail(null)
          setDetailError(null)
        }}
      />
    </div>
  )
}

function Kpi({ label, value, hint }) {
  return (
    <div className="figma-card p-5 sm:p-6">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">{label.toUpperCase()}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--figma-text-strong)]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-[var(--figma-text-muted)]">{hint}</div> : null}
    </div>
  )
}

function StatusPill({ group, status }) {
  const tone = {
    success: 'bg-emerald-50 text-emerald-800',
    in_progress: 'bg-sky-50 text-sky-800',
    pending: 'bg-amber-50 text-amber-900',
    failed: 'bg-rose-50 text-rose-800',
  }[group] || 'bg-slate-100 text-slate-700'

  return (
    <span className={['inline-flex flex-col gap-0.5 rounded-[10px] px-2.5 py-1 text-[11px] font-semibold', tone].join(' ')}>
      <span>{(group || 'unknown').replace(/_/g, ' ').toUpperCase()}</span>
      {status ? <span className="font-medium opacity-80">{status}</span> : null}
    </span>
  )
}

function typeLabel(type) {
  switch (type) {
    case 'session_payment':
      return 'Session payment'
    case 'refund':
      return 'Refund'
    case 'payout':
      return 'Payout'
    default:
      return type || '—'
  }
}

function formatSignedCents(cents) {
  const n = Number(cents)
  if (!Number.isFinite(n)) return '—'
  const abs = formatCents(Math.abs(n))
  if (n < 0) return `−${abs}`
  if (n > 0) return `+${abs}`
  return abs
}

function TransactionDetailDrawer({ open, loading, error, detail, onClose }) {
  if (!open) return null
  const row = detail?.row
  const data = detail?.data

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button type="button" className="flex-1 cursor-default" aria-label="Close" onClick={onClose} />
      <aside className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--figma-stroke)] px-5 py-4">
          <div>
            <div className="text-xs font-semibold text-[var(--figma-text-muted)]">TRANSACTION DETAIL</div>
            <div className="mt-1 text-lg font-semibold text-[var(--figma-text-strong)]">
              {row ? typeLabel(row.type) : '…'}
            </div>
            {row ? (
              <div className="mt-1 font-mono text-xs text-[var(--figma-text-muted)]">{formatShortUuid(row.id)}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--figma-input-bg)]"
            aria-label="Close detail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? <LoadingState label="Loading detail…" /> : null}
          {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
          {!loading && data ? <DetailBody type={row?.type} data={data} row={row} /> : null}
        </div>
      </aside>
    </div>
  )
}

function DetailBody({ type, data, row }) {
  if (type === 'payout') {
    const payout = data.payout ?? data
    const healer = data.healer ?? data.practitioner ?? payout.healer
    return (
      <div className="space-y-4 text-sm">
        <Section title="Payout">
          <Row label="Amount" value={formatSignedCents(payout.amountCents ?? row?.amountCents)} />
          <Row label="Status" value={payout.status || row?.status || '—'} />
          <Row label="Stripe" value={payout.stripeId || row?.stripeId || '—'} mono />
          {payout.failureReason ? <Row label="Failure" value={payout.failureReason} /> : null}
          <Row
            label="Occurred"
            value={row?.occurredAt ? formatAdminDateTime(row.occurredAt) : '—'}
          />
        </Section>
        <Section title="Practitioner">
          <Row label="Name" value={personName(healer)} />
          <Row label="ID" value={formatShortUuid(healer?.id)} mono />
        </Section>
      </div>
    )
  }

  const charge = data.charge ?? data.payment ?? data.financials?.charge ?? {}
  const refund = data.refund ?? data.financials?.refund
  const healer = data.financials?.healer ?? data.healerWallet ?? data.healer
  const session = data.session
  const promo = data.promo
  const serviceFee = data.serviceFee ?? data.clientServiceFee

  return (
    <div className="space-y-4 text-sm">
      <Section title="Charge">
        <Row label="Amount" value={formatCents(charge.amountCents ?? charge.totalCents)} />
        <Row label="Status" value={charge.status || '—'} />
        <Row label="Stripe" value={charge.stripeId || row?.stripeId || '—'} mono />
      </Section>
      {refund ? (
        <Section title="Refund">
          <Row label="Amount" value={formatSignedCents(-(refund.amountCents ?? Math.abs(row?.amountCents || 0)))} />
          <Row label="Status" value={refund.status || '—'} />
          <Row label="Stripe" value={refund.stripeId || '—'} mono />
        </Section>
      ) : null}
      {serviceFee ? (
        <Section title="Client service fee">
          <Row label="Amount" value={formatCents(serviceFee.amountCents ?? serviceFee)} />
        </Section>
      ) : null}
      {promo ? (
        <Section title="Promo">
          <Row label="Code" value={promo.code || '—'} />
          <Row label="Discount" value={formatCents(promo.discountCents ?? promo.amountCents)} />
          <Row label="Funded by" value={promo.fundedBy || '—'} />
        </Section>
      ) : null}
      {healer ? (
        <Section title="Healer wallet">
          <Row label="Session earning" value={formatCents(healer.sessionEarningCents ?? breakdownCents(healer, 'session'))} />
          <Row label="Commission" value={formatCents(healer.commissionCents ?? breakdownCents(healer, 'commission'))} />
          <Row label="Platform fee" value={formatCents(healer.platformFeeCents ?? breakdownCents(healer, 'platform'))} />
          <Row label="Net" value={formatCents(healer.netAmountCents)} />
          <Row label="Wallet state" value={healer.walletState || '—'} />
        </Section>
      ) : null}
      {session ? (
        <Section title="Session">
          <Row label="ID" value={formatShortUuid(session.id)} mono />
          <Row label="Status" value={session.status || '—'} />
          <Row
            label="Start"
            value={session.scheduledStartUtc ? formatAdminDateTime(session.scheduledStartUtc) : '—'}
          />
        </Section>
      ) : null}
      {!charge?.amountCents && !refund && !healer && !session ? (
        <pre className="overflow-x-auto rounded-[10px] bg-[var(--figma-input-bg)] p-3 text-[11px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
    </div>
  )
}

function breakdownCents(healer, kind) {
  const rows = healer?.breakdown
  if (!Array.isArray(rows)) return null
  const hit = rows.find((r) => {
    const key = String(r.key || r.label || '').toLowerCase()
    return key.includes(kind)
  })
  return hit?.amountCents ?? hit?.cents ?? null
}

function Section({ title, children }) {
  return (
    <div className="rounded-[12px] border border-[var(--figma-stroke)] p-4">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--figma-text-muted)]">{title.toUpperCase()}</div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[var(--figma-text-muted)]">{label}</span>
      <span className={['font-semibold text-[var(--figma-text-strong)] text-right', mono ? 'font-mono text-xs' : ''].join(' ')}>
        {value}
      </span>
    </div>
  )
}
