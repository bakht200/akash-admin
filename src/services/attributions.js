import { apiGet, apiPatch } from '../api/client'

/**
 * List invite attributions (Lane 1 / Lane 2).
 * @param {{ clientId?: string, practitionerId?: string }} [params]
 * @returns {Promise<{ attributions: Array, rejectedAttempts: Array }>}
 */
export function fetchAttributions(params = {}) {
  const query = {}
  if (params.clientId) query.clientId = params.clientId
  if (params.practitionerId) query.practitionerId = params.practitionerId
  return apiGet('/admin/attributions', Object.keys(query).length ? query : undefined)
}

/**
 * Admin override of attribution lane.
 * @param {string} id
 * @param {{ lane: 1 | 2, reason: string }} body
 */
export function patchAttribution(id, body) {
  return apiPatch(`/admin/attributions/${id}`, body)
}
