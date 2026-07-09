import { Flame, CalendarCheck, CheckSquare, Trophy, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

function clsx(...args) { return args.filter(Boolean).join(' ') }

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

export default function StatisticsPage() {
  // Chart Data
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Calories Burned',
        data: [450, 520, 380, 610, 590, 480, 720],
        borderColor: '#7c3aed', // violet-600
        backgroundColor: 'rgba(124, 58, 237, 0.2)', // violet with opacity
        tension: 0.4, // Smooth curve
        borderWidth: 3,
        pointBackgroundColor: '#12121a', // inner color
        pointBorderColor: '#a78bfa', // outer color
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 11, family: 'Inter' },
          padding: 10,
        },
        beginAtZero: true,
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 12, family: 'Inter' },
          padding: 10,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">Statistics</h1>
          <p className="text-[14px]" style={{ color: 'var(--t-3)' }}>Deep dive into your health and productivity data.</p>
        </div>

        {/* 4 Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Calories"
            value="14,240"
            subtitle="Burned this month"
            trend={12}
            Icon={Flame}
            gradientClass="bg-gradient-to-br from-orange-400 to-pink-500"
            delay="anim-delay-1"
          />
          <StatCard
            title="Completed Days"
            value="24"
            subtitle="Goals met this month"
            trend={5}
            Icon={CalendarCheck}
            gradientClass="bg-gradient-to-br from-violet-500 to-indigo-600"
            delay="anim-delay-2"
          />
          <StatCard
            title="Tasks"
            value="128"
            subtitle="Tasks completed"
            trend={-2}
            Icon={CheckSquare}
            gradientClass="bg-gradient-to-br from-sky-400 to-blue-600"
            delay="anim-delay-3"
          />
          <StatCard
            title="Records"
            value="7"
            subtitle="Personal bests hit"
            trend={18}
            Icon={Trophy}
            gradientClass="bg-gradient-to-br from-amber-400 to-orange-500"
            delay="anim-delay-4"
          />
        </div>

        {/* Chart Section */}
        <section aria-labelledby="chart-heading" className="glass-card p-6 anim-up anim-delay-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 id="chart-heading" className="text-lg font-bold text-white tracking-tight">Weekly Progress</h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--t-3)' }}>Calories burned over the last 7 days.</p>
            </div>
            <select className="bg-black/20 border border-white/10 text-white text-sm font-medium rounded-lg px-4 py-2 outline-none focus:border-violet-500 transition-colors cursor-pointer appearance-none min-w-[120px]">
              <option value="this-week" className="bg-[#12121a]">This Week</option>
              <option value="last-week" className="bg-[#12121a]">Last Week</option>
              <option value="this-month" className="bg-[#12121a]">This Month</option>
            </select>
          </div>
          
          <div className="w-full h-[300px] sm:h-[350px]">
            <Line data={data} options={options} />
          </div>
        </section>

        {/* Recent Statistics */}
        <section aria-labelledby="recent-heading" className="glass-card p-6 anim-up anim-delay-6">
          <h2 id="recent-heading" className="text-lg font-bold text-white tracking-tight mb-5 pb-4 border-b border-white/5">
            Recent Statistics
          </h2>
          <div className="space-y-1">
            <RecentStatItem
              title="Longest Running Streak"
              date="Jul 5, 2026"
              value="14 Days"
              isPositive={true}
            />
            <RecentStatItem
              title="Highest Calorie Intake"
              date="Jul 4, 2026"
              value="3,200 kcal"
              isPositive={false}
            />
            <RecentStatItem
              title="Most Tasks Completed"
              date="Jul 2, 2026"
              value="12 Tasks"
              isPositive={true}
            />
            <RecentStatItem
              title="Lowest Sleep Duration"
              date="Jun 28, 2026"
              value="4.5 Hours"
              isPositive={false}
            />
          </div>
        </section>

      </div>
    </main>
  )
}
