/** Same short ticket number the server puts on practitioner email and notifications. */
export function formatSupportTicketNumber(ticketId) {
  const hex = String(ticketId || '').replace(/-/g, '').toUpperCase()
  if (hex.length < 8) return ''
  return `#${hex.slice(0, 8)}`
}

export function getSupportTicketNumber(ticket) {
  return ticket?.ticketNumber || formatSupportTicketNumber(ticket?.id)
}
