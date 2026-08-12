import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client'

export async function fetchPromoCodes(params) {
  return apiGet('/admin/promo-codes', params)
}

export async function fetchPromoCode(id) {
  return apiGet(`/admin/promo-codes/${id}`)
}

export async function createPromoCode(payload) {
  return apiPost('/admin/promo-codes', payload)
}

export async function updatePromoCode(id, payload) {
  return apiPatch(`/admin/promo-codes/${id}`, payload)
}

export async function deletePromoCode(id) {
  return apiDelete(`/admin/promo-codes/${id}`)
}
