
require('dotenv').config({ path: '../.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initCollections() {
    console.log("🌐 Using Client SDK to initialize collections...");
    console.log("⚠️  NOTE: This will FAIL with 'Permission Denied' unless you temporarily allow writes in Firestore Rules.");

    const memberId = process.env.BITRIX_LOCAL_MEMBER_ID;
    if (!memberId) {
        console.error("❌ Missing BITRIX_LOCAL_MEMBER_ID in .env.local");
        process.exit(1);
    }

    try {
        console.log(`🔍 Fetching Installation for ${memberId}...`);

        // Use 'installations' collection (Production)
        const installRef = doc(db, 'installations', memberId);
        const installSnap = await getDoc(installRef);

        if (!installSnap.exists()) {
            // Fallback to 'test_installations' if env is test, maybe? 
            // But the user said "production data".
            console.error(`❌ Installation document not found for ${memberId} in 'installations' collection.`);
            console.log("   Please ensuring you have installed the app in Bitrix first.");
            process.exit(1);
        }

        const domain = installSnap.data().domain;
        console.log(`✅ Found Domain: ${domain}`);

        console.log("🛠️  Initializing 'config-app'...");
        await setDoc(doc(db, 'config-app', memberId), {
            theme: 'system',
            language: 'es',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log("🛠️  Initializing 'config-architect'...");
        await setDoc(doc(db, 'config-architect', memberId), {
            name: "Aibot",
            role: "Arquitecto de Protocolos",
            systemPrompt: "Eres un arquitecto de agentes AI experto en Bitrix24.",
            updatedAt: new Date().toISOString()
        }); // No merge here to wipe out old fields like 'model'

        // Architect AI Sub-collection
        console.log("🛠️  Initializing 'config-architect/ai/config'...");
        await setDoc(doc(db, 'config-architect', memberId, 'ai', 'config'), {
            provider: 'openai',
            model: 'gpt-4-turbo',
            temperature: 0.7,
            maxTokens: 2000,
            apiKey: "ENTER_ARCHITECT_OPENAI_KEY_HERE",
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log("🔐 Initializing 'config-ai'...");
        await setDoc(doc(db, 'config-ai', memberId), {
            provider: 'openai',
            model: 'gpt-4o',
            apiKey: "ENTER_YOUR_OPENAI_KEY_HERE",
            temperature: 0.7,
            maxTokens: 1000
        }, { merge: true });

        console.log("🔐 Initializing 'config-secrets'...");
        const secretsRef = doc(db, 'config-secrets', domain);
        const secretSnap = await getDoc(secretsRef);
        if (!secretSnap.exists()) {
            await setDoc(secretsRef, {
                clientId: "ENTER_BITRIX_CLIENT_ID",
                clientSecret: "ENTER_BITRIX_CLIENT_SECRET",
                webhookHandlerUrl: process.env.NEXT_PUBLIC_APP_URL || ""
            });
            console.log("✅ 'config-secrets' created.");
        } else {
            console.log("ℹ️  'config-secrets' already exists.");
        }

        console.log("\n✅ Success! Don't forget to restore your Security Rules.");

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.code === 'permission-denied') {
            console.error("\n👉 SOLUTION: Go to Firebase Console -> Firestore -> Rules");
            console.error("   Change 'allow write: if false;' to 'allow write: if true;' temporarily.");
            console.error("   Run this script again.");
            console.error("   Change it back when done!");
        }
    }
}

initCollections();
