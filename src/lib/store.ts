
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store global para el estado de la interfaz de usuario.
 * La persistencia de los agentes se maneja directamente en Firestore 
 * para garantizar sincronización en tiempo real entre múltiples pestañas/usuarios.
 */
interface UIState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeFilter: 'all' | 'voice' | 'text';
  setActiveFilter: (filter: 'all' | 'voice' | 'text') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      activeFilter: 'all',
      setActiveFilter: (filter) => set({ activeFilter: filter }),
    }),
    {
      name: 'aibot24-ui-config',
    }
  )
);
