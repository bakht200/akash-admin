import { personName } from './display'

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function firstValue(...values) {
  for (const value of values) {
    if (value == null || value === '') continue
    return value
  }
  return undefined
}

const MODALITY_KEYS = [
  'specializations',
  'specialties',
  'modalities',
  'healerSpecializations',
  'assignedSpecializations',
  'selectedSpecializations',
  'specializationList',
]

export function modalityLabel(item) {
  if (item == null) return ''
  if (typeof item === 'string' || typeof item === 'number') return String(item).trim()
  if (!isPlainObject(item)) return ''
  return String(
    firstValue(
      item.name,
      item.title,
      item.label,
      item.specializationName,
      item.modalityName,
      item.specialization?.name,
      item.specialty?.name,
      item.modality?.name,
    ) || '',
  ).trim()
}

function unwrapArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
  }
  if (isPlainObject(value)) {
    if (Array.isArray(value.items)) return value.items
    if (Array.isArray(value.specializations)) return value.specializations
    if (Array.isArray(value.modalities)) return value.modalities
  }
  return null
}

function collectFromObject(source, seen) {
  if (!isPlainObject(source) || seen.has(source)) return []
  seen.add(source)

  for (const key of MODALITY_KEYS) {
    const rows = unwrapArray(source[key])
    if (rows?.length) return rows
  }

  const singular = source.specialization || source.modality
  if (singular && (typeof singular === 'string' || singular.name)) return [singular]

  return []
}

/**
 * Admin detail stores assigned modalities as a join array
 * (`[{ specialization: { id, name } }]`) or under several sibling keys.
 */
export function collectModalities(data) {
  if (!isPlainObject(data)) return []

  const nested = isPlainObject(data.profile) ? data.profile : {}
  const user = isPlainObject(data.user) ? data.user : {}
  const healer = isPlainObject(data.healer)
    ? data.healer
    : isPlainObject(data.practitioner)
      ? data.practitioner
      : {}
  const training = isPlainObject(data.trainingAndCertifications) ? data.trainingAndCertifications : {}

  const seen = new WeakSet()
  const trainingRows = unwrapArray(training.training) || unwrapArray(training.items) || []
  const trainingSpecs = trainingRows.filter(
    (item) =>
      isPlainObject(item) && (item.specialization || item.specializationName || item.modality || item.modalityName),
  )

  const raw = [
    ...collectFromObject(data, seen),
    ...collectFromObject(nested, seen),
    ...collectFromObject(healer, seen),
    ...collectFromObject(user, seen),
    ...collectFromObject(training, seen),
    ...trainingSpecs,
  ]

  const byKey = new Map()
  for (const item of raw) {
    const label = modalityLabel(item)
    if (!label) continue
    const id = isPlainObject(item)
      ? item.id || item.specializationId || item.specialization?.id || item.modality?.id
      : label
    if (!byKey.has(String(id))) {
      byKey.set(String(id), {
        id: id ?? label,
        name: label,
        specializationId: isPlainObject(item)
          ? item.specializationId || item.specialization?.id || item.id
          : undefined,
      })
    }
  }

  return [...byKey.values()]
}

/**
 * GET /admin/practitioners/{id} returns healer fields on `profile` and person
 * fields on `user` / `healer` (same names the list endpoint puts on each row).
 */
export function flattenPractitionerDetail(data) {
  if (!isPlainObject(data)) return { profile: {}, modalities: [] }

  const nested = isPlainObject(data.profile) ? data.profile : {}
  const user = isPlainObject(data.user) ? data.user : {}
  const healer = isPlainObject(data.healer) ? data.healer : isPlainObject(data.practitioner) ? data.practitioner : {}

  const profile = {
    ...nested,
    ...healer,
    ...user,
    id: firstValue(data.id, healer.id, user.id, nested.id),
    firstName: firstValue(user.firstName, healer.firstName, data.firstName, nested.firstName),
    lastName: firstValue(user.lastName, healer.lastName, data.lastName, nested.lastName),
    name: firstValue(user.name, healer.name, data.name, nested.name),
    email: firstValue(user.email, healer.email, data.email, nested.email),
    phone: firstValue(user.phone, healer.phone, data.phone, nested.phone),
    phoneCountryCode: firstValue(
      user.phoneCountryCode,
      healer.phoneCountryCode,
      data.phoneCountryCode,
      nested.phoneCountryCode,
    ),
    avatarUrl: firstValue(
      user.avatarUrl,
      healer.avatarUrl,
      data.avatarUrl,
      nested.avatarUrl,
      user.photoUrl,
      healer.photoUrl,
      nested.photoUrl,
    ),
    countryOfPractice: firstValue(
      nested.countryOfPractice,
      data.countryOfPractice,
      healer.countryOfPractice,
      user.countryOfPractice,
      nested.country,
    ),
    bio: firstValue(nested.bio, data.bio, healer.bio),
    sessionPriceCents: firstValue(nested.sessionPriceCents, data.sessionPriceCents, healer.sessionPriceCents),
    status: firstValue(data.status, nested.status, healer.status, user.status),
    createdAt: firstValue(data.createdAt, user.createdAt, healer.createdAt, nested.createdAt),
    lastActiveAt: firstValue(data.lastActiveAt, user.lastActiveAt, healer.lastActiveAt, nested.lastActiveAt),
    averageRating: firstValue(data.averageRating, nested.averageRating, healer.averageRating),
    totalSessions: firstValue(data.totalSessions, nested.totalSessions, healer.totalSessions),
    reviewCount: firstValue(data.reviewCount, nested.reviewCount, healer.reviewCount),
  }

  return { profile, modalities: collectModalities(data), displayName: personName(profile) }
}

export function credentialLabel(item) {
  if (item == null) return ''
  if (typeof item === 'string') return item.trim()
  if (!isPlainObject(item)) return ''
  return String(
    firstValue(item.name, item.title, item.program, item.issuer, item.institution, item.organization) || '',
  ).trim()
}

export function credentialImageUrl(item) {
  if (!isPlainObject(item)) return null
  return (
    firstValue(
      item.imageUrl,
      item.photoUrl,
      item.fileUrl,
      item.documentUrl,
      item.certificateUrl,
      item.certificationUrl,
      item.url,
      item.publicUrl,
    ) || null
  )
}

function collectCredentialList(data, keys) {
  const training = isPlainObject(data.trainingAndCertifications) ? data.trainingAndCertifications : {}
  const nested = isPlainObject(data.profile) ? data.profile : {}
  const healer = isPlainObject(data.healer) ? data.healer : {}
  const bags = [data, nested, healer, training]
  for (const bag of bags) {
    for (const key of keys) {
      const rows = unwrapArray(bag[key])
      if (rows?.length) return rows
    }
  }
  return []
}

export function collectCertifications(data) {
  if (!isPlainObject(data)) return []
  return collectCredentialList(data, ['certifications', 'certificates', 'certificationDocuments'])
}

export function collectTraining(data) {
  if (!isPlainObject(data)) return []
  const training = isPlainObject(data.trainingAndCertifications) ? data.trainingAndCertifications : {}
  return (
    unwrapArray(training.training) ||
    unwrapArray(training.items) ||
    collectCredentialList(data, ['training', 'education'])
  )
}

