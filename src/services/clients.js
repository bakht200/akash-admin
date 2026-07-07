import { apiGet, apiPatch, apiPost } from '../api/client'
import { paginate, withMockFallback } from '../api/mock'
import { clientListRows, getClientRecordOrFallback } from '../data/clientData'

export async function fetchClients(params) {
  return withMockFallback(
    () => apiGet('/admin/clients', params),
    (p) => paginate(clientListRows, p),
    params,
  )
}

export async function fetchClient(id) {
  return withMockFallback(
    () => apiGet(`/admin/clients/${id}`),
    () => getClientRecordOrFallback(id),
    id,
  )
}

export async function suspendClient(id, reason) {
  return withMockFallback(
    () => apiPost(`/admin/clients/${id}/suspend`, { reason }),
    () => ({ ok: true, id, reason }),
    { id, reason },
  )
}

export async function reactivateClient(id) {
  return withMockFallback(
    () => apiPost(`/admin/clients/${id}/reactivate`),
    () => ({ ok: true, id }),
    id,
  )
}

export async function updateClientProfile(id, { name, phone }) {
  return withMockFallback(
    () => apiPatch(`/admin/clients/${id}`, { name, phone }),
    () => ({ ok: true, id, name, phone }),
    { id, name, phone },
  )
}

export async function fetchClientMetrics() {
  return withMockFallback(
    () => apiGet('/admin/clients/metrics'),
    () => ({
      churnRate: 2.4,
      churnLabel: '30-day inactivity rate',
      avgLtv: 1142,
      ltvLabel: 'Average total client spend',
      accumulating: false,
    }),
    {},
  )
}

export async function fetchClientActivity(clientId) {
  return withMockFallback(
    () => apiGet(`/admin/clients/${clientId}/activity`),
    () => [
      { type: 'booking', label: 'Marcus Chen booked a Yoga Session', when: '2 minutes ago' },
      { type: 'review', label: 'Elena Vasquez left a review', when: '1 hour ago' },
      { type: 'signup', label: 'Priya Nair signed up', when: '3 hours ago' },
    ],
    clientId,
  )
}
