import { apiDownload, apiGet, apiPost } from '../api/client'

/** Platform-level all-time financial snapshot. */
export async function fetchAccountingSnapshot() {
  return apiGet('/admin/accounting/snapshot')
}

/**
 * Range-scoped platform revenue headline.
 * @param {{ range?: 7|30|90, from?: string, to?: string }} params
 */
export async function fetchRevenueSummary(params = { range: 30 }) {
  return apiGet('/admin/revenue/summary', normalizeRevenueParams(params))
}

/**
 * Per-day revenue series for charts + daily ledger.
 * @param {{ range?: 7|30|90, from?: string, to?: string }} params
 */
export async function fetchRevenueDailySeries(params = { range: 30 }) {
  return apiGet('/admin/revenue/daily-series', normalizeRevenueParams(params))
}

function normalizeRevenueParams(params = {}) {
  if (params.from && params.to) {
    return { from: params.from, to: params.to }
  }
  const range = Number(params.range ?? 30)
  return { range: [7, 30, 90].includes(range) ? range : 30 }
}

export async function fetchTransactions(params) {
  return apiGet('/admin/transactions', params)
}

export async function fetchTransactionKpis(params) {
  return apiGet('/admin/transactions/kpis', params)
}

/** Full money story for a ledger row. `type` is session_payment | refund | payout. */
export async function fetchTransactionDetail(type, id) {
  return apiGet(`/admin/transactions/${encodeURIComponent(type)}/${encodeURIComponent(id)}`)
}

export async function fetchPayouts(params) {
  return apiGet('/admin/payouts', params)
}

export async function fetchPayoutKpis(params) {
  return apiGet('/admin/payouts/kpis', params)
}

export async function fetchPayout(id) {
  return apiGet(`/admin/payouts/${encodeURIComponent(id)}`)
}

export async function exportPayoutsCsv(params) {
  return apiDownload('/admin/payouts/export.csv', params, 'payouts.csv')
}

/** Re-attempt a failed payout. Requires `payouts:retry`. */
export async function retryPayout(id, reason) {
  return apiPost(`/admin/payouts/${encodeURIComponent(id)}/retry`, reason ? { reason } : {})
}

export async function fetchWalletOverview() {
  return apiGet('/admin/wallet/overview')
}

/** @deprecated use fetchWalletOverview */
export async function fetchWalletBalance() {
  return fetchWalletOverview()
}

/**
 * Platform Stripe balance-transactions feed.
 * Cursor pagination: pass `starting_after` = previous `pagination.nextCursor`.
 * Envelope: `{ items, pagination: { limit, hasMore, nextCursor } }` (no total/page).
 */
export async function fetchWalletMovements(params = {}) {
  const query = { ...params }
  if (query.starting_after == null) delete query.starting_after
  return apiGet('/admin/wallet/movements', query)
}

export async function fetchHealth() {
  return apiGet('/health')
}
