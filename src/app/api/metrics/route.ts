import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, metrics } = body;

        if (!agentId) {
            return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
        }

        const metricsData = metrics || {};
        const db = await getDb();

        const { agentId: _, ...updates } = metricsData;

        await db.collection('metrics').updateOne(
            { agentId },
            {
                $set: {
                    ...updates,
                    updatedAt: new Date().toISOString()
                },
                $setOnInsert: { agentId }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Metrics POST] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
