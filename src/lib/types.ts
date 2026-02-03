export type AgentType = 'voice' | 'text';

export interface AIAgent {
  id: string;
  name: string;
  type: AgentType;
  personality: string;
  responseStyle: string;
  initialContext: string;
  createdAt: string;
  metrics: {
    usageCount: number;
    performanceRating: number;
    totalInteractionMetric: number; // minutos para voz, mensajes para texto
  };
  feedback?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
