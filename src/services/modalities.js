import { apiGet, apiPatch, apiPost } from '../api/client'
import { withMockFallback } from '../api/mock'

const MOCK_MODALITIES = [
  { key: 'yoga', name: 'Yoga', description: 'Movement, breath, and alignment practices.', practitioners: 128 },
]

export async function fetchModalities() {
  return withMockFallback(() => apiGet('/admin/modalities'), () => MOCK_MODALITIES, {})
}

export async function updateModality(key, payload) {
  return withMockFallback(
    () => apiPatch(`/admin/modalities/${key}`, payload),
    () => ({ ok: true, key, ...payload }),
    { key, payload },
  )
}

export async function createModality(payload) {
  return withMockFallback(() => apiPost('/admin/modalities', payload), () => ({ ok: true, ...payload }), payload)
}
