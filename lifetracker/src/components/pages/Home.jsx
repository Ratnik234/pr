import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Flame, Droplet, Smile, Plus, Utensils, FileText, Activity, Heart, Zap, X, AlertTriangle } from 'lucide-react'
import { getEntries, getDayTotals, getSettings, todayStr, addEntry, getActivityLog, getWorkouts, getCurrentUserInfo } from '../../utils/storage'
import { useTranslation } from 'react-i18next'

// Helper for classes
function clsx(...args) { return args.filter(Boolean).join(' ') }

function OverviewCard({ title, value, subtext, Icon, gradientClass, delay }) {
  return (
    <div className={clsx("glass-card p-6 flex flex-col gap-4 anim-up group", delay)}>
      <div className="flex items-start justify-between">
        <div className={clsx("w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110", gradientClass)} style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--t-3)' }}>
          {title}
        </p>
        <p className="text-3xl font-bold leading-none tracking-tight mb-2" style={{ color: 'var(--t-1)' }}>
          {value}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--t-2)' }}>
          {subtext}
        </p>
      </div>
    </div>
  )
}

function QuickActionButton({ label, Icon, colorClass, delay, onClick }) {
  return (
    <button onClick={onClick} className={clsx("flex items-center gap-3 p-4 rounded-[16px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg anim-up w-full text-left", delay)} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", colorClass)} style={{ background: 'var(--bg-card)' }}>
        <Icon size={20} />
      </div>
      <span className="font-semibold text-[15px]" style={{ color: 'var(--t-1)' }}>{label}</span>
    </button>
  )
}

function ActivityCard({ title, time, description, Icon, colorClass, delay }) {
  return (
    <div className={clsx("glass-card p-5 flex items-center gap-4 transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-0.5 anim-up", delay)}>
      <div className={clsx("w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0", colorClass)} style={{ background: 'var(--bg-raised)' }}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[15px] font-bold truncate" style={{ color: 'var(--t-1)' }}>{title}</h4>
        <p className="text-[13px] truncate mt-0.5" style={{ color: 'var(--t-2)' }}>{description}</p>
      </div>
      <div className="text-[12px] font-mono font-medium flex-shrink-0" style={{ color: 'var(--t-3)' }}>
        {time}
      </div>
    </div>
  )
}

// ─── Simple Modals ────────────────────────────────────────────────────────────
function AddTaskModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-up">
      <div className="w-full max-w-sm p-6 rounded-[24px] shadow-2xl glass-card relative" style={{ background: 'var(--bg-panel)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 transition-colors" style={{ color: 'var(--t-3)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--t-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t-3)'}>
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--t-1)' }}>Add New Task</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
            autoFocus
          />
          <button type="submit" className="btn-primary w-full py-3 rounded-xl mt-2 text-[15px]">
            Add Task
          </button>
        </form>
      </div>
    </div>
  )
}

function AddNoteModal({ onClose, onAdd }) {
  const [content, setContent] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    onAdd(content)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-up">
      <div className="w-full max-w-sm p-6 rounded-[24px] shadow-2xl glass-card relative" style={{ background: 'var(--bg-panel)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 transition-colors" style={{ color: 'var(--t-3)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--t-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t-3)'}>
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--t-1)' }}>Add New Note</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
            autoFocus
          />
          <button type="submit" className="btn-primary w-full py-3 rounded-xl mt-2 text-[15px]" style={{ background: 'linear-gradient(135deg, var(--sky), #38bdf8)' }}>
            Save Note
          </button>
        </form>
      </div>
    </div>
  )
}

