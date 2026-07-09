import { CheckCircle2, Flame, Droplet, Smile, Plus, Utensils, FileText, Activity, Heart, Zap } from 'lucide-react'

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

function QuickActionButton({ label, Icon, colorClass, delay }) {
  return (
    <button className={clsx("flex items-center gap-3 p-4 rounded-[16px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg anim-up", delay)} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
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

export default function Home() {
  return (
    <main
      id="main-content"
      aria-label="Home page content"
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div
        className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-10"
        style={{ paddingBottom: 'calc(6rem + 24px)' }} // Bottom nav padding
      >
        {/* Greeting */}
        <header className="anim-down">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--t-1)' }}>
            Good morning, Alex 👋
          </h1>
          <p className="text-[15px]" style={{ color: 'var(--t-2)' }}>
            Let's make today a great day. Here is your overview.
          </p>
        </header>

        {/* Today's Overview */}
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-[14px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t-3)' }}>
            Today's Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <OverviewCard
              title="Completed Tasks"
              value="5 / 8"
              subtext="3 tasks remaining"
              Icon={CheckCircle2}
              gradientClass="bg-gradient-to-br from-violet-500 to-indigo-600"
              delay="anim-delay-1"
            />
            <OverviewCard
              title="Calories"
              value="1,648"
              subtext="552 kcal remaining"
              Icon={Flame}
              gradientClass="bg-gradient-to-br from-orange-400 to-pink-500"
              delay="anim-delay-2"
            />
            <OverviewCard
              title="Water"
              value="1.5 L"
              subtext="Goal: 2.5 L"
              Icon={Droplet}
              gradientClass="bg-gradient-to-br from-sky-400 to-blue-600"
              delay="anim-delay-3"
            />
            <OverviewCard
              title="Mood"
              value="Great"
              subtext="Feeling energized"
              Icon={Smile}
              gradientClass="bg-gradient-to-br from-emerald-400 to-teal-500"
              delay="anim-delay-4"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="text-[14px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t-3)' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionButton
              label="Add Task"
              Icon={Plus}
              colorClass="text-violet-400"
              delay="anim-delay-2"
            />
            <QuickActionButton
              label="Add Meal"
              Icon={Utensils}
              colorClass="text-orange-400"
              delay="anim-delay-3"
            />
            <QuickActionButton
              label="Add Note"
              Icon={FileText}
              colorClass="text-sky-400"
              delay="anim-delay-4"
            />
          </div>
        </section>

        {/* Today's Activity */}
        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="text-[14px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t-3)' }}>
            Today's Activity
          </h2>
          <div className="space-y-3">
            <ActivityCard
              title="Morning Run"
              description="5.2 km · 342 kcal burned"
              time="09:14 AM"
              Icon={Activity}
              colorClass="text-violet-400"
              delay="anim-delay-3"
            />
            <ActivityCard
              title="Healthy Lunch"
              description="Chicken salad · 480 kcal"
              time="12:30 PM"
              Icon={Heart}
              colorClass="text-pink-400"
              delay="anim-delay-4"
            />
            <ActivityCard
              title="Deep Work Session"
              description="Completed 2 tasks"
              time="02:15 PM"
              Icon={Zap}
              colorClass="text-amber-400"
              delay="anim-delay-5"
            />
          </div>
        </section>

      </div>
    </main>
  )
}
