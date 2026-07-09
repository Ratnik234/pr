import { useState, useEffect, useCallback } from 'react'
import { Plus, Flame, Beef, Droplet, Wheat, Search, Trash2 } from 'lucide-react'
import {
  addEntry, deleteEntry, getCaloriesByDate, getDayTotals,
  getSettings, todayStr,
} from '../../utils/storage'

// Helper for classes
function clsx(...args) { return args.filter(Boolean).join(' ') }

// ─── MacroCard ────────────────────────────────────────────────────────────────
function MacroCard({ label, value, target, unit, Icon, colorClass, gradientClass, delay }) {
  const pct = target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0
  return (
    <div className={clsx("glass-card p-5 flex flex-col gap-4 anim-up", delay)}>
      <div className="flex justify-between items-start">
        <div className={clsx("w-10 h-10 rounded-[12px] flex items-center justify-center text-white", gradientClass)} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <Icon size={20} />
        </div>
        <span className="text-[12px] font-bold px-2 py-1 rounded-lg" style={{ background: `${colorClass}20`, color: colorClass }}>
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--t-3)' }}>{label}</p>
        <div className="flex items-end gap-1.5 mb-1">
          <span className="text-2xl font-bold leading-none tracking-tight" style={{ color: 'var(--t-1)' }}>{value}</span>
          <span className="text-[13px] font-medium mb-0.5" style={{ color: 'var(--t-3)' }}>/ {target} {unit}</span>
        </div>
        <div className="progress-track mt-4" style={{ height: 4 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, height: '100%', background: colorClass }} />
        </div>
      </div>
    </div>
  )
}

