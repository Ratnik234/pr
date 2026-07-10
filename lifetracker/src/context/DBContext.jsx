/**
 * src/context/DBContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React-контекст для стану ініціалізації SQLite БД.
 *
 * Використання:
 *   // main.jsx
 *   <DBProvider><App /></DBProvider>
 *
 *   // будь-який компонент
 *   const { isReady, error } = useDB()
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { getDB } from '../utils/storage'

const DBContext = createContext({ isReady: false, error: null })

export function useDB() {
  return useContext(DBContext)
}

export function DBProvider({ children }) {
  const [isReady, setIsReady] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        await getDB()
        if (!cancelled) setIsReady(true)
      } catch (err) {
        console.error('[DBProvider] Не вдалося ініціалізувати БД:', err)
        if (!cancelled) setError(err.message ?? String(err))
      }
    }

    bootstrap()
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh',
        background: '#12121a', color: '#f87171', fontFamily: 'monospace',
        gap: 12, padding: 24, textAlign: 'center',
      }}>
        <p style={{ fontSize: 18, fontWeight: 700 }}>⚠ Database Error</p>
        <p style={{ fontSize: 13, maxWidth: 480, opacity: 0.8 }}>{error}</p>
        <p style={{ fontSize: 12, opacity: 0.5 }}>
          Try refreshing the page. If the issue persists, clear site data in browser settings.
        </p>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#12121a', color: '#a78bfa',
        fontFamily: 'monospace', fontSize: 14, gap: 10,
      }}>
        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
        Initializing database…
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <DBContext.Provider value={{ isReady, error }}>
      {children}
    </DBContext.Provider>
  )
}
