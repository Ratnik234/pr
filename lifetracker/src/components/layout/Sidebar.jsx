import { NavLink } from 'react-router-dom'
import { Home, Calendar, Apple, BarChart2, Settings, X, Activity, Plus } from 'lucide-react'

const NAV = [
  { id: 'home',       path: '/',           label: 'Home',       Icon: Home,      badge: null,  dot: false },
  { id: 'calendar',   path: '/calendar',   label: 'Calendar',   Icon: Calendar,  badge: 3,     dot: false },
  { id: 'calories',   path: '/calories',   label: 'Calories',   Icon: Apple,     badge: null,  dot: true  },
  { id: 'statistics', path: '/statistics', label: 'Statistics', Icon: BarChart2, badge: null,  dot: false },
  { id: 'settings',   path: '/settings',   label: 'Settings',   Icon: Settings,  badge: null,  dot: false },
]

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-3 px-4 pt-7 pb-6">
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-[13px] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', boxShadow: '0 4px 16px rgba(124,58,237,0.45)' }}
        >
          <Activity size={18} className="text-white" />
        </div>
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 pulse-glow"
          style={{ background: '#10b981', borderColor: 'var(--bg-panel)' }}
          aria-hidden="true"
        />
      </div>
      <div>
        <p className="text-[15px] font-bold tracking-tight gradient-brand leading-none">LifeTracker</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mt-1" style={{ color: 'var(--t-3)' }}>
          Wellness Dashboard
        </p>
      </div>
    </div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--t-3)' }}>
      {children}
    </p>
  )
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ item, onClick }) {
  const { path, label, Icon, badge, dot } = item
  return (
    <li>
      <NavLink
        to={path}
        onClick={onClick}
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        {({ isActive }) => (
          <>
            <span className="nav-icon flex-shrink-0" style={{ color: isActive ? '#a78bfa' : 'var(--t-2)' }}>
              <Icon size={18} />
            </span>
            <span className="flex-1 leading-none">{label}</span>
            {badge !== null && (
              <span
                className="flex items-center justify-center text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5"
                style={{ background: 'rgba(124,58,237,0.75)', color: '#e9d5ff' }}
              >
                {badge}
              </span>
            )}
            {dot && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#f59e0b' }}
                aria-label="has updates"
              />
            )}
          </>
        )}
      </NavLink>
    </li>
  )
}

// ─── Score Card ───────────────────────────────────────────────────────────────
function ScoreCard() {
  const score = 78
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (circ * score) / 100
  return (
    <div
      className="mx-3 mb-4 rounded-[18px] p-4"
      style={{
        background: 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(99,102,241,0.10))',
        border: '1px solid rgba(124,58,237,0.22)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0 w-16 h-16">
          <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="32" cy="32" r={r}
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold" style={{ color: '#e9d5ff' }}>{score}</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#e9d5ff' }}>Health Score</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-2)' }}>Excellent day!</p>
          <p className="text-[10px] mt-2 font-medium" style={{ color: '#a78bfa' }}>+4 pts from yesterday</p>
        </div>
      </div>
    </div>
  )
}

// ─── User Profile Footer ──────────────────────────────────────────────────────
function ProfileFooter() {
  const handleLogout = () => {
    localStorage.removeItem('lifetracker_session')
    window.location.reload()
  }

  return (
    <div className="px-3 pb-5">
      <div
        className="flex items-center gap-3 p-3 rounded-[16px] cursor-pointer hover:brightness-110 transition-all duration-200 group"
        style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
        onClick={handleLogout}
        title="Logout"
      >
        <div
          className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
        >
          <span className="text-sm font-bold text-white">LT</span>
        </div>
        <div className="min-w-0 flex-1 group-hover:hidden">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--t-1)' }}>My Account</p>
          <p className="text-[11px] truncate" style={{ color: 'var(--t-3)' }}>Active</p>
        </div>
        <div className="min-w-0 flex-1 hidden group-hover:block">
          <p className="text-sm font-bold text-red-400">Logout</p>
        </div>
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 group-hover:hidden"
          style={{ background: 'var(--emerald)' }}
          aria-label="online"
        />
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          className="fixed inset-0 z-30 lg:hidden cursor-default"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
          aria-label="Close navigation"
          tabIndex={-1}
        />
      )}

      <aside
        id="sidebar"
        aria-label="Main navigation"
        className={[
          'fixed top-0 left-0 z-40 h-full flex flex-col',
          'glass border-r',
          'transition-transform duration-300 ease-out will-change-transform',
          'lg:static lg:translate-x-0 lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          width: 'var(--sidebar-w)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 icon-btn lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>

        <Logo />

        {/* Divider */}
        <div className="mx-4 mb-4" style={{ height: 1, background: 'var(--border)' }} aria-hidden="true" />

        {/* Nav */}
        <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 pb-4">
          <SectionLabel>Menu</SectionLabel>
          <ul role="list" className="space-y-1">
            {NAV.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                onClick={() => { onClose() }}
              />
            ))}
          </ul>

          {/* Quick actions */}
          <div className="mt-6 mb-3">
            <SectionLabel>Quick Actions</SectionLabel>
          </div>
          <div className="space-y-2 px-1">
            {[
              { label: 'Add Task',      color: '#7c3aed', action: () => window.location.href = '/' },
              { label: 'Log Meal',      color: '#f97316', action: () => window.location.href = '/calories' },
              { label: 'View Calendar', color: '#0ea5e9', action: () => window.location.href = '/calendar' },
            ].map(({ label, color, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center gap-2.5 text-[13px] font-medium py-2.5 px-3 rounded-[12px] transition-all duration-200 hover:brightness-110"
                style={{
                  background: `${color}14`,
                  border: `1px solid ${color}28`,
                  color,
                }}
              >
                <Plus size={14} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <ScoreCard />
        <ProfileFooter />
      </aside>
    </>
  )
}
