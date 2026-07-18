import { useState } from 'react'
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { addEntry, getSettings, updateSettings, uid, todayStr } from '../../utils/storage'
import { useTranslation } from 'react-i18next'

export default function GlobalModals({ activeModal, onClose }) {
  if (!activeModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-up">
      <div className="w-full max-w-sm p-6 rounded-[24px] shadow-2xl glass-card relative" style={{ background: 'var(--bg-panel)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 transition-colors" style={{ color: 'var(--t-3)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--t-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t-3)'}>
          <X size={20} />
        </button>
        {activeModal === 'task' && <TaskForm onClose={onClose} />}
        {activeModal === 'meal' && <MealForm onClose={onClose} />}
        {activeModal === 'water' && <WaterForm onClose={onClose} />}
      </div>
    </div>
  )
}

function TaskForm({ onClose }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const today = todayStr()
    await addEntry('tasks', { 
      id: uid(), 
      title, 
      date: today, 
      start_time: startTime || null,
      end_time: endTime || null,
      completed: false 
    })
    onClose()
    window.location.reload()
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--t-1)' }}>{t('modals.addTask', 'Add Task')}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder={t('modals.taskTitle', 'Task title')} 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          autoFocus 
          className="w-full px-4 py-3 rounded-xl text-[15px] outline-none" 
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} 
        />
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-3)' }} />
            <input 
              type="time" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
              className="w-full pl-9 pr-3 py-3 rounded-xl text-[15px] outline-none" 
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} 
            />
          </div>
          <div className="flex-1 relative">
            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t-3)' }} />
            <input 
              type="time" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
              className="w-full pl-9 pr-3 py-3 rounded-xl text-[15px] outline-none" 
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} 
            />
          </div>
        </div>
        <button type="submit" className="btn-primary py-3 rounded-xl">{t('modals.save', 'Save')}</button>
      </form>
    </>
  )
}

function MealForm({ onClose }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !calories) return
    const today = todayStr()
    await addEntry('calories', { id: uid(), date: today, name, calories: Number(calories) })
    onClose()
    window.location.reload()
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-6 text-orange-400">{t('modals.logMeal', 'Log Meal')}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder={t('modals.mealName', 'Meal name')} 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          autoFocus 
          className="w-full px-4 py-3 rounded-xl text-[15px] outline-none" 
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} 
        />
        <input 
          type="number" 
          placeholder={t('modals.caloriesPlaceholder', 'Calories')} 
          value={calories} 
          onChange={(e) => setCalories(e.target.value)} 
          className="w-full px-4 py-3 rounded-xl text-[15px] outline-none" 
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} 
        />
        <button type="submit" className="btn-primary py-3 rounded-xl" style={{ background: '#f97316', color: 'white' }}>{t('modals.save', 'Save')}</button>
      </form>
    </>
  )
}

function WaterForm({ onClose }) {
  const { t } = useTranslation()
  const [ml, setMl] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ml) return
    const s = await getSettings()
    const today = todayStr()
    if (!s.waterLog) s.waterLog = {}
    if (!s.waterLog[today]) s.waterLog[today] = 0
    s.waterLog[today] += Number(ml)
    await updateSettings({ waterLog: s.waterLog })
    onClose()
    window.location.reload()
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-6 text-sky-400">{t('modals.addWater', 'Add Water')}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="number" 
          placeholder={t('modals.volumeMl', 'Volume (ml)')} 
          value={ml} 
          onChange={(e) => setMl(e.target.value)} 
          autoFocus 
          className="w-full px-4 py-3 rounded-xl text-[15px] outline-none" 
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--t-1)' }} 
        />
        <button type="submit" className="btn-primary py-3 rounded-xl" style={{ background: 'var(--sky)', color: 'white' }}>{t('modals.save', 'Save')}</button>
      </form>
    </>
  )
}
