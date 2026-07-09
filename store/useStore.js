import { create } from 'zustand';

// Simple mock for a database / auth layer
const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('lt_user')) || null,
  isAuthenticated: !!localStorage.getItem('lt_user'),
  
  // Auth methods
  login: (email, password) => {
    // Mock login
    const user = { email, id: '1', name: email.split('@')[0] };
    localStorage.setItem('lt_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  
  register: (email, password) => {
    // Mock register
    const user = { email, id: '1', name: email.split('@')[0] };
    localStorage.setItem('lt_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('lt_user');
    set({ user: null, isAuthenticated: false });
  },

  // Modals state for UI interactivity
  isLogMealModalOpen: false,
  setLogMealModalOpen: (isOpen) => set({ isLogMealModalOpen: isOpen }),
  
  isWorkoutModalOpen: false,
  setWorkoutModalOpen: (isOpen) => set({ isWorkoutModalOpen: isOpen }),
  
  isWaterModalOpen: false,
  setWaterModalOpen: (isOpen) => set({ isWaterModalOpen: isOpen }),
}));

export default useStore;
