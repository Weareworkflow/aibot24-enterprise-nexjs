
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
  avatar?: string; // Base64 image
  color?: string;
  createdAt: string;
  isActive?: boolean;
  integrations?: Record<string, boolean>;
  apiEndpoints?: APIEndpoint[];
  // Bitrix24 Sync Fields
  bitrixBotId?: number; // ID numérico del usuario bot en Bitrix
  bitrixBotCode?: string; // Código único (ej: bot_123)
}

export interface AgentMetrics {
  usageCount: number;
  performanceRating: number;
  totalInteractionMetric: number;
  latency?: string;
  tokens?: string;
  transfers?: number;
  meetings?: number;
  abandoned?: number;
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
  // Nuevos campos técnicos
  clientId?: string;
  clientSecret?: string;
  serviceWebhook?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  updatedAt?: any; // Firestore Timestamp
}

// --- New Schemas for Enterprise Platform ---

export interface AIConfig {
  apiKey?: string; // Store strictly in backend or secured env (config-ai collection)
  model: string;
  temperature: number;
  maxTokens: number;
  provider?: 'openai' | 'anthropic' | 'google';
  updatedAt?: string; // ISO Date
}

export type SessionStatus = 'active' | 'closed' | 'paused';
export type ChannelType = 'bitrix' | 'web' | 'voice';

export interface Session {
  id: string;
  agentId: string;
  installationId: string;
  channel: ChannelType;
  externalId?: string; // Bitrix Chat ID, Phone number, etc.
  status: SessionStatus;
  startTime: string; // ISO Date
  lastInteraction: string; // ISO Date
  summary?: string;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO Date
  actorId: string;
  action: 'create' | 'update' | 'delete' | 'login';
  resource: 'agent' | 'installation' | 'settings' | 'ai-config';
  resourceId: string;
  changes?: Record<string, any>; // Diff
  ipAddress?: string;
}

export interface KnowledgeChunk {
  id: string;
  agentId: string;
  content: string;
  embedding?: number[];
  source?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ArchitectConfiguration {
  name: string; // Default: "Aibot"
  role: string; // Default: "Arquitecto de Protocolos"
  systemPrompt: string;
  updatedAt: string; // ISO Date
}
