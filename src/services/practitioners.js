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

export async function reviewIdentityVerification(id, { action, reason } = {}) {
  return apiPatch(`/admin/practitioners/${id}/identity-verification`, {
    action,
    ...(reason ? { reason } : {}),
  })
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

/**
 * Standing = late session changes (inside 12h of start) over a rolling 90 days.
 * Returns `{ standing, lateChanges }`; `lateChanges` includes non-counting rows
 * too, because the pattern matters as much as the score.
 */
export async function fetchPractitionerStanding(id) {
  return apiGet(`/admin/practitioners/${id}/standing`)
}

/** Practitioners whose standing crossed the review threshold and is still open. */
export async function fetchStandingQueue(params) {
  return apiGet('/admin/practitioners/standing/queue', params)
}

/**
 * Close out a standing review. This records the decision only — it never
 * suspends the account, which stays a separate deliberate action.
 */
export async function resolveStandingReview(id, note) {
  return apiPost(`/admin/practitioners/${id}/standing/resolve`, note ? { note } : {})
}
