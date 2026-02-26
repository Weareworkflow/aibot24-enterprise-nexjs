import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const {
    BITRIX_CLIENT_ID: clientId,
    BITRIX_CLIENT_SECRET: clientSecret,
    BITRIX_DOMAIN: domain,
    BITRIX_ACCESS_TOKEN,
    BITRIX_REFRESH_TOKEN
} = process.env;

// Local URI for port-forward
const MONGODB_URI = "mongodb://admin:consultordigital123.@localhost:27017/aibot24_enterprise_db?authSource=admin";

let currentAccessToken = BITRIX_ACCESS_TOKEN;
let currentRefreshToken = BITRIX_REFRESH_TOKEN;

async function refreshBitrixToken() {
    if (!currentRefreshToken || !clientId || !clientSecret) {
        console.log("⚠️ No hay Refresh Token o credenciales configuradas.");
        return;
    }

    console.log("🔄 Renovando token de Bitrix...");
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
            throw new Error(`Error en OAuth: ${data.error_description || data.error}`);
        }

        currentAccessToken = data.access_token;
        currentRefreshToken = data.refresh_token;
        console.log("✅ Token renovado.");
    } catch (error: any) {
        console.error("❌ Fallo al renovar token:", error.message);
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
    console.log(`🚀 Iniciando limpieza total en ${domain}...`);

    if (!currentAccessToken || !domain) {
        console.error("❌ Falta BITRIX_ACCESS_TOKEN o BITRIX_DOMAIN en .env.local");
        return;
    }

    // 1. Limpieza de Bitrix24
    console.log("\n--- Limpieza de Bitrix24 ---");
    console.log("🔍 Buscando bots registrados...");
    const listResult = await callBitrix('imbot.bot.list');

    if (listResult.error) {
        console.error("❌ Error al listar bots:", listResult.error_description || listResult.error);
    } else {
        const bots = listResult.result || [];
        console.log(`📊 Se encontraron ${Object.keys(bots).length} bots.`);

        for (const botId in bots) {
            const bot = bots[botId];
            console.log(`🗑️ Eliminando bot: ${bot.NAME} (ID: ${botId}, CODE: ${bot.CODE})...`);
            const unregisterResult = await callBitrix('imbot.unregister', { BOT_ID: botId });

            if (unregisterResult.error) {
                console.error(`   ❌ Error eliminando ${botId}:`, unregisterResult.error_description || unregisterResult.error);
            } else {
                console.log(`   ✅ Bot ${botId} eliminado.`);
            }
        }
    }

    // 2. Limpieza de MongoDB
    console.log("\n--- Limpieza de MongoDB ---");
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();

        console.log("🗑️ Vaciando colección 'agents'...");
        const agentsResult = await db.collection('agents').deleteMany({});
        console.log(`   ✅ Se eliminaron ${agentsResult.deletedCount} agentes.`);

        console.log("🗑️ Vaciando colección 'metrics'...");
        const metricsResult = await db.collection('metrics').deleteMany({});
        console.log(`   ✅ Se eliminaron ${metricsResult.deletedCount} documentos de métricas.`);

    } catch (error: any) {
        console.error("❌ Fallo en la limpieza de MongoDB:", error.message);
    } finally {
        await client.close();
    }

    console.log("\n✨ Proceso de limpieza total finalizado.");
}

totalCleanup().catch(err => console.error("💥 Error crítico:", err));
