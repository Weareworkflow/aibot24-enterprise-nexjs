import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ agentId: string }> }
) {
    try {
        const { agentId } = await params;
        const db = await getDb();

        const metrics = await db.collection('metrics').findOne({ agentId });

        return NextResponse.json(metrics ? { ...metrics, _id: undefined } : {
            agentId,
            usageCount: 0,
            performanceRating: 0,
            totalInteractionMetric: 0,
        });
    } catch (error: any) {
        console.error('[Metrics GET] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
