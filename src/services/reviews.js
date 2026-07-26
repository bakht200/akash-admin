import { apiDownload, apiGet, apiPost } from '../api/client'

export async function fetchReviews(params) {
  return apiGet('/admin/reviews', params)
}

export async function fetchReviewKpis() {
  return apiGet('/admin/reviews/kpis')
}

export async function exportReviewsCsv(params) {
  return apiDownload('/admin/reviews/export.csv', params, 'reviews.csv')
}

export async function flagReview(id, reason) {
  return apiPost(`/admin/reviews/${id}/flag`, reason ? { reason } : {})
}

export async function resolveReviewFlags(id) {
  return apiPost(`/admin/reviews/${id}/resolve-flags`)
}

export async function hideReview(id) {
  return apiPost(`/admin/reviews/${id}/hide`)
}

export async function unhideReview(id) {
  return apiPost(`/admin/reviews/${id}/unhide`)
}
