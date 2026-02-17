
require('dotenv').config({ path: '../.env.local' });
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
// This requires GOOGLE_APPLICATION_CREDENTIALS environment variable to be set 
// to the path of your service account key file.
// OR it works automatically on GCP environment.
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
} catch (e) {
    console.error("❌ Failed to initialize Firebase Admin. You need a Service Account Key.");
    console.error("👉 Run: export GOOGLE_APPLICATION_CREDENTIALS=\"/path/to/key.json\"");
    console.error("👉 Or download key from Firebase Console > Project Settings > Service Accounts");
    process.exit(1);
}

const db = getFirestore();
const auth = getAuth();

async function initCollections() {
    console.log("🔐 Using Firebase Admin SDK (Bypassing Security Rules)...");

    const memberId = process.env.BITRIX_LOCAL_MEMBER_ID;

    if (!memberId) {
        console.error("❌ Missing BITRIX_LOCAL_MEMBER_ID in .env.local");
        process.exit(1);
    }

    console.log(`🔍 Fetching Installation for Member ID: ${memberId}...`);

    try {
        // 1. Get Domain from Installation
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

        console.log("🛠️  Initializing 'config-app' (Public UI Settings)...");
        await db.collection('config-app').doc(memberId).set({
            theme: 'system',
            language: 'es',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log("🛠️  Initializing 'config-architect' (Personality)...");
        await db.collection('config-architect').doc(memberId).set({
            name: "Aibot",
            role: "Arquitecto de Protocolos",
            systemPrompt: "Eres un arquitecto de agentes AI experto en Bitrix24.",
            updatedAt: new Date().toISOString()
        }); // Wipe out old fields like 'model'

        // Architect AI Sub-collection
        console.log("🛠️  Initializing 'config-architect/ai/config'...");
        await db.collection('config-architect').doc(memberId).collection('ai').doc('config').set({
            provider: 'openai',
            model: 'gpt-4-turbo',
            temperature: 0.7,
            maxTokens: 2000,
            apiKey: "ENTER_ARCHITECT_OPENAI_KEY_HERE",
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log("🔐 Initializing 'config-ai' (Private API Keys)...");
        await db.collection('config-ai').doc(memberId).set({
            provider: 'openai',
            model: 'gpt-4o',
            apiKey: "REPLACE_WITH_OPENAI_KEY", // User must replace this
            temperature: 0.7,
            maxTokens: 1000
        }, { merge: true });

        console.log("🔐 Initializing 'config-secrets' (Bitrix Client Secrets)...");
        // Only set if not exists, to avoid overwriting existing secrets
        const secretsRef = db.collection('config-secrets').doc(domain);
        const secretsSnap = await secretsRef.get();

        if (!secretsSnap.exists) {
            await secretsRef.set({
                clientId: "REPLACE_WITH_BITRIX_CLIENT_ID",
                clientSecret: "REPLACE_WITH_BITRIX_CLIENT_SECRET",
                webhookHandlerUrl: process.env.NEXT_PUBLIC_APP_URL || "https://your-production-url.com"
            });
            console.log("✅ 'config-secrets' created. ⚠️ GO TO FIRESTORE AND UPDATE VALUES!");
        } else {
            console.log("ℹ️  'config-secrets' already exists for this domain. Skipping overwrite.");
        }

        console.log("\n✅ Initialization Complete!");
        console.log("👉 Go to Firebase Console > Firestore and update 'config-ai' and 'config-secrets' with real keys.");

    } catch (error) {
        console.error("❌ Error initializing collections:", error);
    }
}

initCollections();
