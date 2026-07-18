import { NavLink } from 'react-router-dom'
import { Home, Calendar, Apple, BarChart2, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const NAV = [
  { id: 'home',       path: '/',           labelKey: 'nav.home',     Icon: Home      },
  { id: 'calendar',   path: '/calendar',   labelKey: 'nav.calendar', Icon: Calendar  },
  { id: 'calories',   path: '/calories',   labelKey: 'nav.calories', Icon: Apple     },
  { id: 'statistics', path: '/statistics', labelKey: 'nav.stats',    Icon: BarChart2 },
  { id: 'settings',   path: '/settings',   labelKey: 'nav.settings', Icon: Settings  },
]

export default function BottomNav() {
  const { t } = useTranslation()
  return (
    <nav
      id="bottom-navigation"
      aria-label={t('nav.home', 'Mobile navigation')}
      className="fixed bottom-0 inset-x-0 z-20 lg:hidden"
    >
      {/* Gradient veil above nav */}
      <div
        className="h-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top,var(--bg-root),transparent)' }}
        aria-hidden="true"
      />

      <div
        className="glass px-1 pb-safe"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <ul role="list" className="flex items-stretch">
          {NAV.map(({ id, path, labelKey, Icon }) => (
            <li key={id} className="flex-1">
              <NavLink
                to={path}
                aria-label={t(labelKey)}
                className={({ isActive }) => `w-full flex flex-col items-center gap-1 py-3 relative transition-colors duration-200 group ${isActive ? 'active-nav' : ''}`}
                style={({ isActive }) => ({ color: isActive ? '#a78bfa' : 'var(--t-3)' })}
              >
                {({ isActive }) => (
                  <>
                    {/* Top active bar */}
                    <span
                      className="absolute top-0 inset-x-4 h-[2px] rounded-b-full transition-all duration-300"
                      style={{
                        background: isActive ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : 'transparent',
                      }}
                      aria-hidden="true"
                    />

                    {/* Icon pill */}
                    <span
                      className="flex items-center justify-center w-10 h-7 rounded-[11px] transition-all duration-200 group-hover:scale-110"
                      style={{
                        background: isActive ? 'rgba(124,58,237,0.18)' : 'transparent',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      <Icon size={19} />
                    </span>

                    <span className="text-[10px] font-semibold leading-none tracking-wide">{t(labelKey)}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
