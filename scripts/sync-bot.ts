import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Script to synchronize an existing bot with its Bitrix24 User Profile.
 * This can help with search visibility issues by "nudging" Bitrix to re-index the bot user.
 */
async function syncBot(tenantId: string, botName: string) {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI not found");
        return;
    }

    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();

        // 1. Get installation and agent
        const inst = await db.collection('installations').findOne({ domain: tenantId });
        const agent = await db.collection('agents').findOne({ tenantId, name: botName });

        if (!inst || !agent) {
            console.error(`❌ Could not find installation or agent for ${tenantId} / ${botName}`);
            return;
        }

        console.log(`🔄 Syncing Bot: ${agent.name} (ID: ${agent.bitrixBotId}) in ${tenantId}...`);

        const callBitrix = async (method: string, params: any) => {
            const url = `https://${tenantId}/rest/${method}.json`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth: inst.accessToken,
                    ...params
                })
            });
            return await response.json();
        };

        // 2. Update user profile to ensure visibility
        console.log("   Step 1: Updating User Profile...");
        const userResult = await callBitrix('user.update', {
            ID: agent.bitrixBotId,
            NAME: agent.name,
            LAST_NAME: "[AI Agent]",
            WORK_POSITION: agent.role,
            WORK_COMPANY: agent.company || "AI Bot 24"
        });

        if (userResult.error) {
            console.error("   ❌ User update error:", userResult.error_description);
        } else {
            console.log("   ✅ User profile synchronized.");
        }

        // 3. Update bot registration to ensure webhooks and OpenLine status
        console.log("   Step 2: Updating Bot Registration handlers...");
        const botResult = await callBitrix('imbot.update', {
            BOT_ID: agent.bitrixBotId,
            FIELDS: {
                NAME: agent.name,
                WORK_POSITION: agent.role,
                COLOR: agent.color || 'BLUE'
            },
            EVENT_MESSAGE_ADD: process.env.BITRIX_BOT_HANDLER_URL,
            EVENT_WELCOME_MESSAGE: process.env.BITRIX_BOT_HANDLER_URL,
            EVENT_BOT_DELETE: process.env.BITRIX_BOT_HANDLER_URL,
            EVENT_MESSAGE_UPDATE: process.env.BITRIX_BOT_HANDLER_URL
        });

        if (botResult.error) {
            console.error("   ❌ Bot update error:", botResult.error_description);
        } else {
            console.log("   ✅ Bot registration synchronized.");
        }

        console.log("\n✨ Sync completed. Please check Bitrix24 search in a few minutes.");

    } catch (error: any) {
        console.error("💥 Critical error:", error.message);
    } finally {
        await client.close();
    }
}

// Usage example: npm run ts-node scripts/sync-bot.ts workflowteams.bitrix24.es "Bot Viajes"
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: npx ts-node scripts/sync-bot.ts <domain> <bot_name>");
    process.exit(1);
}

syncBot(args[0], args[1]);
