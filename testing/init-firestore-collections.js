
require('dotenv').config({ path: '../.env.local' });
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
// Assumes GOOGLE_APPLICATION_CREDENTIALS is set or running in an environment with default creds.
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
} catch (e) {
    console.error("❌ Failed to initialize Firebase Admin.");
    console.error("👉 Ensure GOOGLE_APPLICATION_CREDENTIALS is set to your service account key path.");
    process.exit(1);
}

const db = getFirestore();

async function initCollections() {
    console.log("🔐 Initializing Firestore Collections (Secrets Managed in Cloud)...");

    const memberId = process.env.BITRIX_LOCAL_MEMBER_ID;

    if (!memberId) {
        console.error("❌ Missing BITRIX_LOCAL_MEMBER_ID in .env.local");
        console.error("   (We need this ONLY to know which tenant to initialize)");
        process.exit(1);
    }

    console.log(`🔍 Checking Installation for Member ID: ${memberId}...`);

    try {
        // 0. GLOBAL CONFIGURATION (Shared by all tenants/architects)
        console.log("🌍 Ensuring 'settings/ai' (Global AI Configuration)...");
        const globalAiRef = db.collection('settings').doc('ai');
        const globalAiSnap = await globalAiRef.get();

        if (!globalAiSnap.exists) {
            await globalAiRef.set({
                provider: 'openai',
                model: 'gpt-4o',
                apiKey: "ENTER_GLOBAL_API_KEY_HERE",
                temperature: 0.7,
                updatedAt: new Date().toISOString()
            });
            console.log("   ⚠️ Created Global AI Config. GO TO FIRESTORE -> settings -> ai AND SET YOUR API KEY.");
        } else {
            // Ensure fields exist
            await globalAiRef.set({
                provider: 'openai',
                model: 'gpt-4o',
                ...(globalAiSnap.data().apiKey ? {} : { apiKey: "ENTER_GLOBAL_API_KEY_HERE" })
            }, { merge: true });
            console.log("   ✅ Global AI Config exists.");
        }

        // 1. Get Domain from Installation (Source of Truth)
        // CHECK: Is this a legacy installation (ID=MemberID)?
        console.log(`🔍 Checking for Legacy Installation (ID=${memberId})...`);
        const legacyInstallRef = db.collection('installations').doc(memberId);
        const legacyInstallSnap = await legacyInstallRef.get();

        let domain;
        let installData;

        if (legacyInstallSnap.exists) {
            console.log("   ⚠️ Found legacy installation with Member ID.");
            installData = legacyInstallSnap.data();
            domain = installData.domain;

            // MIGRATE TO DOMAIN-BASED ID
            if (domain) {
                console.log(`   🚀 Migrating to installations/${domain}...`);
                const newInstallRef = db.collection('installations').doc(domain);
                await newInstallRef.set({
                    ...installData,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                console.log("      ✅ Created/Updated installations/" + domain);
            }
        } else {
            // Check if installation exists by domain directly
            // We need to find the domain some other way - check all installations
            const allInstalls = await db.collection('installations').get();
            for (const doc of allInstalls.docs) {
                const data = doc.data();
                if (data.memberId === memberId) {
                    domain = doc.id; // doc ID is the domain
                    console.log(`   ✅ Found installation by memberId scan. Domain is ${domain}`);
                    break;
                }
            }
            if (!domain) {
                console.error(`❌ Installation not found for ${memberId}. Install the app in Bitrix first.`);
                process.exit(1);
            }
        }

        console.log(`✅ Target Domain: ${domain}`);

        // 2. Initialize Collections

        // --- Config App (UI) --- Keyed by DOMAIN
        console.log(`🛠️  Ensuring 'config-app/${domain}' (UI Settings)...`);
        await db.collection('config-app').doc(domain).set({
            theme: 'system',
            language: 'es',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // --- Config Architect (Personality ONLY) ---
        console.log("🛠️  Ensuring 'config-architect' (Personality Only)...");
        // We use merge: true to avoid overwriting custom prompts if they exist
        // KEY CHANGE: Use 'domain' (Portal URL) as the key
        const architectRef = db.collection('config-architect').doc(domain);

        await architectRef.set({
            name: "Aibot",
            role: "Arquitecto de Protocolos",
            systemPrompt: "Eres un experto en Bitrix24 que ayuda a configurar otros agentes.",
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // EXPLICIT CLEANUP: Remove old AI config fields from this doc
        try {
            await architectRef.update({
                apiKey: admin.firestore.FieldValue.delete(),
                model: admin.firestore.FieldValue.delete(),
                provider: admin.firestore.FieldValue.delete(),
                temperature: admin.firestore.FieldValue.delete()
            });
            console.log("   🧹 Cleaned up deprecated AI fields from 'config-architect' (Now uses settings/ai).");
        } catch (e) {
            // Ignore if fields didn't exist
        }

        console.log("   ✅ Architect personality ensured.");

        // --- Config AI (REMOVED - Now Global) ---
        // We no longer initialize 'config-ai' per tenant for keys.
        // It might still be used for tenant-specific overrides in the future, but for now we rely on Global.
        console.log("🔐 'config-ai' (Tenant Keys) -> DEPRECATED in favor of 'settings/ai'");

        // --- Config Secrets (Bitrix Client ID/Secret) ---
        // Stored by DOMAIN, not Member ID
        console.log(`🔐 Checking 'config-secrets' for domain ${domain}...`);
        const secretsRef = db.collection('config-secrets').doc(domain);
        const secretsSnap = await secretsRef.get();

        if (!secretsSnap.exists) {
            await secretsRef.set({
                clientId: "ENTER_CLIENT_ID_IN_FIRESTORE",
                clientSecret: "ENTER_CLIENT_SECRET_IN_FIRESTORE",
                webhookHandlerUrl: "https://your-production-url.com",
                updatedAt: new Date().toISOString()
            });
            console.log("   ⚠️ Created 'config-secrets' placeholder. GO TO FIRESTORE -> config-secrets -> [domain] AND SET CREDENTIALS.");
        } else {
            console.log("   ✅ 'config-secrets' already exists. Preserving credentials.");
        }

        // --- Agents (Default Active Agent) --- Keyed by DOMAIN
        const defaultAgentId = `default-${domain.replace(/\./g, '-')}`;
        console.log(`🤖 Ensuring Default Agent for ${domain} (ID: ${defaultAgentId})...`);
        const agentRef = db.collection('agents').doc(defaultAgentId);
        const agentSnap = await agentRef.get();

        if (!agentSnap.exists) {
            await agentRef.set({
                id: defaultAgentId,
                tenantId: domain,
                name: "Aibot Principal",
                role: "Asistente Virtual",
                company: "Mi Empresa",
                objective: "Ayudar a los clientes",
                tone: "Profesional y amable",
                knowledge: "Información general de la empresa.",
                isActive: true,
                type: 'text',
                createdAt: new Date().toISOString(),
                // Advanced Config Defaults
                model: "gpt-4o",
                temperature: 0.7,
                provider: "openai"
            });
            console.log("   ✅ Created Default Agent.");
        } else {
            console.log("   ✅ Default Agent exists. Preserving.");
        }

        // --- Metrics (Ensuring All Agents have Metrics) ---
        console.log(`📊 Syncing Metrics Schema for ALL Active Agents...`);
        const agentsSnap = await db.collection('agents').get();
        let syncedCount = 0;

        for (const doc of agentsSnap.docs) {
            const agentId = doc.id;
            const metricsRef = db.collection('metrics').doc(agentId);
            const metricsSnap = await metricsRef.get();

            if (!metricsSnap.exists) {
                await metricsRef.set({
                    usageCount: 0,
                    performanceRating: 100,
                    totalInteractionMetric: 0,
                    meetings: 0,
                    transfers: 0,
                    abandoned: 0,
                    latency: "0ms",
                    tokens: "0",
                    updatedAt: new Date().toISOString()
                });
                console.log(`   ➕ Created missing metrics for agent: ${agentId}`);
                syncedCount++;
            } else {
                // Determine if we need to backfill fields
                const data = metricsSnap.data();
                const update = {};
                if (data.usageCount === undefined) update.usageCount = 0;
                if (data.performanceRating === undefined) update.performanceRating = 100;
                if (data.totalInteractionMetric === undefined) update.totalInteractionMetric = 0;
                if (data.meetings === undefined) update.meetings = 0;
                if (data.transfers === undefined) update.transfers = 0;
                if (data.abandoned === undefined) update.abandoned = 0;

                if (Object.keys(update).length > 0) {
                    await metricsRef.update(update);
                    console.log(`   🔄 Updated schema for agent: ${agentId}`);
                    syncedCount++;
                }
            }
        }
        console.log(`   ✅ Metrics synchronized. Updated/Created: ${syncedCount}`);

        console.log("\n✅ Initialization Logic Complete.");
        console.log("👉 MANAGE ALL SECRETS DIRECTLY IN FIRESTORE CONSOLE.");
        console.log("   - Global OpenAI Key: 'settings/ai' (apiKey)");
        console.log("   - Bitrix Credentials: 'config-secrets' (per domain)");

    } catch (error) {
        console.error("❌ Error initializing collections:", error);
    }
}

initCollections();
