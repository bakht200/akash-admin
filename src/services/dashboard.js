import { apiGet } from '../api/client'

/** Four top KPI cards (fixed 30-day window). Requires financials:read. */
export async function fetchDashboardKpis() {
  return apiGet('/admin/dashboard/kpis')
}

/**
 * Monthly Platform Revenue Flow chart.
 * @param {string} period - `1m` | `3m` | `6m` | `12m` (default `6m`)
 */
export async function fetchDashboardRevenueTrend(period = '6m') {
  return apiGet('/admin/dashboard/revenue-trend', { period })
}

/** Newest rows of the Transactions union ledger. Requires financials:read. */
export async function fetchDashboardRecentTransactions(limit = 8) {
  return apiGet('/admin/dashboard/recent-transactions', { limit })
}

/** Practitioners who joined in the last 7 days. Requires practitioners:read. */
export async function fetchNewJoinings() {
  return apiGet('/admin/dashboard/new-joinings')
}
