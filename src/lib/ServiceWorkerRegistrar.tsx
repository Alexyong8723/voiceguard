'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[VoiceGuard SW] registered:', reg.scope))
        .catch((err) => console.warn('[VoiceGuard SW] registration failed:', err))
    }
  }, [])

  return null
}
