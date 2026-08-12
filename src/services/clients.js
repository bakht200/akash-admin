import { apiDelete, apiDownload, apiGet, apiPatch, apiPost } from '../api/client'

export async function fetchClients(params) {
  return apiGet('/admin/clients', params)
}

export async function fetchClient(id) {
  return apiGet(`/admin/clients/${id}`)
}

export async function updateClient(id, payload) {
  return apiPatch(`/admin/clients/${id}`, payload)
}

export async function suspendClient(id, reason) {
  return apiPost(`/admin/clients/${id}/suspend`, { reason })
}

export async function reactivateClient(id, reason) {
  return apiPost(`/admin/clients/${id}/reactivate`, reason ? { reason } : {})
}

export async function fetchClientMetrics() {
  return apiGet('/admin/clients/metrics')
}

export async function fetchClientNotes(id) {
  return apiGet(`/admin/clients/${id}/notes`)
}

export async function createClientNote(id, body) {
  return apiPost(`/admin/clients/${id}/notes`, { body })
}

export async function deleteClientNote(clientId, noteId) {
  return apiDelete(`/admin/clients/${clientId}/notes/${noteId}`)
}

export async function exportClientsCsv(params) {
  return apiDownload('/admin/clients/export.csv', params, 'clients.csv')
}

/** @deprecated use updateClient — kept for callers mid-migration */
export async function updateClientProfile(id, { firstName, lastName, phone, phoneCountryCode, name }) {
  const payload = {}
  if (firstName != null || lastName != null) {
    payload.firstName = firstName
    payload.lastName = lastName
  } else if (name) {
    const parts = String(name).trim().split(/\s+/)
    payload.firstName = parts[0] ?? ''
    payload.lastName = parts.slice(1).join(' ')
  }
  if (phone != null) payload.phone = phone
  if (phoneCountryCode != null) payload.phoneCountryCode = phoneCountryCode
  return updateClient(id, payload)
}
