import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIAgent, AppConfig } from './types';
import { db } from './firebase-server';
import { getCollections } from './db-schema';
import { doc, getDoc } from 'firebase/firestore';

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
  tenantId: string | null; // Now represents the Portal URL (Domain)
  setTenantId: (id: string | null) => void;
  memberId: string | null; // Represents the specific installation/user ID
  setMemberId: (id: string | null) => void;
  domain: string | null;
  setDomain: (domain: string | null) => void;
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;

  // App Config (Public)
  appConfig: AppConfig | null;
  setAppConfig: (config: AppConfig) => void;
  loadAppConfig: (memberId: string) => Promise<void>;

  // Centralized Agent Management
  agents: AIAgent[];
  setAgents: (agents: AIAgent[]) => void;
  setAgent: (agent: AIAgent) => void;
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
      memberId: null,
      setMemberId: (id) => set({ memberId: id }),
      domain: null,
      setDomain: (domain) => set({ domain: domain }),
      language: 'es',
      setLanguage: (lang) => set({ language: lang }),

      // App Config
      appConfig: null,
      setAppConfig: (config) => set({ appConfig: config }),
      loadAppConfig: async (memberId) => {
        try {
          const { appConfig } = getCollections(db);
          const docRef = doc(appConfig, memberId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            set({ appConfig: snap.data() });
          }
        } catch (error) {
          console.error("Failed to load app config:", error);
        }
      },

      // Agents State
      agents: [],
      setAgents: (agents) => set({ agents }),
      setAgent: (agent) => set((state) => {
        const exists = state.agents.some((a) => a.id === agent.id);
        if (exists) {
          return {
            agents: state.agents.map((a) => (a.id === agent.id ? { ...a, ...agent } : a)),
          };
        }
        return { agents: [...state.agents, agent] };
      }),
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
        memberId: state.memberId,
        domain: state.domain,
        language: state.language
      }),
    }
  )
);
