import { apiGet } from '../api/client'
import { withMockFallback } from '../api/mock'

export async function fetchDashboardKpis() {
  return withMockFallback(
    () => apiGet('/admin/dashboard/kpis'),
    () => ({
      platformRevenue: { value: 12482, deltaPct: 12.4 },
      transactions: { value: 6241, deltaPct: 4.8 },
      activeUsers: { value: 842, deltaPct: 1.2, accumulating: false },
      refunds30d: { value: 28, deltaPct: -0.9 },
      newJoiningsThisWeek: 4,
    }),
    {},
  )
}

export async function fetchDashboardRevenueTrend(months = 6) {
  return withMockFallback(
    () => apiGet('/admin/dashboard/revenue-trend', { months }),
    () => ({ points: [28, 34, 46, 40, 58, 78], labels: ['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'] }),
    { months },
  )
}

export async function fetchNewJoinings() {
  return withMockFallback(
    () => apiGet('/admin/dashboard/new-joinings'),
    () => [
      { id: 'emma-thompson', name: 'Dr. Emma Reed', specialization: 'Trauma-informed Therapy', time: '2h ago' },
      { id: 'james-sterling', name: 'Marcus Sterling', specialization: 'Meditation & Breathwork', time: '5h ago' },
      { id: 'sarah-alfayed', name: 'Sarah Chen', specialization: 'Nutrition & Lifestyle', time: '1d ago' },
    ],
    {},
  )
}
