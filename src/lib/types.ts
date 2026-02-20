
export type AgentType = 'text';

export interface AIAgent {
  id: string; // auto
  tenantId: string; // Dominio del portal, ej: workflowteams.bitrix24.es
  name: string;
  type: AgentType;
  role: string; // Rol en Bitrix
  company: string; // Empresa / Sector (WORK_COMPANY en Bitrix)
  color: string;
  systemPrompt: string; // Prompt del sistema, fuente única de verdad
  isActive: boolean;
  bitrixBotId?: number; // ID del bot en Bitrix
  avatar?: string; // Base64 image
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
  status: 'active' | 'suspended';
  accessToken: string;
  refreshToken: string; // Credenciales de autenticación
  expiresIn: number;
  clientSecret?: string;
  clientId?: string; // Credenciales técnicas
}

export interface AppConfig {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  systemPrompt: string;
  tenantId: string; // Dominio del portal, ej: workflowteams.bitrix24.es
}
