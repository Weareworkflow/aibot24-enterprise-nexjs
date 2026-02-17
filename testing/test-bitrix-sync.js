
require('dotenv').config({ path: '../.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin (Auto-detects credentials if GOOGLE_APPLICATION_CREDENTIALS is set, 
// or tries to use default app if already initialized. For local dev, we might need a service account key 
// or we can use the client SDK logic if admin is too complex to setup without key file).
// 
// User said "production data is in firestore". 
// To read from Firestore in a Node script, we need the Admin SDK or Client SDK. 
// Given the environment, sticking to Client SDK might be easier if we don't have a service account json.
// BUT, the package.json has "firebase" and "firebase-admin".
// Let's try to use the Client SDK style which likely works with the API Key/Project ID in .env.local
// for public read/write if rules allow, or just standardauth.
// Actually, for a quick script without a service account JSON, Client SDK is easier.

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testBitrixSync() {
    const memberId = process.env.BITRIX_LOCAL_MEMBER_ID;

    if (!memberId) {
        console.error("❌ Missing BITRIX_LOCAL_MEMBER_ID in .env.local");
        console.error("   (Required to identify which tenant to test against)");
        process.exit(1);
    }

    console.log(`🔍 Fetching Installation Data for Member ID: ${memberId}...`);

    try {
        // 1. Fetch Installation from Firestore (Production Data)
        const installRef = doc(db, 'installations', memberId); // Note: In production it's 'installations', in test it might be 'test_installations'
        // The user said "take production data". But we are in "test" environment locally (NEXT_PUBLIC_APP_ENV=test).
        // EXCEPT, the real installation data is likely in the *production* 'installations' collection, not 'test_installations'.
        // If we want "production data", we should query 'installations'.
        // However, db-schema prefixes it. Here we are using raw string 'installations'. 
        // This is correct if we want real production data.

        const installSnap = await getDoc(installRef);

        if (!installSnap.exists()) {
            console.error(`❌ Installation not found in Firestore for ID: ${memberId}`);
            console.log("Tip: Ensure you are querying the correct collection (prod 'installations' vs test 'test_installations').");
            process.exit(1);
        }

        const installData = installSnap.data();
        const accessToken = installData.accessToken;
        const domain = installData.domain;

        if (!accessToken || !domain) {
            console.error("❌ Installation found but missing accessToken or domain.");
            process.exit(1);
        }

        console.log(`✅ Found Installation: ${domain}`);
        console.log(`🤖 Testing Bot Sync...`);

        // Mock Agent Data
        const agent = {
            id: "test-agent-firestore-" + Date.now(),
            name: "Test Bot (Prod Data) " + new Date().toISOString().split('T')[1],
            role: "Automated Tester",
            company: "AI Solutions Inc.",
            avatar: "ivborw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
            color: "RED"
        };

        const handlerUrl = "https://example.com";
        const webhookUrl = `${handlerUrl}/api/bitrix/webhook`;

        const params = {
            CODE: `bot_${agent.id}`,
            TYPE: 'O',
            EVENT_MESSAGE_ADD: webhookUrl,
            EVENT_WELCOME_MESSAGE: webhookUrl,
            PROPERTIES: {
                NAME: agent.name,
                WORK_POSITION: agent.role,
                COLOR: agent.color,
                PERSONAL_PHOTO: agent.avatar
            }
        };

        console.log("📤 Sending payload to imbot.register:", JSON.stringify(params, null, 2));

        // Direct call to Bitrix REST API
        const response = await fetch(`https://${domain}/rest/imbot.register.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth: accessToken,
                ...params
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("❌ Bitrix Error:", data.error, data.error_description);
        } else {
            console.log("✅ Bot Registered Successfully! Bot ID:", data.result);

            // Test Company Update
            if (agent.company) {
                console.log("🔄 Updating Company...");
                const updateResp = await fetch(`https://${domain}/rest/user.update.json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        auth: accessToken,
                        ID: data.result,
                        WORK_COMPANY: agent.company
                    })
                });
                const updateData = await updateResp.json();
                if (updateData.result) console.log("✅ Company updated to:", agent.company);
                else console.error("⚠️ Company update failed:", updateData);
            }
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testBitrixSync();
