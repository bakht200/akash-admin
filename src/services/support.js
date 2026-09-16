import { apiGet, apiPatch, apiPost } from '../api/client'

const SUPPORT_ATTACHMENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])

export async function fetchSupportTickets(params) {
  return apiGet('/admin/support/tickets', params)
}

export async function fetchSupportTicket(id) {
  const response = await apiGet(`/admin/support/tickets/${id}`)
  return response?.data ?? response
}

export async function sendSupportReply(id, { message, attachmentUrl } = {}) {
  const response = await apiPost(`/admin/support/tickets/${id}/replies`, {
    message: message || '',
    ...(attachmentUrl ? { attachmentUrl } : {}),
  })
  return response?.data ?? response
}

export async function createSupportTicket({ userId, subject, message, attachmentUrl }) {
  const response = await apiPost('/admin/support/tickets', {
    userId,
    subject,
    message,
    ...(attachmentUrl ? { attachmentUrl } : {}),
  })
  return response?.data ?? response
}

export async function requestSupportUploadUrl(contentType, userId) {
  return apiPost('/admin/support/upload-url', {
    contentType,
    ...(userId ? { userId } : {}),
  })
}

export async function uploadSupportAttachment(file, userId) {
  const contentType = SUPPORT_ATTACHMENT_TYPES.has(file.type) ? file.type : ''
  if (!contentType) {
    throw new Error('Attachments must be JPG, PNG, GIF, or PDF.')
  }
  const payload = await requestSupportUploadUrl(contentType, userId)
  const uploadUrl = payload?.uploadUrl
  const publicUrl = payload?.publicUrl || payload?.fileUrl
  if (!uploadUrl) throw new Error('Upload URL was not returned.')
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  })
  if (!res.ok) {
    throw new Error(`Attachment upload failed (${res.status})`)
  }
  return publicUrl
}

export async function fetchMessageTemplates({ includeInactive = false } = {}) {
  const response = await apiGet('/admin/support/message-templates', {
    includeInactive: includeInactive ? 'true' : 'false',
  })
  return Array.isArray(response) ? response : response?.data ?? []
}

export async function updateMessageTemplate(id, body) {
  const response = await apiPatch(`/admin/support/message-templates/${id}`, body)
  return response?.data ?? response
}
