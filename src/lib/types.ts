
export type AgentType = 'text';

export interface APIEndpoint {
  name: string;
  url: string;
  method: string;
  headers?: string;
  body?: string;
}

export interface AIAgent {
  id: string;
  tenantId: string; // ID del portal (member_id)
  name: string;
  type: AgentType;
  role: string;
  company: string;
  objective: string;
  tone: string;
  knowledge: string; // Protocolo de comportamiento refinado por IA
  color?: string;
  createdAt: string;
  isActive?: boolean;
  integrations?: Record<string, boolean>;
  apiEndpoints?: APIEndpoint[];
  metrics: {
    usageCount: number;
    performanceRating: number;
    totalInteractionMetric: number;
    latency?: string;
    tokens?: string;
    transfers?: number;
    abandoned?: number;
  };
}

export interface BitrixInstallation {
  memberId: string;
  domain: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: number;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
