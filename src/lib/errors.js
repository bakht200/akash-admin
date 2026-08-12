/** Extract a user-facing message from an Axios / API error. */
export function getErrorMessage(err, fallback = 'Something went wrong.') {
  const api = err?.response?.data?.error
  if (api?.message) return api.message
  if (typeof err?.message === 'string' && err.message) return err.message
  return fallback
}

export function getErrorCode(err) {
  return err?.response?.data?.error?.code ?? null
}

export function isForbidden(err) {
  return err?.response?.status === 403
}
