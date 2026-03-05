
export type AgentType = 'text';

export interface AIAgent {
  id: string; // Formato: {tenantId}-{bitrixBotId}
  tenantId: string; // Dominio del portal, ej: workflowteams.bitrix24.es
  name: string;
  type: AgentType;
  role: string; // Rol en Bitrix (WORK_POSITION)
  company: string; // Empresa / Sector (WORK_COMPANY en Bitrix)
  color: string;
  systemPrompt: string; // Prompt maestro del agente
  // systemPromptRegistered?: string; // DEPRECATED: Se usa un solo prompt maestro
  isActive: boolean;
  bitrixBotId: number; // ID obligatorio asignado por Bitrix24
  bitrixBotCode: string; // CODE único usado en imbot.register
  avatar?: string; // Base64 image
  integrations?: AgentIntegration[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentIntegration {
  id: string;
  provider: 'OUTLOOK' | string;
  isActive: boolean;
  config: {
    clientId?: string;
    clientSecret?: string;
    tenantId?: string;
    assignments?: {
      userId: string;
      userEmail: string;
      userName: string;
      calendarId: string;
      calendarName: string;
    }[];
    [key: string]: any;
  };
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
  createdAt?: string;
  updatedAt?: string;
}

export interface AppConfig {
  id: string; // El dominio del portal (ej: portal.bitrix24.es), actúa como llave primaria
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  tenantId: string; // Dominio del portal, ej: workflowteams.bitrix24.es
  updatedAt?: string;
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
  id: string; // UUID managed in service
  tenantId: string;
  nombre: string;
  tipo_plantilla: 'RECORDATORIO' | 'RETARGETING' | 'INFORMATIVO';
  canal: 'PUSH' | 'WHATSAPP' | 'EMAIL' | 'SMS';
  estado: boolean;

  configuracion: {
    // TIPO: RECORDATORIO
    recordatorio?: {
      activar_antes: {
        valor: number;
        unidad: 'MINUTES' | 'HOURS' | 'DAYS';
      };
    };

    // TIPO: RETARGETING
    retargeting?: {
      esperar_despues_de_evento: {
        valor: number;
        unidad: 'MINUTES' | 'HOURS' | 'DAYS';
      };
      condicion_parada: string;
      intentos_maximos: number;
    };

    // TIPO: INFORMATIVO
    informativo?: {
      modo: 'UNICO' | 'FRECUENTE';
      fecha_fija?: string; // ISODate
      frecuencia?: {
        tipo: 'DIARIO' | 'SEMANAL' | 'MENSUAL';
        hora: string; // "08:30"
        dia_ejecucion: string; // "MONDAY" o "1"
      };
    };
  };

  contenido: {
    titulo: string;
    cuerpo: string;
  };

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

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string; // 'CREATE_AGENT', 'UPDATE_PROMPT', etc.
  entityType: 'AGENT' | 'INSTALLATION' | 'CONFIG';
  entityId: string;
  details: any;
  timestamp: string;
}
