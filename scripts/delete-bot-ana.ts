const https = require('https');
const path = require('path');
const fs = require('fs');

// Cargar variables de .env.local manualmente para evitar dependencias
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        env[match[1]] = value;
    }
});

const clientId = env.BITRIX_CLIENT_ID;
const clientSecret = env.BITRIX_CLIENT_SECRET;
const domain = env.BITRIX_DOMAIN;
let accessToken = env.BITRIX_ACCESS_TOKEN;
let refreshToken = env.BITRIX_REFRESH_TOKEN;

function callBitrix(method, params = {}) {
    return new Promise((resolve, reject) => {
        const url = `https://${domain}/rest/${method}.json`;
        const postData = JSON.stringify({
            auth: accessToken,
            ...params
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response: ' + data));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}

async function refreshBitrixToken() {
    console.log("🔄 Renovando token de Bitrix...");
    const url = `https://oauth.bitrix.info/oauth/token/?grant_type=refresh_token&client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}`;

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.error) {
                        reject(new Error(result.error_description || result.error));
                    } else {
                        accessToken = result.access_token;
                        refreshToken = result.refresh_token;
                        console.log("✅ Token renovado correctamente.");
                        resolve(result);
                    }
                } catch (e) {
                    reject(new Error('Invalid JSON response: ' + data));
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    const targetName = "Ana";
    console.log(`🚀 Buscando bot "${targetName}" en ${domain}...`);

    if (!accessToken || !domain) {
        console.error("❌ Falta BITRIX_ACCESS_TOKEN o BITRIX_DOMAIN en .env.local");
        process.exit(1);
    }

    try {
        let listResult = await callBitrix('imbot.bot.list');

        if (listResult.error === 'expired_token' || listResult.error === 'invalid_token') {
            await refreshBitrixToken();
            listResult = await callBitrix('imbot.bot.list');
        }

        if (listResult.error) {
            console.error("❌ Error al listar bots:", listResult.error_description || listResult.error);
            return;
        }

        const bots = listResult.result || {};
        let found = false;

        for (const botId in bots) {
            const bot = bots[botId];
            if (bot.NAME.toLowerCase() === targetName.toLowerCase()) {
                found = true;
                console.log(`🎯 Encontrado: ${bot.NAME} (ID: ${botId}, CODE: ${bot.CODE})`);
                console.log(`🗑️ Eliminando...`);

                const unregisterResult = await callBitrix('imbot.unregister', { BOT_ID: botId });

                if (unregisterResult.error) {
                    console.error(`   ❌ Error:`, unregisterResult.error_description || unregisterResult.error);
                } else {
                    console.log(`   ✅ Bot "${targetName}" eliminado exitosamente.`);
                }
            }
        }

        if (!found) {
            console.log(`ℹ️ No se encontró ningún bot con el nombre "${targetName}" en Bitrix24.`);
        }

    } catch (e) {
        console.error("💥 Error:", e.message);
    }

    console.log("\n✨ Fin del proceso.");
}

run();
