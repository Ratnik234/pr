import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Activity, User, LogOut } from 'lucide-react'
import { getCurrentUserInfo, getSettings } from '../../utils/storage'

function useDate() {
  return useMemo(() => {
    const now = new Date()
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const isoDate = now.toISOString().split('T')[0]
    return { weekday, dateStr, isoDate }
  }, [])
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

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ username, avatarUrl }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const initial = username ? username.charAt(0).toUpperCase() : 'U'

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    localStorage.removeItem('lifetracker_session')
    localStorage.removeItem('lifetracker_username')
    window.location.reload()
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        id="header-avatar"
        aria-label="User profile"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 focus-visible:rounded-xl"
      >
        <div
          className="relative w-9 h-9 rounded-[13px] flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 3px 12px rgba(124,58,237,0.4)' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-white leading-none select-none">{initial}</span>
          )}
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

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-30 w-48 rounded-[14px] overflow-hidden anim-down"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', boxShadow: '0 12px 32px rgba(0,0,0,0.35)' }}
        >
          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate('/profile') }}
            className="w-full flex items-center gap-2.5 text-[13px] font-medium px-4 py-3 transition-colors hover:bg-white/5 text-left"
            style={{ color: 'var(--t-1)' }}
          >
            <User size={16} />
            Профіль
          </button>
          <div style={{ height: 1, background: 'var(--border)' }} aria-hidden="true" />
          <button
            role="menuitem"
            onClick={() => { setOpen(false); handleLogout() }}
            className="w-full flex items-center gap-2.5 text-[13px] font-medium px-4 py-3 transition-colors hover:bg-red-500/10 text-left text-red-400"
          >
            <LogOut size={16} />
            Вийти
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────
export default function Header({ onMenuOpen, onOpenModal }) {
  const { weekday, dateStr, isoDate } = useDate()
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    getCurrentUserInfo().then(info => {
      if (info?.username) setUsername(info.username)
    })
    getSettings().then(s => {
      if (s?.avatar) setAvatarUrl(s.avatar)
    })
  }, [])

  return (
    <header
      id="app-header"
      role="banner"
     className="glass sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 anim-down"
     style={{
      height: 'var(--header-h)',
      borderBottom: '1px solid var(--border)',
     }}
    >
      {/* ── Left zone ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
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
        <Avatar username={username} avatarUrl={avatarUrl} />
      </div>
    </header>
  )
}