// ─── AddFoodModal ─────────────────────────────────────────────────────────────
function AddFoodModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', calories: '', protein: '', fat: '', carbs: '' })
  const [error, setError] = useState('')

  function handle(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setError('')
  }

  function submit() {
    if (!form.name.trim()) { setError('Вкажіть назву страви'); return }
    onAdd({
      name:     form.name.trim(),
      calories: Number(form.calories) || 0,
      protein:  Number(form.protein)  || 0,
      fat:      Number(form.fat)      || 0,
      carbs:    Number(form.carbs)    || 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="glass-card p-6 w-full max-w-md anim-up" style={{ border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-bold text-white mb-5">Add Food Entry</h3>

        <div className="space-y-3">
          {[
            { id: 'name',     label: 'Food Name',   type: 'text',   placeholder: 'e.g. Grilled Chicken' },
            { id: 'calories', label: 'Calories',    type: 'number', placeholder: 'kcal' },
            { id: 'protein',  label: 'Protein (g)', type: 'number', placeholder: 'g' },
            { id: 'fat',      label: 'Fat (g)',      type: 'number', placeholder: 'g' },
            { id: 'carbs',    label: 'Carbs (g)',    type: 'number', placeholder: 'g' },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--t-3)' }}>
                {label}
              </label>
              <input
                id={`food-input-${id}`}
                type={type}
                placeholder={placeholder}
                value={form[id]}
                onChange={e => handle(id, e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                className="w-full rounded-xl px-3 py-2.5 text-[14px] text-white outline-none transition-colors focus:ring-1"
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  '--tw-ring-color': 'rgba(124,58,237,0.45)',
                }}
              />
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-[12px] mt-3">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            id="add-food-cancel"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--t-2)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          <button
            id="add-food-submit"
            onClick={submit}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold btn-primary"
          >
            Add Food
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CaloriesPage ─────────────────────────────────────────────────────────────
export default function CaloriesPage() {
  const today = todayStr()
  const [foods, setFoods]       = useState([])
  const [totals, setTotals]     = useState({ calories: 0, protein: 0, fat: 0, carbs: 0 })
  const [goals, setGoals]       = useState({ calories: 2200, protein: 140, fat: 65, carbs: 250 })
  const [search, setSearch]     = useState('')
  const [showModal, setShowModal] = useState(false)

  // ─── Load from storage ──────────────────────────────────────────────────────
  const reload = useCallback(() => {
    const entries = getCaloriesByDate(today)
    setFoods(entries)
    setTotals(getDayTotals(today))
    const s = getSettings()
    if (s?.goals) setGoals(s.goals)
  }, [today])

  useEffect(() => { reload() }, [reload])

  // ─── Add food ───────────────────────────────────────────────────────────────
  function handleAdd(entry) {
    addEntry('calories', entry)
    reload()
  }

  // ─── Delete food ─────────────────────────────────────────────────────────────
  function handleDelete(id) {
    deleteEntry('calories', id)
    reload()
  }

  // ─── Filtered list ───────────────────────────────────────────────────────────
  const filtered = search
    ? foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods

  return (
    <main
      id="main-content"
      aria-label="Calories page"
      className="flex-1 overflow-y-auto"
      style={{ minHeight: 0 }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8" style={{ paddingBottom: 'calc(6rem + 24px)' }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-down">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">Today's Calories</h1>
            <p className="text-[14px]" style={{ color: 'var(--t-3)' }}>Track your nutrition and macro goals.</p>
          </div>
          <button
            id="add-food-btn"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-transform hover:scale-105"
          >
            <Plus size={16} />
            Add Food
          </button>
        </div>

        {/* 4 Macro Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MacroCard
            label="Calories"
            value={totals.calories}
            target={goals.calories}
            unit="kcal"
            Icon={Flame}
            colorClass="#f97316"
            gradientClass="bg-gradient-to-br from-orange-400 to-pink-500"
            delay="anim-delay-1"
          />
          <MacroCard
            label="Protein"
            value={totals.protein}
            target={goals.protein}
            unit="g"
            Icon={Beef}
            colorClass="#a78bfa"
            gradientClass="bg-gradient-to-br from-violet-500 to-indigo-600"
            delay="anim-delay-2"
          />
          <MacroCard
            label="Fat"
            value={totals.fat}
            target={goals.fat}
            unit="g"
            Icon={Droplet}
            colorClass="#38bdf8"
            gradientClass="bg-gradient-to-br from-sky-400 to-blue-600"
            delay="anim-delay-3"
          />
          <MacroCard
            label="Carbs"
            value={totals.carbs}
            target={goals.carbs}
            unit="g"
            Icon={Wheat}
            colorClass="#34d399"
            gradientClass="bg-gradient-to-br from-emerald-400 to-teal-500"
            delay="anim-delay-4"
          />
        </div>

        {/* Food Log Table */}
        <div className="glass-card overflow-hidden anim-up anim-delay-5" style={{ padding: 0 }}>

          <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold text-white tracking-tight">Food Log</h2>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="food-search"
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-64 border rounded-xl py-2 pl-9 pr-3 text-[13px] text-white transition-colors"
                style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="p-10 text-center" style={{ color: 'var(--t-3)' }}>
                <p className="text-[14px] font-medium">No food entries for today yet.</p>
                <p className="text-[12px] mt-1">Click «Add Food» to log your first meal.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-3)' }}>Food</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-3)' }}>Calories</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-violet-400">Protein</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-sky-400">Fat</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-emerald-400">Carbs</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-3)' }}></th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {filtered.map(food => (
                    <tr key={food.id} className="transition-colors hover:bg-white/[0.03] group cursor-default">
                      <td className="px-5 py-4">
                        <p className="text-[14px] font-semibold text-gray-200 group-hover:text-white transition-colors">{food.name}</p>
                        <p className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--t-3)' }}>{food.date}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-md border border-orange-400/20">
                          {food.calories} kcal
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-gray-300">{food.protein}g</td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-gray-300">{food.fat}g</td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-gray-300">{food.carbs}g</td>
                      <td className="px-5 py-4">
                        <button
                          id={`delete-food-${food.id}`}
                          onClick={() => handleDelete(food.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
                          aria-label={`Delete ${food.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span style={{ color: 'var(--t-3)' }}>Total:</span>
              <span className="text-orange-400 text-base">{totals.calories} kcal</span>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddFoodModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </main>
  )
}
