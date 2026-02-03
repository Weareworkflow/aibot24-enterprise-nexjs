
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIAgent } from './types';

interface AgentState {
  agents: AIAgent[];
  addAgent: (agent: AIAgent) => void;
  deleteAgent: (id: string) => void;
  toggleAgentActive: (id: string) => void;
  updateAgent: (id: string, updates: Partial<AIAgent>) => void;
}

const INITIAL_AGENTS: AIAgent[] = [
  {
    id: "1",
    name: "AIV-SALES-MASTER",
    type: "voice",
    isActive: true,
    role: "Especialista Ventas B2B",
    company: "TechSolutions Global",
    objective: "Cierre de contratos y prospección",
    tone: "Directo y altamente profesional",
    knowledge: "Manual de ventas corporativas, manejo de objeciones y precios de licencias empresariales.",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 215,
      performanceRating: 4.8,
      totalInteractionMetric: 934,
      latency: "450m",
      tokens: "120k",
      transfers: 45,
      abandoned: 12
    }
  },
  {
    id: "2",
    name: "SUPPORT-CORE-01",
    type: "voice",
    isActive: true,
    role: "Soporte Técnico Nivel 1",
    company: "CloudServices Inc",
    objective: "Resolución de incidencias técnicas",
    tone: "Paciente, empático y resolutivo",
    knowledge: "Guía de resolución de problemas comunes de software, acceso a base de conocimientos de red y servidores.",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 540,
      performanceRating: 4.5,
      totalInteractionMetric: 1820,
      latency: "1200m",
      tokens: "245k",
      transfers: 112,
      abandoned: 9
    }
  },
  {
    id: "3",
    name: "WHATSAPP-BOT-PRO",
    type: "text",
    isActive: true,
    role: "Asistente de Citas",
    company: "Clínica Dental Moderna",
    objective: "Gestión de calendario y recordatorios",
    tone: "Informal, amable y eficiente",
    knowledge: "Horarios de médicos, políticas de cancelación y procedimientos disponibles.",
    createdAt: "2024-02-10T09:15:00Z",
    metrics: {
      usageCount: 1250,
      performanceRating: 4.9,
      totalInteractionMetric: 5400,
      latency: "850m",
      tokens: "450k",
      transfers: 22,
      abandoned: 5
    }
  }
];

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      agents: INITIAL_AGENTS,
      addAgent: (agent) => set((state) => ({ 
        agents: [agent, ...state.agents] 
      })),
      deleteAgent: (id) => set((state) => ({ 
        agents: state.agents.filter((a) => a.id !== id) 
      })),
      toggleAgentActive: (id) => set((state) => ({
        agents: state.agents.map((a) => 
          a.id === id ? { ...a, isActive: !a.isActive } : a
        )
      })),
      updateAgent: (id, updates) => set((state) => ({
        agents: state.agents.map((a) => 
          a.id === id ? { ...a, ...updates } : a
        )
      })),
    }),
    {
      name: 'aibot24-storage',
    }
  )
);
