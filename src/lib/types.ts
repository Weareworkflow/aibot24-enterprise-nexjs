export interface VoiceAgent {
  id: string;
  name: string;
  personality: string;
  responseStyle: string;
  initialContext: string;
  createdAt: string;
  metrics: {
    usageCount: number;
    performanceRating: number;
    totalChatTime: number; // in minutes
  };
  feedback?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}