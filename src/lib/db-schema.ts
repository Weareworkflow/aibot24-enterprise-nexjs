
import {
    collection,
    CollectionReference,
    DocumentData,
    Firestore,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import {
    AIAgent,
    AgentMetrics,
    BitrixInstallation,
    AppConfig,
    AIConfig,
    Session,
    AuditLog,
    KnowledgeChunk,
    ArchitectConfiguration
} from './types';

// Environment Configuration
const ENV = process.env.NEXT_PUBLIC_APP_ENV === 'test' ? 'test_' : '';

// Collection Names (Dynamic based on Environment)
export const COLLECTIONS = {
    AGENTS: `${ENV}agents`,
    METRICS: `${ENV}metrics`, // New: separated from agents
    INSTALLATIONS: `${ENV}installations`,
    CONFIG_APP: `${ENV}config-app`,
    CONFIG_SECRETS: `${ENV}config-secrets`, // Internal use
    CONFIG_AI: `${ENV}config-ai`, // New: Internal AI config
    CONFIG_ARCHITECT: `${ENV}config-architect`, // New: Architect Agent config
    SESSIONS: `${ENV}sessions`, // New: Session management
    AUDIT_LOGS: `${ENV}audit_logs`, // New: Security
    // Sub-collections (No prefix needed for sub-collections usually, but consistency is good. 
    // However, traditionally subcollections are just names. Let's keep them simple or prefix them too? 
    // The user asked to separate "databases". Prefixed root collections is enough to separate the data.)
    MESSAGES: 'messages',
    KNOWLEDGE: 'knowledge'
} as const;

// Typed Converter Helper
const createConverter = <T extends DocumentData>() => ({
    toFirestore: (data: T) => data,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as T,
});

// Helper to get typed collections
export const getCollections = (db: Firestore) => ({
    agents: collection(db, COLLECTIONS.AGENTS).withConverter(createConverter<AIAgent>()),
    metrics: collection(db, COLLECTIONS.METRICS).withConverter(createConverter<AgentMetrics>()),
    installations: collection(db, COLLECTIONS.INSTALLATIONS).withConverter(createConverter<BitrixInstallation>()),
    appConfig: collection(db, COLLECTIONS.CONFIG_APP).withConverter(createConverter<AppConfig>()),
    aiConfig: collection(db, COLLECTIONS.CONFIG_AI).withConverter(createConverter<AIConfig>()),
    architectConfig: collection(db, COLLECTIONS.CONFIG_ARCHITECT).withConverter(createConverter<ArchitectConfiguration>()),
    sessions: collection(db, COLLECTIONS.SESSIONS).withConverter(createConverter<Session>()),
    auditLogs: collection(db, COLLECTIONS.AUDIT_LOGS).withConverter(createConverter<AuditLog>()),
});

// Sub-collections helpers
export const getSubCollections = (db: Firestore) => ({
    messages: (sessionId: string) =>
        collection(db, COLLECTIONS.SESSIONS, sessionId, COLLECTIONS.MESSAGES),
    knowledge: (agentId: string) =>
        collection(db, COLLECTIONS.AGENTS, agentId, COLLECTIONS.KNOWLEDGE).withConverter(createConverter<KnowledgeChunk>()),
    architectAi: (memberId: string) =>
        collection(db, COLLECTIONS.CONFIG_ARCHITECT, memberId, 'ai').withConverter(createConverter<AIConfig>()),
});
