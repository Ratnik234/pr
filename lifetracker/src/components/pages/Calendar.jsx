import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, FileText, Utensils, Plus, Trash2, Edit2, X, Clock } from 'lucide-react'
import { getEntries, getCaloriesByDate, updateEntry, addEntry, deleteEntry, uid } from '../../utils/storage'

// Helper for classes
function clsx(...args) { return args.filter(Boolean).join(' ') }

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Helper to format Date to YYYY-MM-DD
function toDateStr(d) {
  const y   = d.getFullYear()
  const m   = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function AddEntryModal({ onClose, onAdd, selectedDateStr, editEntry }) {
  const [type, setType] = useState(editEntry ? (editEntry.title ? 'task' : 'note') : 'task')
  const [text, setText] = useState(editEntry ? (editEntry.title || editEntry.content) : '')
  const [startTime, setStartTime] = useState(editEntry?.start_time || '')
  const [endTime, setEndTime] = useState(editEntry?.end_time || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(type, text, startTime, endTime, editEntry?.id)
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
            <>
              <input
                type="text"
                placeholder="Task title"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-[15px] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }}
                autoFocus
              />
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-[15px] outline-none" 
                    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} 
                  />
                </div>
                <div className="flex-1 relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                    className="w-full pl-9 pr-3 py-3 rounded-xl text-[15px] outline-none" 
                    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} 
                  />
                </div>
              </div>
            </>
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
  const [currentDate,  setCurrentDate]  = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Storage Data
  const [tasks, setTasks] = useState([])
  const [meals, setMeals] = useState([])
  const [notes, setNotes] = useState([])
  // All tasks for calendar indicators (async)
  const [allTaskDates, setAllTaskDates] = useState(new Set())

  const [showAddModal, setShowAddModal] = useState(false)
  const [editEntryData, setEditEntryData] = useState(null)

  const selectedDateStr = useMemo(() => toDateStr(selectedDate), [selectedDate])

  // ─── Load selected day data ───────────────────────────────────────────────
  const loadData = async () => {
    const [dayTasks, dayMeals, dayNotes] = await Promise.all([
      getEntries('tasks',  t => t.date === selectedDateStr),
      getCaloriesByDate(selectedDateStr),
      getEntries('notes',  n => n.date === selectedDateStr),
    ])
    setTasks(dayTasks)
    setMeals(dayMeals)
    setNotes(dayNotes)
  }

  // Load all task dates for calendar indicators
  const loadAllTaskDates = async () => {
    const all = await getEntries('tasks')
    setAllTaskDates(new Set(all.map(t => t.date)))
  }

  useEffect(() => {
    loadData()
  }, [selectedDateStr])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadAllTaskDates()
  }, [tasks])  // refresh indicators when tasks change  // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleTaskToggle = async (task) => {
    const updated = await updateEntry('tasks', task.id, { completed: !task.completed })
    if (updated) {
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
    }
  }

  const handleDeleteTask = async (id) => {
    if (confirm('Delete this task?')) {
      await deleteEntry('tasks', id)
      loadData()
    }
  }

  const handleDeleteNote = async (id) => {
    if (confirm('Delete this note?')) {
      await deleteEntry('notes', id)
      loadData()
    }
  }

  // Add or Update entry
  const handleAddEntry = async (type, text, startTime, endTime, editId) => {
    if (editId) {
      if (type === 'task') {
        await updateEntry('tasks', editId, { title: text, start_time: startTime || null, end_time: endTime || null })
      } else {
        await updateEntry('notes', editId, { content: text })
      }
    } else {
      const entryId = uid()
      if (type === 'task') {
        await addEntry('tasks', { id: entryId, date: selectedDateStr, title: text, start_time: startTime || null, end_time: endTime || null, completed: false })
      } else {
        await addEntry('notes', { id: entryId, date: selectedDateStr, content: text })
      }
    }
    setShowAddModal(false)
    setEditEntryData(null)
    loadData()
    loadAllTaskDates()
  }

  // ─── Calendar grid ────────────────────────────────────────────────────────
  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth     = new Date(year, month + 1, 0).getDate()
  const firstDayIndex   = new Date(year, month, 1).getDay()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday   = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  const days = []
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
  }

  const isToday    = (d) => { const t = new Date(); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear() }
  const isSelected = (d) => d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()
  const hasData    = (d) => allTaskDates.has(toDateStr(d))

  const formatHeader       = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 hover:brightness-110"
                  style={{ background: 'var(--bg-hover)', color: 'var(--t-1)', border: '1px solid var(--border)' }}
                >
                  Today
                </button>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <button onClick={prevMonth} className="p-2 transition-colors hover:brightness-110" style={{ background: 'var(--bg-hover)', color: 'var(--t-2)' }} aria-label="Previous month">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-px h-5" style={{ background: 'var(--border)' }} />
                  <button onClick={nextMonth} className="p-2 transition-colors hover:brightness-110" style={{ background: 'var(--bg-hover)', color: 'var(--t-2)' }} aria-label="Next month">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {/* Days Header */}
              <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}>
                {DAYS_OF_WEEK.map((day, i) => (
                  <div key={day} className="py-3 text-center text-[11px] font-bold uppercase tracking-wider"
                       style={{ color: (i === 0 || i === 6) ? '#f87171' : 'var(--t-3)' }}>
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar Cells */}
              <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--border)' }}>
                {days.map((dayObj, i) => {
                  const today       = isToday(dayObj.date)
                  const selected    = isSelected(dayObj.date)
                  const hasActivity = hasData(dayObj.date)
                  const isWeekend   = dayObj.date.getDay() === 0 || dayObj.date.getDay() === 6
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(dayObj.date)}
                      className={clsx(
                        "relative min-h-[80px] sm:min-h-[120px] p-1.5 sm:p-2 transition-colors cursor-pointer group hover:brightness-125",
                        !dayObj.isCurrentMonth && "opacity-40",
                        selected ? "brightness-110" : ""
                      )}
                      style={{ background: isWeekend ? 'var(--bg-raised)' : 'var(--bg-card)' }}
                    >
                      <div className="flex justify-end mb-1">
                        <span
                          style={!today && !selected && isWeekend ? { color: '#f87171' } : undefined}
                          className={clsx(
                            "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                            today && !selected && "bg-indigo-500/20 text-indigo-400",
                            selected && "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.5)] scale-110",
                            !today && !selected && (isWeekend ? "group-hover:bg-white/10" : "text-gray-300 group-hover:bg-white/10")
                          )}
                        >
                          {dayObj.date.getDate()}
                        </span>
                      </div>
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
              <button onClick={() => { setEditEntryData(null); setShowAddModal(true); }} className="icon-btn hover:text-indigo-400 transition-colors" aria-label="Add new entry">
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
                        <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={!!task.completed}
                            onChange={() => handleTaskToggle(task)}
                            className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-black/20 border-white/20"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] transition-colors block truncate" style={{ color: task.completed ? 'var(--t-3)' : 'var(--t-1)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                            {(task.start_time || task.end_time) && (
                              <span className="text-[10px] text-indigo-400/80 font-mono">
                                {task.start_time || '?'} - {task.end_time || '?'}
                              </span>
                            )}
                          </div>
                        </label>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditEntryData(task); setShowAddModal(true); }} className="text-indigo-300 p-1 hover:bg-indigo-500/20 rounded">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-red-400 p-1 hover:bg-red-500/20 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] italic" style={{ color: 'var(--t-3)' }}>No tasks for this day.</p>
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
                          <span className="text-[13px] font-semibold" style={{ color: 'var(--t-1)' }}>{meal.name}</span>
                          <span className="text-[11px] font-mono" style={{ color: 'var(--t-3)' }}>{meal.calories} kcal</span>
                        </div>
                        <span className="text-[12px]" style={{ color: 'var(--t-3)' }}>P {meal.protein}g · F {meal.fat}g · C {meal.carbs}g</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] italic" style={{ color: 'var(--t-3)' }}>No meals logged.</p>
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
                      <div key={note.id} className="relative p-4 rounded-xl text-[13px] leading-relaxed italic border border-transparent hover:border-white/10 transition-colors group pr-16" style={{ background: 'var(--bg-raised)', color: 'var(--t-2)' }}>
                        "{note.content}"
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditEntryData(note); setShowAddModal(true); }} className="text-sky-300 p-1.5 bg-sky-500/10 hover:bg-sky-500/20 rounded-md">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteNote(note.id)} className="text-red-400 p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] italic" style={{ color: 'var(--t-3)' }}>No notes.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEntryModal
          selectedDateStr={selectedDateStr}
          onClose={() => { setShowAddModal(false); setEditEntryData(null); }}
          onAdd={handleAddEntry}
          editEntry={editEntryData}
        />
      )}
    </main>
  )
}
