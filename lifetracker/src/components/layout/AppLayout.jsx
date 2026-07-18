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
import GlobalModals from './GlobalModals'
import ProfilePage from '../pages/Profile'
import { useTranslation } from 'react-i18next'

export default function AppLayout() {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null)

  const handleMenuOpen = useCallback(() => setSidebarOpen(true), [])
  const handleMenuClose = useCallback(() => setSidebarOpen(false), [])
  const openModal = useCallback((type) => setActiveModal(type), [])
  const closeModal = useCallback(() => setActiveModal(null), [])

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
        {t('common.skipToContent', 'Skip to main content')}
      </a>

      {/* App shell */}
      <div className="relative z-10 flex min-h-dvh w-full" id="app-root">
        {/* ── Sidebar ── */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleMenuClose}
          onOpenModal={openModal}
        />

        {/* ── Main column ── */}
        <div className="flex flex-col flex-1 min-w-0 min-h-dvh">
          <Header onMenuOpen={handleMenuOpen} onOpenModal={openModal} />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/calories" element={<CaloriesPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* ── Mobile bottom nav ── */}
        <BottomNav />
      </div>

      <GlobalModals activeModal={activeModal} onClose={closeModal} />
    </>
  )
}
