
import { getBitrixClient } from './src/lib/bitrix-service';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyLocalMode() {
    console.log('--- Verifying Local Bitrix Mode with Firestore Fallback ---');
    console.log(`NEXT_PUBLIC_BITRIX_LOCAL_MODE: ${process.env.NEXT_PUBLIC_BITRIX_LOCAL_MODE}`);
    console.log(`BITRIX_LOCAL_MEMBER_ID: ${process.env.BITRIX_LOCAL_MEMBER_ID}`);

    if (process.env.NEXT_PUBLIC_BITRIX_LOCAL_MODE !== 'true') {
        console.error('❌ Local mode is NOT enabled in env vars.');
        return;
    }

    const memberId = process.env.BITRIX_LOCAL_MEMBER_ID;
    if (!memberId || memberId === 'REPLACE_WITH_YOUR_MEMBER_ID') {
        console.error('⚠️ BITRIX_LOCAL_MEMBER_ID is not set or is still the placeholder.');
        console.log('Please update .env.local with a valid member_id from your "installations" collection.');
        return;
    }

    try {
        console.log(`Attempting to get client for ${memberId}...`);
        // This will now attempt to connect to separate Firebase project if env vars are loaded correctly
        // And since BITRIX_LOCAL_ACCESS_TOKEN is missing, it should query Firestore to get the client.

        const client = await getBitrixClient(memberId);

        console.log('✅ Client retrieved successfully from Firestore (or fallback):');
        console.log(`Domain: ${client.domain}`);
        console.log(`AccessToken: ${client.accessToken ? '****' + client.accessToken.slice(-4) : 'undefined'}`);

    } catch (error) {
        console.error('❌ Error retrieving client:', error);
    }
}

verifyLocalMode();
