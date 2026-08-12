import { useEffect, useRef } from 'react'
import { connectAdminSocket } from '../lib/adminSocket'

/**
 * Subscribe to `admin:notification` on the `/admin` Socket.io namespace.
 * Treats the event as a refetch nudge (not a delta stream).
 *
 * @param {(payload: object) => void} onNotification
 * @param {{ enabled?: boolean }} [options]
 */
export function useAdminLiveRefresh(onNotification, { enabled = true } = {}) {
  const handlerRef = useRef(onNotification)

  useEffect(() => {
    handlerRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    if (!enabled) return undefined

    const socket = connectAdminSocket()
    if (!socket) return undefined

    const onEvent = (payload) => {
      handlerRef.current?.(payload)
    }

    socket.on('admin:notification', onEvent)

    return () => {
      socket.off('admin:notification', onEvent)
      socket.disconnect()
    }
  }, [enabled])
}
