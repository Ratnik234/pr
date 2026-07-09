import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import MainContent from './MainContent'
import Home from '../pages/Home'
import CalendarPage from '../pages/Calendar'
import CaloriesPage from '../pages/Calories'
import StatisticsPage from '../pages/Statistics'
import SettingsPage from '../pages/Settings'
import Auth from '../pages/Auth'
import ProtectedRoute from './ProtectedRoute'
import useStore from '../../store/useStore'
import GlobalModals from './Modals'
export default function AppLayout() {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuOpen = useCallback(() => setSidebarOpen(true), [])
  const handleMenuClose= useCallback(() => setSidebarOpen(false), [])

  return (
    <>
      {/* Fixed ambient mesh gradient */}
      <div className="mesh-bg" aria-hidden="true" />

      {/* Skip to content link — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-semibold focus:text-white"
        style={{ background: 'var(--accent-1)' }}
      >
        Skip to main content
      </a>

      {/* App shell */}
      <div className="relative z-10 flex min-h-dvh w-full" id="app-root">
        <Routes>
          <Route path="/auth" element={
            !isAuthenticated ? <Auth /> : <Navigate to="/" replace />
          } />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <>
                {/* ── Sidebar ── */}
                <Sidebar
                  isOpen={sidebarOpen}
                  onClose={handleMenuClose}
                />

                {/* ── Main column ── */}
                <div className="flex flex-col flex-1 min-w-0 min-h-dvh">
                  <Header onMenuOpen={handleMenuOpen} />
                  
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/calories" element={<CaloriesPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>

                {/* ── Mobile bottom nav ── */}
                <BottomNav />
                
                {/* ── Global Modals ── */}
                <GlobalModals />
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  )
}
