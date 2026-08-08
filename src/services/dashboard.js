import { apiGet } from '../api/client'
import { withMockFallback } from '../api/mock'

// The API and these pages were built against different shapes, and the old fixture
// fallback hid that: any mismatch fell back to canned data instead of failing. Each
// fetch below maps the real response to what its page renders, so the adaptation lives
// at the boundary rather than being spread through components.

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** '2026-03' → 'MAR' */
function monthLabel(bucketMonth) {
  const index = Number(String(bucketMonth).split('-')[1]) - 1
  return MONTHS[index] ?? String(bucketMonth)
}

function relativeTime(iso) {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

/**
 * KPI cards.
 *
 * Money arrives in cents and is rendered by a formatter that expects a major-unit
 * amount, so it is divided here — otherwise $88.00 displays as $8,800.
 *
 * A null deltaPct means there is no comparable earlier period yet rather than zero
 * change, which is what "Data accumulating" is for.
 */
export async function fetchDashboardKpis() {
  const raw = await withMockFallback(
    () => apiGet('/admin/dashboard/kpis'),
    () => ({
      platformRevenue: { valueCents: 1248200, deltaPct: 12.4 },
      totalTransactions: { value: 6241, deltaPct: 4.8 },
      activeUsers: { value: 842, deltaPct: 1.2 },
      refunds: { value: 28, deltaPct: -0.9 },
    }),
    {},
  )

  const revenue = raw?.platformRevenue ?? {}
  const transactions = raw?.totalTransactions ?? {}
  const activeUsers = raw?.activeUsers ?? {}
  const refunds = raw?.refunds ?? {}

  return {
    platformRevenue: {
      value: (revenue.valueCents ?? 0) / 100,
      deltaPct: revenue.deltaPct ?? 0,
    },
    transactions: {
      value: transactions.value ?? 0,
      deltaPct: transactions.deltaPct ?? 0,
    },
    activeUsers: {
      value: activeUsers.value ?? 0,
      deltaPct: activeUsers.deltaPct ?? 0,
      accumulating: activeUsers.deltaPct === null || activeUsers.deltaPct === undefined,
    },
    refunds30d: {
      value: refunds.value ?? 0,
      deltaPct: refunds.deltaPct ?? 0,
    },
    periodDays: raw?.periodDays ?? 30,
  }
}

/**
 * Revenue chart. The API returns monthly buckets in cents; the chart draws each point
 * as a pixel height, so values are scaled to a fixed range relative to the tallest
 * bucket. Without that, a month of a few dollars and a month of thousands both render
 * as a flat line or overflow the container.
 */
export async function fetchDashboardRevenueTrend(months = 6) {
  const raw = await withMockFallback(
    () => apiGet('/admin/dashboard/revenue-trend', { months }),
    () => ({
      buckets: [
        { month: '2026-03', revenueCents: 280000 },
        { month: '2026-04', revenueCents: 340000 },
        { month: '2026-05', revenueCents: 460000 },
        { month: '2026-06', revenueCents: 400000 },
        { month: '2026-07', revenueCents: 580000 },
        { month: '2026-08', revenueCents: 780000 },
      ],
    }),
    { months },
  )

  const buckets = Array.isArray(raw?.buckets) ? raw.buckets : []
  const max = Math.max(1, ...buckets.map((b) => b.revenueCents ?? 0))
  const MAX_POINT = 100

  return {
    points: buckets.map((b) => Math.round(((b.revenueCents ?? 0) / max) * MAX_POINT)),
    labels: buckets.map((b) => monthLabel(b.month)),
    // Kept so a caller can show real amounts rather than the scaled heights.
    amountsCents: buckets.map((b) => b.revenueCents ?? 0),
  }
}

/**
 * Recently joined practitioners.
 *
 * This endpoint answers `{ success, count, windowDays, items }` — no `data` key — so it
 * is returned whole and the list is taken from `items`.
 *
 * It does not include a specialization, which the card has a slot for; that slot stays
 * empty rather than showing an invented value.
 */
export async function fetchNewJoinings() {
  const raw = await withMockFallback(
    () => apiGet('/admin/dashboard/new-joinings'),
    () => ({
      items: [
        { id: 'emma-thompson', name: 'Dr. Emma Reed', joinedAt: new Date().toISOString() },
        { id: 'james-sterling', name: 'Marcus Sterling', joinedAt: new Date().toISOString() },
      ],
    }),
    {},
  )

  const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : []

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    avatarUrl: item.avatarUrl ?? null,
    specialization: item.specialization ?? '',
    time: relativeTime(item.joinedAt),
  }))
}
