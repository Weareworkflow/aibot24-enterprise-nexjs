import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

async function refreshBitrixToken(domain: string, installation: any) {
    const { clientId, clientSecret, refreshToken } = installation;
    if (!refreshToken || !clientId || !clientSecret) {
        console.log(`⚠️ No credentials for ${domain}`);
        return null;
    }

    console.log(`🔄 Refreshing Bitrix token for ${domain}...`);
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
    });

    try {
        const response = await fetch(`https://oauth.bitrix.info/oauth/token/?${params.toString()}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(`OAuth Error: ${data.error_description || data.error}`);
        }

        console.log(`✅ Token refreshed for ${domain}.`);
        return data.access_token;
    } catch (error: any) {
        console.error(`❌ Token refresh failed for ${domain}:`, error.message);
        return null;
    }
}

async function callBitrix(domain: string, accessToken: string, method: string, params: any = {}) {
    const url = `https://${domain}/rest/${method}.json`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            auth: accessToken,
            ...params
        })
    });
    return await response.json();
}

async function totalCleanup() {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI not found");
        return;
    }

    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();

        // 1. Get all installations to clean up Bitrix for each domain
        const installations = await db.collection('installations').find({}).toArray();
        console.log(`🚀 Found ${installations.length} installations.`);

        for (const inst of installations) {
            const domain = inst.domain;
            console.log(`\n--- Cleaning domain: ${domain} ---`);

            let accessToken = await refreshBitrixToken(domain, inst);
            if (!accessToken) {
                console.warn(`⚠️ Skipping Bitrix cleanup for ${domain} due to token error.`);
            } else {
                console.log(`🔍 Listing bots for ${domain}...`);
                const listResult = await callBitrix(domain, accessToken, 'imbot.bot.list');

                if (listResult.error) {
                    console.error(`❌ Error listing bots for ${domain}:`, listResult.error_description || listResult.error);
                } else {
                    const bots = listResult.result || [];
                    console.log(`📊 Found ${Object.keys(bots).length} bots.`);

                    for (const botId in bots) {
                        const bot = bots[botId];
                        console.log(`🗑️ Unregistering bot: ${bot.NAME} (ID: ${botId})...`);
                        const unreg = await callBitrix(domain, accessToken, 'imbot.unregister', { BOT_ID: botId });
                        if (unreg.error) console.error(`   ❌ Error unregistering ${botId}:`, unreg.error);
                        else console.log(`   ✅ Bot ${botId} unregistered.`);
                    }
                }
            }
        }

        // 2. Clear MongoDB
        console.log("\n--- MongoDB Cleanup ---");
        console.log("🗑️ Clearing 'agents' collection...");
        const agentsResult = await db.collection('agents').deleteMany({});
        console.log(`   ✅ Deleted ${agentsResult.deletedCount} agents.`);

        console.log("🗑️ Clearing 'metrics' collection...");
        const metricsResult = await db.collection('metrics').deleteMany({});
        console.log(`   ✅ Deleted ${metricsResult.deletedCount} metrics documents.`);

    } catch (error: any) {
        console.error("❌ Cleanup failed:", error.message);
    } finally {
        await client.close();
    }

    console.log("\n✨ Total cleanup finished.");
}

totalCleanup().catch(err => console.error("💥 Critical Error:", err));
