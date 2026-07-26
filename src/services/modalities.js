import { apiDownload, apiGet, apiPatch, apiPost } from '../api/client'

export async function fetchModalities(params) {
  return apiGet('/admin/modalities', params)
}

export async function fetchModalityStats() {
  return apiGet('/admin/modalities/stats')
}

export async function fetchModalityMatrix(params = { period: 30 }) {
  return apiGet('/admin/modalities/matrix', params)
}

export async function fetchModalityTrend(params = { period: 30 }) {
  return apiGet('/admin/modalities/trend', params)
}

export async function fetchModalityActivity(params) {
  return apiGet('/admin/modalities/activity', params)
}

export async function exportModalitiesCsv(params) {
  return apiDownload('/admin/modalities/export.csv', params, 'modalities.csv')
}

export async function requestModalityIconUploadUrl(contentType) {
  return apiPost('/admin/modalities/icon-upload-url', { contentType })
}

export async function createModality(payload) {
  return apiPost('/admin/modalities', payload)
}

export async function updateModality(id, payload) {
  return apiPatch(`/admin/modalities/${id}`, payload)
}

/** Upload file to a presigned S3 URL, then return the publicUrl for create/edit. */
export async function uploadModalityIcon(file) {
  const { uploadUrl, publicUrl } = await requestModalityIconUploadUrl(file.type || 'image/png')
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'image/png' },
    body: file,
  })
  if (!res.ok) {
    throw new Error(`Icon upload failed (${res.status})`)
  }
  return publicUrl
}
