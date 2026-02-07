
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIAgent } from './types';

/**
 * Global store for UI state and Bitrix24 context.
 * Manages language, theme, and agent fleet.
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
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
  
  // Centralized Agent Management
  agents: AIAgent[];
  setAgents: (agents: AIAgent[]) => void;
  updateAgentLocal: (agentId: string, updates: Partial<AIAgent>) => void;
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
      language: 'es',
      setLanguage: (lang) => set({ language: lang }),
      
      // Agents State
      agents: [],
      setAgents: (agents) => set({ agents }),
      updateAgentLocal: (agentId, updates) => set((state) => ({
        agents: state.agents.map((a) => 
          a.id === agentId ? { ...a, ...updates } : a
        )
      })),
    }),
    {
      name: 'aibot24-v3-config-v3',
      partialize: (state) => ({ 
        tenantId: state.tenantId, 
        domain: state.domain,
        language: state.language
      }),
    }
  )
);
