import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const PageActionsSetContext = createContext(null)
const PageActionsValueContext = createContext(null)

export function PageActionsProvider({ children }) {
  const [pageActions, setPageActions] = useState(null)
  const setters = useMemo(() => ({ setPageActions }), [])

  return (
    <PageActionsSetContext.Provider value={setters}>
      <PageActionsValueContext.Provider value={pageActions}>{children}</PageActionsValueContext.Provider>
    </PageActionsSetContext.Provider>
  )
}

export function usePageActions() {
  return useContext(PageActionsValueContext)
}

/** Register topbar primary/secondary actions from a page. Cleared on unmount. */
export function useRegisterPageActions(actions) {
  const ctx = useContext(PageActionsSetContext)

  useEffect(() => {
    if (!ctx) return undefined
    ctx.setPageActions(actions)
    return () => ctx.setPageActions(null)
  }, [ctx, actions])
}
