
export type AgentType = 'text';

export interface AIAgent {
  id: string; // Formato: {tenantId}-{bitrixBotId}
  tenantId: string; // Dominio del portal, ej: workflowteams.bitrix24.es
  name: string;
  type: AgentType;
  role: string; // Rol en Bitrix (WORK_POSITION)
  company: string; // Empresa / Sector (WORK_COMPANY en Bitrix)
  color: string;
  systemPrompt: string; // Prompt específico del agente (Nuevos)
  systemPromptRegistered: string; // Prompt específico del agente (Registrados)
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
  systemPromptRegistered: string;
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
export interface NotificationTemplate {
  id: string;
  tenantId: string;
  key: string; // Clave única para referenciar desde triggers/AI (ej: 'RECORDATORIO_CITA')
  nombre: string;
  tipo_plantilla: 'RECORDATORIO' | 'RETARGETING' | 'INFORMATIVO';
  canal: 'WHATSAPP' | 'PUSH' | 'EMAIL' | 'SMS';
  // ... rest same
  trigger_type: 'BEFORE' | 'AFTER' | 'FRECUENTE' | 'SCHEDULED' | 'EVENT';
  frecuencia_tipo?: 'DIARIO' | 'SEMANAL' | 'MENSUAL';
  dia_ejecucion: string;
  hora_especifica: string;
  mensaje_json: {
    titulo: string;
    cuerpo: string;
    [key: string]: any;
  };
  condicion_parada?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  id: string;
  tenantId: string;
  nombre: string;
  evento: 'ONCRMLEADADD' | 'ONCRMDEALSTAGEUPDATE' | 'ONCRMDEALADD' | 'ANY';
  filtros: {
    campo: string;
    operador: '==' | '!=' | 'in' | 'contains';
    valor: any;
  }[];
  plantillaKey: string;
  delaySegundos: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
