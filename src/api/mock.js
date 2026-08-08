function paginate(items, { page = 1, limit = 25 } = {}) {
  const start = (page - 1) * limit
  return {
    items: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  }
}

// Opt in explicitly. Previously any value other than the string 'false' selected
// fixtures, so an unset variable served made-up data; now only an explicit 'true'
// does, and everything else calls the real API.
const USE_FIXTURES = import.meta.env.VITE_USE_MOCK_API === 'true'

/**
 * Return fixture data in fixture mode, otherwise call the API.
 *
 * This deliberately does NOT catch errors. It used to wrap the API call in a
 * try/catch that returned `mockData` on any failure, which meant a 401, a CORS
 * rejection, a 500 and a dropped network connection all produced confident-looking
 * numbers with nothing logged — making a broken dashboard indistinguishable from a
 * working one, and any verification meaningless.
 *
 * Failures now propagate so callers can render an error state.
 */
export async function withMockFallback(apiCall, mockData, params) {
  if (USE_FIXTURES) {
    return typeof mockData === 'function' ? mockData(params) : mockData
  }
  return apiCall(params)
}

export { paginate, USE_FIXTURES }
