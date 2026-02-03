export type AgentType = 'voice' | 'text';

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  role: string;
  company: string;
  objective: string;
  tone: string;
  knowledge: string;
  createdAt: string;
  isActive?: boolean;
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
