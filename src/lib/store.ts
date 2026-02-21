import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIAgent, AppConfig, BitrixInstallation, UserRole, AgentMetrics } from './types';

/**
 * Global store for UI state and Bitrix24 context.
 * Manages language, theme, and agent fleet.
 */
interface UIState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeFilter: 'all' | 'text';
  setActiveFilter: (filter: 'all' | 'text') => void;
  tenantId: string | null; // Dominio del portal (ej: workflowteams.bitrix24.es)
  setTenantId: (id: string | null) => void;
  memberId: string | null; // ID único de instalación
  setMemberId: (id: string | null) => void;
  domain: string | null;
  setDomain: (domain: string | null) => void;
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;

  // User Context
  userId: string | null;
  setUserId: (id: string | null) => void;
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  isAuthorized: boolean;
  setIsAuthorized: (auth: boolean) => void;

  // App Config
  appConfig: AppConfig | null;
  setAppConfig: (config: AppConfig) => void;
  loadAppConfig: (tenantId: string) => Promise<void>;

  // Installation Data (Bitrix Credentials)
  installation: BitrixInstallation | null;
  setInstallation: (inst: BitrixInstallation | null) => void;
  loadInstallation: (domain: string) => Promise<void>;

  // Centralized Agent Management
  agents: AIAgent[];
  setAgents: (agents: AIAgent[]) => void;
  setAgent: (agent: AIAgent) => void;
  updateAgentLocal: (agentId: string, updates: Partial<AIAgent>) => void;

  // Real-time Metrics
  agentMetrics: Record<string, AgentMetrics>;
  setAgentMetrics: (agentId: string, metrics: AgentMetrics) => void;
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
      domain: null, // Usually same as tenantId
      setDomain: (domain) => set({ domain: domain }),
      language: 'es',
      setLanguage: (lang) => set({ language: lang }),
      userId: null,
      setUserId: (id) => set({ userId: id }),
      userRole: null,
      setUserRole: (role) => set({ userRole: role }),
      isAuthorized: false,
      setIsAuthorized: (auth) => set({ isAuthorized: auth }),

      // App Config
      appConfig: null,
      setAppConfig: (config) => set({ appConfig: config }),
      loadAppConfig: async (tenantId) => {
        try {
          const res = await fetch(`/api/config/${encodeURIComponent(tenantId)}`);
          if (res.ok) {
            const data = await res.json();
            set({ appConfig: data });
            if (data.language) set({ language: data.language });
            // appConfig object is already set above at line 82
          }
        } catch (error) {
          console.error("Failed to load app config:", error);
        }
      },

      // Installation
      installation: null,
      setInstallation: (inst) => set({ installation: inst }),
      loadInstallation: async (domain) => {
        try {
          const res = await fetch(`/api/installations/${encodeURIComponent(domain)}`);
          if (res.ok) {
            const data = await res.json();
            set({ installation: data });
          }
        } catch (error) {
          console.error("Failed to load installation:", error);
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

      // Real-time Metrics implementation
      agentMetrics: {},
      setAgentMetrics: (agentId, metrics) => set((state) => ({
        agentMetrics: {
          ...state.agentMetrics,
          [agentId]: metrics
        }
      })),
    }),
    {
      name: 'aibot24-v5-store',
      partialize: (state) => ({
        tenantId: state.tenantId,
        memberId: state.memberId,
        domain: state.domain,
        language: state.language,
        userId: state.userId,
        userRole: state.userRole,
        agentMetrics: state.agentMetrics
      }),
    }
  )
);
