
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store global para el estado de la interfaz de usuario y contexto de Bitrix24.
 * Persiste el tenantId (member_id) para mantener la sesión del portal.
 */
interface UIState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeFilter: 'all' | 'voice' | 'text';
  setActiveFilter: (filter: 'all' | 'voice' | 'text') => void;
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
  domain: string | null;
  setDomain: (domain: string | null) => void;
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
      tenantId: null,
      setTenantId: (id) => set({ tenantId: id }),
      domain: null,
      setDomain: (domain) => set({ domain: domain }),
    }),
    {
      name: 'aibot24-v3-config-v2',
    }
  )
);
