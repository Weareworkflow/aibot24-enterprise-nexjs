
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkCollections() {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI not found");
        return;
    }
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        
        console.log("\n--- Collections Analysis ---");
        
        const configDocs = await db.collection('config-app').find({}).limit(5).toArray();
        console.log(`config-app: Found ${configDocs.length} docs`);
        configDocs.forEach(d => console.log(`  - ID: ${d.id}, tenantId: ${d.tenantId}`));
        
        const agentDocs = await db.collection('agents').find({}).limit(5).toArray();
        console.log(`agents: Found ${agentDocs.length} docs`);
        agentDocs.forEach(d => console.log(`  - ID: ${d.id}, tenantId: ${d.tenantId}`));
        
        const installationDocs = await db.collection('installations').find({}).limit(5).toArray();
        console.log(`installations: Found ${installationDocs.length} docs`);
        installationDocs.forEach(d => console.log(`  - ID: ${d.id}, memberId: ${d.memberId}, domain: ${d.domain}`));

    } catch (error) {
        console.error("❌ Error:", error.message || error);
    } finally {
        await client.close();
    }
}

checkCollections();
