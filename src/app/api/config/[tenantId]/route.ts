import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        const { tenantId } = await params;
        const db = await getDb();

        const config = await db.collection('config-app').findOne({ tenantId });

        return NextResponse.json(config ? { ...config, id: config.tenantId, _id: undefined } : {
            id: tenantId,
            tenantId,
            theme: 'light',
            language: 'es',
        });
    } catch (error: any) {
        console.error('[Config GET] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        const { tenantId } = await params;
        const body = await request.json();
        const db = await getDb();

        const { _id, tenantId: _, id: __, ...updates } = body;

        await db.collection('config-app').updateOne(
            { tenantId },
            {
                $set: { ...updates, updatedAt: new Date().toISOString() },
                $setOnInsert: { tenantId, id: tenantId }
            },
            { upsert: true }
        );

        // --- Cache Invalidation ---
        try {
            const agentInternalUrl = process.env.AGENT_INTERNAL_URL;
            if (agentInternalUrl) {
                console.log(`[Config PUT] Triggering global cache invalidation for tenant: ${tenantId}`);

                fetch(`${agentInternalUrl}/api/cache/invalidate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agent_id: tenantId,
                        type: 'config'
                    })
                }).catch(err => console.error('[Config PUT] Cache invalidation fetch error:', err));
            }
        } catch (cacheErr) {
            console.error('[Config PUT] Cache invalidation logic error:', cacheErr);
        }
        // --------------------------

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Config PUT] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
