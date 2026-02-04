
export type AgentType = 'voice' | 'text';

export interface APIEndpoint {
  name: string;
  url: string;
  method: string;
  headers?: string;
  body?: string;
}

export interface KnowledgeFile {
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export interface AIAgent {
  id: string;
  tenantId: string; // ID del creador/empresa
  name: string;
  type: AgentType;
  role: string;
  company: string;
  objective: string;
  tone: string;
  knowledge: string;
  knowledgeFiles?: KnowledgeFile[];
  color?: string;
  createdAt: string;
  isActive?: boolean;
  integrations?: Record<string, boolean>;
  apiEndpoints?: APIEndpoint[];
  metrics: {
    usageCount: number;
    performanceRating: number;
    totalInteractionMetric: number; // minutos para voz, mensajes para texto
    latency?: string;
    tokens?: string;
    transfers?: number;
    abandoned?: number;
  };
  feedback?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
