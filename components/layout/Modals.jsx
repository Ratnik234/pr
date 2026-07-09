import useStore from '../../store/useStore';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl anim-down">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function GlobalModals() {
  const { t } = useTranslation();
  const { 
    isLogMealModalOpen, setLogMealModalOpen,
    isWorkoutModalOpen, setWorkoutModalOpen,
    isWaterModalOpen, setWaterModalOpen
  } = useStore();

  return (
    <>
      <Modal 
        isOpen={isLogMealModalOpen} 
        onClose={() => setLogMealModalOpen(false)} 
        title={t('menu.logMeal')}
      >
        <p className="text-gray-400 mb-4">Select a meal to log and track your calories.</p>
        <button onClick={() => setLogMealModalOpen(false)} className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors">
          Save Meal
        </button>
      </Modal>

      <Modal 
        isOpen={isWorkoutModalOpen} 
        onClose={() => setWorkoutModalOpen(false)} 
        title={t('menu.startWorkout')}
      >
        <p className="text-gray-400 mb-4">Track your activity and calories burned.</p>
        <button onClick={() => setWorkoutModalOpen(false)} className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-colors">
          Start Workout
        </button>
      </Modal>

      <Modal 
        isOpen={isWaterModalOpen} 
        onClose={() => setWaterModalOpen(false)} 
        title={t('menu.addWater')}
      >
        <p className="text-gray-400 mb-4">Log your hydration intake.</p>
        <button onClick={() => setWaterModalOpen(false)} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors">
          Add 250ml
        </button>
      </Modal>
    </>
  );
}
