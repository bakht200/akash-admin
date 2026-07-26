import { apiDelete, apiDownload, apiGet, apiPatch, apiPost } from '../api/client'

export async function fetchPractitioners(params) {
  return apiGet('/admin/practitioners', params)
}

export async function fetchPractitioner(id) {
  return apiGet(`/admin/practitioners/${id}`)
}

export async function exportPractitionersCsv(params) {
  return apiDownload('/admin/practitioners/export.csv', params, 'practitioners.csv')
}

export async function moderatePractitioner(id, payload) {
  return apiPatch(`/admin/practitioners/${id}/moderate`, payload)
}

/** @deprecated use moderatePractitioner */
export async function updatePractitionerModeration(id, payload) {
  return moderatePractitioner(id, payload)
}

export async function suspendPractitioner(id, reason) {
  return apiPost(`/admin/practitioners/${id}/suspend`, { reason })
}

export async function reactivatePractitioner(id, reason) {
  return apiPost(`/admin/practitioners/${id}/reactivate`, reason ? { reason } : {})
}

export async function fetchCommissionOverride(id) {
  return apiGet(`/admin/practitioners/${id}/commission-override`)
}

export async function setCommissionOverride(id, { overrideRate, overrideExpiresAt }) {
  return apiPatch(`/admin/practitioners/${id}/commission-override`, {
    overrideRate,
    overrideExpiresAt,
  })
}

export async function clearCommissionOverride(id) {
  return apiDelete(`/admin/practitioners/${id}/commission-override`)
}
