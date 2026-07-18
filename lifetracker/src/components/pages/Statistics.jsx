import { useState, useEffect } from 'react'
import { Flame, CalendarCheck, CheckSquare, Trophy, ArrowUp, ArrowDown, Plus } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { getDayTotals, computeStreak, getSettings, getEntries, addEntry, updateEntry, todayStr, getActivityLog, logActivity, getWorkouts } from '../../utils/storage'
import { useTranslation } from 'react-i18next'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Filler,
  Legend
)

function clsx(...args) { return args.filter(Boolean).join(' ') }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

function shortDay(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', { weekday: 'short' })
}

// ─── Components ───────────────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, trend, Icon, gradientClass, delay }) {
  const isUp = trend >= 0
  return (
    <div className={clsx("glass-card p-6 flex flex-col gap-4 anim-up group", delay)}>
      <div className="flex justify-between items-start">
        <div className={clsx("w-12 h-12 rounded-[14px] flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110", gradientClass)} style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          <Icon size={22} />
        </div>
        <span
          className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{
            background: isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: isUp ? '#34d399' : '#f87171',
          }}
        >
          {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {Math.abs(trend)}%
        </span>
      </div>
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--t-3)' }}>{title}</p>
        <p className="text-3xl font-bold leading-none tracking-tight mb-2" style={{ color: 'var(--t-1)' }}>{value}</p>
        <p className="text-[13px]" style={{ color: 'var(--t-2)' }}>{subtitle}</p>
      </div>
    </div>
  )
}

function RecentStatItem({ title, value, date, isPositive }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-white/[0.03] border border-transparent hover:border-white/5">
      <div>
        <p className="text-[14px] font-bold" style={{ color: 'var(--t-1)' }}>{title}</p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--t-3)' }}>{date}</p>
      </div>
      <div className="text-right">
        <p className="text-[15px] font-bold" style={{ color: isPositive ? '#34d399' : '#f87171' }}>
          {isPositive ? '+' : '-'}{value}
        </p>
      </div>
    </div>
  )
}

