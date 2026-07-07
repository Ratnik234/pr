// ─── Icon Library ─────────────────────────────────────────────────────────────
// All icons: 24x24 viewBox, stroke-based, accessible with aria-hidden

const icon = (paths, opts = {}) => {
  const { fill = false, strokeWidth = 1.75 } = opts
  return ({ size = 20, className = '', style, ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths}
    </svg>
  )
}

export const IcHome = icon(<>
  <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
  <path d="M9 21V12h6v9"/>
</>)

export const IcCalendar = icon(<>
  <rect x="3" y="4" width="18" height="18" rx="2.5"/>
  <path d="M16 2v4M8 2v4M3 10h18"/>
  <circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none"/>
  <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none"/>
  <circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none"/>
</>)

export const IcFlame = icon(<>
  <path d="M12 2C9 6.5 7 9 7 12a5 5 0 0 0 10 0c0-2.5-1.5-5-2.5-6.5C14 7.5 13.5 9 12 9 12 9 15 5.5 12 2z"/>
</>)

export const IcChart = icon(<>
  <rect x="3"  y="13" width="4" height="8"  rx="1"/>
  <rect x="10" y="8"  width="4" height="13" rx="1"/>
  <rect x="17" y="3"  width="4" height="18" rx="1"/>
</>)

export const IcSettings = icon(<>
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
</>)

export const IcUser = icon(<>
  <circle cx="12" cy="8" r="4"/>
  <path d="M4 20c0-3.87 3.58-7 8-7s8 3.13 8 7"/>
</>)

export const IcBell = icon(<>
  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
</>)

export const IcSearch = icon(<>
  <circle cx="11" cy="11" r="7"/>
  <path d="m21 21-4.35-4.35"/>
</>)

export const IcMenu = icon(<>
  <path d="M3 6h18M3 12h18M3 18h18"/>
</>)

export const IcX = icon(<>
  <path d="M18 6 6 18M6 6l12 12"/>
</>)

export const IcPlus = icon(<>
  <path d="M12 5v14M5 12h14"/>
</>)

export const IcActivity = icon(<>
  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
</>)

export const IcHeart = icon(<>
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</>)

export const IcDroplets = icon(<>
  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
</>)

export const IcMoon = icon(<>
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</>)

export const IcArrowUp = icon(<>
  <polyline points="18 15 12 9 6 15"/>
</>)

export const IcArrowDown = icon(<>
  <polyline points="6 9 12 15 18 9"/>
</>)

export const IcCheck = icon(<>
  <polyline points="20 6 9 17 4 12"/>
</>)

export const IcStar = icon(<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>, { fill: true })

export const IcTrend = icon(<>
  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
  <polyline points="17 6 23 6 23 12"/>
</>)

export const IcBolt = icon(<>
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</>)
