import { Db } from 'mongodb';

export async function ensureIndexes(db: Db) {
    try {
        // Index for agents: unique pair (tenantId, bitrixBotId)
        // We use a partialFilterExpression to allow multiple agents with bitrixBotId = null
        console.log('[Database] Ensuring unique index for agents (tenantId, bitrixBotId)...');
        await db.collection('agents').createIndex(
            { tenantId: 1, bitrixBotId: 1 },
            {
                unique: true,
                name: 'unique_tenant_bot',
                partialFilterExpression: {
                    bitrixBotId: { $type: "number" }
                }
            }
        );

        // Index for agent names: unique name per tenant
        console.log('[Database] Ensuring unique index for agent names (tenantId, name)...');
        await db.collection('agents').createIndex(
            { tenantId: 1, name: 1 },
            { unique: true, name: 'unique_tenant_agent_name' }
        );

        // Index for installations: unique domain (already usually primary key or indexed, but let's be sure)
        await db.collection('installations').createIndex({ domain: 1 }, { unique: true });

        // Index for config-app: unique tenantId
        await db.collection('config-app').createIndex({ tenantId: 1 }, { unique: true });

        // Index for notification_templates: id (unique) and tenantId (listing)
        console.log('[Database] Ensuring indexes for notification_templates...');
        await db.collection('notification_templates').createIndex({ id: 1 }, { unique: true });
        await db.collection('notification_templates').createIndex({ tenantId: 1 });

        // Index for audit_logs
        console.log('[Database] Ensuring indexes for audit_logs...');
        await db.collection('audit_logs').createIndex({ tenantId: 1, timestamp: -1 });

        console.log('✅ [Database] Indexes verified.');
    } catch (error) {
        console.error('❌ [Database] Error ensuring indexes:', error);
    }
}
