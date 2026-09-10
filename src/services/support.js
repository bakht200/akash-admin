import { apiGet, apiPost } from '../api/client'

export async function fetchSupportTicket(id) {
  const response = await apiGet(`/admin/support/tickets/${id}`)
  return response?.data ?? response
}

export async function sendSupportReply(id, message) {
  const response = await apiPost(`/admin/support/tickets/${id}/replies`, { message })
  return response?.data ?? response
}
