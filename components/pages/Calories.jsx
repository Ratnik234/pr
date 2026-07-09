import { Plus, Flame, Beef, Droplet, Wheat, Search } from 'lucide-react'

// Helper for classes
function clsx(...args) { return args.filter(Boolean).join(' ') }

function MacroCard({ label, value, target, unit, Icon, colorClass, gradientClass, delay }) {
  const pct = Math.min(Math.round((value / target) * 100), 100)
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

export default function CaloriesPage() {
  const foods = [
    { id: 1, name: 'Grilled Chicken Breast', weight: '150g', cal: 248, p: '46g', f: '5g', c: '0g' },
    { id: 2, name: 'Brown Rice', weight: '200g', cal: 224, p: '5g', f: '2g', c: '46g' },
    { id: 3, name: 'Avocado', weight: '100g', cal: 160, p: '2g', f: '15g', c: '9g' },
    { id: 4, name: 'Greek Yogurt', weight: '170g', cal: 100, p: '17g', f: '0g', c: '6g' },
    { id: 5, name: 'Almonds', weight: '30g', cal: 164, p: '6g', f: '14g', c: '6g' },
  ]

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
          <button className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-transform hover:scale-105">
            <Plus size={16} />
            Add Food
          </button>
        </div>

        {/* 4 Cards (Macros) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MacroCard
            label="Calories"
            value={896}
            target={2200}
            unit="kcal"
            Icon={Flame}
            colorClass="#f97316" // orange-500
            gradientClass="bg-gradient-to-br from-orange-400 to-pink-500"
            delay="anim-delay-1"
          />
          <MacroCard
            label="Protein"
            value={76}
            target={140}
            unit="g"
            Icon={Beef}
            colorClass="#a78bfa" // violet-400
            gradientClass="bg-gradient-to-br from-violet-500 to-indigo-600"
            delay="anim-delay-2"
          />
          <MacroCard
            label="Fat"
            value={36}
            target={65}
            unit="g"
            Icon={Droplet}
            colorClass="#38bdf8" // sky-400
            gradientClass="bg-gradient-to-br from-sky-400 to-blue-600"
            delay="anim-delay-3"
          />
          <MacroCard
            label="Carbs"
            value={67}
            target={250}
            unit="g"
            Icon={Wheat}
            colorClass="#34d399" // emerald-400
            gradientClass="bg-gradient-to-br from-emerald-400 to-teal-500"
            delay="anim-delay-4"
          />
        </div>

        {/* Food Table Area */}
        <div className="glass-card overflow-hidden anim-up anim-delay-5" style={{ padding: 0 }}>
          
          <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold text-white tracking-tight">Food Log</h2>
            
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search food..."
                className="w-full sm:w-64 border rounded-xl py-2 pl-9 pr-3 text-[13px] text-white transition-colors"
                style={{
                  background: 'var(--bg-raised)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-3)' }}>Food</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-3)' }}>Weight</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--t-3)' }}>Calories</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-violet-400">Protein</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-sky-400">Fat</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-emerald-400">Carbs</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {foods.map((food) => (
                  <tr key={food.id} className="transition-colors hover:bg-white/[0.03] group cursor-default">
                    <td className="px-5 py-4">
                      <p className="text-[14px] font-semibold text-gray-200 group-hover:text-white transition-colors">{food.name}</p>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-medium text-gray-400">{food.weight}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-[13px] font-bold text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-md border border-orange-400/20">
                        {food.cal}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-gray-300">{food.p}</td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-gray-300">{food.f}</td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-gray-300">{food.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer of table */}
          <div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}>
            <div className="flex items-center gap-4 text-sm font-bold">
              <span style={{ color: 'var(--t-3)' }}>Total:</span>
              <span className="text-orange-400 text-base">896 kcal</span>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
