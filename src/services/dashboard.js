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

/**
 * Client-side executive snapshot CSV (PDF report export is not available yet).
 * Pulls the same dashboard endpoints and downloads one file.
 */
export async function downloadDashboardReport({ period = '6m' } = {}) {
  const settled = await Promise.allSettled([
    fetchDashboardKpis(),
    fetchDashboardRevenueTrend(period),
    fetchDashboardRecentTransactions(50),
    fetchNewJoinings(),
  ])

  const kpis = settled[0].status === 'fulfilled' ? settled[0].value : null
  const trend = settled[1].status === 'fulfilled' ? settled[1].value : null
  const txnsPayload = settled[2].status === 'fulfilled' ? settled[2].value : null
  const joinPayload = settled[3].status === 'fulfilled' ? settled[3].value : null

  if (!kpis && !trend && !txnsPayload && !joinPayload) {
    const firstErr = settled.find((r) => r.status === 'rejected')?.reason
    throw firstErr || new Error('Could not load dashboard data for export.')
  }

  const lines = []
  const push = (row) => lines.push(row.map(csvCell).join(','))

  push(['Section', 'Field', 'Value'])

  if (kpis) {
    const revenue = kpis.platformRevenue
    const totalTx = kpis.totalTransactions
    const activeUsers = kpis.activeUsers
    const refunds = kpis.refunds
    push(['KPIs', 'Platform revenue (cents)', revenue?.valueCents ?? ''])
    push(['KPIs', 'Platform revenue delta %', revenue?.deltaPct ?? ''])
    push(['KPIs', 'Total transactions', totalTx?.value ?? ''])
    push(['KPIs', 'Transactions delta %', totalTx?.deltaPct ?? ''])
    push(['KPIs', 'Active users', activeUsers?.value ?? ''])
    push(['KPIs', 'Active users window (days)', activeUsers?.windowDays ?? ''])
    push(['KPIs', 'Active users delta %', activeUsers?.deltaPct ?? ''])
    push(['KPIs', 'Refunds count', refunds?.value ?? ''])
    push(['KPIs', 'Refunds delta %', refunds?.deltaPct ?? ''])
  }

  const series = trend?.series ?? trend?.items ?? (Array.isArray(trend) ? trend : [])
  for (const p of series) {
    push([
      'Revenue trend',
      p.month ?? p.label ?? '',
      p.revenueCents ?? p.platformRevenueCents ?? p.valueCents ?? 0,
    ])
  }

  const txns = txnsPayload?.items ?? (Array.isArray(txnsPayload) ? txnsPayload : [])
  for (const t of txns) {
    push([
      'Recent transactions',
      `${t.type || 'txn'}:${t.id || ''}`,
      t.amountCents ?? t.netCents ?? t.grossCents ?? '',
    ])
  }

  const joinings = joinPayload?.items ?? (Array.isArray(joinPayload) ? joinPayload : [])
  for (const a of joinings) {
    const name = [a.firstName, a.lastName].filter(Boolean).join(' ') || a.name || a.email || a.id
    push(['New joinings (7d)', name, a.createdAt ?? a.email ?? ''])
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function csvCell(value) {
  const s = value == null ? '' : String(value)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}
