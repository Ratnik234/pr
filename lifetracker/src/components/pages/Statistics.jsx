import { useState, useEffect } from 'react'
import { Flame, CalendarCheck, CheckSquare, Trophy, ArrowUp, ArrowDown, Plus } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { getDayTotals, computeStreak, getSettings, getEntries, addEntry, updateEntry, todayStr } from '../../utils/storage'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
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

// ─── StatisticsPage ───────────────────────────────────────────────────────────
export default function StatisticsPage() {
  const [weeklyData, setWeeklyData] = useState({ labels: [], values: [], calorieLimit: 2200 })
  const [weightData, setWeightData] = useState({ labels: [], values: [] })
  const [streak, setStreak] = useState(0)
  const [totalWeekCal, setTotalWeekCal] = useState(0)
  const [newWeight, setNewWeight] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    const days = getLast7Days()
    const goal = getSettings()?.goals?.calories ?? 2200
    const values = days.map(d => getDayTotals(d).calories)
    const total = values.reduce((a, b) => a + b, 0)

    setWeeklyData({
      labels: days.map(shortDay),
      values,
      calorieLimit: goal,
    })
    setTotalWeekCal(total)
    setStreak(computeStreak())

    // Weight Data
    const allWeights = getEntries('weight')
    let lastWeight = null
    const wValues = days.map(d => {
      // get weight for this day
      const entry = allWeights.find(w => w.date === d)
      if (entry) lastWeight = entry.val
      return lastWeight
    })
    setWeightData({
      labels: days.map(shortDay),
      values: wValues
    })
  }

  function handleAddWeight() {
    const val = parseFloat(newWeight)
    if (!isNaN(val) && val > 0) {
      // check if today already has weight
      const allWeights = getEntries('weight')
      const today = todayStr()
      const existing = allWeights.find(w => w.date === today)
      // the schema doesn't provide update for generic 'update by date', so I'll just addEntry which assigns new id
      // Ideally I would update it, but addEntry is fine if we just pick the latest or filter.
      // Actually storage.js updateEntry needs ID.
      if (existing) {
        updateEntry('weight', existing.id, { val })
        setNewWeight('')
        loadData()
      } else {
        addEntry('weight', { val })
        setNewWeight('')
        loadData()
      }
    }
  }

  // ─── Line chart (weekly calories) ─────────────────────────────────────────
  const lineData = {
    labels: weeklyData.labels,
    datasets: [
      {
        fill: true,
        label: 'Calories',
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
      },
    ],
  }

  // ─── Line chart (weekly weight) ───────────────────────────────────────────
  const weightChartData = {
    labels: weightData.labels,
    datasets: [
      {
        fill: true,
        label: 'Weight (kg)',
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
        spanGaps: true
      },
    ],
  }

  // ─── Bar chart (daily breakdown vs goal) ──────────────────────────────────
  const barData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Calories',
        data: weeklyData.values,
        backgroundColor: weeklyData.values.map(v =>
          v > weeklyData.calorieLimit ? 'rgba(239,68,68,0.7)' : 'rgba(79,122,74,0.7)'
        ),
        borderRadius: 6,
      },
    ],
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
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        beginAtZero: false
      }
    }
  }

  return (
    <main
      id="main-content"
      aria-label="Statistics page"
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8" style={{ paddingBottom: 'calc(6rem + 24px)' }}>

        {/* Header */}
        <div className="anim-down">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--t-1)' }}>Statistics</h1>
          <p className="text-[14px]" style={{ color: 'var(--t-3)' }}>Deep dive into your health and productivity data.</p>
        </div>

        {/* 4 Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Weekly Calories"
            value={totalWeekCal.toLocaleString()}
            subtitle="Total this week"
            trend={0}
            Icon={Flame}
            gradientClass="bg-gradient-to-br from-orange-400 to-pink-500"
            delay="anim-delay-1"
          />
          <StatCard
            title="Streak"
            value={streak}
            subtitle={streak === 1 ? '1 day in a row' : `${streak} days in a row`}
            trend={streak > 0 ? 5 : 0}
            Icon={CalendarCheck}
            gradientClass="bg-gradient-to-br from-violet-500 to-indigo-600"
            delay="anim-delay-2"
          />
          <StatCard
            title="Daily Goal"
            value={`${weeklyData.calorieLimit}`}
            subtitle="kcal target / day"
            trend={0}
            Icon={CheckSquare}
            gradientClass="bg-gradient-to-br from-sky-400 to-blue-600"
            delay="anim-delay-3"
          />
          <StatCard
            title="Days Tracked"
            value={weeklyData.values.filter(v => v > 0).length}
            subtitle="Out of last 7 days"
            trend={18}
            Icon={Trophy}
            gradientClass="bg-gradient-to-br from-amber-400 to-orange-500"
            delay="anim-delay-4"
          />
        </div>

        {/* Weight Tracking */}
        <section aria-labelledby="weight-heading" className="glass-card p-6 anim-up anim-delay-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 id="weight-heading" className="text-lg font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>Weight Tracking</h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--t-3)' }}>Log your weight and monitor progress.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Weight (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
              />
              <button 
                onClick={handleAddWeight}
                className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus size={16} /> Log
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
                <h2 id="chart-heading" className="text-lg font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>Weekly Calorie Trend</h2>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--t-3)' }}>Calories consumed over the last 7 days.</p>
              </div>
            </div>
            <div className="w-full h-[260px]">
              <Line data={lineData} options={commonOptions} />
            </div>
          </section>

          {/* Bar Chart — vs Goal */}
          <section aria-labelledby="bar-heading" className="glass-card p-6 anim-up anim-delay-6">
            <div className="mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <h2 id="bar-heading" className="text-lg font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>Daily vs. Goal</h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--t-3)' }}>
                Green = within goal · <span style={{ color: '#f87171' }}>Red = over goal</span>
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
            Highlights
          </h2>
          <div className="space-y-1">
            <RecentStatItem
              title="Current Streak"
              date="Days in a row with logged meals"
              value={`${streak} days`}
              isPositive={streak > 0}
            />
            <RecentStatItem
              title="Weekly Total Calories"
              date="Sum of last 7 days"
              value={`${totalWeekCal.toLocaleString()} kcal`}
              isPositive={totalWeekCal <= weeklyData.calorieLimit * 7}
            />
            <RecentStatItem
              title="Days Tracked This Week"
              date="Days with at least one food entry"
              value={`${weeklyData.values.filter(v => v > 0).length} / 7`}
              isPositive={true}
            />
          </div>
        </section>

      </div>
    </main>
  )
}
