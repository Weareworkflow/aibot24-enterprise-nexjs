
require('dotenv').config({ path: '../.env.local' });

// Mock fetch for local testing if needed, or use real fetch in Node 18+
// const fetch = require('node-fetch'); // Uncomment if using Node < 18

async function testBitrixSync() {
    const memberId = process.env.BITRIX_LOCAL_MEMBER_ID;
    const accessToken = process.env.BITRIX_LOCAL_ACCESS_TOKEN;
    const domain = process.env.BITRIX_LOCAL_DOMAIN;

    if (!memberId || !accessToken || !domain) {
        console.error("❌ Missing BITRIX_LOCAL env vars in .env.local");
        process.exit(1);
    }

    console.log(`🤖 Testing Bot Sync for Member: ${memberId} on ${domain}`);

    // Mock Agent Data
    const agent = {
        id: "test-agent-" + Date.now(),
        name: "Test Bot " + new Date().toISOString().split('T')[1],
        role: "Automated Tester",
        company: "AI Solutions Inc.",
        avatar: "ivborw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==", // 1x1 Red Pixel Base64
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

    try {
        // Direct call to Bitrix REST API (simulating what bitrix-service does)
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
        console.error("❌ Network/Script Error:", error);
    }
}

testBitrixSync();
