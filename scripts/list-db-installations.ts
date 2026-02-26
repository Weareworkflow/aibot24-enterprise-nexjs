
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function listInstallations() {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI not found in .env.local");
        return;
    }

    console.log("🔍 Connecting to MongoDB...");
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();
        const installations = await db.collection('installations').find({}).toArray();

        console.log(`📊 Found ${installations.length} installations:`);
        installations.forEach(inst => {
            console.log(`- Domain: ${inst.domain}, MemberID: ${inst.memberId}, ClientID: ${inst.clientId ? '✅ Present' : '❌ Missing'}`);
        });

        if (installations.length > 0) {
            console.log("\n--- Detailed first installation (redacted) ---");
            const first = installations[0];
            console.log(JSON.stringify({
                domain: first.domain,
                clientId: first.clientId,
                hasSecret: !!first.clientSecret,
                hasRefreshToken: !!first.refreshToken
            }, null, 2));
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await client.close();
    }
}

listInstallations();
