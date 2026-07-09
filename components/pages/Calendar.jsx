import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, FileText, Utensils, Plus } from 'lucide-react'

// Helper for classes
function clsx(...args) { return args.filter(Boolean).join(' ') }

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  // Generate calendar grid
  const days = []
  
  // Previous month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    })
  }
  
  // Next month days to fill the grid (up to 42 slots = 6 weeks to keep grid size consistent)
  const totalSlots = 42; 
  const remaining = totalSlots - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    })
  }

  const isToday = (d) => {
    const today = new Date()
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear()
  }

  const isSelected = (d) => {
    return d.getDate() === selectedDate.getDate() &&
           d.getMonth() === selectedDate.getMonth() &&
           d.getFullYear() === selectedDate.getFullYear()
  }

  const formatHeader = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const formatSelectedDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <main
      id="main-content"
      aria-label="Calendar page"
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div
        className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8"
        style={{ paddingBottom: 'calc(6rem + 24px)' }}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ── Left Side: Large Calendar ── */}
          <div className="flex-1 w-full glass-card p-4 sm:p-6 anim-up">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>
                {formatHeader(currentDate)}
              </h1>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={goToday}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200"
                  style={{ background: 'var(--bg-hover)', color: 'var(--t-1)', border: '1px solid var(--border)' }}
                >
                  Today
                </button>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <button
                    onClick={prevMonth}
                    className="p-2 transition-colors hover:brightness-110"
                    style={{ background: 'var(--bg-hover)', color: 'var(--t-2)' }}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-px h-5" style={{ background: 'var(--border)' }} />
                  <button
                    onClick={nextMonth}
                    className="p-2 transition-colors hover:brightness-110"
                    style={{ background: 'var(--bg-hover)', color: 'var(--t-2)' }}
                    aria-label="Next month"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              
              {/* Days Header */}
              <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}>
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="py-3 text-center text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--t-3)' }}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Cells */}
              {/* Use grid-cols-7 with a 1px gap mimicking borders, by giving the container a bg color and cells a solid color */}
              <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--border)' }}>
                {days.map((dayObj, i) => {
                  const today = isToday(dayObj.date)
                  const selected = isSelected(dayObj.date)
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(dayObj.date)}
                      className={clsx(
                        "relative min-h-[80px] sm:min-h-[120px] p-1.5 sm:p-2 transition-colors cursor-pointer group hover:brightness-125",
                        !dayObj.isCurrentMonth && "opacity-40",
                        selected ? "brightness-110" : ""
                      )}
                      style={{ background: 'var(--bg-card)' }}
                    >
                      <div className="flex justify-end mb-1">
                        <span
                          className={clsx(
                            "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                            today && !selected && "bg-indigo-500/20 text-indigo-400",
                            selected && "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.5)] scale-110",
                            !today && !selected && "text-gray-300 group-hover:bg-white/10"
                          )}
                        >
                          {dayObj.date.getDate()}
                        </span>
                      </div>
                      
                      {/* Static Events for visual flair */}
                      {dayObj.isCurrentMonth && dayObj.date.getDate() % 5 === 0 && (
                        <div className="px-1.5 py-0.5 mb-1 text-[10px] sm:text-[11px] font-medium rounded truncate" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                          Workout
                        </div>
                      )}
                      {dayObj.isCurrentMonth && dayObj.date.getDate() % 8 === 0 && (
                        <div className="px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium rounded truncate" style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c' }}>
                          Cheat meal
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Right Side: Selected Day Card ── */}
          <div className="w-full lg:w-[320px] xl:w-[380px] flex-shrink-0 glass-card p-6 anim-up anim-delay-2 lg:sticky lg:top-24">
            
            <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--t-1)' }}>
                {formatSelectedDate(selectedDate)}
              </h2>
              <button className="icon-btn hover:text-indigo-400 transition-colors" aria-label="Add new entry">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-7">
              {/* Tasks */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-400 mb-3">
                  <CheckCircle2 size={15} /> Tasks
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/10 group" style={{ background: 'var(--bg-raised)' }}>
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-black/20 border-white/20" defaultChecked />
                    <span className="text-[13px] text-gray-400 line-through group-hover:text-gray-300 transition-colors">Morning Run (5k)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/10 group" style={{ background: 'var(--bg-raised)' }}>
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-black/20 border-white/20" />
                    <span className="text-[13px] text-gray-200 group-hover:text-white transition-colors">Read 20 pages</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/10 group" style={{ background: 'var(--bg-raised)' }}>
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-black/20 border-white/20" />
                    <span className="text-[13px] text-gray-200 group-hover:text-white transition-colors">Prepare project presentation</span>
                  </label>
                </div>
              </div>

              {/* Meals */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-orange-400 mb-3">
                  <Utensils size={15} /> Meals
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-col gap-1 p-3 rounded-xl border border-transparent hover:border-white/10 transition-colors" style={{ background: 'var(--bg-raised)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-gray-200">Breakfast</span>
                      <span className="text-[11px] font-mono text-gray-400">420 kcal</span>
                    </div>
                    <span className="text-[12px] text-gray-400">Oatmeal, Banana, Coffee</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl border border-transparent hover:border-white/10 transition-colors" style={{ background: 'var(--bg-raised)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-gray-200">Lunch</span>
                      <span className="text-[11px] font-mono text-gray-400">650 kcal</span>
                    </div>
                    <span className="text-[12px] text-gray-400">Chicken Salad, Avocado</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-sky-400 mb-3">
                  <FileText size={15} /> Notes
                </h3>
                <div className="p-4 rounded-xl text-[13px] text-gray-300 leading-relaxed italic border border-transparent hover:border-white/10 transition-colors" style={{ background: 'var(--bg-raised)' }}>
                  "Felt really energetic during the morning run. Need to remember to drink more water in the afternoon."
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
