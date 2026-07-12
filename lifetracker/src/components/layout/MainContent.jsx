import {
  Activity, Heart, Droplets, Moon,
  Apple, TrendingUp, Plus, ArrowUp, ArrowDown,
  Calendar, Zap, Check, Star,
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clsx(...args) { return args.filter(Boolean).join(' ') }

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, sub, Icon, gradient, progress, pct, delay = '' }) {
  const isUp = pct >= 0
  return (
    <article
      className={clsx('glass-card p-5 flex flex-col gap-4 anim-up', delay)}
      aria-label={`${label}: ${value} ${unit}`}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
          style={{ background: gradient, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
        >
          <Icon size={18} className="text-white" />
        </div>
        <span
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
          style={{
            background: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: isUp ? '#34d399' : '#f87171',
          }}
        >
          {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {Math.abs(pct)}%
        </span>
      </div>

      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.10em] mb-1"
          style={{ color: 'var(--t-3)' }}
        >
          {label}
        </p>
        <p className="text-[28px] font-bold leading-none tracking-tight" style={{ color: 'var(--t-1)' }}>
          {value}
          <span className="text-sm font-medium ml-1.5" style={{ color: 'var(--t-2)' }}>{unit}</span>
        </p>
        {sub && <p className="text-[12px] mt-1" style={{ color: 'var(--t-3)' }}>{sub}</p>}
      </div>

      {progress !== undefined && (
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px]" style={{ color: 'var(--t-3)' }}>Daily goal</span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--t-2)' }}>{progress}%</span>
          </div>
          <div className="progress-track" style={{ height: 5 }}>
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, height: '100%', background: gradient }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label} progress ${progress}%`}
            />
          </div>
        </div>
      )}
    </article>
  )
}

// ─── Calorie Ring ─────────────────────────────────────────────────────────────
function CalorieRing() {
  const consumed = 1648
  const goal     = 2200
  const remaining = goal - consumed
  const pct = Math.min(Math.round((consumed / goal) * 100), 100)
  const R = 64
  const circ = 2 * Math.PI * R
  const offset = circ - (circ * pct) / 100

  const macros = [
    { label: 'Protein', g: 112, color: '#a78bfa', pct: 78 },
    { label: 'Carbs',   g: 184, color: '#f97316', pct: 62 },
    { label: 'Fat',     g: 54,  color: '#0ea5e9', pct: 55 },
  ]

  return (
    <article className="glass-card p-5 anim-up anim-delay-5" aria-label="Calories today">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--t-1)' }}>Calories</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-3)' }}>Today's intake</p>
        </div>
        <Apple size={18} style={{ color: '#f97316' }} />
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        {/* Ring */}
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90" aria-hidden="true">
            <circle cx="74" cy="74" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
            <circle
              cx="74" cy="74" r={R}
              fill="none"
              stroke="url(#calGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)' }}
            />
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#f97316"/>
                <stop offset="100%" stopColor="#ec4899"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: 'var(--t-1)' }}>{pct}%</span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--t-3)' }}>of goal</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3 min-w-[110px]">
          {[
            { label: 'Consumed',  val: consumed.toLocaleString(), unit: 'kcal', color: 'var(--t-1)' },
            { label: 'Remaining', val: remaining.toLocaleString(), unit: 'kcal', color: '#34d399' },
            { label: 'Goal',      val: goal.toLocaleString(),     unit: 'kcal', color: 'var(--t-2)' },
          ].map(({ label, val, unit, color }) => (
            <dl key={label}>
              <dt className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--t-3)' }}>{label}</dt>
              <dd className="text-lg font-bold leading-none" style={{ color }}>
                {val} <span className="text-[11px] font-medium" style={{ color: 'var(--t-3)' }}>{unit}</span>
              </dd>
            </dl>
          ))}
        </div>
      </div>

      {/* Macros */}
      <div className="mt-5 space-y-2.5">
        {macros.map(({ label, g, color, pct: mp }) => (
          <div key={label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[12px] font-medium" style={{ color: 'var(--t-2)' }}>{label}</span>
              <span className="text-[11px] font-semibold" style={{ color }}>{g}g</span>
            </div>
            <div className="progress-track" style={{ height: 4 }}>
              <div className="progress-fill" style={{ width: `${mp}%`, height: '100%', background: color }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

// ─── Week Calendar ────────────────────────────────────────────────────────────
function WeekCalendar() {
  const today = new Date()
  const dow = today.getDay()

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dow + i)
    return {
      short: days[i],
      date: d.getDate(),
      isToday: i === dow,
      hasEvent: [1, 3, 5].includes(i),
      isPast: i < dow,
    }
  })

  return (
    <article className="glass-card p-5 anim-up anim-delay-4" aria-label="Week calendar">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--t-1)' }}>This Week</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-3)' }}>
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          id="add-event"
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-[10px] transition-all duration-200 hover:opacity-80"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}
          aria-label="Add event"
        >
          <Plus size={13} />
          Event
        </button>
      </div>

      <ol role="list" className="grid grid-cols-7 gap-1" aria-label="Days of the week">
        {week.map((d, i) => (
          <li key={i} className="flex flex-col items-center gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: d.isToday ? '#a78bfa' : 'var(--t-3)' }}
            >
              {d.short}
            </span>
            <button
              aria-label={`${d.date}${d.isToday ? ' today' : ''}`}
              aria-current={d.isToday ? 'date' : undefined}
              className="relative w-9 h-9 rounded-[13px] text-[13px] font-semibold flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={
                d.isToday
                  ? {
                      background: 'linear-gradient(135deg,#7c3aed,#6366f1)',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(124,58,237,0.5)',
                      transform: 'scale(1.08)',
                    }
                  : {
                      color: d.isPast ? 'var(--t-3)' : 'var(--t-2)',
                      background: 'transparent',
                    }
              }
            >
              {d.date}
              {d.hasEvent && !d.isToday && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#ec4899' }}
                  aria-hidden="true"
                />
              )}
            </button>
          </li>
        ))}
      </ol>

      {/* Upcoming events */}
      <div className="mt-5 space-y-2">
        {[
          { time: '09:00', title: 'Morning Run', color: '#a78bfa', done: true },
          { time: '12:30', title: 'Lunch — Meal logged', color: '#f97316', done: true },
          { time: '17:00', title: 'Yoga Session', color: '#0ea5e9', done: false },
          { time: '20:00', title: 'Evening Walk', color: '#10b981', done: false },
        ].map(({ time, title, color, done }) => (
          <div
            key={time}
            className="flex items-center gap-3 p-2.5 rounded-[12px] transition-colors duration-200 hover:bg-white/[0.025]"
          >
            <div
              className="w-1 h-8 rounded-full flex-shrink-0"
              style={{ background: done ? color : `${color}55` }}
              aria-hidden="true"
            />
            <time className="text-[11px] font-mono font-semibold flex-shrink-0" style={{ color: 'var(--t-3)' }}>
              {time}
            </time>
            <span
              className="flex-1 text-[13px] font-medium truncate"
              style={{ color: done ? 'var(--t-2)' : 'var(--t-1)', textDecoration: done ? 'line-through' : 'none' }}
            >
              {title}
            </span>
            {done && <Check size={14} style={{ color: '#34d399', flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </article>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
function ActivityFeed() {
  const items = [
    { time: '09:14', title: 'Morning Run',       sub: '5.2 km · 342 kcal · 28 min', dot: '#a78bfa' },
    { time: '12:30', title: 'Chicken Salad',     sub: 'Lunch · 480 kcal · P 42g',   dot: '#f97316' },
    { time: '14:00', title: 'Water intake',      sub: '500 ml · 4th glass',          dot: '#0ea5e9' },
    { time: '16:45', title: 'Afternoon Walk',    sub: '1.8 km · 92 kcal',            dot: '#10b981' },
    { time: '19:20', title: 'Salmon & Rice',     sub: 'Dinner · 620 kcal · P 48g',  dot: '#ec4899' },
  ]
  return (
    <article className="glass-card p-5 anim-up anim-delay-5" aria-label="Recent activity">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--t-1)' }}>Recent Activity</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-3)' }}>Last 24 hours</p>
        </div>
        <button
          id="view-all-activity"
          className="text-[12px] font-semibold transition-colors duration-200 hover:underline"
          style={{ color: '#a78bfa' }}
        >
          View all
        </button>
      </div>

      <ul role="list" className="space-y-1">
        {items.map(({ time, title, sub, dot }, i) => (
          <li
            key={i}
            className="flex items-center gap-3 px-3 py-3 rounded-[14px] transition-colors duration-200 hover:bg-white/[0.03] group"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
              style={{ background: dot }}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium leading-snug truncate" style={{ color: 'var(--t-1)' }}>{title}</p>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--t-3)' }}>{sub}</p>
            </div>
            <time className="text-[11px] font-mono flex-shrink-0" style={{ color: 'var(--t-3)' }}>{time}</time>
          </li>
        ))}
      </ul>
    </article>
  )
}

// ─── Streak / Quick Stats ─────────────────────────────────────────────────────
function QuickStatsBar() {
  const stats = [
    { label: 'Streak',  val: '12',   unit: 'days',  color: '#f59e0b', Icon: Zap  },
    { label: 'Weight',  val: '74.2', unit: 'kg',    color: '#0ea5e9', Icon: TrendingUp },
    { label: 'BMI',     val: '22.1', unit: '',      color: '#10b981', Icon: Star  },
    { label: 'Water',   val: '1.8',  unit: 'L',     color: '#6366f1', Icon: Droplets },
  ]
  return (
    <div
      className="glass-card overflow-hidden anim-up anim-delay-1"
      style={{ padding: 0 }}
      aria-label="Quick stats"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--border)' }}>
        {stats.map(({ label, val, unit, color, Icon: StatIcon }) => (
          <div
            key={label}
            className="flex flex-col items-center py-5 px-4 transition-colors duration-200 hover:bg-white/[0.025]"
            style={{ borderColor: 'var(--border)' }}
          >
            <StatIcon size={16} className="mb-2" style={{ color }} />
            <span className="text-[22px] font-bold leading-none" style={{ color }}>{val}</span>
            {unit && <span className="text-[11px] mt-0.5" style={{ color: 'var(--t-3)' }}>{unit}</span>}
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-2" style={{ color: 'var(--t-3)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page Heading ─────────────────────────────────────────────────────────────
function PageHeading({ title, subtitle }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 anim-up">
      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>
          {title}
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--t-3)' }}>{subtitle}</p>
      </div>
      <button
        id="quick-add-main"
        className="btn-primary flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-[14px]"
      >
        <Plus size={15} />
        Quick Add
      </button>
    </div>
  )
}

// ─── Page Map ─────────────────────────────────────────────────────────────────
const PAGES = {
  home:       { title: 'Good morning, Alex \u{1F44B}', subtitle: "Here\u2019s your wellness overview for today." },
  calendar:   { title: 'Calendar',                     subtitle: 'Manage your schedule and upcoming events.' },
  calories:   { title: 'Calories & Nutrition',         subtitle: 'Track and analyse your daily food intake.' },
  statistics: { title: 'Statistics',                   subtitle: 'Deep-dive into your progress over time.' },
  settings:   { title: 'Settings',                     subtitle: 'Customise your LifeTracker experience.' },
}

const METRICS = [
  {
    label: 'Steps',
    value: '8,472',
    unit: 'steps',
    sub: 'vs 7,560 yesterday',
    Icon: Activity,
    gradient: 'linear-gradient(135deg,#7c3aed,#6366f1)',
    progress: 85,
    pct: 12,
    delay: 'anim-delay-2',
  },
  {
    label: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    sub: 'Resting · Normal',
    Icon: Heart,
    gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)',
    progress: 72,
    pct: -3,
    delay: 'anim-delay-3',
  },
  {
    label: 'Water',
    value: '1.8',
    unit: 'L',
    sub: '6 of 8 glasses',
    Icon: Droplets,
    gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    progress: 72,
    pct: 5,
    delay: 'anim-delay-4',
  },
  {
    label: 'Sleep',
    value: '7.4',
    unit: 'hrs',
    sub: 'Good quality · REM 22%',
    Icon: Moon,
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    progress: 92,
    pct: 8,
    delay: 'anim-delay-5',
  },
]

// ─── Main Content ─────────────────────────────────────────────────────────────
export default function MainContent({ activeNav }) {
  const page = PAGES[activeNav] || PAGES.home
  return (
    <main
      id="main-content"
      aria-label="Page content"
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div
        className="w-full max-w-[1600px] mx-auto px-6 lg:px-8 xl:px-10 py-7 space-y-5"
        style={{ paddingBottom: 'calc(5rem + 24px)' }}  /* room for mobile bottom nav */
      >
        <PageHeading title={page.title} subtitle={page.subtitle} />

        {/* Quick stats row */}
        <QuickStatsBar />

        {/* Metric cards */}
        <section aria-labelledby="metrics-h">
          <h2
            id="metrics-h"
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: 'var(--t-3)' }}
          >
            Today&apos;s Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {METRICS.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        </section>

        {/* Calendar + Calorie ring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeekCalendar />
          <CalorieRing />
        </div>

        {/* Activity feed */}
        <ActivityFeed />
      </div>
    </main>
  )
}
