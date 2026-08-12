// Which environment this build talks to. All of it is fixed at build time, so a
// production bundle built with staging settings looks normal and shows staging data.

const RAW_ENV = (import.meta.env.VITE_APP_ENV || '').trim().toLowerCase()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || ''

export const APP_ENV = RAW_ENV || 'unknown'
export const IS_PRODUCTION = APP_ENV === 'production'
export const IS_STAGING = APP_ENV === 'staging'

export const ENV_LABEL = {
  production: 'Production',
  staging: 'Staging',
  local: 'Local',
  unknown: 'Unknown environment',
}[APP_ENV] ?? APP_ENV

export function apiHost() {
  try {
    return new URL(API_BASE_URL).host
  } catch {
    return API_BASE_URL || '(not set)'
  }
}

export const FIREBASE_PROJECT = FIREBASE_PROJECT_ID || '(not set)'

// Staging's project is akash-dev-999d6 and its AWS resources are akash-dev-*.
// Historical naming — "dev" in a resource name means staging.
function looksLikeStaging(value) {
  return /(-dev\b|akash-dev|ds26o2otimehm|api-staging|localhost|127\.0\.0\.1)/i.test(value)
}

function looksLikeProduction(value) {
  return /(akash-prod|^api\.akashtherapies\.com$)/i.test(value)
}

/** Ways this build's settings contradict each other. Empty when consistent. */
export function environmentWarnings() {
  const warnings = []
  const host = apiHost()

  if (APP_ENV === 'unknown') {
    warnings.push('VITE_APP_ENV is not set, so this build cannot say which environment it targets.')
  }
  if (!API_BASE_URL) {
    warnings.push('VITE_API_BASE_URL is not set. Requests resolve against this site and reach no backend.')
  }
  if (!FIREBASE_PROJECT_ID) {
    warnings.push('VITE_FIREBASE_PROJECT_ID is not set, so sign-in cannot work.')
  }

  if (IS_PRODUCTION && (looksLikeStaging(host) || looksLikeStaging(FIREBASE_PROJECT_ID))) {
    warnings.push(
      `Built as production but pointed at staging: API ${host}, Firebase project ${FIREBASE_PROJECT}.`,
    )
  }
  if (IS_STAGING && (looksLikeProduction(host) || looksLikeProduction(FIREBASE_PROJECT_ID))) {
    warnings.push(
      `Built as staging but pointed at production: API ${host}, Firebase project ${FIREBASE_PROJECT}.`,
    )
  }

  return warnings
}

/** One line naming what this build talks to. */
export function environmentSummary() {
  return `${ENV_LABEL} · API ${apiHost()} · Firebase ${FIREBASE_PROJECT}`
}
