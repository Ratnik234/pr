import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, FileText, Utensils, Plus, Trash2, X } from 'lucide-react'
import { getEntries, getCaloriesByDate, updateEntry, addEntry, deleteEntry } from '../../utils/storage'

// Helper for classes
function clsx(...args) { return args.filter(Boolean).join(' ') }

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Helper to format Date to YYYY-MM-DD
function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function AddEntryModal({ onClose, onAdd, selectedDateStr }) {
  const [type, setType] = useState('task') // 'task' | 'note'
  const [text, setText] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(type, text)
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-up">
      <div className="w-full max-w-sm p-6 rounded-[24px] shadow-2xl glass-card relative" style={{ background: 'var(--bg-panel)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--t-1)' }}>Add Entry ({selectedDateStr})</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setType('task')}
              className={clsx("flex-1 py-2 rounded-lg text-sm font-semibold transition-colors", type === 'task' ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-gray-400 border border-transparent")}
            >
              Task
            </button>
            <button 
              type="button"
              onClick={() => setType('note')}
              className={clsx("flex-1 py-2 rounded-lg text-sm font-semibold transition-colors", type === 'note' ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "bg-white/5 text-gray-400 border border-transparent")}
            >
              Note
            </button>
          </div>
          
          {type === 'task' ? (
            <input
              type="text"
              placeholder="Task title"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
              autoFocus
            />
          ) : (
            <textarea
              placeholder="Write your note here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
              autoFocus
            />
          )}
          
          <button type="submit" className="btn-primary w-full py-3 rounded-xl mt-2 text-[15px]">
            Save
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Storage Data
  const [tasks, setTasks] = useState([])
  const [meals, setMeals] = useState([])
  const [notes, setNotes] = useState([])
  
  const [showAddModal, setShowAddModal] = useState(false)

  const selectedDateStr = useMemo(() => toDateStr(selectedDate), [selectedDate])

  const loadData = () => {
    setTasks(getEntries('tasks', t => t.date === selectedDateStr))
    setMeals(getCaloriesByDate(selectedDateStr))
    setNotes(getEntries('notes', n => n.date === selectedDateStr))
  }

  // Load data when selected date changes
  useEffect(() => {
    loadData()
  }, [selectedDateStr])

  const handleTaskToggle = (task) => {
    const updated = updateEntry('tasks', task.id, { completed: !task.completed })
    if (updated) {
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
    }
  }

  const handleDeleteTask = (id) => {
    if (confirm("Delete this task?")) {
      deleteEntry('tasks', id)
      loadData()
    }
  }

  const handleDeleteNote = (id) => {
    if (confirm("Delete this note?")) {
      deleteEntry('notes', id)
      loadData()
    }
  }

  const handleAddEntry = (type, text) => {
    if (type === 'task') {
      // Create manually to enforce the selected date
      const data = JSON.parse(localStorage.getItem('lifetracker_data') || '{}')
      if (!data.tasks) data.tasks = []
      data.tasks.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        date: selectedDateStr,
        title: text,
        completed: false
      })
      localStorage.setItem('lifetracker_data', JSON.stringify(data))
    } else {
      const data = JSON.parse(localStorage.getItem('lifetracker_data') || '{}')
      if (!data.notes) data.notes = []
      data.notes.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        date: selectedDateStr,
        content: text
      })
      localStorage.setItem('lifetracker_data', JSON.stringify(data))
    }
    setShowAddModal(false)
    loadData()
  }

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
  
  // Next month days to fill the grid (up to 42 slots = 6 weeks)
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

  // Mock checking if a day has data for indicators
  const allTasks = useMemo(() => getEntries('tasks'), [tasks]) // dependency to trigger re-render on add
  const hasData = (d) => {
    const dStr = toDateStr(d)
    return allTasks.some(t => t.date === dStr)
  }

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
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 hover:brightness-110"
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
              <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--border)' }}>
                {days.map((dayObj, i) => {
                  const today = isToday(dayObj.date)
                  const selected = isSelected(dayObj.date)
                  const hasActivity = hasData(dayObj.date)
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
                      
                      {/* Events Indicator */}
                      {dayObj.isCurrentMonth && hasActivity && (
                        <div className="px-1.5 py-0.5 mb-1 text-[10px] sm:text-[11px] font-medium rounded truncate" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
                          Activity Logged
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
              <button onClick={() => setShowAddModal(true)} className="icon-btn hover:text-indigo-400 transition-colors" aria-label="Add new entry">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-7">
              {/* Tasks */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-400 mb-3">
                  <CheckCircle2 size={15} /> Tasks
                </h3>
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-2 sm:p-3 rounded-xl transition-colors border border-transparent hover:border-white/10 group" style={{ background: 'var(--bg-raised)' }}>
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={!!task.completed}
                            onChange={() => handleTaskToggle(task)}
                            className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-black/20 border-white/20"
                          />
                          <span className={clsx("text-[13px] transition-colors", task.completed ? "text-gray-400 line-through" : "text-gray-200")}>
                            {task.title}
                          </span>
                        </label>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-500 italic">No tasks for this day.</p>
                )}
              </div>

              {/* Meals */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-orange-400 mb-3">
                  <Utensils size={15} /> Meals
                </h3>
                {meals.length > 0 ? (
                  <div className="space-y-2">
                    {meals.map(meal => (
                      <div key={meal.id} className="flex flex-col gap-1 p-3 rounded-xl border border-transparent hover:border-white/10 transition-colors" style={{ background: 'var(--bg-raised)' }}>
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] font-semibold text-gray-200">{meal.name}</span>
                          <span className="text-[11px] font-mono text-gray-400">{meal.calories} kcal</span>
                        </div>
                        <span className="text-[12px] text-gray-400">P {meal.protein}g · F {meal.fat}g · C {meal.carbs}g</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-500 italic">No meals logged.</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-sky-400 mb-3">
                  <FileText size={15} /> Notes
                </h3>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map(note => (
                      <div key={note.id} className="relative p-4 rounded-xl text-[13px] text-gray-300 leading-relaxed italic border border-transparent hover:border-white/10 transition-colors group" style={{ background: 'var(--bg-raised)' }}>
                        "{note.content}"
                        <button onClick={() => handleDeleteNote(note.id)} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-500 italic">No notes.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {showAddModal && (
        <AddEntryModal
          selectedDateStr={selectedDateStr}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEntry}
        />
      )}
    </main>
  )
}
