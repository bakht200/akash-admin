function paginate(items, { page = 1, limit = 25 } = {}) {
  const start = (page - 1) * limit
  return {
    items: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  }
}

export async function withMockFallback(apiCall, mockData, params) {
  try {
    if (import.meta.env.VITE_USE_MOCK_API === 'false') {
      return await apiCall(params)
    }
    throw new Error('mock')
  } catch {
    return typeof mockData === 'function' ? mockData(params) : mockData
  }
}

export { paginate }
