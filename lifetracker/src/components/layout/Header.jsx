import { useMemo, useState, useEffect } from 'react'
import { Search as SearchIcon, Bell, Menu, Plus, Activity } from 'lucide-react'
import { getCurrentUserInfo } from '../../utils/storage'

function useDate() {
  return useMemo(() => {
    const now = new Date()
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const isoDate = now.toISOString().split('T')[0]
    return { weekday, dateStr, isoDate }
  }, [])
}

// ─── Search ───────────────────────────────────────────────────────────────────
function Search() {
  return (
    <div className="relative hidden sm:flex items-center">
      <label htmlFor="global-search" className="sr-only">Search</label>
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-[14px] transition-all duration-200 focus-within:ring-1"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          width: 220,
          '--tw-ring-color': 'rgba(124,58,237,0.45)',
        }}
      >
        <SearchIcon size={15} className="flex-shrink-0" style={{ color: 'var(--t-3)' }} />
        <input
          id="global-search"
          type="search"
          placeholder="Search…"
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--t-3)]"
          style={{ color: 'var(--t-1)', minWidth: 0 }}
        />
        <kbd
          className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-md flex-shrink-0"
          style={{ background: 'var(--bg-hover)', color: 'var(--t-3)', border: '1px solid var(--border)' }}
        >
          ⌘K
        </kbd>
      </div>
    </div>
  )
}

// ─── Date Badge ───────────────────────────────────────────────────────────────
function DateBadge({ weekday, dateStr, isoDate }) {
  return (
    <div className="text-center lg:text-left">
      <time dateTime={isoDate} className="block text-sm font-semibold" style={{ color: 'var(--t-1)' }}>
        {dateStr}
      </time>
      <time dateTime={isoDate} className="hidden lg:block text-[11px] font-medium mt-0.5" style={{ color: 'var(--t-3)' }}>
        {weekday}
      </time>
    </div>
  )
}


// ─── Add Button ───────────────────────────────────────────────────────────────
function AddButton({ onClick }) {
  return (
    <button
      id="header-add"
      onClick={onClick}
      aria-label="Quick add"
      className="btn-primary hidden sm:flex items-center gap-1.5 text-[13px] px-3.5 py-2 rounded-[12px]"
    >
      <Plus size={14} />
      <span>Add</span>
    </button>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ username }) {
  const initial = username ? username.charAt(0).toUpperCase() : 'U'
  return (
    <button
      id="header-avatar"
      aria-label="User profile"
      className="flex items-center gap-2.5 focus-visible:rounded-xl"
    >
      <div
        className="relative w-9 h-9 rounded-[13px] flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 3px 12px rgba(124,58,237,0.4)' }}
      >
        <span className="text-sm font-bold text-white leading-none select-none">{initial}</span>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          style={{ background: 'var(--emerald)', borderColor: 'var(--bg-panel)' }}
          aria-hidden="true"
        />
      </div>
      <div className="hidden lg:block text-left">
        <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--t-1)' }}>{username || 'User'}</p>
        <p className="text-[11px] leading-tight" style={{ color: 'var(--t-3)' }}>Pro Plan</p>
      </div>
    </button>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────
export default function Header({ onMenuOpen, onOpenModal }) {
  const { weekday, dateStr, isoDate } = useDate()
  const [username, setUsername] = useState('')

  useEffect(() => {
    getCurrentUserInfo().then(info => {
      if (info?.username) setUsername(info.username)
    })
  }, [])

  return (
    <header
      id="app-header"
      role="banner"
      className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 anim-down"
      style={{
        height: 'var(--header-h)',
        background: 'rgba(14,14,26,0.82)',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* ── Left zone ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Hamburger — mobile only */}
        <button
          id="sidebar-toggle"
          className="icon-btn lg:hidden"
          onClick={onMenuOpen}
          aria-label="Open navigation"
          aria-expanded="false"
          aria-controls="sidebar"
        >
          <Menu size={17} />
        </button>

        {/* Mobile logo mark */}
        <div className="flex items-center gap-2 lg:hidden">
          <div
            className="w-7 h-7 rounded-[10px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}
          >
            <Activity size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold gradient-brand">LifeTracker</span>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-5" style={{ background: 'var(--border)' }} aria-hidden="true" />

        {/* Date — desktop */}
        <div className="hidden lg:block">
          <DateBadge weekday={weekday} dateStr={dateStr} isoDate={isoDate} />
        </div>
      </div>

      {/* ── Center — date on mobile ── */}
      <div className="flex-1 flex justify-center lg:hidden">
        <DateBadge weekday={weekday} dateStr={dateStr} isoDate={isoDate} />
      </div>

      {/* ── Right zone ── */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <Search />
        <AddButton onClick={() => onOpenModal('task')} />
        <div className="hidden sm:block w-px h-5" style={{ background: 'var(--border)' }} aria-hidden="true" />
        <Avatar username={username} />
      </div>
    </header>
  )
}