function RecommendationsSection({ workouts, t }) {
  const recommendations = []
  const exerciseStats = {}
  
  workouts.forEach(w => {
    const match = w.title.match(/^(.*?)\s*(\d+(?:\.\d+)?)\s*(kg|lbs)/i)
    if (match) {
      const exercise = match[1].trim().toLowerCase()
      const weight = parseFloat(match[2])
      const date = new Date(w.date)
      if (!exerciseStats[exercise]) exerciseStats[exercise] = []
      exerciseStats[exercise].push({ weight, date })
    }
  })

  const now = new Date()
  Object.keys(exerciseStats).forEach(ex => {
    const history = exerciseStats[ex].sort((a,b) => a.date - b.date)
    if (history.length < 2) return
    const latest = history[history.length - 1]
    const latestWeight = latest.weight
    
    const firstTimeAtWeight = history.find(h => h.weight === latestWeight).date
    const daysSince = (now - firstTimeAtWeight) / (1000 * 60 * 60 * 24)
    const daysSinceLastLift = (now - latest.date) / (1000 * 60 * 60 * 24)
    
    if (daysSinceLastLift > 14) return
    
    if (daysSince > 30) {
      recommendations.push({
        title: t('stats.noProgress', 'Plateau Detected'),
        desc: t('stats.noProgressDesc', "Your lifting weight hasn't changed in a month. Consider a new training program."),
        ex: ex.charAt(0).toUpperCase() + ex.slice(1),
        color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20'
      })
    } else if (daysSince > 14) {
      recommendations.push({
        title: t('stats.increaseWeight', 'Increase Weight'),
        desc: t('stats.increaseWeightDesc', "You have been lifting {{weight}}kg for a while. Consider increasing by 2.5-5kg.", { weight: latestWeight }),
        ex: ex.charAt(0).toUpperCase() + ex.slice(1),
        color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20'
      })
    }
  })

  if (recommendations.length === 0) return null

  return (
    <section aria-labelledby="recs-heading" className="glass-card p-6 anim-up anim-delay-3">
      <h2 id="recs-heading" className="text-lg font-bold tracking-tight mb-5 pb-4 border-b" style={{ color: 'var(--t-1)', borderColor: 'var(--border)' }}>
        {t('stats.recommendations', 'Recommendations')}
      </h2>
      <div className="space-y-3">
        {recommendations.map((r, i) => (
          <div key={i} className={`p-4 rounded-xl border ${r.bg} ${r.border}`}>
            <h3 className={`font-bold text-[15px] ${r.color}`}>{r.title} ({r.ex})</h3>
            <p className="text-[13px] mt-1" style={{ color: 'var(--t-2)' }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── StatisticsPage ───────────────────────────────────────────────────────────
export default function StatisticsPage() {
  const { t } = useTranslation()
  const [weeklyData,    setWeeklyData]    = useState({ labels: [], values: [], calorieLimit: 2200 })
  const [weightData,    setWeightData]    = useState({ labels: [], values: [] })
  const [streak,        setStreak]        = useState(0)
  const [totalWeekCal,  setTotalWeekCal]  = useState(0)
  const [newWeight,     setNewWeight]     = useState('')
  
  // Activity state
  const [activityData, setActivityData] = useState({ steps: 0, distance: 0, running_distance: 0 })
  const [workouts, setWorkouts] = useState([])
  
  // Activity form
  const [formSteps, setFormSteps] = useState('')
  const [formDist, setFormDist] = useState('')
  const [formRun, setFormRun] = useState('')

  useEffect(() => { loadData() }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    const days = getLast7Days()

    // Parallel fetch of all data
    const [settingsData, streakVal, ...dayTotals] = await Promise.all([
      getSettings(),
      computeStreak(),
      ...days.map(d => getDayTotals(d)),
    ])

    const goal   = settingsData?.goals?.calories ?? 2200
    const values = dayTotals.map(t => t.calories)
    const total  = values.reduce((a, b) => a + b, 0)

    setWeeklyData({ labels: days.map(shortDay), values, calorieLimit: goal })
    setTotalWeekCal(total)
    setStreak(streakVal)

    // Weight data
    const allWeights = await getEntries('weight')
    let lastWeight = null
    const wValues = days.map(d => {
      const entry = allWeights.find(w => w.date === d)
      if (entry) lastWeight = entry.weight
      return lastWeight
    })
    setWeightData({ labels: days.map(shortDay), values: wValues })

    // Activity & Workouts
    const todayAct = await getActivityLog(todayStr())
    setActivityData(todayAct)
    setFormSteps(todayAct.steps || '')
    setFormDist(todayAct.distance || '')
    setFormRun(todayAct.running_distance || '')

    const allWorkouts = await getWorkouts()
    setWorkouts(allWorkouts)
  }

  async function handleLogActivity() {
    await logActivity(
      todayStr(),
      parseInt(formSteps) || 0,
      parseFloat(formDist) || 0,
      parseFloat(formRun) || 0
    )
    loadData()
  }

  async function handleAddWeight() {
    const val = parseFloat(newWeight)
    if (isNaN(val) || val <= 0) return

    const allWeights = await getEntries('weight')
    const today      = todayStr()
    const existing   = allWeights.find(w => w.date === today)

    if (existing) {
      await updateEntry('weight', existing.id, { weight: val })
    } else {
      await addEntry('weight', { weight: val })
    }
    setNewWeight('')
    loadData()
  }

  // ─── Line chart (weekly calories) ─────────────────────────────────────────
  const lineData = {
    labels: weeklyData.labels,
    datasets: [{
      fill: true,
      label: t('calories.calories', 'Calories'),
      data: weeklyData.values,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.2)',
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: '#12121a',
      pointBorderColor: '#a78bfa',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  }

  // ─── Line chart (weekly weight) ───────────────────────────────────────────
  const weightChartData = {
    labels: weightData.labels,
    datasets: [{
      fill: true,
      label: t('stats.weightKg', 'Weight (kg)'),
      data: weightData.values,
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: '#12121a',
      pointBorderColor: '#38bdf8',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      spanGaps: true,
    }],
  }

  // ─── Bar chart (daily breakdown vs goal) ──────────────────────────────────
  const barData = {
    labels: weeklyData.labels,
    datasets: [{
      label: t('calories.calories', 'Calories'),
      data: weeklyData.values,
      backgroundColor: weeklyData.values.map(v =>
        v > weeklyData.calorieLimit ? 'rgba(239,68,68,0.7)' : 'rgba(79,122,74,0.7)'
      ),
      borderRadius: 6,
    }],
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18, 18, 26, 0.9)',
        titleColor: '#e9d5ff',
        bodyColor: '#fff',
        borderColor: 'rgba(124, 58, 237, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 11, family: 'Inter' }, padding: 10 },
        beginAtZero: true,
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 12, family: 'Inter' }, padding: 10 },
      },
    },
    interaction: { intersect: false, mode: 'index' },
  }

  const weightChartOptions = {
    ...commonOptions,
    scales: { ...commonOptions.scales, y: { ...commonOptions.scales.y, beginAtZero: false } }
  }

  return (
    <main
      id="main-content"
      aria-label={t('stats.title', 'Statistics')}
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div className="w-full px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 space-y-8" style={{ paddingBottom: 'calc(6rem + 24px)' }}>

        {/* Header */}
        <div className="anim-down">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--t-1)' }}>{t('stats.title', 'Statistics')}</h1>
          <p className="text-[14px]" style={{ color: 'var(--t-3)' }}>{t('stats.subtitle', 'Deep dive into your health and productivity data.')}</p>
        </div>

        {/* 4 Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={t('stats.weeklyCalories', 'Weekly Calories')} value={totalWeekCal.toLocaleString()} subtitle={t('stats.totalThisWeek', 'Total this week')} trend={0} Icon={Flame} gradientClass="bg-gradient-to-br from-orange-400 to-pink-500" delay="anim-delay-1" />
          <StatCard title={t('stats.streak', 'Streak')} value={streak} subtitle={t('stats.daysInARow', '{{count}} days in a row', { count: streak })} trend={streak > 0 ? 5 : 0} Icon={CalendarCheck} gradientClass="bg-gradient-to-br from-violet-500 to-indigo-600" delay="anim-delay-2" />
          <StatCard title={t('stats.dailyGoal', 'Daily Goal')} value={weeklyData.calorieLimit} subtitle={t('stats.kcalTargetPerDay', 'kcal target / day')} trend={0} Icon={CheckSquare} gradientClass="bg-gradient-to-br from-sky-400 to-blue-600" delay="anim-delay-3" />
          <StatCard title={t('stats.daysTracked', 'Days Tracked')} value={weeklyData.values.filter(v => v > 0).length} subtitle={t('stats.outOfLast7Days', 'Out of last 7 days')} trend={18} Icon={Trophy} gradientClass="bg-gradient-to-br from-amber-400 to-orange-500" delay="anim-delay-4" />
        </div>

        <RecommendationsSection workouts={workouts} t={t} />

        {/* Activity & Workouts Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title={t('stats.totalWorkouts', 'Total Workouts')} value={workouts.length} subtitle={t('stats.autoTracked', 'Automatically tracked')} trend={0} Icon={Trophy} gradientClass="bg-gradient-to-br from-indigo-400 to-purple-600" delay="anim-delay-2" />
          <StatCard title={t('stats.workoutCalories', 'Workout Calories')} value={workouts.reduce((a, b) => a + b.calories_burned, 0).toLocaleString()} subtitle={t('stats.burnedInTotal', 'Burned in total')} trend={0} Icon={Flame} gradientClass="bg-gradient-to-br from-red-400 to-orange-500" delay="anim-delay-3" />
          <StatCard title={t('stats.todaysSteps', "Today's Steps")} value={activityData.steps.toLocaleString()} subtitle={t('stats.stepCountToday', 'Step count today')} trend={0} Icon={ArrowUp} gradientClass="bg-gradient-to-br from-emerald-400 to-teal-500" delay="anim-delay-4" />
          <StatCard title={t('stats.todaysDistance', "Today's Distance")} value={`${activityData.distance} km`} subtitle={t('stats.runDistance', 'Run: {{distance}} km', { distance: activityData.running_distance })} trend={0} Icon={ArrowDown} gradientClass="bg-gradient-to-br from-cyan-400 to-blue-500" delay="anim-delay-5" />
        </div>

        {/* Activity Input */}
        <section aria-labelledby="activity-heading" className="glass-card p-6 anim-up anim-delay-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 id="activity-heading" className="text-lg font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>{t('stats.activityTracker', 'Activity Tracker')}</h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--t-3)' }}>{t('stats.activityTrackerDesc', 'Log your daily steps and distance manually.')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--t-2)' }}>{t('stats.stepsLabel', 'Steps')}</label>
              <input type="number" value={formSteps} onChange={(e) => setFormSteps(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--t-2)' }}>{t('stats.distanceKm', 'Distance (km)')}</label>
              <input type="number" step="0.1" value={formDist} onChange={(e) => setFormDist(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} />
            </div>
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--t-2)' }}>{t('stats.runningKm', 'Running (km)')}</label>
              <input type="number" step="0.1" value={formRun} onChange={(e) => setFormRun(e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} />
            </div>
          </div>
          <button onClick={handleLogActivity} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus size={16} /> {t('stats.saveActivity', 'Save Activity')}
          </button>
        </section>

        {/* Weight Tracking */}
        <section aria-labelledby="weight-heading" className="glass-card p-6 anim-up anim-delay-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 id="weight-heading" className="text-lg font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>{t('stats.weightTracking', 'Weight Tracking')}</h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--t-3)' }}>{t('stats.weightTrackingDesc', 'Log your weight and monitor progress.')}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={t('stats.weightKg', 'Weight (kg)')}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
              />
              <button onClick={handleAddWeight} className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <Plus size={16} /> {t('stats.log', 'Log')}
              </button>
            </div>
          </div>
          <div className="w-full h-[260px] sm:h-[300px]">
            <Line data={weightChartData} options={weightChartOptions} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart — Weekly Trend */}
          <section aria-labelledby="chart-heading" className="glass-card p-6 anim-up anim-delay-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 id="chart-heading" className="text-lg font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>{t('stats.weeklyCalorieTrend', 'Weekly Calorie Trend')}</h2>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--t-3)' }}>{t('stats.weeklyCalorieTrendDesc', 'Calories consumed over the last 7 days.')}</p>
              </div>
            </div>
            <div className="w-full h-[260px]">
              <Line data={lineData} options={commonOptions} />
            </div>
          </section>

          {/* Bar Chart — vs Goal */}
          <section aria-labelledby="bar-heading" className="glass-card p-6 anim-up anim-delay-6">
            <div className="mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <h2 id="bar-heading" className="text-lg font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>{t('stats.dailyVsGoal', 'Daily vs. Goal')}</h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--t-3)' }}>
                {t('stats.withinGoal', 'Green = within goal')} · <span style={{ color: '#f87171' }}>{t('stats.overGoal', 'Red = over goal')}</span>
              </p>
            </div>
            <div className="w-full h-[260px]">
              <Bar data={barData} options={commonOptions} />
            </div>
          </section>
        </div>

        {/* Recent Highlights */}
        <section aria-labelledby="recent-heading" className="glass-card p-6 anim-up anim-delay-6">
          <h2 id="recent-heading" className="text-lg font-bold tracking-tight mb-5 pb-4 border-b" style={{ color: 'var(--t-1)', borderColor: 'var(--border)' }}>
            {t('stats.highlights', 'Highlights')}
          </h2>
          <div className="space-y-1">
            <RecentStatItem title={t('stats.currentStreak', 'Current Streak')} date={t('stats.currentStreakDesc', 'Days in a row with logged meals')} value={t('stats.days', '{{count}} days', { count: streak })} isPositive={streak > 0} />
            <RecentStatItem title={t('stats.weeklyTotalCalories', 'Weekly Total Calories')} date={t('stats.weeklyTotalCaloriesDesc', 'Sum of last 7 days')} value={t('stats.kcalUnit', '{{count}} kcal', { count: totalWeekCal.toLocaleString() })} isPositive={totalWeekCal <= weeklyData.calorieLimit * 7} />
            <RecentStatItem title={t('stats.daysTrackedThisWeek', 'Days Tracked This Week')} date={t('stats.daysTrackedThisWeekDesc', 'Days with at least one food entry')} value={`${weeklyData.values.filter(v => v > 0).length} / 7`} isPositive={true} />
          </div>
        </section>

      </div>
    </main>
  )
}
