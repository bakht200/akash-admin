/** Shared display conventions (FR-7 foundation). */

const SESSION_STATUS_LABELS = {
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

const CLIENT_STATUS_LABELS = {
  active: 'Active',
  suspended: 'Suspended',
  dormant: 'Dormant (30d+)',
}

const PRACTITIONER_STATUS_LABELS = {
  active: 'Active',
  suspended: 'Suspended',
  dormant: 'Dormant (30d+)',
  onboarding_incomplete: 'Onboarding Incomplete',
}

/** Normalize legacy mock statuses to backend vocabulary. */
export function normalizeSessionStatus(status) {
  const key = String(status ?? '')
    .toLowerCase()
    .replace(/\s+/g, '_')
  const legacy = {
    upcoming: 'confirmed',
    active: 'in_progress',
    disputed: 'no_show',
  }
  return legacy[key] ?? key
}

export function normalizeClientStatus(status) {
  const key = String(status ?? '')
    .toLowerCase()
    .replace(/\s+/g, '_')
  if (key === 'inactive') return 'dormant'
  return key
}

export function normalizePractitionerStatus(status) {
  const key = String(status ?? '')
    .toLowerCase()
    .replace(/\s+/g, '_')
  if (key === 'pending') return 'onboarding_incomplete'
  if (key === 'inactive') return 'dormant'
  return key
}

export function formatShortUuid(id) {
  if (!id) return '—'
  const raw = String(id).trim()
  const uuidMatch = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
  const value = uuidMatch ? uuidMatch[0] : raw
  if (value.length <= 10) return value
  return `${value.slice(0, 8)}…`
}

export function sessionStatusLabel(status) {
  const normalized = normalizeSessionStatus(status)
  return SESSION_STATUS_LABELS[normalized] ?? normalized.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function sessionStatusClass(status) {
  const normalized = normalizeSessionStatus(status)
  switch (normalized) {
    case 'confirmed':
      return 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80'
    case 'in_progress':
      return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
    case 'no_show':
      return 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/80'
    case 'cancelled':
      return 'bg-rose-50 text-rose-800 ring-1 ring-rose-200/80'
    case 'completed':
      return 'bg-teal-50 text-teal-800 ring-1 ring-teal-200/80'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export function clientStatusLabel(status) {
  const normalized = normalizeClientStatus(status)
  return CLIENT_STATUS_LABELS[normalized] ?? normalized.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function clientStatusClass(status) {
  const normalized = normalizeClientStatus(status)
  switch (normalized) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700'
    case 'suspended':
      return 'bg-rose-50 text-rose-700'
    case 'dormant':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export function practitionerStatusLabel(status) {
  const normalized = normalizePractitionerStatus(status)
  return PRACTITIONER_STATUS_LABELS[normalized] ?? normalized.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function practitionerStatusClass(status) {
  const normalized = normalizePractitionerStatus(status)
  switch (normalized) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700'
    case 'onboarding_incomplete':
      return 'bg-amber-50 text-amber-800'
    case 'suspended':
      return 'bg-rose-50 text-rose-700'
    case 'dormant':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export function formatMoney(amount, currency = 'USD') {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}

export function formatAdminDateTime(date, timeZone) {
  const tz = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  const formatted = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: tz,
  }).format(d)
  const tzLabel = tz.replace(/_/g, ' ')
  return `${formatted} (${tzLabel})`
}

export const SESSION_STATUS_OPTIONS = ['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']

export const CLIENT_STATUS_OPTIONS = ['active', 'suspended', 'dormant']