function WarningsBanner({ activity, totals, goals, water }) {
  const { t } = useTranslation()
  const warnings = []

  if (activity.caloriesBurned > 1000) {
    warnings.push({
      title: t('home.highLoadWarning', 'High Workout Load'),
      desc: t('home.highLoadDesc', 'Consider resting tomorrow. Your workout load was extremely high today based on your profile.'),
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    })
  }

  const currentHour = new Date().getHours()
  const waterLiters = (water || 0) * 0.25
  if (currentHour >= 18 && waterLiters < 1.0) {
    warnings.push({
      title: t('home.lowWaterWarning', 'Hydration Needed'),
      desc: t('home.lowWaterDesc', "You haven't logged enough water for today."),
      icon: Droplet,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20'
    })
  }

  if (goals.calories > 0 && totals.calories > goals.calories * 1.2) {
    warnings.push({
      title: t('home.overCaloriesWarning', 'High Calories'),
      desc: t('home.overCaloriesDesc', 'You exceeded your daily calorie goal significantly.'),
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    })
  }

  if (warnings.length === 0) return null

  return (
    <div className="flex flex-col gap-3 mb-6 anim-down">
      <h2 className="text-[14px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--t-3)' }}>
        {t('home.warnings', 'Warnings')}
      </h2>
      {warnings.map((w, i) => (
        <div key={i} className={`p-4 rounded-xl border flex gap-4 ${w.bg} ${w.border}`}>
          <w.icon className={`flex-shrink-0 ${w.color}`} size={24} />
          <div>
            <h3 className={`font-bold text-[15px] ${w.color}`}>{w.title}</h3>
            <p className="text-[13px] mt-1" style={{ color: 'var(--t-2)' }}>{w.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tasks, setTasks] = useState([])
  const [totals, setTotals] = useState({ calories: 0 })
  const [goals, setGoals] = useState({ calories: 2200 })
  const [habits, setHabits] = useState([])
  const [habitLog, setHabitLog] = useState([])
  const [activity, setActivity] = useState({ steps: 0, distance: 0, caloriesBurned: 0 })
  const [username, setUsername] = useState('User')
  const [water, setWater] = useState(0)
  const [motionSupported, setMotionSupported] = useState(true)

  useEffect(() => {
    // Check if device motion/pedometer is available.
    // Since Web API for pedometer doesn't exist natively for standard browsers without flags,
    // we will attempt a graceful check or just show it's unavailable on desktop.
    if (typeof window !== 'undefined' && !window.DeviceMotionEvent) {
      setMotionSupported(false)
    }
  }, [])

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)

  const reloadData = async () => {
    const today = todayStr()
    const [allTasks, dayTotals, s, user, act, works] = await Promise.all([
      getEntries('tasks', t => t.date === today),
      getDayTotals(today),
      getSettings(),
      getCurrentUserInfo(),
      getActivityLog(today),
      getWorkouts(today)
    ])
    setTasks(allTasks)
    setTotals(dayTotals)
    if (s?.goals) setGoals(s.goals)
    if (user?.username) setUsername(user.username)
    if (s?.waterLog) {
      setWater(s.waterLog[today] || 0)
    }

    // Sum workout calories
    const calsBurned = works.filter(w => w.date === today).reduce((sum, w) => sum + (w.calories_burned || 0), 0)
    setActivity({
      steps: act?.steps || 0,
      distance: act?.distance || 0,
      caloriesBurned: calsBurned
    })
  }

  useEffect(() => { reloadData() }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const remainingCalories = Math.max(0, goals.calories - totals.calories)

  return (
    <main
      id="main-content"
      aria-label="Home page content"
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div
        className="w-full px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 space-y-10"
        style={{ paddingBottom: 'calc(6rem + 24px)' }}
      >
        {/* Greeting */}
        <header className="anim-down">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--t-1)' }}>
            {t('home.goodMorning', 'Good morning')}, {username} 👋
          </h1>
          <p className="text-[15px]" style={{ color: 'var(--t-2)' }}>
            {t('home.todayOverview', "Let's make today a great day. Here is your overview.")}
          </p>
        </header>

        <WarningsBanner activity={activity} totals={totals} goals={goals} water={water} />

        {/* Today's Overview */}
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-[14px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t-3)' }}>
            {t('home.todayOverview', "Today's Overview")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <OverviewCard title="Completed Tasks" value={`${completedTasks} / ${totalTasks}`} subtext={`${totalTasks - completedTasks} tasks remaining`} Icon={CheckCircle2} gradientClass="bg-gradient-to-br from-violet-500 to-indigo-600" delay="anim-delay-1" />
            <OverviewCard title="Calories" value={totals.calories.toLocaleString()} subtext={`${remainingCalories.toLocaleString()} kcal remaining`} Icon={Flame} gradientClass="bg-gradient-to-br from-orange-400 to-pink-500" delay="anim-delay-2" />
            <OverviewCard title="Water" value="1.5 L" subtext="Goal: 2.5 L" Icon={Droplet} gradientClass="bg-gradient-to-br from-sky-400 to-blue-600" delay="anim-delay-3" />
            <OverviewCard title="Mood" value="Great" subtext="Feeling energized" Icon={Smile} gradientClass="bg-gradient-to-br from-emerald-400 to-teal-500" delay="anim-delay-4" />
          </div>
        </section>

        {/* Quick Actions */}
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-[14px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t-3)' }}>
            {t('home.quickActions', 'Quick Actions')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionButton label={t('home.logWorkout', 'Add Task')} Icon={Plus} colorClass="text-violet-400" delay="anim-delay-2" onClick={() => setShowTaskModal(true)} />
            <QuickActionButton label={t('home.addCalories', 'Add Meal')} Icon={Utensils} colorClass="text-orange-400" delay="anim-delay-3" onClick={() => navigate('/calories')} />
            <QuickActionButton label={t('home.addNote', 'Add Note')} Icon={FileText} colorClass="text-sky-400" delay="anim-delay-4" onClick={() => setShowNoteModal(true)} />
          </div>
        </section>

        {/* Habit Tracker */}
        <section aria-labelledby="habits-heading">
          <h2 id="habits-heading" className="text-[14px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t-3)' }}>
            Habits Tracker
          </h2>
          <div className="glass-card p-4 anim-up anim-delay-5">
            {!motionSupported && (
              <div className="mb-4 p-3 rounded-xl text-[13px] border border-amber-500/20 bg-amber-500/10 text-amber-400">
                t('home.autoDataUnavailable')
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[20px] font-bold" style={{ color: 'var(--t-1)' }}>{activity.steps.toLocaleString()}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-3)' }}>Steps</p>
              </div>
              <div>
                <p className="text-[20px] font-bold" style={{ color: 'var(--t-1)' }}>{activity.distance} km</p>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-3)' }}>Distance</p>
              </div>
              <div>
                <p className="text-[20px] font-bold" style={{ color: 'var(--orange)' }}>{activity.caloriesBurned}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-3)' }}>Kcal Burned</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activities */}
        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="text-[14px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t-3)' }}>
            Recent Activities
          </h2>
          <div className="space-y-3">
            <ActivityCard title="Morning Run" description="5.2 km · 342 kcal burned" time="09:14 AM" Icon={Activity} colorClass="text-violet-400" delay="anim-delay-3" />
            <ActivityCard title="Healthy Lunch" description="Chicken salad · 480 kcal" time="12:30 PM" Icon={Heart} colorClass="text-pink-400" delay="anim-delay-4" />
            <ActivityCard title="Deep Work Session" description="Completed 2 tasks" time="02:15 PM" Icon={Zap} colorClass="text-amber-400" delay="anim-delay-5" />
          </div>
        </section>

      </div>

      {showTaskModal && (
        <AddTaskModal
          onClose={() => setShowTaskModal(false)}
          onAdd={async (title) => {
            await addEntry('tasks', { title, completed: false })
            setShowTaskModal(false)
            reloadData()
          }}
        />
      )}

      {showNoteModal && (
        <AddNoteModal
          onClose={() => setShowNoteModal(false)}
          onAdd={async (content) => {
            await addEntry('notes', { content })
            setShowNoteModal(false)
            reloadData()
          }}
        />
      )}
    </main>
  )
}
