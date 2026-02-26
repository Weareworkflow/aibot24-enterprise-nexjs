import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const {
    MONGODB_URI,
    BITRIX_CLIENT_ID: clientId,
    BITRIX_CLIENT_SECRET: clientSecret,
    BITRIX_DOMAIN: domain,
    BITRIX_ACCESS_TOKEN,
    BITRIX_REFRESH_TOKEN
} = process.env;

let currentAccessToken = BITRIX_ACCESS_TOKEN;
let currentRefreshToken = BITRIX_REFRESH_TOKEN;

async function refreshBitrixToken() {
    if (!currentRefreshToken || !clientId || !clientSecret) {
        console.log("⚠️ No Refresh Token or credentials configured.");
        return;
    }

    console.log("🔄 Refreshing Bitrix token...");
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: currentRefreshToken!,
    });

    try {
        const response = await fetch(`https://oauth.bitrix.info/oauth/token/?${params.toString()}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(`OAuth Error: ${data.error_description || data.error}`);
        }

        currentAccessToken = data.access_token;
        currentRefreshToken = data.refresh_token;
        console.log("✅ Token refreshed.");
    } catch (error: any) {
        console.error("❌ Token refresh failed:", error.message);
    }
}

async function callBitrix(method: string, params: any = {}) {
    const url = `https://${domain}/rest/${method}.json`;

    const execute = async () => {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth: currentAccessToken,
                ...params
            })
        });
        return await response.json();
    };

    let result = await execute();

    if (result.error === 'expired_token' || result.error === 'invalid_token') {
        await refreshBitrixToken();
        result = await execute();
    }

    return result;
}

async function totalCleanup() {
    console.log(`🚀 Starting total cleanup in ${domain}...`);

    if (!currentAccessToken || !domain) {
        console.error("❌ Missing BITRIX_ACCESS_TOKEN or BITRIX_DOMAIN");
        return;
    }

    // 1. Bitrix24 Cleanup
    console.log("\n--- Bitrix24 Cleanup ---");
    console.log("🔍 Searching for registered bots...");
    const listResult = await callBitrix('imbot.bot.list');

    if (listResult.error) {
        console.error("❌ Error listing bots:", listResult.error_description || listResult.error);
    } else {
        const bots = listResult.result || [];
        console.log(`📊 Found ${Object.keys(bots).length} bots.`);

        for (const botId in bots) {
            const bot = bots[botId];
            console.log(`🗑️ Unregistering bot: ${bot.NAME} (ID: ${botId}, CODE: ${bot.CODE})...`);
            const unregisterResult = await callBitrix('imbot.unregister', { BOT_ID: botId });

            if (unregisterResult.error) {
                console.error(`   ❌ Error unregistering ${botId}:`, unregisterResult.error_description || unregisterResult.error);
            } else {
                console.log(`   ✅ Bot ${botId} unregistered.`);
            }
        }
    }

    // 2. MongoDB Cleanup
    console.log("\n--- MongoDB Cleanup ---");
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI not found");
    } else {
        const client = new MongoClient(MONGODB_URI);
        try {
            await client.connect();
            const db = client.db();

            console.log("🗑️ Clearing 'agents' collection...");
            const agentsResult = await db.collection('agents').deleteMany({});
            console.log(`   ✅ Deleted ${agentsResult.deletedCount} agents.`);

            console.log("🗑️ Clearing 'metrics' collection...");
            const metricsResult = await db.collection('metrics').deleteMany({});
            console.log(`   ✅ Deleted ${metricsResult.deletedCount} metrics documents.`);

        } catch (error: any) {
            console.error("❌ MongoDB Cleanup failed:", error.message);
        } finally {
            await client.close();
        }
    }

    console.log("\n✨ Total cleanup process finished.");
}

totalCleanup().catch(err => console.error("💥 Critical Error:", err));
