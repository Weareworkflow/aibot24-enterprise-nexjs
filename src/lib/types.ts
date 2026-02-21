
export type AgentType = 'text';

export interface AIAgent {
  id: string; // Formato: {tenantId}-{bitrixBotId}
  tenantId: string; // Dominio del portal, ej: workflowteams.bitrix24.es
  name: string;
  type: AgentType;
  role: string; // Rol en Bitrix (WORK_POSITION)
  company: string; // Empresa / Sector (WORK_COMPANY en Bitrix)
  color: string;
  systemPrompt: string; // Prompt específico del agente
  isActive: boolean;
  bitrixBotId: number; // ID obligatorio asignado por Bitrix24
  avatar?: string; // Base64 image
}

export interface AgentMetrics {
  agentId: string; // Relación con AIAgent ({tenantId}-{bitrixBotId})
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
  id: string; // El dominio del portal (ej: portal.bitrix24.es), actúa como llave primaria
  memberId: string;
  domain: string;
  status: 'active' | 'suspended';
  accessToken: string;
  refreshToken: string; // Credenciales de autenticación
  expiresIn: number;
  clientSecret?: string;
  clientId?: string; // Credenciales técnicas
}

export interface AppConfig {
  id: string; // El dominio del portal (ej: portal.bitrix24.es), actúa como llave primaria
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  systemPrompt: string;
  tenantId: string; // Dominio del portal, ej: workflowteams.bitrix24.es
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AIBotMember {
  id: string; // composite key: {domain}-{userId}
  userId: string;
  userName: string;
  domain: string;
  role: UserRole;
  addedAt: string;
  lastVisit: string;
}
