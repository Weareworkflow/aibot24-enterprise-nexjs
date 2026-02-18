
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
        // 1. Get Domain from Installation (Source of Truth)
        const installRef = db.collection('installations').doc(memberId);
        const installSnap = await installRef.get();

        if (!installSnap.exists) {
            console.error(`❌ Installation not found for ${memberId}. Install the app in Bitrix first.`);
            process.exit(1);
        }

        const installData = installSnap.data();
        const domain = installData.domain;
        console.log(`✅ Found Domain: ${domain}`);

        // 2. Initialize Collections

        // --- Config App (UI) ---
        console.log("🛠️  Ensuring 'config-app' (UI Settings)...");
        await db.collection('config-app').doc(memberId).set({
            theme: 'system',
            language: 'es',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // --- Config Architect (Personality) ---
        console.log("🛠️  Ensuring 'config-architect' (Personality)...");
        // We use merge: true to avoid overwriting custom prompts if they exist
        await db.collection('config-architect').doc(memberId).set({
            name: "Aibot",
            role: "Arquitecto de Protocolos",
            systemPrompt: "Eres un arquitecto de agentes AI experto en Bitrix24.",
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // --- Config Architect AI (Internal) ---
        console.log("🛠️  Ensuring 'config-architect/ai/config'...");
        const archAiRef = db.collection('config-architect').doc(memberId).collection('ai').doc('config');
        const archAiSnap = await archAiRef.get();

        if (!archAiSnap.exists) {
            await archAiRef.set({
                provider: 'openai',
                model: 'gpt-4-turbo',
                temperature: 0.7,
                apiKey: "ENTER_ARCHITECT_KEY_IN_FIRESTORE", // Placeholder
                updatedAt: new Date().toISOString()
            });
            console.log("   ⚠️ Created Architect AI config. Please set 'apiKey' in Firestore Console.");
        } else {
            console.log("   ✅ Architect AI config exists. Preserving.");
        }

        // --- Config AI (Tenant LLM Keys) ---
        console.log("🔐 Checking 'config-ai' (Tenant API Keys)...");
        const aiConfigRef = db.collection('config-ai').doc(memberId);
        const aiConfigSnap = await aiConfigRef.get();

        if (!aiConfigSnap.exists) {
            await aiConfigRef.set({
                provider: 'openai',
                model: 'gpt-4o',
                apiKey: "ENTER_TENANT_KEY_IN_FIRESTORE", // Placeholder
                temperature: 0.7,
                maxTokens: 1000,
                updatedAt: new Date().toISOString()
            });
            console.log("   ⚠️ Created 'config-ai' placeholder. GO TO FIRESTORE -> config-ai -> [memberId] AND SET KEY.");
        } else {
            console.log("   ✅ 'config-ai' already exists. Preserving keys.");
        }

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

        // --- Agents (Default Active Agent) ---
        console.log(`🤖 Ensuring Default Agent for ${memberId}...`);
        const agentId = memberId; // Use Member ID as Default Agent ID for simplicity
        const agentRef = db.collection('agents').doc(agentId);
        const agentSnap = await agentRef.get();

        if (!agentSnap.exists) {
            await agentRef.set({
                id: agentId,
                tenantId: memberId,
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

        // --- Metrics (Zeroed) ---
        console.log(`📊 Initializing Metrics for Agent ${agentId}...`);
        const metricsRef = db.collection('metrics').doc(agentId);
        // We act on the specific agent ID because Dashboard listens to `metrics/{agentId}`

        // Always ensure fields exist, even if doc exists (merge: true deals with partials)
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
        }, { merge: true });
        console.log("   ✅ Metrics initialized/reset to baseline (zeros preserved if merge).");

        console.log("\n✅ Initialization Logic Complete.");
        console.log("👉 MANAGE ALL SECRETS DIRECTLY IN FIRESTORE CONSOLE.");
        console.log("   - OpenAI Keys: 'config-ai' (per tenant) OR 'config-architect/ai/config'");
        console.log("   - Bitrix Credentials: 'config-secrets' (per domain)");

    } catch (error) {
        console.error("❌ Error initializing collections:", error);
    }
}

initCollections();
