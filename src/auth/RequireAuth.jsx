import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthed, fetchMe } from './auth'
import LoadingState from '../components/states/LoadingState'

export default function RequireAuth() {
  const location = useLocation()
  const [ready, setReady] = useState(false)
  const [ok, setOk] = useState(isAuthed())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!isAuthed()) {
        if (!cancelled) {
          setOk(false)
          setReady(true)
        }
        return
      }
      try {
        await fetchMe()
        if (!cancelled) setOk(true)
      } catch {
        if (!cancelled) setOk(false)
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--figma-app-bg)]">
        <LoadingState label="Checking session…" />
      </div>
    )
  }

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
