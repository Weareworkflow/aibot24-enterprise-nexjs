import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI not set');
        process.exit(1);
    }

    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();

        const installations = await db.collection('installations').find({}).toArray();
        console.log('\n--- Installations ---');
        console.table(installations.map(i => ({
            domain: i.domain,
            memberId: i.memberId,
            status: i.status,
            updatedAt: i.updatedAt
        })));

        const agents = await db.collection('agents').find({}).toArray();
        console.log('\n--- Agents by Tenant ---');
        console.table(agents.map(a => ({
            id: a.id,
            tenantId: a.tenantId,
            name: a.name,
            bitrixBotId: a.bitrixBotId,
            isActive: a.isActive
        })));

        // Look for agents with tenantId that doesn't match an installation
        const domains = new Set(installations.map(i => i.domain));
        const orphanAgents = agents.filter(a => !domains.has(a.tenantId));

        if (orphanAgents.length > 0) {
            console.log('\n⚠️ Found agents with unknown tenantId:');
            console.table(orphanAgents);
        } else {
            console.log('\n✅ All agents belong to a known installation.');
        }

    } finally {
        await client.close();
    }
}

run().catch(console.dir);
