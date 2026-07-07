import { apiGet } from '../api/client'
import { withMockFallback } from '../api/mock'

export async function fetchRevenueSummary(params) {
  return withMockFallback(
    () => apiGet('/admin/financials/revenue', params),
    () => ({
      platformRevenue: 142500,
      totalProcessed: 428000,
      monthlyGrowth: 18.2,
      runRateAnnualized: 1800000,
    }),
    params,
  )
}

export async function fetchTransactions(params) {
  return withMockFallback(
    () => apiGet('/admin/financials/transactions', params),
    () => ({
      items: [],
      total: 0,
      health: { status: 'ok', label: 'Core services liveness' },
    }),
    params,
  )
}

export async function fetchPayouts(params) {
  return withMockFallback(() => apiGet('/admin/financials/payouts', params), () => ({ items: [], total: 0 }), params)
}

export async function fetchWalletBalance() {
  return withMockFallback(
    () => apiGet('/admin/financials/wallet/balance'),
    () => ({
      available: 842010.15,
      pending: 442582.27,
      reservedHealerLiability: 310200,
      fetchedAt: new Date().toISOString(),
      stripeReachable: true,
    }),
    {},
  )
}

export async function fetchWalletMovements(params) {
  return withMockFallback(() => apiGet('/admin/financials/wallet/movements', params), () => ({ items: [], total: 0 }), params)
}

export async function fetchHealth() {
  return withMockFallback(
    () => apiGet('/health'),
    () => ({ status: 'ok', label: 'Core services liveness' }),
    {},
  )
}
