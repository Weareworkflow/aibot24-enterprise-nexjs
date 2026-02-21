import { NextRequest, NextResponse } from 'next/server';
import { getBitrixClient } from '@/lib/bitrix-service';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ domain: string }> }
) {
    try {
        const { domain } = await params;
        console.log(`[Refresh] Forcing token refresh for: ${domain}`);

        // getBitrixClient already has logic to refresh if expired.
        // We can force it by temporarily marking it as expired if we wanted, 
        // but let's just use the existing logic first which is now more aggressive.
        const client = await getBitrixClient(domain);

        return NextResponse.json({
            success: true,
            domain: client.domain,
            message: "Token verificado/refrescado"
        });
    } catch (error: any) {
        console.error('[Refresh] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
